export type AppMode = 'dental' | 'general';

export type DentalTabType = 
  | 'pdf-a4-brief'
  | 'dental-mmi'
  | 'why-dentistry'
  | 'dental-extractor'
  | 'star-d-clinic'
  | 'dental-schools'
  | 'dental-prompt'
  | 'dental-evaluator'
  | 'dental-parent';

export type TabType = 
  | DentalTabType
  | 'generator' 
  | 'library' 
  | 'evaluator' 
  | 'extractor' 
  | 'mock-interview' 
  | 'parent-guide';

export interface PdfA4RoadmapItem {
  grade: string;
  stageTitle: string;
  keySubjectsAndActivities: string;
  dentalConnection: string;
}

export interface PdfA4CorePillar {
  pillarTitle: string;
  summary: string;
  evidenceSource: string;
}

export interface PdfInterviewerQuestion {
  id: number;
  type: string;
  sourceSection: string;
  mainQuestion: string;
  interviewerIntent: string;
  followUpQuestions: string[];
  starDDefenseGuide: string;
}

export interface PdfA4BriefResult {
  applicantProfile: {
    targetUniversity: string;
    oneLineIdentity: string;
    coreKeywords: string[];
    evaluationSummary: {
      academicCompetence: string;
      dentalFit: string;
      manualDexterity: string;
      medicalEthics: string;
    };
  };
  threeYearRoadmap: PdfA4RoadmapItem[];
  corePillars: PdfA4CorePillar[];
  officerAudit: {
    strengths: string[];
    vulnerabilities: string[];
  };
  interviewerQuestions: PdfInterviewerQuestion[];
}

export interface PromptEngineeringTechnique {
  technique: string;
  description: string;
}

export interface GeneratedPromptResult {
  promptTitle: string;
  engineeredPrompt: string;
  promptEngineeringTechniques: PromptEngineeringTechnique[];
  howToUseGuide: string;
  parentCoachingTip: string;
}

export interface MasterPrompt {
  id: string;
  title: string;
  category: '꼬리질문' | '자기소개/지원동기' | 'STAR경험' | '전공심화' | '인성/갈등' | '학부모용질문지';
  targetAudience: string;
  description: string;
  coreTechnique: string;
  promptText: string;
  howToUse: string;
  parentTip: string;
}

export interface TailQuestion {
  question: string;
  intent: string;
  answeringTip: string;
}

export interface AnswerEvaluationResult {
  overallVerdict: '우수' | '보통' | '보완필요';
  overallComment: string;
  scores: {
    academic: number;
    careerFit: number;
    community: number;
    structure: number;
  };
  structureAnalysis: {
    isPrepStar: boolean;
    comment: string;
  };
  blindCheck: {
    hasViolation: boolean;
    detectedPhrases: string[];
    warningMessage: string;
  };
  tailQuestions: TailQuestion[];
  improvedAnswer: string;
  parentTip: string;
}

export interface ExtractedQuestion {
  id: number;
  category: string;
  question: string;
  sourceActivity: string;
  interviewerIntent: string;
  recommendedPrep: string;
}

export interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  timestamp: string;
}
