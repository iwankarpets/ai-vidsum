import { apiClient } from './client';
import {
  type ApiSuccessResponse,
  type JobsListResponse,
  type JobStatus,
  type Video,
  type VideoSubmissionRequest,
  type VideoSubmissionResponse,
} from './types';

export const submitVideo = async (
  data: VideoSubmissionRequest,
): Promise<VideoSubmissionResponse> => {
  const response = await apiClient.post<ApiSuccessResponse<VideoSubmissionResponse>>(
    '/video/transcribe',
    data,
  );
  return response.data.data;
};

export const getJobStatus = async (jobId: string | number): Promise<JobStatus> => {
  const response = await apiClient.get<ApiSuccessResponse<JobStatus>>(
    `/video/transcribe/${jobId}/status`,
  );
  return response.data.data;
};

export const getAllJobs = async (): Promise<JobsListResponse> => {
  const response = await apiClient.post<ApiSuccessResponse<JobStatus[]>>('/video/jobs/running');
  return { jobs: response.data.data };
};

export const getUserVideos = async (): Promise<Video[]> => {
  const response = await apiClient.get<ApiSuccessResponse<Video[]>>('/video');
  return response.data.data;
};

export const getVideoById = async (videoId: string): Promise<Video> => {
  const response = await apiClient.get<ApiSuccessResponse<Video>>(`/video/${videoId}`);
  return response.data.data;
};