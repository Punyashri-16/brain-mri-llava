
import React, { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';

import type { PromptType, AnalysisResponse } from '../index';
import { analyzeImage, comparePrompts } from '../services/api';

import {
  UploadCloud,
  Cpu,
  AlertCircle,
  CheckCircle2,
  FileImage,
  X,
  ScanLine,
  Sparkles,
  LoaderCircle,
  ShieldCheck,
  FileText,
  GitCompareArrows,
  Clock3,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface WorkspaceProps {
  onReportGenerated: (report: AnalysisResponse) => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const promptOptions: {
  value: PromptType;
  title: string;
  description: string;
  tag?: string;
}[] = [
  {
    value: 'generic',
    title: 'Generic Analysis',
    description: 'General visual description of the MRI scan.',
  },
  {
    value: 'tumor_focused',
    title: 'Tumor-Focused',
    description: 'Focuses on possible lesion and tumour-related features.',
  },
  {
    value: 'radiology_guided',
    title: 'Radiology-Guided',
    description: 'Structured observations using radiology-oriented prompts.',
    tag: 'Recommended',
  },
  {
    value: 'safety_aware',
    title: 'Safety-Aware',
    description: 'Emphasizes uncertainty and limitations in AI findings.',
  },
];

const reportFields: {
  key: keyof AnalysisResponse['report'];
  label: string;
}[] = [
  { key: 'observedFindings', label: 'Findings' },
  { key: 'location', label: 'Location' },
  { key: 'lesionCharacteristics', label: 'Lesion characteristics' },
  { key: 'surroundingEdema', label: 'Edema' },
  { key: 'massEffect', label: 'Mass effect' },
  { key: 'possibleInterpretation', label: 'Interpretation' },
  { key: 'uncertainty', label: 'Uncertainty' },
];

const promptTitle = (prompt: PromptType) =>
  promptOptions.find((option) => option.value === prompt)?.title ?? prompt;

const formatSeconds = (seconds: number) =>
  Number.isFinite(seconds) && seconds > 0
    ? `${seconds.toFixed(2)} s`
    : 'Not reported';

export const Workspace: React.FC<WorkspaceProps> = ({
  onReportGenerated,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [promptType, setPromptType] =
    useState<PromptType>('radiology_guided');

  const [loading, setLoading] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comparisonError, setComparisonError] = useState<string | null>(null);

  const [comparisonResults, setComparisonResults] =
    useState<AnalysisResponse[] | null>(null);

  const [expandedReports, setExpandedReports] = useState<
    Partial<Record<PromptType, boolean>>
  >({});

  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const formatSize = (bytes: number): string =>
    `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

  const handleFile = (file?: File) => {
    if (!file) return;

    const validType = ['image/png', 'image/jpeg'].includes(file.type);

    if (!validType) {
      setError('Unsupported format. Please upload a PNG or JPG MRI image.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('File exceeds the 10 MB upload limit.');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
    setComparisonError(null);
    setComparisonResults(null);
    setExpandedReports({});

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFile(event.target.files?.[0]);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    handleFile(event.dataTransfer.files?.[0]);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    setComparisonError(null);
    setComparisonResults(null);
    setExpandedReports({});

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getErrorMessage = (err: unknown, fallback: string) => {
    const apiError = err as {
      code?: string;
      response?: {
        data?: {
          detail?: string;
          error?: string;
          message?: string;
        };
      };
      message?: string;
    };

    if (
      apiError.code === 'ECONNABORTED' ||
      apiError.code === 'ETIMEDOUT'
    ) {
      return 'The comparison took longer than the allowed time. The backend may still be processing. Please check with the backend team before retrying.';
    }

    return (
      apiError.response?.data?.detail ||
      apiError.response?.data?.error ||
      apiError.response?.data?.message ||
      apiError.message ||
      fallback
    );
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Please upload T1CE_slice.png before starting analysis.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await analyzeImage(selectedFile, promptType);

      if (!result.success) {
        throw new Error(
          result.error || 'The backend did not return a successful analysis.'
        );
      }

      onReportGenerated(result);
    } catch (err: unknown) {
      setError(
        getErrorMessage(
          err,
          'Unable to communicate with the analysis backend.'
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = async () => {
    if (!selectedFile) {
      setComparisonError(
        'Please upload T1CE_slice.png before comparing prompts.'
      );
      return;
    }

    setComparing(true);
    setComparisonError(null);

    // Previous successful results are deliberately preserved.
    // They will only be replaced after a new comparison succeeds.

    try {
      const results = await comparePrompts(selectedFile);

      const expectedPrompts: PromptType[] = [
        'generic',
        'tumor_focused',
        'radiology_guided',
        'safety_aware',
      ];

      const receivedPrompts = new Set(
        results.map((result) => result.promptType)
      );

      const missing = expectedPrompts.filter(
        (prompt) => !receivedPrompts.has(prompt)
      );

      if (results.length !== 4 || missing.length > 0) {
        throw new Error(
          `Expected four prompt results. Received ${results.length}.` +
            (missing.length > 0
              ? ` Missing: ${missing.map(promptTitle).join(', ')}.`
              : '')
        );
      }

      const failed = results.filter((result) => !result.success);

      if (failed.length > 0) {
        throw new Error(
          `Some prompt runs failed: ${failed
            .map((result) => promptTitle(result.promptType))
            .join(', ')}.`
        );
      }

      setComparisonResults(results);
      setExpandedReports({});
    } catch (err: unknown) {
      setComparisonError(
        getErrorMessage(err, 'Unable to complete prompt comparison.')
      );
    } finally {
      setComparing(false);
    }
  };

  const selectedPrompt = promptOptions.find(
    (option) => option.value === promptType
  );

  const toggleReport = (prompt: PromptType) => {
    setExpandedReports((current) => ({
      ...current,
      [prompt]: !current[prompt],
    }));
  };

  const comparisonOrder: PromptType[] = [
    'generic',
    'tumor_focused',
    'radiology_guided',
    'safety_aware',
  ];

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
            <ScanLine size={15} />
            Imaging workspace
          </div>
          <h2 className="text-2xl font-bold text-white">
            MRI Analysis Studio
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Upload a brain MRI scan and configure your AI analysis.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-xs text-slate-400">
          <ShieldCheck size={15} className="text-cyan-400" />
          Research environment
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
        <AlertCircle size={19} className="mt-0.5 shrink-0 text-amber-400" />
        <div>
          <p className="text-sm font-semibold text-amber-300">
            Research and educational use only
          </p>
          <p className="mt-1 text-xs leading-relaxed text-amber-200/60">
            AI-generated findings are experimental and are not clinically
            validated diagnoses. Do not use these results for medical decisions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-semibold text-cyan-400">
              <UploadCloud size={20} />
              MRI Scan Input
            </h3>
            <span className="text-[10px] uppercase tracking-widest text-slate-500">
              Step 01
            </span>
          </div>

          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative flex min-h-[290px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-5 text-center transition-all duration-300 ${
              dragging
                ? 'scale-[1.01] border-cyan-400 bg-cyan-400/10'
                : selectedFile
                  ? 'border-emerald-500/40 bg-slate-950/60'
                  : 'border-slate-700 bg-slate-950/40 hover:border-cyan-500/60 hover:bg-cyan-500/5'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              onClick={(event) => event.stopPropagation()}
              className="hidden"
            />

            {selectedFile ? (
              <div className="w-full space-y-4">
                {previewUrl && (
                  <div className="relative flex min-h-[190px] items-center justify-center rounded-lg bg-black/40 p-3">
                    <img
                      src={previewUrl}
                      alt="Uploaded MRI scan preview"
                      className="max-h-[220px] max-w-full rounded-lg object-contain"
                    />
                  </div>
                )}

                <div className="flex items-center gap-3 rounded-lg bg-slate-800/70 p-3 text-left">
                  <div className="rounded-lg bg-cyan-500/10 p-2">
                    <FileImage size={22} className="text-cyan-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">
                      {selectedFile.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {formatSize(selectedFile.size)} · PNG/JPEG
                    </p>
                  </div>
                  <CheckCircle2 size={19} className="shrink-0 text-emerald-400" />
                </div>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    removeFile();
                  }}
                  className="inline-flex items-center gap-2 text-xs text-red-400 transition hover:text-red-300"
                >
                  <X size={15} />
                  Remove selected file
                </button>
              </div>
            ) : (
              <>
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10">
                  <UploadCloud size={32} className="text-cyan-400" />
                </div>
                <p className="font-medium text-white">
                  {dragging
                    ? 'Drop your MRI scan here'
                    : 'Drag and drop your MRI scan'}
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  or click to browse files
                </p>
                <span className="mt-5 rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-xs text-cyan-300">
                  Browse files
                </span>
                <p className="mt-5 text-[11px] text-slate-500">
                  Supported: PNG, JPG, JPEG · Maximum 10 MB
                </p>
              </>
            )}
          </div>

          <div className="rounded-lg border border-cyan-500/10 bg-cyan-500/5 p-3">
            <p className="text-xs font-medium text-cyan-300">
              Recommended input: T1CE_slice.png
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
              Use the individual T1CE modality for LLaVA analysis.
              combined_mri.png is reserved for frontend visualisation.
              The segmentation mask is not sent to the model.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>
              {selectedFile
                ? 'File selected and ready for analysis.'
                : 'Your scan will be submitted to the configured backend.'}
            </span>
          </div>
        </div>

        <div className="flex flex-col space-y-5 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-semibold text-cyan-400">
              <Cpu size={20} />
              Analysis Configuration
            </h3>
            <span className="text-[10px] uppercase tracking-widest text-slate-500">
              Step 02
            </span>
          </div>

          <div>
            <label className="mb-3 block text-sm font-medium text-slate-300">
              Select Prompt Strategy
            </label>

            <div className="space-y-3">
              {promptOptions.map((option, index) => (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => setPromptType(option.value)}
                  className={`w-full rounded-xl border p-4 text-left transition-all duration-200 ${
                    promptType === option.value
                      ? 'border-cyan-500/60 bg-cyan-500/10'
                      : 'border-slate-800 bg-slate-950/40 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-semibold ${
                          promptType === option.value
                            ? 'bg-cyan-500/20 text-cyan-300'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span
                        className={`text-sm font-semibold ${
                          promptType === option.value
                            ? 'text-cyan-300'
                            : 'text-slate-200'
                        }`}
                      >
                        {option.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {option.tag && (
                        <span className="rounded bg-cyan-500/10 px-2 py-1 text-[9px] uppercase tracking-wider text-cyan-300">
                          {option.tag}
                        </span>
                      )}
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                          promptType === option.value
                            ? 'border-cyan-400'
                            : 'border-slate-600'
                        }`}
                      >
                        {promptType === option.value && (
                          <span className="h-2 w-2 rounded-full bg-cyan-400" />
                        )}
                      </span>
                    </div>
                  </div>
                  <p className="ml-10 mt-2 text-xs text-slate-500">
                    {option.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-violet-300">
              <Sparkles size={15} />
              SELECTED STRATEGY
            </div>
            <p className="mt-2 text-sm text-slate-200">
              {selectedPrompt?.title}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {selectedPrompt?.description}
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/5 p-3">
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-400" />
              <p className="text-xs leading-relaxed text-red-300">{error}</p>
            </div>
          )}

          <div className="mt-auto space-y-3 pt-2">
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={loading || comparing || !selectedFile}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-4 text-sm font-semibold text-white shadow-lg shadow-cyan-900/20 transition-all duration-300 hover:from-cyan-400 hover:to-blue-500 disabled:cursor-not-allowed disabled:from-slate-700 disabled:to-slate-800"
            >
              {loading ? (
                <>
                  <LoaderCircle size={19} className="animate-spin" />
                  Processing MRI Scan...
                </>
              ) : (
                <>
                  <Cpu size={19} />
                  Run LLaVA Analysis
                  <Sparkles size={16} />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCompare}
              disabled={loading || comparing || !selectedFile}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-violet-500/40 bg-violet-500/10 py-4 text-sm font-semibold text-violet-200 transition hover:border-violet-400 hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {comparing ? (
                <>
                  <LoaderCircle size={19} className="animate-spin" />
                  Comparing all four prompts...
                </>
              ) : (
                <>
                  <GitCompareArrows size={19} />
                  Compare All Four Prompts
                </>
              )}
            </button>

            <p className="text-center text-[10px] text-slate-500">
              Comparison runs all four strategies sequentially on the same image.
            </p>
          </div>
        </div>
      </div>

      {comparisonError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <AlertCircle size={19} className="mt-0.5 shrink-0 text-red-400" />
          <div>
            <p className="text-sm font-semibold text-red-300">
              Prompt comparison could not be completed
            </p>
            <p className="mt-1 text-xs leading-relaxed text-red-200/70">
              {comparisonError}
            </p>
          </div>
        </div>
      )}

      {comparing && (
        <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
          <div className="flex items-center gap-3">
            <LoaderCircle size={20} className="animate-spin text-violet-300" />
            <div>
              <p className="text-sm font-semibold text-violet-200">
                Running four prompt strategies
              </p>
              <p className="mt-1 text-xs text-slate-400">
                The backend runs these sequentially. CPU inference can take
                several minutes. Keep this page open and do not start another
                analysis.
              </p>
            </div>
          </div>
        </div>
      )}

      {comparisonResults && (
        <section className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">
                <GitCompareArrows size={15} />
                Prompt laboratory
              </div>
              <h3 className="text-xl font-bold text-white">
                Four-Strategy Comparison
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Outputs generated from the same uploaded MRI image.
              </p>
            </div>
            <span className="self-start rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300">
              Comparison response received
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {comparisonOrder.map((prompt) => {
              const result = comparisonResults.find(
                (item) => item.promptType === prompt
              );

              if (!result) return null;

              const expanded = Boolean(expandedReports[prompt]);

              return (
                <article
                  key={prompt}
                  className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70"
                >
                  <div className="flex items-center justify-between gap-3 border-b border-slate-800 p-4">
                    <div>
                      <h4 className="text-sm font-semibold text-white">
                        {promptTitle(prompt)}
                      </h4>
                      <p className="mt-1 text-[11px] text-slate-500">
                        {prompt.replace(/_/g, ' ')}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-lg bg-slate-950/70 px-2.5 py-2 text-xs text-cyan-300">
                      <Clock3 size={13} />
                      {formatSeconds(result.inferenceTimeSeconds)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-4">
                    <div className="rounded-lg bg-slate-950/60 p-3">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500">
                        Assessable Field Rate
                      </p>
                      <p className="mt-1 text-lg font-semibold text-cyan-300">
                        {result.evaluation.completenessPercentage}%
                      </p>
                    </div>

                    <div className="rounded-lg bg-slate-950/60 p-3">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500">
                        Report fields
                      </p>
                      <p className="mt-1 text-lg font-semibold text-slate-200">
                        {result.evaluation.totalFields} fields
                      </p>
                    </div>
                  </div>

                  <div className="px-4 pb-4">
                    <button
                      type="button"
                      onClick={() => toggleReport(prompt)}
                      className="flex w-full items-center justify-between rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2.5 text-xs font-medium text-slate-200 transition hover:border-violet-500/50"
                    >
                      {expanded
                        ? 'Hide structured report'
                        : 'View structured report'}
                      {expanded ? (
                        <ChevronUp size={15} />
                      ) : (
                        <ChevronDown size={15} />
                      )}
                    </button>

                    {expanded && (
                      <div className="mt-3 space-y-3">
                        {reportFields.map((field) => (
                          <div key={field.key}>
                            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-violet-300">
                              {field.label}
                            </p>
                            <p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-300">
                              {result.report[field.key] || 'Not provided'}
                            </p>
                          </div>
                        ))}

                        <p className="border-t border-slate-800 pt-3 text-[10px] leading-relaxed text-slate-500">
                          {result.evaluation.evaluationNote}
                        </p>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <p className="text-xs font-semibold text-amber-300">
              Interpretation of comparison metrics
            </p>
            <p className="mt-1 text-xs leading-relaxed text-amber-200/60">
              Assessable Field Rate measures how many of the seven report
              fields were considered assessable. It does not measure medical
              accuracy, factual grounding, or clinical performance. Faster
              inference does not mean a more accurate report.
            </p>
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <ScanLine size={20} className="text-cyan-400" />
          <div>
            <p className="text-xs font-medium text-slate-300">Image Input</p>
            <p className="mt-1 text-[10px] text-slate-500">T1CE MRI slice</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <Cpu size={20} className="text-violet-400" />
          <div>
            <p className="text-xs font-medium text-slate-300">AI Processing</p>
            <p className="mt-1 text-[10px] text-slate-500">LLaVA inference</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <FileText size={20} className="text-emerald-400" />
          <div>
            <p className="text-xs font-medium text-slate-300">Output</p>
            <p className="mt-1 text-[10px] text-slate-500">
              Seven-field structured report
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
