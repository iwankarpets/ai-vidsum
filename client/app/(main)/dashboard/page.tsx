import { Loader, Loader2 } from "lucide-react";
import VideoSubmissionForm from "./components/video-submission-form";
import { useVideoProcessingStatus } from "@/lib/hooks/queries/video";
import { cn } from "@/lib/utils";

export default function DashboardPage(){
    const { data: proccessingStatus } = useVideoProcessingStatus();


    return(
        <div className="space-y-8">
            {proccessingStatus?.isProccesing && (
                <div className={cn(
                    "relative px-4 py-3 transition-all duration-500 rounded-lg",
                    "bg-blue-500/10 border-blue-500/20"
                )}>
                    <div className="flex items-center gap-4 max-w-7xl mx-auto">
                        <div className="flex-shrink-0">
                        <div className="rounded-full bg-blue-500/15 p-1">
                            <Loader2 className="size-5 text-blue-600 animate-spin"/>
                        </div>
                    </div>
                    <div className="flex-1 flex items-center justify-center gap-4 min-w-0">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-blue-600">
                                Proccessing video in progress...
                                {proccessingStatus.progress && `(${proccessingStatus.progress}%)`}    
                            </p>
                            <p>
                                Currently analyzing `${proccessingStatus.videoTitle}`. This may 
                                take a few minutes depending on the video length
                            </p>
                        </div>
                    </div>
                    </div>
                </div>
            )}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">
                    Submit New Video
                </h1>
                <p className="text-lg text-muted-foreground max-w-3xl">
                    Enter a YouTube URL to get started with AI-powered video summarization. 
                    Our advanced AI will analyze your video and provide comprehensive insights.
                </p>
            </div>
            <div className="grid gap-8 lg:grid-cols-[2fr, 1fr]">
                <div className="space-y-6">
                    <VideoSubmissionForm/>
                </div>
            </div>
        </div>
    )
}