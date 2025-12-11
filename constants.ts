import { AgentType, SalaryDataPoint } from './types';

export const INITIAL_SALARY_DATA: SalaryDataPoint[] = [
  { role: 'Junior Dev', min: 600000, median: 1200000, max: 1800000 },
  { role: 'Senior Dev', min: 1800000, median: 2800000, max: 4000000 },
  { role: 'Lead Engineer', min: 3500000, median: 5000000, max: 7500000 },
  { role: 'Product Manager', min: 1500000, median: 2500000, max: 4500000 },
];

export const AGENT_SYSTEM_INSTRUCTIONS: Record<AgentType, string> = {
  [AgentType.CAREER_GUIDE]: "You are a holistic Career Guide. Help the user plan their long-term career path, suggest industries, and identify skill gaps. Keep responses concise and encouraging.",
  [AgentType.RESUME_WIZARD]: "You are an expert Resume Writer and ATS specialist. Ask the user to paste their resume text or describe their experience. Critique their experience descriptions, suggest action verbs, and help format their CV for maximum impact.",
  [AgentType.INTERVIEW_COACH]: "You are a tough but fair Interview Coach. Start by asking what role they are interviewing for. Then ask one behavioral or technical question at a time. Provide feedback on their answers.",
  [AgentType.SALARY_NEGOTIATOR]: "You are a seasoned Negotiation Expert. Help the user understand their market value in INR. Draft counter-offers and role-play negotiation scenarios."
};

export const MOCK_USER = {
  id: 'u1',
  name: 'Alex Developer',
  email: 'alex@example.com',
  avatar: 'https://picsum.photos/100/100',
};

export const MOCK_PROFILE = {
  title: 'Senior Frontend Engineer',
  skills: ['React', 'TypeScript', 'Node.js', 'Tailwind CSS'],
  experienceYears: 5,
  targetRole: 'Staff Engineer',
  location: 'Bangalore, India'
};