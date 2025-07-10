import { useJournalStore, JournalEntry } from '@/store/journalStore';

const GEMINI_API_KEY = 'AIzaSyCCvp4hroYZoG166vRf6P7ir0SeJ4Twb30';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

interface JournalPrompt {
  question: string;
  context?: string;
}

const DEFAULT_PROMPTS: JournalPrompt[] = [
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

export const generateJournalPrompts = (entries: JournalEntry[]): JournalPrompt[] => {
  if (!entries || entries.length === 0) {
    return DEFAULT_PROMPTS;
  }

  const prompts: JournalPrompt[] = [...DEFAULT_PROMPTS];
  const recentEntry = entries[0];
  const lastWeekEntries = entries.filter(entry => 
    new Date(entry.date).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
  );

  if (recentEntry.content) {
    prompts.push({
      question: "How have your thoughts evolved since your last reflection?",
      context: "Based on your last entry",
    });
  }

  // Get the primary emotion from the entry
  const primaryEmotion = recentEntry.userCorrectedEmotion || recentEntry.emotion;
  if (primaryEmotion) {
    prompts.push({
      question: `How are you managing your ${primaryEmotion.toLowerCase()} feelings today?`,
      context: "Following up on your emotions",
    });
  }

  if (lastWeekEntries.length >= 3) {
    prompts.push({
      question: "What patterns have you noticed in your thoughts and feelings this week?",
      context: "Reflecting on your week",
    });
  }

  prompts.push({
    question: "What's one small step you could take today towards your personal growth?",
  });

  return prompts;
};

export async function generateGeminiPrompt(recentEntry: any): Promise<JournalPrompt | null> {
  if (!recentEntry?.content || !GEMINI_API_KEY) {
    return null;
  }

  try {
    const prompt = `Based on this journal entry: "${recentEntry.content}", generate a single follow-up question that is:
    1. Max 15 words long
    2. Thought-provoking and encourages self-reflection
    3. Related to the emotional content or personal growth
    4. Phrased in a supportive and empathetic way

    Return ONLY the question, no other text or punctuation.`;

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
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      })
    });

    if (!response.ok) {
      console.error('Gemini API error:', await response.text());
      return null;
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return {
        question: data.candidates[0].content.parts[0].text.trim(),
        context: "LEXA's Nudge"
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error generating Gemini prompt:', error);
    return null;
  }
}

export async function generateFollowUpQuestions(text: string): Promise<string[]> {
  if (!text || !GEMINI_API_KEY) {
    return [];
  }

  try {
    const prompt = `Based on this journal entry: "${text}", generate 3 follow-up questions that are:
    1. Each max 15 words long
    2. Thought-provoking and encourage self-reflection
    3. Related to the emotional content or personal growth
    4. Phrased in a supportive and empathetic way
    5. Different from each other in focus

    Return ONLY the questions, one per line, no numbering or other text.`;

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
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      })
    });

    if (!response.ok) {
      console.error('Gemini API error:', await response.text());
      return [];
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      // Split the response into lines and clean up
      return data.candidates[0].content.parts[0].text
        .split('\n')
        .map((question: string) => question.trim())
        .filter((question: string) => question.length > 0)
        .slice(0, 3); // Ensure we only return max 3 questions
    }
    
    return [];
  } catch (error) {
    console.error('Error generating follow-up questions:', error);
    return [];
  }
}

function isPersonalQuestion(text: string): boolean {
  const personalKeywords = [
    'i ', 'me ', 'my ', 'mine ', 'myself ',
    'how am i', 'what do i', 'tell me about', 'how do i feel',
    'my emotions', 'my feelings', 'my thoughts', 'my journal',
    'my entries', 'my mood', 'my progress', 'my history'
  ];
  
  const lowercaseText = text.toLowerCase();
  return personalKeywords.some(keyword => lowercaseText.includes(keyword));
}

function getRelevantJournalInsights(entries: JournalEntry[], userMessage: string): string {
  // Get entries from the last 30 days
  const recentEntries = entries.filter(entry => {
    const entryDate = new Date(entry.date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return entryDate >= thirtyDaysAgo;
  });

  if (recentEntries.length === 0) return '';

  // Get emotion trends
  const emotionCounts: { [key: string]: number } = {};
  recentEntries.forEach(entry => {
    const emotion = entry.userCorrectedEmotion || entry.emotion;
    emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
  });

  const dominantEmotion = Object.entries(emotionCounts)
    .sort(([, a], [, b]) => b - a)[0][0];

  // Format insights
  const insights = [
    `Based on your journal entries from the last 30 days:`,
    `- You've written ${recentEntries.length} entries`,
    `- Your most frequent emotion has been ${dominantEmotion}`,
    `- Recent topics you've written about:`,
    ...recentEntries.slice(0, 3).map(entry => 
      `  • ${entry.content.slice(0, 50)}...`
    )
  ].join('\n');

  return insights;
}

export async function generateGeminiResponse(prompt: string, entries?: JournalEntry[]) {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not found');
  }

  // Extract the user's message from the prompt
  const userMessageMatch = prompt.match(/User's message: (.*?)(\n|$)/);
  const userMessage = userMessageMatch ? userMessageMatch[1] : '';

  // Check if it's a personal question and we have entries
  let enhancedPrompt = prompt;
  if (entries && entries.length > 0 && isPersonalQuestion(userMessage)) {
    const journalInsights = getRelevantJournalInsights(entries, userMessage);
    enhancedPrompt = `${prompt}\n\nRelevant information from the user's journal:\n${journalInsights}\n\nUse this information to provide a more personalized and informed response. Reference specific patterns or insights from their journal entries when relevant.`;
  }

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
                text: enhancedPrompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      })
    });

    if (!response.ok) {
      console.error('Gemini API error:', await response.text());
      throw new Error('Failed to generate response');
    }

    const data = await response.json();
    return data.candidates[0]?.content?.parts?.[0]?.text || 'I apologize, but I\'m having trouble responding right now.';
  } catch (error) {
    console.error('Error generating response:', error);
    throw error;
  }
} 