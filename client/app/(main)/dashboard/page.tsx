import VideoSubmissionForm from "./components/video-submission-form";

export default function DashboardPage(){
    return(
        <div className="space-y-8">
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