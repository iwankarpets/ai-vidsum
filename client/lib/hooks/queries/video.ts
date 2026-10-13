import { getAllJobs } from '@/lib/api/video';
import { useQuery } from '@tanstack/react-query';

interface VideoProcessingStatus {
  isProcessing: boolean;
  videoTitle?: string;
  progress?: number;
  error?: string;
}

export function useVideoProcessingStatus() {
  return useQuery<VideoProcessingStatus>({
    queryKey: ['runningJobs'],
    queryFn: async () => {
      const { jobs } = await getAllJobs();
      if (!jobs.length) {
        return { isProcessing: false };
      }

      const activeJob = jobs.find((job) => job.state === 'active' || job.state === 'waiting');
      if (!activeJob) {
        return { isProcessing: false };
      }

      return {
        isProcessing: true,
        videoTitle: activeJob.result?.videoInfo?.title || 'Processing value...',
        progress: activeJob.progress,
        error: activeJob.failedReason,
      };
    },

    refetchInterval: (query) => (query.state.status === 'error' ? false : 5000),
    refetchIntervalInBackground: false,
    retry: false,
  });
}