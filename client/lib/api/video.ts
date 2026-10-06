import { apiClient } from "./client";
import { ApiSuccessResponse, JobsListResponse, JobStatus, Video, VideoSubmissiionRequest, VideoSubmissionResponse } from "./types";

export const submitVideo = async(
    data: VideoSubmissiionRequest
): Promise<VideoSubmissionResponse>=>{
    const response = await apiClient.post<ApiSuccessResponse<VideoSubmissionResponse>>(
        "/videos/transcribe",
        data
    )

    return response.data.data
}

export const getJobStatus = async (jobId: string): Promise<JobStatus>=>{
    const response = await apiClient.get<ApiSuccessResponse<JobStatus>>(
        `/videos/transcribe/${jobId}/status`
    )
    return response.data.data
}

export const getAllJobs = async (): Promise<JobsListResponse>=>{
    const response = await apiClient.get<ApiSuccessResponse<JobsListResponse>>(
        `/videos/jobs/running`
    )
    return response.data.data
}

export const getUserVideos = async(): Promise<Video[]>=>{
    const response = await apiClient.get<ApiSuccessResponse<Video[]>>("/videos");
    return response.data.data;
}

export const getVideoById = async(videoId: string): Promise<Video>=>{
    const response = await apiClient.get<ApiSuccessResponse<Video>>(
        "/videos/${videoId}");
    return response.data.data;
}