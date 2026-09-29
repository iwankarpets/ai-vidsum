import type { Video } from '../entities/video.entity.js';

export const transformVideo = (video: Video) => ({
  id: video.id,
  url: video.url,
  title: video.title,
  description: video.description,
  duration: video.duration,
  author: video.author,
  thumbnail: video.thumbnail,
  status: video.status,
  createdAt: video.createdAt,
  updatedAt: video.updatedAt,
  transcription: video.transcription
    ? {
        text: video.transcription.text,
        confidence: video.transcription.confidence,
        isMusic: video.transcription.isMusic,
        createdAt: video.transcription.createdAt,
      }
    : null,
  analysis: video.analysis
    ? {
        summary: video.analysis.summary,
        keyPoints: video.analysis.keyPoints,
        sentiment: video.analysis.sentiment,
        topics: video.analysis.topics,
        suggestedTags: video.analysis.suggestedTags,
        createdAt: video.analysis.createdAt,
      }
    : null,
});
