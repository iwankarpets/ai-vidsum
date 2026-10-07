import { JobStatus, Video } from "@/lib/api/types";
import {
  getAllJobs,
  getJobStatus,
  getUserVideos,
  getVideoById,
} from "@/lib/api/video";
import { useQuery } from "@tanstack/react-query";

export function useAllJobs() {
  return useQuery({
    queryKey: ["jobs"],
    queryFn: getAllJobs,
    refetchInterval: 5000,
  });
}

export function useJobStatus(jobId: string) {
  return useQuery({
    queryKey: ["job-status", jobId],
    queryFn: () => getJobStatus(jobId),
    refetchInterval: (query) => {
      const data = query.state.data as JobStatus | undefined;
      if (data?.state === "waiting" || data?.state === "active") {
        return 3000;
      }
      return false;
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}

export function userVideos() {
  return useQuery<Video[]>({
    queryKey: ["videos"],
    queryFn: getUserVideos,
  });
}

export function useVideoById(videoId: string) {
  return useQuery<Video>({
    queryKey: ["video", videoId],
    queryFn: () => getVideoById(videoId),
    enabled: !!videoId,
  });
}
