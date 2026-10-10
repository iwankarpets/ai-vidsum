import { getAllJobs } from "@/lib/api/video";
import { useQuery } from "@tanstack/react-query";

interface VideoProcessingStatus{
    isProccesing: boolean;
    videoTitle?: string;
    progress?: number;
    error?: string;
}

export function useVideoProcessingStatus() {
    return useQuery<VideoProcessingStatus>({
        queryKey: ["runningJobs"],
        queryFn: async () => {
            const { jobs } = await getAllJobs();
            if(!jobs.length){
                return {isProccesing: false};
            }

            const activeJob = jobs.find(job => job.state === "active" || job.state === "waiting");
            if(!activeJob){
                return {isProccesing: false};
            }

            return {
                isProccesing: true,
                videoTitle: activeJob.result?.videoInfo?.title || "Processing value...",
                progress: activeJob.progress,
                error: activeJob.failedReason
            };

        },

        refetchInterval: 5000,
        refetchIntervalInBackground:false
    });
}