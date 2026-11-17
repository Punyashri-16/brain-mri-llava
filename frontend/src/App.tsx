import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { AnalysisResponse } from './index';
import { Workspace } from './components/Workspace';
import MRIViewer from './components/MRIViewer';
import { checkHealth } from './services/api';

import {
  BrainCircuit,
  LayoutDashboard,
  ScanLine,
  FlaskConical,
  Workflow,
  ChartNoAxesCombined,
  Activity,
  ShieldCheck,
  ArrowUpRight,
  Cpu,
  Database,
  Zap,
  FileImage,
  ChevronRight,
  Clock3,
  CircleDot,
  CheckCircle2,
  AlertTriangle,
  FileText,
} from 'lucide-react';

type Section =
  | 'overview'
  | 'analysis'
  | 'prompts'
  | 'workflow'
  | 'evaluation';

const navigation = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'analysis', label: 'MRI Analysis', icon: ScanLine },
  { id: 'prompts', label: 'Prompt Laboratory', icon: FlaskConical },
  { id: 'workflow', label: 'AI Workflow', icon: Workflow },
  { id: 'evaluation', label: 'Evaluation', icon: ChartNoAxesCombined },
] as const;

const reportFields = [
  { label: 'Observed Findings', key: 'observedFindings' },
  { label: 'Location', key: 'location' },
  { label: 'Lesion Characteristics', key: 'lesionCharacteristics' },
  { label: 'Surrounding Edema', key: 'surroundingEdema' },
  { label: 'Mass Effect', key: 'massEffect' },
  { label: 'Possible Interpretation', key: 'possibleInterpretation' },
] as const;

const promptLabels: Record<string, string> = {
  generic: 'Generic',
  tumor_focused: 'Tumor-Focused',
  radiology_guided: 'Radiology-Guided',
  safety_aware: 'Safety-Aware',
};

function StatusCard({
  icon: Icon,
  label,
  value,
  detail,
  color = 'cyan',
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  detail: string;
  color?: string;
}) {
  const colors: Record<string, string> = {
    cyan: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
    teal: 'text-teal-400 bg-teal-400/10 border-teal-400/20',
    violet: 'text-violet-400 bg-violet-400/10 border-violet-400/20',
    amber: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 hover:border-cyan-400/30 transition-all">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <h3 className="text-xl font-semibold mt-2 text-slate-100">
            {value}
          </h3>
        </div>
        <div className={`p-3 rounded-xl border ${colors[color]}`}>
          <Icon size={21} />
        </div>
      </div>
      <p className="text-xs text-slate-500 mt-4">{detail}</p>
    </div>
  );
}

