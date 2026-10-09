import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useJobStatus } from "@/lib/hooks/queries/video";
import { ArrowBigLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { JobCard } from "../../components/job-card";

export default function HistoryPage(){
    const { id } = useParams()
    const {data: job, isLoading, error} = useJobStatus(id as string)

    if(error){
        return (
            <div className="text-center py-12">
                <p className="text-red-500">
                    Failed to load job details.Please try gain later.
                </p>
                <Link href="/dashboard/history" className="mt-4 inline-block">
                    <Button variant="outline">
                        <ArrowBigLeft className="mr-2 h-4 w-4"/>
                        Go back to history
                    </Button>
                </Link>
            </div>
        )
    }

    if(isLoading || !job){
        return (
            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-lg"/>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]"/>
                        <Skeleton className="h-4 w-[150px]"/>
                    </div>
                </div>
                <Card className="p-6">
                    <div className="space-y-4">
                        <Skeleton className="h-4 w-[150px]"/>
                        <Skeleton className="h-2 w-full"/>
                        <Skeleton className="h-4 w-3/4"/>
                    </div>
                </Card>
            </div>
        )
    }

    return(
        <div className="space-y-6">
            <Link href={"/dashboard/history"}>
                <Button variant="outline" size={"sm"} className="gap-1.5">
                    <ArrowBigLeft className="mr-2 h-4 w-4"/>
                    Go back to history
                </Button>
            </Link>
            <JobCard job={job} showDetails={false}/>
        </div>
    )
}