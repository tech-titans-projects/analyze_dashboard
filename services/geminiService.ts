

import { GoogleGenAI, Type } from "@google/genai";
import type { SentimentResult } from '../types';
import { Sentiment } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    sentiment: {
      type: Type.STRING,
      description: 'The sentiment of the text. Must be one of "Positive", "Negative", or "Neutral".'
    },
    confidence: {
      type: Type.NUMBER,
      description: 'A confidence score between 0 and 1 for the sentiment classification.'
    },
    keywords: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'A list of keywords from the text that most influence the sentiment.'
    },
    explanation: {
      type: Type.STRING,
      description: 'A brief explanation of why the text was classified with this sentiment.'
    }
  },
  required: ['sentiment', 'confidence', 'keywords', 'explanation']
};

export async function analyzeSentimentBatch(texts: string[]): Promise<SentimentResult[]> {
  if (texts.length === 0) {
    return [];
  }

  const batchResponseSchema = {
    type: Type.ARRAY,
    items: responseSchema,
  };

  try {
    const formattedTexts = texts.map((t, i) => `TEXT ${i + 1}: "${t}"`).join('\n');
    const prompt = `Analyze the sentiment for each of the following texts. Return your response as a JSON array where each object contains the analysis for the corresponding text. The order of the objects in the array must match the order of the texts provided.

Texts:
${formattedTexts}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: batchResponseSchema,
        temperature: 0.2,
      },
    });

    const jsonText = response.text.trim();
    const parsedResults = JSON.parse(jsonText);

    if (!Array.isArray(parsedResults)) {
      throw new Error("API response was not a valid array.");
    }
    
    // The model might not return a result for every single text. We handle this gracefully.
    if (parsedResults.length !== texts.length) {
        console.warn(`API returned ${parsedResults.length} results for ${texts.length} inputs. The results will be padded with error messages.`);
    }

    return texts.map((originalText, index) => {
      const result = parsedResults[index];
      if (!result) {
        return {
          originalText,
          sentiment: Sentiment.Neutral,
          confidence: 0,
          keywords: [],
          explanation: "No analysis was returned for this specific text.",
        };
      }
      
      const sentimentValue = Object.values(Sentiment).includes(result.sentiment as Sentiment)
        ? result.sentiment
        : Sentiment.Neutral;

      return {
        originalText,
        sentiment: sentimentValue,
        confidence: result.confidence || 0,
        keywords: result.keywords || [],
        explanation: result.explanation || "No explanation provided.",
      };
    });

  } catch (error) {
    console.error("Error in batch sentiment analysis:", error);

    let errorMessage = "An error occurred during the analysis of this batch.";
    if (error instanceof Error) {
        if (error.message.includes('429') || error.message.includes('RESOURCE_EXHAUSTED')) {
            errorMessage = "API rate limit exceeded. Please try again after a short wait.";
        } else {
            errorMessage = `Analysis failed: ${error.message}`;
        }
    }
    
    return texts.map(text => ({
      originalText: text,
      sentiment: Sentiment.Neutral,
      confidence: 0,
      keywords: [],
      explanation: errorMessage
    }));
  }
}

export async function identifyMisspelledWords(text: string): Promise<string[]> {
  if (!text.trim()) {
    return [];
  }
  try {
    const prompt = `Identify all misspelled English words in the following text. Return only a JSON array of the misspelled words as strings. If there are no misspelled words, return an empty array.

Text: "${text}"`;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        temperature: 0,
      },
    });

    const jsonText = response.text.trim();
    const parsed = JSON.parse(jsonText);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Error identifying misspelled words:", error);
    return []; // Return empty array on error to avoid breaking the UI
  }
}

export async function getSpellingSuggestions(word: string): Promise<string[]> {
  try {
    const prompt = `Provide up to 5 correct spelling suggestions for the misspelled word "${word}". Return only a JSON array of the suggested words as strings. If you have no suggestions, return an empty array.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        temperature: 0.1,
      },
    });

    const jsonText = response.text.trim();
    const parsed = JSON.parse(jsonText);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Error getting spelling suggestions for word:", word, error);
    return []; // Return empty array on error
  }
}


function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        // Result is a data URL: "data:audio/webm;base64,..."
        // We need to strip the prefix
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      } else {
        reject(new Error("Failed to read blob."));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  try {
    const base64Audio = await blobToBase64(audioBlob);
    const audioPart = {
      inlineData: {
        mimeType: audioBlob.type,
        data: base64Audio,
      },
    };
    const textPart = {
      text: "Transcribe this audio recording accurately.",
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: [audioPart, textPart] },
    });
    
    return response.text.trim();
  } catch (error) {
    console.error("Error transcribing audio:", error);
    throw new Error("Failed to transcribe audio. Please try again.");
  }
}