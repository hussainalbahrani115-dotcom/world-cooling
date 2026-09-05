export interface Appliance {
  id: string;
  nameAr: string;
  nameEn: string;
  category: string;
  imageUrl: string | null;
  createdAt: string;
}

export interface Subsystem {
  id: string;
  applianceId: string;
  nameAr: string;
  nameEn: string;
}

export interface Symptom {
  id: string;
  applianceId: string;
  subsystemId: string | null;
  title: string;
  description: string | null;
}

export interface Part {
  id: string;
  name: string;
  sku: string;
  price: string;
  storeUrl: string;
  stockStatus: string;
  compatibleModels: Record<string, unknown> | null;
}

export type NodeType = 'question' | 'diagnosis' | 'paywall';

export interface NodeAnswer {
  id: string;
  nodeId: string;
  answerText: string;
  nextNodeId: string | null;
}

export interface DiagnosisPartLink {
  diagnosisId: string;
  partId: string;
  isRequired: boolean;
  part: Part;
}

export interface Diagnosis {
  id: string;
  finalNodeId: string;
  diagnosisTitle: string;
  rootCause: string;
  severityLevel: string;
  parts: DiagnosisPartLink[];
}

export interface DiagnosticNode {
  id: string;
  applianceId: string;
  subsystemId: string | null;
  questionText: string | null;
  nodeType: NodeType;
  parentNodeId: string | null;
  confidenceWeight: number | null;
  answers: NodeAnswer[];
  diagnoses: Diagnosis[];
}

export interface TreeResponse {
  appliance: Appliance;
  nodes: DiagnosticNode[];
}

export interface ReportOverview {
  totalSessions: number;
  paidSessions: number;
  abandonedSessions: number;
  activeSessions: number;
  reachedDiagnosisGate: number;
  diagnosisReachRate: number;
  paymentConversionRate: number;
}

export interface ReportByAppliance {
  applianceId: string;
  applianceName: string;
  totalSessions: number;
  paidSessions: number;
  reachedDiagnosisGate: number;
  diagnosisReachRate: number;
  paymentConversionRate: number;
}
