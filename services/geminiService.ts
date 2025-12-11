import { GoogleGenAI, GenerateContentResponse, Chat } from "@google/genai";
import { AgentType, CourseRecommendation, ScannerCriteria, Candidate } from "../types";
import { AGENT_SYSTEM_INSTRUCTIONS } from "../constants";

// Fix: Properly access Vite environment variables
const getApiKey = () => {
  // Check import.meta.env first (Vite standard)
  if (import.meta.env.VITE_GEMINI_API_KEY) {
    return import.meta.env.VITE_GEMINI_API_KEY;
  }
  // Fallback to API_KEY for backward compatibility
  if (import.meta.env.API_KEY) {
    return import.meta.env.API_KEY;
  }
  console.error("No Gemini API key found in environment variables");
  return "";
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

export const generateAgentResponse = async (
  message: string,
  agentType: AgentType,
  history: { role: 'user' | 'model'; content: string }[]
): Promise<string> => {
  try {
    const modelId = 'gemini-2.5-flash';
    
    const chat: Chat = ai.chats.create({
      model: modelId,
      config: {
        systemInstruction: AGENT_SYSTEM_INSTRUCTIONS[agentType],
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.content }]
      }))
    });

    const response: GenerateContentResponse = await chat.sendMessage({ message });
    return response.text || "I'm having trouble thinking right now. Please try again.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I encountered an error connecting to the AI service.";
  }
};

export const getLiveClient = () => {
    return ai;
}

export const parseResumeWithGemini = async (base64Data: string, mimeType: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: `Analyze this resume and extract the following information in JSON format:
            - currentTitle: The candidate's most recent or current job title.
            - skills: A comma-separated string of technical and soft skills.
            - location: The candidate's current location (City, Country).
            - targetRole: A recommended next role based on their experience.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Resume parsing error:", error);
    return null;
  }
};

export const analyzeCandidateResume = async (
    base64Data: string, 
    mimeType: string, 
    criteria: ScannerCriteria
): Promise<Candidate> => {
    try {
        const prompt = `
        You are an AI Recruitment Engine. Analyze the attached resume against these strict criteria:
        
        CRITERIA:
        1. Target Role: ${criteria.role}
        2. Experience Range: ${criteria.minExp} to ${criteria.maxExp} years.
        3. Custom Requirement: "${criteria.customPrompt}"
        4. Check for Bias: ${criteria.filterBias ? "Yes (Flag generic pronouns, age indicators, marital status)" : "No"}
        5. Check for Duplicates: ${criteria.filterDuplicates ? "Yes (Generate a short hash of the resume text)" : "No"}

        OUTPUT REQUIREMENTS:
        Return a JSON object matching this structure exactly:
        {
            "name": "Candidate Name",
            "role": "Current Role found in resume",
            "experience": number (total years),
            "matchScore": number (0-100 based on fit),
            "status": "passed" | "failed",
            "flags": ["list", "of", "red", "flags", "or", "bias", "issues"],
            "agentNotes": {
                "screener": "Comment on experience vs requirement (e.g. '5y matches range 2-10y')",
                "biasCheck": "Comment on any bias found or 'Clean'",
                "tech": "Comment on specific skill matches from custom requirement",
                "referee": "Final short verdict"
            }
        }

        Logic for Status:
        - FAIL if experience is outside range (${criteria.minExp}-${criteria.maxExp}).
        - FAIL if matchScore < 60.
        - FAIL if bias detected and filterBias is true.
        - OTHERWISE "passed".
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { inlineData: { mimeType: mimeType, data: base64Data } },
                    { text: prompt }
                ]
            },
            config: {
                responseMimeType: "application/json"
            }
        });

        const result = JSON.parse(response.text || "{}");
        
        return {
            id: Math.random().toString(36).substr(2, 9),
            ...result
        };

    } catch (error) {
        console.error("Bulk Analysis Error:", error);
        return {
            id: Math.random().toString(36).substr(2, 9),
            name: "Unknown Candidate (Error)",
            role: "N/A",
            experience: 0,
            matchScore: 0,
            status: "failed",
            flags: ["Processing Error"],
            agentNotes: {
                screener: "Failed to parse",
                biasCheck: "N/A",
                tech: "N/A",
                referee: "System Error"
            }
        };
    }
};

export const analyzeCourseWithGemini = async (url: string): Promise<CourseRecommendation> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analyze this course URL/Platform string for potential fraud, quality, and ROI for a Senior Software Engineer. 
            URL: ${url}
            
            Return JSON with keys:
            - title: Inferred course title
            - provider: Inferred provider name
            - duration: Estimated duration
            - cost: Estimated cost number (in INR)
            - roiScore: 0-100
            - matchReason: Why it fits/doesn't fit
            - verified: boolean (true if reputable provider)
            - fraudAlerts: array of strings (red flags if any)
            `,
            config: {
                responseMimeType: "application/json"
            }
        });
        
        const data = JSON.parse(response.text || "{}");
        return {
            id: `gen_${Date.now()}`,
            title: data.title || "Unknown Course",
            provider: data.provider || "Unknown Provider",
            duration: data.duration || "N/A",
            cost: data.cost || 0,
            roiScore: data.roiScore || 50,
            matchReason: data.matchReason || "Analysis complete",
            verified: data.verified || false,
            fraudAlerts: data.fraudAlerts
        };
    } catch (e) {
        console.error("Course Analysis Error", e);
        return {
            id: 'err',
            title: 'Analysis Failed',
            provider: 'System',
            duration: '-',
            cost: 0,
            roiScore: 0,
            matchReason: "Could not analyze this URL.",
            verified: false
        };
    }
}
