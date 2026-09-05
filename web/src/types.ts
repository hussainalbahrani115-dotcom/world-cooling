export interface Appliance {
  id: string;
  nameAr: string;
  nameEn: string;
  category: string;
  imageUrl: string | null;
}

export interface Symptom {
  id: string;
  applianceId: string;
  title: string;
  description: string | null;
}

export type DiagnosticStepType = 'question' | 'paywall' | 'diagnosis';

export interface AnswerOption {
  id: string;
  answerText: string;
}

export interface DiagnosisPartInfo {
  name: string;
  sku: string;
  price: string;
  storeUrl: string;
  stockStatus: string;
  isRequired: boolean;
}

// يطابق شكل استجابة محرك التشخيص في الـ backend (DiagnosticStepResponse) —
// نوع واحد من ثلاثة بحسب node_type للعقدة الحالية.
export interface DiagnosticStep {
  type: DiagnosticStepType;
  sessionId: string;
  confidenceScore: number;
  // question
  questionText?: string;
  answers?: AnswerOption[];
  // paywall
  message?: string;
  // diagnosis
  diagnosisTitle?: string;
  rootCause?: string;
  severityLevel?: string;
  parts?: DiagnosisPartInfo[];
}
