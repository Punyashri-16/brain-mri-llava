
import { useEffect, useState } from 'react';
import {
  Activity,
  Brain,
  Database,
  Image as ImageIcon,
  Layers3,
  Loader2,
  AlertCircle,
} from 'lucide-react';

type ViewKey = 'combined' | 'T1' | 'T1CE' | 'T2' | 'FLAIR' | 'mask';

interface PatientSample {
  id: string;
  slice: number;
  tumourPixels: number;
}

type SampleMetadata = Record<string, unknown>;

const samples: PatientSample[] = [
  { id: 'BraTS2021_00495', slice: 84, tumourPixels: 2068 },
  { id: 'BraTS2021_00621', slice: 69, tumourPixels: 789 },
  { id: 'BraTS2021_00000', slice: 74, tumourPixels: 1978 },
  { id: 'BraTS2021_00002', slice: 78, tumourPixels: 5220 },
];

const views: {
  key: ViewKey;
  label: string;
  filename: string;
  description: string;
}[] = [
  {
    key: 'combined',
    label: 'Combined MRI',
    filename: 'combined_mri.png',
    description: 'Four-panel view containing all four MRI modalities.',
  },
  {
    key: 'T1',
    label: 'T1',
    filename: 'T1_slice.png',
    description: 'T1-weighted MRI slice.',
  },
  {
    key: 'T1CE',
    label: 'T1CE',
    filename: 'T1CE_slice.png',
    description: 'T1-weighted contrast-enhanced MRI slice.',
  },
  {
    key: 'T2',
    label: 'T2',
    filename: 'T2_slice.png',
    description: 'T2-weighted MRI slice.',
  },
  {
    key: 'FLAIR',
    label: 'FLAIR',
    filename: 'FLAIR_slice.png',
    description: 'Fluid-attenuated inversion recovery MRI slice.',
  },
  {
    key: 'mask',
    label: 'Ground Truth Mask',
    filename: 'segmentation_mask.png',
    description: 'Dataset-provided segmentation mask, not an AI prediction.',
  },
];

const labelDescriptions = [
  { value: 0, label: 'Background' },
  { value: 1, label: 'Necrotic / non-enhancing tumour core' },
  { value: 2, label: 'Peritumoral edema' },
  { value: 4, label: 'Enhancing tumour' },
];

function displayMetadataValue(value: unknown): string {
  if (value === null || value === undefined) return '—';

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
}

