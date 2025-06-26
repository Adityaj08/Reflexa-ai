import { useJournalStore } from '@/store/journalStore';

interface JournalPrompt {
  question: string;
  context?: string;
}

export const generateJournalPrompts = (entries: any[]): JournalPrompt[] => {
  if (!entries || entries.length === 0) {
    return [
      {
        question: "What's on your mind today?",
      },
      {
        question: "How are you feeling right now?",
      },
      {
        question: "What are you grateful for today?",
      }
    ];
  }

  const prompts: JournalPrompt[] = [];
  const recentEntry = entries[0];
  const lastWeekEntries = entries.filter(entry => 
    new Date(entry.date).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
  );

  // Add follow-up prompt based on most recent entry
  if (recentEntry.content) {
    prompts.push({
      question: "How have your thoughts evolved since your last reflection?",
      context: "Based on your last entry",
    });
  }

  // Add emotion-based prompt if emotions were mentioned
  if (recentEntry.emotions && recentEntry.emotions.length > 0) {
    prompts.push({
      question: `How are you managing your ${recentEntry.emotions[0].toLowerCase()} feelings today?`,
      context: "Following up on your emotions",
    });
  }

  // Add pattern-based prompt if we have enough entries
  if (lastWeekEntries.length >= 3) {
    prompts.push({
      question: "What patterns have you noticed in your thoughts and feelings this week?",
      context: "Reflecting on your week",
    });
  }

  // Add growth-oriented prompt
  prompts.push({
    question: "What's one small step you could take today towards your personal growth?",
  });

  return prompts;
};

const GEMINI_API_KEY = 'AIzaSyCCvp4hroYZoG166vRf6P7ir0SeJ4Twb30';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export async function generateGeminiResponse(prompt: string) {
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    });

    const data = await response.json();
    
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    }
    
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error generating response:', error);
    throw error;
  }
} 