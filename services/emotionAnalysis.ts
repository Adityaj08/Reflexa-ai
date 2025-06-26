import { Platform } from 'react-native';

const GEMINI_API_KEY = 'AIzaSyCCvp4hroYZoG166vRf6P7ir0SeJ4Twb30';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{ type: string; text?: string; image?: string }>;
}

interface AnalysisResult {
  emotion: string;
  confidence: number;
}

const EMOTIONS = ['joy', 'sadness', 'anger', 'fear', 'love', 'surprise', 'neutral'];

export const analyzeEmotion = async (text: string): Promise<AnalysisResult> => {
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Analyze the emotional content of this text and classify it into one of these emotions: ${EMOTIONS.join(', ')}. 
                   Return ONLY a JSON object with two fields: "emotion" (string, one of the listed emotions) and "confidence" (number between 0-100).
                   Text to analyze: "${text}"`
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error('Failed to analyze emotion');
    }

    const data = await response.json();
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response format');
    }

    const resultText = data.candidates[0].content.parts[0].text;
    let result;
    
    try {
      // Find JSON object in the response text
      const jsonMatch = resultText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : '{}';
      result = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Error parsing emotion analysis result:', parseError);
      return mockAnalysis(text);
    }
    
    if (!result.emotion || !EMOTIONS.includes(result.emotion) || 
        typeof result.confidence !== 'number' || 
        result.confidence < 0 || result.confidence > 100) {
      throw new Error('Invalid emotion analysis response');
    }
    
    return {
      emotion: result.emotion,
      confidence: result.confidence
    };
  } catch (error) {
    console.error('Error analyzing emotion:', error);
    return mockAnalysis(text);
  }
};

const mockAnalysis = (text: string): AnalysisResult => {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('happy') || lowerText.includes('joy') || lowerText.includes('excited')) {
    return { emotion: 'joy', confidence: 85 };
  } else if (lowerText.includes('sad') || lowerText.includes('depressed') || lowerText.includes('unhappy')) {
    return { emotion: 'sadness', confidence: 82 };
  } else if (lowerText.includes('angry') || lowerText.includes('frustrated') || lowerText.includes('mad')) {
    return { emotion: 'anger', confidence: 88 };
  } else if (lowerText.includes('afraid') || lowerText.includes('scared') || lowerText.includes('anxious')) {
    return { emotion: 'fear', confidence: 79 };
  } else if (lowerText.includes('love') || lowerText.includes('affection') || lowerText.includes('care')) {
    return { emotion: 'love', confidence: 84 };
  } else if (lowerText.includes('surprise') || lowerText.includes('shocked') || lowerText.includes('amazed')) {
    return { emotion: 'surprise', confidence: 76 };
  } else {
    // Random emotion for demo
    const randomEmotion = EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)];
    const randomConfidence = Math.floor(Math.random() * 30) + 60; // 60-90
    return { emotion: randomEmotion, confidence: randomConfidence };
  }
};