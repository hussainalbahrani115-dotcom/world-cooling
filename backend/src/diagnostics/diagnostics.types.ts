// أشكال استجابة محرك التشخيص. كل استجابة من الجلسة هي واحدة من هذه الأنواع الثلاثة،
// بحسب نوع العقدة الحالية (node_type) في شجرة القرار.

export interface QuestionResponse {
  type: 'question';
  sessionId: string;
  confidenceScore: number;
  questionText: string;
  answers: { id: string; answerText: string }[];
}

export interface PaywallResponse {
  type: 'paywall';
  sessionId: string;
  confidenceScore: number;
  message: string;
  requiresPayment: true;
}

export interface DiagnosisPartResponse {
  name: string;
  sku: string;
  price: string;
  storeUrl: string;
  stockStatus: string;
  isRequired: boolean;
}

export interface DiagnosisResponse {
  type: 'diagnosis';
  sessionId: string;
  confidenceScore: number;
  diagnosisTitle: string;
  rootCause: string;
  severityLevel: string;
  parts: DiagnosisPartResponse[];
}

export type DiagnosticStepResponse = QuestionResponse | PaywallResponse | DiagnosisResponse;