export default function MRIViewer() {
  const [selectedPatient, setSelectedPatient] = useState(
    samples[0].id
  );

  const [activeView, setActiveView] = useState<ViewKey>('combined');

  const [metadata, setMetadata] = useState<SampleMetadata | null>(null);
  const [metadataError, setMetadataError] = useState(false);
  const [imageError, setImageError] = useState(false);

  const currentSample =
    samples.find((sample) => sample.id === selectedPatient) ?? samples[0];

  const samplePath = `/samples/${selectedPatient}`;

  const selectedView = views.find(
    (view) => view.key === activeView
  )!;

  const imageUrl = `${samplePath}/${selectedView.filename}`;

  useEffect(() => {
    let cancelled = false;

    const loadMetadata = async () => {
      setMetadata(null);
      setMetadataError(false);

      try {
        const response = await fetch(`${samplePath}/metadata.json`);

        if (!response.ok) {
          throw new Error('Could not load sample metadata');
        }

        const data: SampleMetadata = await response.json();

        if (!cancelled) {
          setMetadata(data);
          setMetadataError(false);
        }
      } catch {
        if (!cancelled) {
          setMetadataError(true);
        }
      }
    };

    loadMetadata();

    return () => {
      cancelled = true;
    };
  }, [samplePath]);

  const metadataEntries = metadata
    ? Object.entries(metadata).filter(
        ([, value]) => value !== null && value !== undefined
      )
    : [];

  const changePatient = (patientId: string) => {
    setSelectedPatient(patientId);
    setActiveView('combined');
    setImageError(false);
  };

  const changeView = (view: ViewKey) => {
    setActiveView(view);
    setImageError(false);
  };

  return (
    <section className="space-y-6 text-slate-100">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
            <Activity size={15} />
            Dataset exploration
          </div>

          <h2 className="text-2xl font-bold tracking-tight">
            MRI Sample Viewer
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Explore four preprocessed BraTS 2021 samples and their MRI modalities.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-300">
          <span className="h-2 w-2 rounded-full bg-cyan-400" />
          {selectedPatient}
        </div>
      </div>

      {/* Patient selector */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="mb-4 flex items-center gap-2">
          <Database size={17} className="text-cyan-400" />
          <h3 className="text-sm font-semibold">
            Select MRI Patient Sample
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {samples.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => changePatient(sample.id)}
              className={`rounded-xl border p-4 text-left transition ${
                selectedPatient === sample.id
                  ? 'border-cyan-400/60 bg-cyan-400/10'
                  : 'border-slate-700 bg-slate-950/60 hover:border-slate-500'
              }`}
            >
              <p
                className={`text-xs font-semibold ${
                  selectedPatient === sample.id
                    ? 'text-cyan-300'
                    : 'text-slate-200'
                }`}
              >
                {sample.id}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Axial slice: {sample.slice}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Mask pixels: {sample.tumourPixels.toLocaleString()}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Selected sample information */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-xs text-slate-500">Selected slice</p>
          <p className="mt-1 text-2xl font-bold text-cyan-300">
            {currentSample.slice}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-xs text-slate-500">Tumour-mask pixels</p>
          <p className="mt-1 text-2xl font-bold text-violet-300">
            {currentSample.tumourPixels.toLocaleString()}
          </p>
        </div>

        <div className="col-span-2 rounded-xl border border-slate-800 bg-slate-900/70 p-4 sm:col-span-1">
          <p className="text-xs text-slate-500">Image dimensions</p>
          <p className="mt-1 text-2xl font-bold text-slate-200">
            336 × 336
          </p>
        </div>
      </div>

      {/* MRI image and controls */}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(260px,0.8fr)]">

        {/* Main image */}
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-5 py-4">
            <div className="flex items-center gap-2">
              <ImageIcon size={17} className="text-cyan-400" />
              <span className="text-sm font-semibold">
                {selectedView.label}
              </span>
            </div>

            <span className="text-xs text-slate-500">
              336 × 336 source slices
            </span>
          </div>

          <div className="flex min-h-[340px] items-center justify-center bg-slate-950 p-4 sm:min-h-[440px]">

            {imageError ? (
              <div className="max-w-sm text-center">
                <AlertCircle
                  className="mx-auto mb-3 text-amber-400"
                  size={34}
                />

                <p className="font-medium text-slate-300">
                  Image could not be loaded
                </p>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Check whether {selectedView.filename} exists inside
                  {` ${selectedPatient}`} under public/samples.
                  The other patient assets may not have been copied yet.
                </p>
              </div>
            ) : (
              <img
                key={imageUrl}
                src={imageUrl}
                alt={`${selectedPatient} ${selectedView.label} MRI view`}
                onError={() => setImageError(true)}
                className="max-h-[420px] max-w-full rounded-lg object-contain"
              />
            )}
          </div>

          <div className="border-t border-slate-800 px-5 py-4">
            <p className="text-sm text-slate-300">
              {selectedView.description}
            </p>

            {activeView === 'mask' && (
              <p className="mt-2 text-xs leading-5 text-amber-300">
                Ground-truth dataset annotation. This is not a segmentation
                generated by the AI model.
              </p>
            )}
          </div>
        </div>

        {/* Side controls */}
        <aside className="space-y-5">

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="mb-4 flex items-center gap-2">
              <Layers3 size={17} className="text-cyan-400" />
              <h3 className="text-sm font-semibold">
                Image modalities
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {views.map((view) => (
                <button
                  key={view.key}
                  type="button"
                  onClick={() => changeView(view.key)}
                  className={`rounded-xl border px-3 py-3 text-left text-sm transition ${
                    activeView === view.key
                      ? 'border-cyan-400/60 bg-cyan-400/10 text-cyan-300'
                      : 'border-slate-700 bg-slate-950/60 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <span className="block font-semibold">
                    {view.label}
                  </span>

                  <span className="mt-1 block text-[11px] text-slate-500">
                    {view.key === 'mask' ? 'Annotation' : 'MRI image'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="mb-3 flex items-center gap-2">
              <Brain size={17} className="text-violet-400" />
              <h3 className="text-sm font-semibold">
                Segmentation labels
              </h3>
            </div>

            <p className="mb-3 text-xs leading-5 text-slate-500">
              Original BraTS label values preserved in the ground-truth mask.
            </p>

            <div className="space-y-3">
              {labelDescriptions.map((item) => (
                <div key={item.value} className="flex items-start gap-3">
                  <span className="flex h-6 min-w-7 items-center justify-center rounded-md border border-slate-700 bg-slate-950 px-2 text-xs font-bold text-cyan-300">
                    {item.value}
                  </span>

                  <span className="pt-1 text-xs leading-4 text-slate-300">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Metadata */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="mb-4 flex items-center gap-2">
          <Database size={17} className="text-cyan-400" />
          <h3 className="text-sm font-semibold">
            Sample metadata
          </h3>
        </div>

        {metadataError ? (
          <p className="text-sm text-amber-300">
            Metadata could not be loaded. Check that metadata.json
            exists in the selected patient folder.
          </p>
        ) : metadata === null ? (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Loader2 size={15} className="animate-spin" />
            Loading sample metadata...
          </div>
        ) : metadataEntries.length === 0 ? (
          <p className="text-sm text-slate-400">
            No metadata fields were found.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {metadataEntries.map(([key, value]) => (
              <div
                key={key}
                className="min-w-0 rounded-xl border border-slate-800 bg-slate-950/60 p-3"
              >
                <p className="mb-1 text-[11px] uppercase tracking-wider text-slate-500">
                  {key.replace(/[_-]/g, ' ')}
                </p>

                <p className="break-words text-sm font-medium text-slate-200">
                  {displayMetadataValue(value)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs leading-5 text-slate-500">
        Research demonstration using preprocessed BraTS 2021 samples.
        The displayed segmentation is ground truth supplied with the
        dataset and must not be interpreted as an AI-generated result
        or a clinical diagnosis. Tumour-mask pixel counts are not
        physical volume measurements.
      </p>
    </section>
  );
}
