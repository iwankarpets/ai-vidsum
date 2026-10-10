import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useJobStatus } from "@/lib/hooks/queries/videos";
import { ArrowBigLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { JobCard } from "../../components/job-card";
import { Badge } from "@/components/ui/badge";

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

            {job.state === "completed" && job.result && (
                <div className="grid gap-6">
                    {job.result.transcription && (
                        <Card className="P-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-medium">Transcription Preview</h3>
                                {job.videoStatus?.hasTranscription && (
                                    <Link 
                                        href={`/dashboard/videos/${job.videoStatus.id}`}
                                        target="_blank"
                                        >
                                        <Button variant={"outline"} size={"sm"} className="gap-1.5">
                                            View Full Transcription
                                        </Button>
                                    </Link>
                                )}
                            </div>
                            <div className="max-h-40 overflow-y-hidden prose prose-sm">
                                <p className="whitespace-pre-line">
                                    {job.result.transcription.text.slice(0,300)}
                                    {job.result.transcription.text.length > 300 && "..."}
                                </p>
                            </div>
                        </Card>
                    )}

                    {job.result.analysis && (
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-medium">Analysis Preview</h3>
                                {job.videoStatus?.hasAnalysis && (
                                    <Link 
                                        href={`/dashboard/videos/${job.videoStatus.id}`}
                                        target="_blank"
                                        >
                                        <Button variant={"outline"} size={"sm"} className="gap-1.5">
                                            View Full Analysis
                                        </Button>
                                    </Link>
                                )}
                            </div>
                            <div className="max-h-40 overflow-y-hidden prose prose-sm">
                                <p className="whitespace-pre-line">
                                    {job.result.analysis.summary.slice(0,300)}
                                    {job.result.analysis.summary.length > 300 && "..."}
                                </p>
                            </div>
                            {job.result.analysis.topics.length > 0 && (
                                <div className="mt-4">
                                    <h4 className="font-medium mb-2">Topics</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {job.result.analysis.topics
                                        .slice(0, 5)
                                        .map((topic) => (
                                            <Badge key={topic} variant={"secondary"}>
                                                {topic}
                                            </Badge>
                                        ))}

                                        {job.result.analysis.topics.length > 5 && (
                                            <Badge variant={"secondary"}>
                                                +{job.result.analysis.topics.length - 5} more
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            )}
                        </Card>
                    )}
                </div>
            )}
        </div>
    )
}