function App() {
  const [activeSection, setActiveSection] =
    useState<Section>('overview');

  const [backendStatus, setBackendStatus] = useState<
    'checking' | 'connected' | 'offline'
  >('checking');

  useEffect(() => {
    let isMounted = true;

    const verifyBackend = async () => {
      const isHealthy = await checkHealth();

      if (isMounted) {
        setBackendStatus(isHealthy ? 'connected' : 'offline');
      }
    };

    verifyBackend();

    return () => {
      isMounted = false;
    };
  }, []);

  const [reportData, setReportData] =
    useState<AnalysisResponse | null>(null);

  const activePage = navigation.find(
    (item) => item.id === activeSection
  );

  const goToAnalysis = () => setActiveSection('analysis');

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex">

      {/* SIDEBAR */}

      <aside className="hidden lg:flex w-[260px] shrink-0 flex-col border-r border-slate-800/80 bg-[#0A1020]">

        <div className="p-6 border-b border-slate-800/70">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center">
              <BrainCircuit className="text-cyan-400" size={27} />
            </div>

            <div>
              <h1 className="font-bold text-lg tracking-tight">
                brain-mri-llava
              </h1>
              <p className="text-[10px] text-slate-500 tracking-widest uppercase">
                Medical AI Research
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 pt-7">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-semibold px-3 mb-3">
            Workspace
          </p>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all ${
                    active
                      ? 'bg-cyan-400/10 text-cyan-300 border border-cyan-400/20 shadow-[0_0_20px_rgba(34,211,238,0.06)]'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <Icon size={19} />
                  <span className="font-medium">{item.label}</span>
                  {active && (
                    <ChevronRight size={15} className="ml-auto" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-4">
          <div className="rounded-xl border border-cyan-400/15 bg-gradient-to-br from-cyan-400/10 to-transparent p-4">
            <div className="flex items-center gap-2 text-cyan-300 text-sm font-medium">
              <ShieldCheck size={17} />
              Research Environment
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mt-2">
              AI-assisted research prototype. Not intended for clinical diagnosis.
            </p>
          </div>

          <p className="text-[10px] text-slate-600 text-center mt-5">
            BRAIN-MRI-LLAVA · RESEARCH BUILD
          </p>
        </div>
      </aside>

      {/* MAIN APPLICATION */}

      <div className="flex-1 min-w-0 flex flex-col">

        {/* TOP BAR */}

        <header className="h-[76px] shrink-0 border-b border-slate-800/80 bg-[#0A1020]/90 backdrop-blur-xl flex items-center justify-between px-5 lg:px-8">

          <div>
            <p className="text-xs text-slate-500">
              Research Workstation / {activePage?.label}
            </p>
            <h2 className="text-lg font-semibold mt-1">
              {activePage?.label}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-4 py-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs text-slate-300">
                UI Running
              </span>
            </div>

            <div className="w-10 h-10 rounded-xl border border-cyan-400/20 bg-cyan-400/10 flex items-center justify-center">
              <Activity size={19} className="text-cyan-400" />
            </div>
          </div>
        </header>

        {/* MOBILE NAVIGATION */}

        <div className="lg:hidden flex overflow-x-auto gap-2 px-4 py-3 border-b border-slate-800 bg-[#0A1020]">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center gap-2 shrink-0 px-3 py-2 rounded-lg text-xs ${
                  activeSection === item.id
                    ? 'bg-cyan-400/10 text-cyan-300'
                    : 'text-slate-400 bg-slate-900'
                }`}
              >
                <Icon size={15} />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* CONTENT */}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">

          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >

            {/* OVERVIEW */}

            {activeSection === 'overview' && (
              <div className="space-y-7">

                <section className="relative overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-[#10243A] via-[#0D172B] to-[#10152A] p-7 lg:p-10">

                  <div className="absolute -right-20 -top-32 w-96 h-96 rounded-full bg-cyan-400/10 blur-[100px]" />

                  <div className="relative max-w-3xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs text-cyan-300">
                      <Zap size={13} />
                      MULTIMODAL AI RESEARCH
                    </div>

                    <h1 className="text-3xl lg:text-5xl font-bold tracking-tight mt-6 leading-tight">
                      Understand MRI scans.
                      <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-teal-400">
                        Explain with AI.
                      </span>
                    </h1>

                    <p className="text-slate-400 text-sm lg:text-base leading-relaxed mt-5 max-w-xl">
                      A radiology-guided explainable brain MRI analysis
                      workstation powered by multimodal LLaVA inference
                      and structured prompting strategies.
                    </p>

                    <button
                      onClick={goToAnalysis}
                      className="mt-8 inline-flex items-center gap-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-6 py-3.5 text-sm font-semibold text-slate-950 transition-all shadow-[0_0_30px_rgba(34,211,238,0.15)]"
                    >
                      Open MRI Analysis
                      <ArrowUpRight size={18} />
                    </button>
                  </div>
                </section>

                {/* SYSTEM STATUS */}

                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">
                      System Overview
                    </h3>
                    <span className="text-xs text-slate-500">
                      Connection status
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

                    <StatusCard
                      icon={Activity}
                      label="Frontend"
                      value="Running"
                      detail="React application is rendering"
                      color="teal"
                    />

                    <StatusCard
                      icon={Cpu}
                      label="FastAPI Backend"
                      value={
                        backendStatus === 'checking'
                          ? 'Checking...'
                          : backendStatus === 'connected'
                          ? 'Connected'
                          : 'Offline'
                      }
                      detail={
                        backendStatus === 'checking'
                          ? 'Checking remote health endpoint'
                          : backendStatus === 'connected'
                          ? 'FastAPI health check successful'
                          : 'Unable to reach the backend'
                      }
                      color={
                        backendStatus === 'connected'
                          ? 'teal'
                          : backendStatus === 'offline'
                          ? 'amber'
                          : 'cyan'
                      }
                    />

                    <StatusCard
                      icon={BrainCircuit}
                      label="LLaVA Model"
                      value="Not verified"
                      detail="Inference availability not confirmed"
                      color="violet"
                    />

                    <StatusCard
                      icon={Database}
                      label="MRI Dataset"
                      value="Not loaded"
                      detail="Waiting for image input"
                      color="cyan"
                    />

                  </div>
                </section>

                {/* FEATURE CARDS */}

                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">
                      Research Modules
                    </h3>
                    <span className="text-xs text-slate-500">
                      Explore the workstation
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">

                    {[
                      {
                        title: 'MRI Analysis Studio',
                        description: 'Upload and inspect MRI images and generate AI-assisted explanations.',
                        icon: ScanLine,
                        action: 'analysis',
                        color: 'text-cyan-400',
                      },
                      {
                        title: 'Prompt Laboratory',
                        description: 'Investigate differences between four radiology prompting strategies.',
                        icon: FlaskConical,
                        action: 'prompts',
                        color: 'text-violet-400',
                      },
                      {
                        title: 'AI Workflow',
                        description: 'Explore the complete MRI preprocessing and inference pipeline.',
                        icon: Workflow,
                        action: 'workflow',
                        color: 'text-teal-400',
                      },
                      {
                        title: 'Results & Evaluation',
                        description: 'Inspect available references and compare generated explanations.',
                        icon: ChartNoAxesCombined,
                        action: 'evaluation',
                        color: 'text-amber-400',
                      },
                      {
                        title: 'Structured Reports',
                        description: 'View findings, interpretations and uncertainty limitations.',
                        icon: FileText,
                        action: 'analysis',
                        color: 'text-sky-400',
                      },
                      {
                        title: 'Dataset Explorer',
                        description: 'Prepare to inspect MRI metadata and available annotations.',
                        icon: Database,
                        action: 'evaluation',
                        color: 'text-emerald-400',
                      },
                    ].map((feature) => {
                      const Icon = feature.icon;

                      return (
                        <button
                          key={feature.title}
                          onClick={() =>
                            setActiveSection(feature.action as Section)
                          }
                          className="text-left rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:border-cyan-400/30 hover:bg-slate-900 transition-all group"
                        >
                          <div className="flex items-center justify-between">
                            <Icon size={24} className={feature.color} />
                            <ArrowUpRight
                              size={17}
                              className="text-slate-600 group-hover:text-cyan-400 transition"
                            />
                          </div>

                          <h4 className="font-semibold mt-5">
                            {feature.title}
                          </h4>

                          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                            {feature.description}
                          </p>
                        </button>
                      );
                    })}

                  </div>
                </section>

                {/* RECENT ACTIVITY */}

                <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                  <div className="flex items-center gap-2">
                    <Clock3 size={18} className="text-cyan-400" />
                    <h3 className="font-semibold">
                      Recent Analysis Activity
                    </h3>
                  </div>

                  {reportData ? (
                    <div className="mt-5 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">
                          MRI analysis completed
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {promptLabels[reportData.promptType] ||
                            reportData.promptType} strategy
                        </p>
                      </div>
                      <button
                        onClick={goToAnalysis}
                        className="text-xs text-cyan-400 hover:text-cyan-300"
                      >
                        View report →
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileImage
                        size={30}
                        className="text-slate-600 mx-auto"
                      />
                      <p className="text-sm text-slate-400 mt-3">
                        No analysis performed in this session.
                      </p>
                      <button
                        onClick={goToAnalysis}
                        className="text-xs text-cyan-400 mt-3 hover:underline"
                      >
                        Start your first analysis
                      </button>
                    </div>
                  )}
                </section>

              </div>
            )}

            {/* MRI ANALYSIS */}

            {activeSection === 'analysis' && (
              <div className="space-y-6">

                <div>
                  <h2 className="text-xl font-bold">
                    MRI Analysis Studio
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Upload a brain MRI image and configure your
                    multimodal AI analysis.
                  </p>
                </div>

                <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-4 flex gap-3 text-sm text-amber-200">
                  <AlertTriangle size={19} className="shrink-0 text-amber-400"/>
                  <p>
                    Research and educational use only. AI-generated
                    findings are not clinically validated diagnoses.
                  </p>
                </div>

                {/* PREPROCESSED SAMPLE EXPLORER */}
                <MRIViewer />

                {/* UPLOAD AND RUN THE CONNECTED AI ANALYSIS */}
                <div className="border-t border-slate-800 pt-6">
                  <div className="mb-5">
                    <h3 className="text-lg font-semibold">Run AI Analysis</h3>
                    <p className="mt-1 text-sm text-slate-400">
                      Upload an MRI image and send it to the connected backend for analysis.
                    </p>
                  </div>
                  <Workspace onReportGenerated={setReportData} />
                </div>

                {reportData && (
                  <section className="rounded-2xl border border-cyan-400/20 bg-slate-900/80 p-5 sm:p-7 space-y-6">

                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-5">
                      <div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="text-teal-400" size={21}/>
                          <h3 className="text-lg font-semibold">
                            AI-Generated Structured Report
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                          Generated using {promptLabels[reportData.promptType] ||
                            reportData.promptType} prompting
                        </p>
                      </div>

                      <span className="text-xs rounded-full border border-teal-400/20 bg-teal-400/10 text-teal-300 px-3 py-1.5">
                        Research Output
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {reportFields.map((field) => (
                        <div
                          key={field.key}
                          className="rounded-xl border border-slate-800 bg-[#0A1020] p-5"
                        >
                          <p className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                            {field.label}
                          </p>
                          <p className="text-sm text-slate-300 leading-relaxed mt-3">
                            {reportData.report[field.key] || 'Not provided.'}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-xl border border-amber-800/30 bg-amber-950/20 p-5">
                      <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
                        Uncertainty & Limitations
                      </p>
                      <p className="text-sm text-slate-300 mt-3 leading-relaxed">
                        {reportData.report.uncertainty || 'Not provided.'}
                      </p>
                    </div>

                    <p className="text-xs text-slate-500">
                      This AI-generated research output must not be used
                      for clinical diagnosis or treatment decisions.
                    </p>
                  </section>
                )}
              </div>
            )}

            {/* OTHER MODULES - TO BE IMPLEMENTED */}

            {activeSection !== 'overview' &&
              activeSection !== 'analysis' && (
                <div className="min-h-[450px] flex flex-col items-center justify-center text-center rounded-3xl border border-slate-800 bg-slate-900/40 p-8">

                  {activeSection === 'prompts' && (
                    <FlaskConical size={42} className="text-violet-400"/>
                  )}

                  {activeSection === 'workflow' && (
                    <Workflow size={42} className="text-teal-400"/>
                  )}

                  {activeSection === 'evaluation' && (
                    <ChartNoAxesCombined size={42} className="text-amber-400"/>
                  )}

                  <h2 className="text-2xl font-bold mt-6">
                    {activePage?.label}
                  </h2>

                  <p className="text-sm text-slate-400 max-w-md mt-3 leading-relaxed">
                    This research module is being developed.
                    It will be connected to the actual inference,
                    preprocessing and evaluation pipeline.
                  </p>

                  <div className="mt-6 inline-flex items-center gap-2 text-xs text-slate-500 border border-slate-800 rounded-full px-4 py-2">
                    <CircleDot size={13} className="text-cyan-400"/>
                    Module development in progress
                  </div>

                  <button
                    onClick={goToAnalysis}
                    className="mt-8 text-sm text-cyan-400 hover:text-cyan-300"
                  >
                    Return to MRI Analysis →
                  </button>
                </div>
              )}

          </motion.div>

          {/* FOOTER */}

          <footer className="mt-12 border-t border-slate-800/70 pt-5 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500">
            <span>brain-mri-llava · Multimodal AI Research Prototype</span>
            <span>Not clinically validated · Educational use only</span>
          </footer>

        </main>
      </div>
    </div>
  );
}

export default App;