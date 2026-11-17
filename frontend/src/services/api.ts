import axios from 'axios';
import type {
  PromptType,
  AnalysisResponse,
  Evaluation,
} from '../index';

const API_BASE_URL = 'https://alris.tail98a132.ts.net/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 180000,
});

interface BackendEvaluation {
  total_fields?: number;
  assessable_fields?: string[];
  non_assessable_fields?: string[];
  completeness_percentage?: number;
  completeness_score?: number;
  uncertainty_provided?: boolean;
  evaluation_note?: string;
}

interface BackendResponse {
  status: string;
  prompt_type?: PromptType;
  report?: {
    findings?: string;
    location?: string;
    lesion_characteristics?: string;
    edema?: string;
    mass_effect?: string;
    interpretation?: string;
    uncertainty?: string;
  };
  inference_time_seconds?: number;
  evaluation?: BackendEvaluation;
  disclaimer?: string;
  error?: string;
}

interface BackendCompareResponse {
  status: string;
  total_prompts?: number;
  total_duration_seconds?: number;
  results: BackendResponse[];
  error?: string;
}

const normalizeCompleteness = (
  evaluation: BackendEvaluation | undefined
): number => {
  if (!evaluation) return 0;

  // /api/analyze reports a percentage; /api/compare reports a 0–1 score.
  if (typeof evaluation.completeness_percentage === 'number') {
    return evaluation.completeness_percentage;
  }

  if (typeof evaluation.completeness_score === 'number') {
    return Math.max(0, Math.min(100, evaluation.completeness_score * 100));
  }

  return 0;
};

const normalizeResponse = (
  data: BackendResponse,
  fallbackPrompt: PromptType
): AnalysisResponse => {
  const evaluation: Evaluation = {
    totalFields: data.evaluation?.total_fields ?? 7,
    assessableFields: data.evaluation?.assessable_fields ?? [],
    nonAssessableFields:
      data.evaluation?.non_assessable_fields ?? [],
    completenessPercentage: normalizeCompleteness(data.evaluation),
    uncertaintyProvided:
      data.evaluation?.uncertainty_provided ?? false,
    evaluationNote:
      data.evaluation?.evaluation_note ??
      (typeof data.evaluation?.completeness_score === 'number'
        ? 'Structural completeness score supplied by the comparison endpoint. This does not measure medical accuracy or factual grounding.'
        : 'Evaluation unavailable.'),
  };

  return {
    success: data.status === 'success',
    promptType: data.prompt_type ?? fallbackPrompt,
    report: {
      observedFindings: data.report?.findings ?? 'Not provided',
      location: data.report?.location ?? 'Not provided',
      lesionCharacteristics:
        data.report?.lesion_characteristics ?? 'Not provided',
      surroundingEdema: data.report?.edema ?? 'Not provided',
      massEffect: data.report?.mass_effect ?? 'Not provided',
      possibleInterpretation:
        data.report?.interpretation ?? 'Not provided',
      uncertainty: data.report?.uncertainty ?? 'Not provided',
    },
    inferenceTimeSeconds: data.inference_time_seconds ?? 0,
    evaluation,
    disclaimer:
      data.disclaimer ??
      'Research and educational use only. This output is not a clinical diagnosis.',
    error: data.error,
  };
};

export const checkHealth = async (): Promise<boolean> => {
  try {
    const response = await api.get('/health');
    return response.status === 200 &&
      response.data.status === 'healthy';
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
};

export const analyzeImage = async (
  imageFile: File,
  promptType: PromptType
): Promise<AnalysisResponse> => {
  const formData = new FormData();

  formData.append('file', imageFile);
  formData.append('prompt_type', promptType);

  const response = await api.post<BackendResponse>(
    '/analyze',
    formData
  );

  return normalizeResponse(response.data, promptType);
};

export const comparePrompts = async (
  imageFile: File
): Promise<AnalysisResponse[]> => {
  const formData = new FormData();
  formData.append('file', imageFile);

  const response = await api.post<BackendCompareResponse>(
    '/compare',
    formData,
    { timeout: 600000 }
  );

  if (response.data.status !== 'success' || !Array.isArray(response.data.results)) {
    throw new Error(
      response.data.error ?? 'The comparison endpoint returned an unexpected response.'
    );
  }

  const expectedPrompts: PromptType[] = [
    'generic',
    'tumor_focused',
    'radiology_guided',
    'safety_aware',
  ];

  const normalized = response.data.results.map((item, index) => {
    const fallbackPrompt = expectedPrompts[index] ?? 'generic';
    return normalizeResponse(item, fallbackPrompt);
  });

  return normalized;
};
