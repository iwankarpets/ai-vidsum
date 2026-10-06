import { getAllJobs } from "@/lib/api/video";
import { useQuery } from "@tanstack/react-query";

export function useAllJobs(){
    return useQuery({
        queryKey: ["jobs"],
        queryFn: getAllJobs,
        refetchInterval: 5000
    })
}