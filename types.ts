
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role?: 'student' | 'admin';
  onboardingCompleted?: boolean;
}

export interface OnboardingPreferences {
  interests: string[];
  cities: string[];
  migrationWillingness: 'Low' | 'Medium' | 'High';
  salaryTarget: number;
  salaryGoal2Year: number;
  riskTolerance: 'Very Safe' | 'Balanced' | 'Aggressive';
  learningStyles: string[];
  language: 'English' | 'Hindi' | 'Hinglish';
}

export interface CareerProfile {
  title: string;
  skills: string[];
  experienceYears: number;
  targetRole: string;
  location: string;
}

export enum AgentType {
  CAREER_GUIDE = 'Career Guide',
  RESUME_WIZARD = 'Resume Wizard',
  INTERVIEW_COACH = 'Interview Coach',
  SALARY_NEGOTIATOR = 'Salary Negotiator'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  agent?: AgentType;
}

export interface SalaryDataPoint {
  role: string;
  min: number;
  median: number;
  max: number;
}

export interface Simulation {
  id: string;
  role: string;
  yearsToGoal: number;
  salaryRange: [number, number];
  skillGap: 'Low' | 'Medium' | 'High';
  matchScore: number;
  description: string;
  requirements: string[];
  salaryGrowth: number[]; // Array of values for chart
}

export interface CourseRecommendation {
  id: string;
  title: string;
  provider: string;
  duration: string;
  cost: number;
  roiScore: number; // 1-100
  matchReason: string;
  verified: boolean;
  fraudAlerts?: string[];
}

export interface VoiceState {
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  supported: boolean;
}

// --- Resume Scanner Types ---
export interface Candidate {
  id: string;
  name: string;
  role: string;
  experience: number;
  matchScore: number;
  status: 'passed' | 'failed' | 'pending';
  flags: string[]; // e.g., "Bias Detected", "Duplicate"
  agentNotes: {
    screener: string;
    biasCheck: string;
    tech: string;
    referee: string;
  };
}

export interface ScannerCriteria {
  role: string;
  minExp: number;
  maxExp: number;
  customPrompt: string;
  filterDuplicates: boolean;
  filterBias: boolean;
}
