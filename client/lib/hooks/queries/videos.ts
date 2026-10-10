import { type JobState, type Video } from '@/lib/api/types';
import { getAllJobs, getJobStatus, getUserVideos, getVideoById } from '@/lib/api/video';
import { useQuery } from '@tanstack/react-query';

const ACTIVE_STATES: JobState[] = ['waiting', 'active', 'delayed'];

export function useAllJobs() {
  return useQuery({
    queryKey: ['jobs'],
    queryFn: getAllJobs,
    refetchInterval: 5000,
  });
}

export function useJobStatus(jobId: string | number) {
  return useQuery({
    queryKey: ['job-status', jobId],
    queryFn: () => getJobStatus(jobId),
    refetchInterval: (query) => {
      const state = query.state.data?.state;
      return state && ACTIVE_STATES.includes(state) ? 3000 : false;
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}

export function useUserVideos() {
  return useQuery<Video[]>({
    queryKey: ['videos'],
    queryFn: getUserVideos,
  });
}

export function useVideoById(videoId: string) {
  return useQuery<Video>({
    queryKey: ['video', videoId],
    queryFn: () => getVideoById(videoId),
    enabled: !!videoId,
  });
}