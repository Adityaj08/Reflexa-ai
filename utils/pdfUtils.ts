import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { JournalEntry } from '@/store/journalStore';
import { format } from 'date-fns';

const generateEntryHTML = (entry: JournalEntry) => {
  const date = format(new Date(entry.date), 'MMMM d, yyyy');
  const emotion = entry.userCorrectedEmotion || entry.emotion;
  
  return `
    <div style="margin-bottom: 20px;">
      <h2 style="color: #333; margin-bottom: 10px;">${date}</h2>
      <p style="color: #666; margin-bottom: 15px;">Emotion: ${emotion}</p>
      ${entry.image ? `<img src="${entry.image}" style="max-width: 100%; margin-bottom: 15px;" />` : ''}
      <p style="color: #333; line-height: 1.6;">${entry.content}</p>
    </div>
  `;
};

const generatePDF = async (entry: JournalEntry) => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Journal Entry</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
          }
        </style>
      </head>
      <body>
        <h1 style="color: #333; margin-bottom: 30px; text-align: center;">Journal Entry</h1>
        ${generateEntryHTML(entry)}
      </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false
    });

    await Sharing.shareAsync(uri, {
      UTI: '.pdf',
      mimeType: 'application/pdf'
    });

    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
};

export { generatePDF }; 