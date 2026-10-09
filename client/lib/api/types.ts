export interface User {
  id: string;
  email: string;
  name: string | null;
  isEmailVerified: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiSuccessResponse<T> {
  status: 'success';
  data: T;
}

export interface ApiErrorData {
  status: 'error';
  message: string;
  code?: string;
}

export type Sentiment = 'positive' | 'negative' | 'neutral';
export type VideoProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type JobState = 'waiting' | 'active' | 'completed' | 'failed' | 'delayed';

export interface VideoInfo {
  title: string;
  description: string;
  duration: number;
  author: string;
  videoUrl: string;
  thumbnail: string;
}

export interface VideoStatus {
  id: string;
  status: VideoProcessingStatus;
  hasTranscription: boolean;
  hasAnalysis: boolean;
  title: string | null;
  thumbnail: string | null;
}

export interface TranscriptionResult {
  text: string;
  confidence: number;
  isMusic?: boolean;
}

export interface AIAnalysis {
  summary: string;
  keyPoints: string[];
  sentiment: Sentiment;
  topics: string[];
  suggestedTags: string[];
}

export interface JobResult {
  videoInfo?: VideoInfo;
  transcription?: TranscriptionResult;
  analysis?: AIAnalysis;
  status: string;
  error?: string;
  final?: boolean;
}

export interface JobStatus {
  id: string | number;
  state: JobState;
  progress: number;
  attempts: number;
  videoStatus?: VideoStatus | null;
  failedReason?: string;
  final?: boolean;
  result?: JobResult;
}

export interface VideoSubmissionRequest {
  url: string;
}

export interface VideoSubmissionResponse {
  jobId: string | number;
  videoInfo: VideoInfo;
  message: string;
}

export interface JobsListResponse {
  jobs: JobStatus[];
}

export interface VideoTranscription {
  text: string;
  confidence: number;
  isMusic: boolean;
  createdAt: string;
}

export interface VideoAnalysis {
  summary: string;
  keyPoints: string[];
  sentiment: Sentiment;
  topics: string[];
  suggestedTags: string[];
  createdAt: string;
}

export interface Video {
  id: string;
  url: string;
  title: string;
  description: string | null;
  duration: number;
  author: string | null;
  thumbnail: string | null;
  status: VideoProcessingStatus;
  createdAt: string;
  updatedAt: string;
  transcription: VideoTranscription | null;
  analysis: VideoAnalysis | null;
}