import { Simulation, CourseRecommendation } from '../types';
import { supabase } from './supabaseClient';

const FALLBACK_SIMULATIONS: Simulation[] = [
    {
        id: 'sim_1',
        role: 'Staff Engineer',
        yearsToGoal: 2,
        salaryRange: [5000000, 8500000],
        skillGap: 'Medium',
        matchScore: 92,
        description: 'Focus on System Design and Distributed Systems. High impact leadership track.',
        requirements: ['System Design', 'Cloud Architecture', 'Team Leadership', 'Rust'],
        salaryGrowth: [2400000, 3500000, 5000000, 6500000]
    },
    {
        id: 'sim_2',
        role: 'Engineering Manager',
        yearsToGoal: 3,
        salaryRange: [4500000, 7000000],
        skillGap: 'High',
        matchScore: 78,
        description: 'Transition to people management. Requires strong soft skills and project management.',
        requirements: ['People Management', 'Agile', 'Hiring Strategy', 'Conflict Resolution'],
        salaryGrowth: [2400000, 3000000, 4500000, 5500000]
    },
    {
        id: 'sim_3',
        role: 'Startup CTO',
        yearsToGoal: 5,
        salaryRange: [6000000, 12000000],
        skillGap: 'High',
        matchScore: 65,
        description: 'High risk, high reward. Requires full-stack mastery and business acumen.',
        requirements: ['Full Stack', 'Fundraising', 'Product Strategy', 'Scalability'],
        salaryGrowth: [2400000, 2400000, 3000000, 10000000]
    }
];

// Fetch simulations from Supabase DB
export const fetchSimulations = async (): Promise<Simulation[]> => {
  try {
      const { data, error } = await supabase
        .from('simulations')
        .select('*');
      
      if (error || !data || data.length === 0) {
        console.log('Using fallback simulation data');
        return FALLBACK_SIMULATIONS;
      }

      // Map DB fields (snake_case) to Frontend types (camelCase)
      return (data || []).map((s: any) => ({
          id: s.id,
          role: s.role,
          yearsToGoal: s.years_to_goal,
          salaryRange: [s.salary_range_min, s.salary_range_max],
          skillGap: s.skill_gap,
          matchScore: s.match_score,
          description: s.description,
          requirements: s.requirements || [],
          salaryGrowth: s.salary_growth || []
      }));

  } catch (e) {
      console.error(e);
      return FALLBACK_SIMULATIONS;
  }
};

// Replaced checkCourseUrl with a real AI analysis call in geminiService.ts
export const checkCourseUrl = async (url: string): Promise<CourseRecommendation> => {
    return {
        id: 'legacy',
        title: 'Deprecated',
        provider: 'N/A',
        duration: 'N/A',
        cost: 0,
        roiScore: 0,
        matchReason: 'Please update to use Gemini Service',
        verified: false
    };
};

export const fetchProgressStats = async () => {
    // Fetch real progress from 'user_progress' table
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (error) return {
            applications: 0,
            interviews: 0,
            skillsMastered: 4,
            coursesCompleted: 2,
            projectedSalary: 2200000
        };

        return {
            applications: data.applications_count,
            interviews: data.interviews_count,
            skillsMastered: data.skills_mastered,
            coursesCompleted: data.courses_completed || 0,
            projectedSalary: data.projected_salary
        };
    } catch (e) {
        // Fallback stats
        return {
            applications: 12,
            interviews: 3,
            skillsMastered: 4,
            coursesCompleted: 2,
            projectedSalary: 2200000
        };
    }
};