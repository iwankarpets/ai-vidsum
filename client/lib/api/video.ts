import { apiClient } from "./client";
import { ApiSuccessResponse, VideoSubmissiionRequest, VideoSubmissionResponse } from "./types";

export const submitVideo = async(
    data: VideoSubmissiionRequest
): Promise<VideoSubmissionResponse>=>{
    const response = await apiClient.post<ApiSuccessResponse<VideoSubmissionResponse>>(
        "/videos/transcribe"
    )

    return response.data.data
}