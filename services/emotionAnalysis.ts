import { Platform } from 'react-native';

const GEMINI_API_KEY = 'AIzaSyCCvp4hroYZoG166vRf6P7ir0SeJ4Twb30';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{ type: string; text?: string; image?: string }>;
}

export interface EmotionResult {
  emotion: string;
  confidence: number;
  isUserSelected?: boolean;
}

interface AnalysisResult {
  primaryEmotion: string;
  emotions: EmotionResult[];
}

// Neutral is handled separately
export const EMOTIONS = ['joy', 'sadness', 'anger', 'fear', 'love', 'surprise'];

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
            text: `Analyze the emotional content of this text and identify the emotions present.
                   Return ONLY a JSON array of objects, each with "emotion" (string, one of: ${EMOTIONS.join(', ')}) 
                   and "confidence" (number between 0-100) fields.
                   The confidence values should sum to 100.
                   If no clear emotion is detected, return an empty array [].
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
    let emotions: EmotionResult[];
    
    try {
      // Find JSON array in the response text
      const jsonMatch = resultText.match(/\[[\s\S]*\]/);
      const jsonString = jsonMatch ? jsonMatch[0] : '[]';
      const parsedEmotions = JSON.parse(jsonString);

      // Create a complete emotion set with all possible emotions
      emotions = EMOTIONS.map(emotion => {
        const found = parsedEmotions.find((e: any) => e.emotion.toLowerCase() === emotion);
        return {
          emotion,
          confidence: found ? Math.round(found.confidence) : 0,
          isUserSelected: false
        };
      });

      // Check if we need to convert to neutral (when 2 or more emotions have 40+ confidence)
      const highConfidenceEmotions = emotions.filter(e => e.confidence >= 40);
      if (highConfidenceEmotions.length >= 2) {
        // Keep the original emotions with their confidences, just add neutral and set it as primary
        emotions.push({ 
          emotion: 'neutral', 
          confidence: 0, 
          isUserSelected: false 
        });
        return {
          primaryEmotion: 'neutral',
          emotions
        };
      }

      // If no emotions were detected or all confidences are 0, set as neutral
      const totalConfidence = emotions.reduce((sum, e) => sum + e.confidence, 0);
      if (totalConfidence === 0) {
        return {
          primaryEmotion: 'neutral',
          emotions: [
            ...emotions,
            { emotion: 'neutral', confidence: 0, isUserSelected: false }
          ]
        };
      }

      // Normalize non-zero confidences to sum to 100
      if (totalConfidence !== 100) {
        emotions = emotions.map(e => ({
          ...e,
          confidence: e.confidence === 0 ? 0 : Math.round((e.confidence / totalConfidence) * 100)
        }));
      }

      // Add neutral with 0 confidence
      emotions.push({ emotion: 'neutral', confidence: 0, isUserSelected: false });

    } catch (parseError) {
      console.error('Error parsing emotion analysis result:', parseError);
      return mockAnalysis(text);
    }
    
    // Sort by confidence descending, keeping neutral at the end
    emotions.sort((a, b) => {
      if (a.emotion === 'neutral') return 1;
      if (b.emotion === 'neutral') return -1;
      return b.confidence - a.confidence;
    });
    
    return {
      primaryEmotion: emotions[0].confidence > 0 ? emotions[0].emotion : 'neutral',
      emotions
    };
  } catch (error) {
    console.error('Error analyzing emotion:', error);
    return mockAnalysis(text);
  }
};

const mockAnalysis = (text: string): AnalysisResult => {
  const lowerText = text.toLowerCase();
  let emotions: EmotionResult[] = EMOTIONS.map(emotion => ({
    emotion,
    confidence: 0,
    isUserSelected: false
  }));

  if (lowerText.includes('happy') || lowerText.includes('joy')) {
    emotions = emotions.map(e => ({
      ...e,
      confidence: e.emotion === 'joy' ? 70 : e.emotion === 'love' ? 30 : 0
    }));
  } else if (lowerText.includes('sad') || lowerText.includes('depressed')) {
    emotions = emotions.map(e => ({
      ...e,
      confidence: e.emotion === 'sadness' ? 80 : e.emotion === 'fear' ? 20 : 0
    }));
  } else if (lowerText.includes('angry') || lowerText.includes('mad')) {
    emotions = emotions.map(e => ({
      ...e,
      confidence: e.emotion === 'anger' ? 75 : e.emotion === 'sadness' ? 25 : 0
    }));
  } else if (lowerText.includes('afraid') || lowerText.includes('anxious')) {
    emotions = emotions.map(e => ({
      ...e,
      confidence: e.emotion === 'fear' ? 65 : e.emotion === 'sadness' ? 35 : 0
    }));
  } else if (lowerText.includes('love') || lowerText.includes('care')) {
    emotions = emotions.map(e => ({
      ...e,
      confidence: e.emotion === 'love' ? 85 : e.emotion === 'joy' ? 15 : 0
    }));
  } else if (lowerText.includes('surprise') || lowerText.includes('shocked')) {
    emotions = emotions.map(e => ({
      ...e,
      confidence: e.emotion === 'surprise' ? 90 : e.emotion === 'fear' ? 10 : 0
    }));
  } else if (lowerText.includes('mixed') || lowerText.includes('confused')) {
    // Example of mixed emotions that should result in neutral
    emotions = emotions.map(e => ({
      ...e,
      confidence: e.emotion === 'joy' ? 45 :
                  e.emotion === 'sadness' ? 40 : 0
    }));
  }

  // Check if we need to convert to neutral (when 2 or more emotions have 40+ confidence)
  const highConfidenceEmotions = emotions.filter(e => e.confidence >= 40);
  if (highConfidenceEmotions.length >= 2) {
    // Keep the original emotions with their confidences, just add neutral and set it as primary
    emotions.push({ 
      emotion: 'neutral', 
      confidence: 0, 
      isUserSelected: false 
    });
    return {
      primaryEmotion: 'neutral',
      emotions
    };
  }

  // Add neutral with 0 confidence
  emotions.push({ emotion: 'neutral', confidence: 0, isUserSelected: false });

  // Sort by confidence
  emotions.sort((a, b) => {
    if (a.emotion === 'neutral') return 1;
    if (b.emotion === 'neutral') return -1;
    return b.confidence - a.confidence;
  });

  return {
    primaryEmotion: emotions[0].confidence > 0 ? emotions[0].emotion : 'neutral',
    emotions
  };
};