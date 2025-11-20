import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key is missing");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const getMotivation = async (
  smokedToday: number,
  dailyLimit: number,
  situation: 'about_to_smoke' | 'just_smoked' | 'over_limit'
): Promise<string> => {
  const ai = getClient();
  if (!ai) return "התמקדו במטרה שלכם, אתם חזקים יותר מההרגל.";

  const model = 'gemini-2.5-flash';
  
  let prompt = '';
  if (situation === 'about_to_smoke') {
    prompt = `The user is about to smoke a cigarette. They have smoked ${smokedToday} out of their daily limit of ${dailyLimit}. 
    Provide a SHORT, powerful, 1-sentence scientific or emotional fact in Hebrew to convince them to wait just 10 minutes. 
    Focus on immediate lung recovery or heart rate improvement.`;
  } else if (situation === 'just_smoked') {
    prompt = `The user just smoked a cigarette. Count: ${smokedToday}/${dailyLimit}. 
    If under limit: Give positive reinforcement to stay on track for the rest of the day.
    If over limit: Be kind but firm. Ask what they can do to fix the rest of the day.
    Answer in Hebrew, 1-2 sentences max.`;
  } else {
    prompt = `The user is over their limit (${smokedToday}/${dailyLimit}). Give a short encouraging warning in Hebrew.`;
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text || "המשיכו לנסות, כל שעה נקייה היא ניצחון.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "כל נשימה נקייה מנקה את הריאות. אתם בדרך הנכונה.";
  }
};

export const getDistraction = async (): Promise<{ title: string; content: string }> => {
  const ai = getClient();
  if (!ai) return { title: "נשימה עמוקה", content: "קחו 5 נשימות עמוקות ואיטיות." };

  const prompt = `Provide a quick, engaging 5-minute distraction for someone quitting smoking. 
  It could be a trivia fact, a quick riddle, or a mindfulness tip. 
  Return JSON format: { "title": "Short Title", "content": "The content in Hebrew" }`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    
    const text = response.text;
    if (!text) throw new Error("No text returned");
    return JSON.parse(text);
  } catch (error) {
    return {
      title: "הידעת?",
      content: "כעבור 20 דקות ללא עישון, לחץ הדם והדופק שלכם חוזרים לרמה תקינה."
    };
  }
};
