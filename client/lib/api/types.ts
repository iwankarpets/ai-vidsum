export interface User {
  id: string;
  email: string;
  name: string;
  isEmailVerified: boolean;
  lastLoginAt: string;
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
  status: "success";
  data: T;
}

export interface ApiErrorData {
  status: "error";
  message: string;
  code?: string;
}

export interface VideoInfo {
  title: string;
  description: string;
  duration: number;
  author: string;
  videoUrl: string;
  thumbnail: string;
  url: string;
}

export interface VideoStatus {
  id: number;
  status: string;
  hasTranscription: boolean;
  hasAnalysis: boolean;
}

export interface JobStatus {
    id: string;
    state: "waiting" | "active" | "completed" | "failed" | "delayed";
    progress: number;
    attempts: number;
    videoStatus?: VideoStatus;
    failedReason?: string;
    final: boolean;
    result?: {
        videoInfo?: VideoInfo;
        transcription?: {
            data?: {
                text: string;
                segments: Array<{
                    start: number;
                    end: number;
                    text: string;
                }>;
            };
            analysis?: {
                summary: string;
                keyPoints: string[];
                topics: string[];
                suggestedTags: string[];
            };
            error?: string;
            final?: boolean;
        };
    };
}

export interface VideoSubmissiionRequest {
  url: string;
}

export interface VideoSubmissionResponse {
  jobId: string;
  videoInfo: VideoInfo;
  message: string;
}

export interface JobsListResponse {
  jobs: JobStatus[];
}

export interface VideoTranscriptrion {
  text: string;
  confidence: number;
  isMusic: boolean;
  createdAt: string;
}

export interface VideoAnalysis {
  summary: string;
  keyPoints: string;
  sentiment: string;
  topics: string[];
  suggestedTags: string[];
  createdAt: string;
}

export interface Video {
  id: number;
  url: string;
  title: string;
  description: string;
  duration: number;
  author: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  transcription: VideoTranscriptrion | null;
  analysis: VideoAnalysis | null;
}
