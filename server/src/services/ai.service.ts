import { GoogleGenerativeAI, type GenerateContentRequest } from '@google/generative-ai';
import { type VideoInfo } from './video.service.js';
import { AppError } from '../utils/errors.js';
import { StatusCodes } from 'http-status-codes';
import logger from '../utils/logger.js';
import { requireEnv } from '../config/env.js';

export interface AIAnalysis {
  summary: string;
  keyPoints: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  topics: string[];
  suggestedTags: string[];
}

const GOOGLE_API_KEY = requireEnv('GOOGLE_API_KEY');

export class AIService {
  private static readonly genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

  private static readonly model = AIService.genAI.getGenerativeModel({
    model: 'gemini-3.5-flash',
  });

  private static generatePrompt(transcription: string, videoInfo?: VideoInfo): string {
    let prompt = `You are a video content analyzer. Your task is to analyze the provided video transcription and return a JSON response,
    IMPORTANT: Your response must be valid JSON and match this exact structure:
    {
        "summary": "2-3 sentences summarizing the main content",
        "keyPoints": ["point 1", "point 2", "etc"],
        "sentiment": "positive|negative|neutral",
        "topics": ["topic1", "topic2", "etc"],
        "suggestedTags": ["#tag1", "#tag2", "etc"]
    }

    DO NOT include any text outside the JSON structure. Your response should be parsable by JSON.parse().
    Analyze this transcription:
    """
${transcription}
    """`;

    if (videoInfo) {
      prompt += `\n\nAdditional video context:
        Title: "${videoInfo.title}"
        Author: "${videoInfo.author}"
        Duration: ${videoInfo.duration} seconds`;
    }

    return prompt;
  }

  static async analyzeTranscription(
    transcription: string,
    videoInfo?: VideoInfo,
  ): Promise<AIAnalysis> {
    try {
      const prompt = AIService.generatePrompt(transcription, videoInfo);

      const generateConfig: GenerateContentRequest = {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      };

      const result = await this.model.generateContent(generateConfig);
      const text = result.response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : text;

      const analysis = JSON.parse(jsonStr) as AIAnalysis;

      if (
        !analysis.summary ||
        !Array.isArray(analysis.keyPoints) ||
        !analysis.sentiment ||
        !analysis.topics ||
        !analysis.suggestedTags
      ) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid response format');
      }

      if (!['positive', 'negative', 'neutral'].includes(analysis.sentiment)) {
        analysis.sentiment = 'neutral';
      }

      return {
        summary: analysis.summary,
        keyPoints: analysis.keyPoints || [],
        sentiment: analysis.sentiment,
        topics: analysis.topics || [],
        suggestedTags: analysis.suggestedTags || [],
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Failed to analyze transcription', { error });
      throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to analyze transcription');
    }
  }
}
