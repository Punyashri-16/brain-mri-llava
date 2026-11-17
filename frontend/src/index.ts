
export type PromptType =
  | 'generic'
  | 'tumor_focused'
  | 'radiology_guided'
  | 'safety_aware';

export interface StructuredReport {
  observedFindings: string;
  location: string;
  lesionCharacteristics: string;
  surroundingEdema: string;
  massEffect: string;
  possibleInterpretation: string;
  uncertainty: string;
}

export interface Evaluation {
  totalFields: number;
  assessableFields: string[];
  nonAssessableFields: string[];
  completenessPercentage: number;
  uncertaintyProvided: boolean;
  evaluationNote: string;
}

export interface AnalysisResponse {
  success: boolean;
  promptType: PromptType;
  report: StructuredReport;
  inferenceTimeSeconds: number;
  evaluation: Evaluation;
  disclaimer: string;
  error?: string;
}

