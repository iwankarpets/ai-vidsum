"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useVideoById } from "@/lib/hooks/queries/videos";
import { type Video } from "@/lib/api/types";
import { cn } from "cn";
import {
  AlertCircle,
  ArrowLeft,
  Clock,
  Copy,
  ExternalLink,
  UserIcon,
  VideoIcon,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";

const statusStyles: Record<Video["status"], string> = {
  pending: "bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20",
  processing: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20",
  completed: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20",
  failed: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20",
};

const sentimentStyles = {
  positive: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20",
  negative: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20",
  neutral: "bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-500/20",
};

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const ss = String(seconds).padStart(2, "0");
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${ss}`;
  }
  return `${minutes}:${ss}`;
}

function BackLink() {
  return (
    <Link
      href="/dashboard/videos"
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="size-4" />
      Back to videos
    </Link>
  );
}

export default function VideoDetailsPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const { data: video, isLoading, error, refetch } = useVideoById(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="space-y-6">
        <BackLink />
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
          <AlertCircle className="size-12 text-red-500" />
          <p className="text-lg font-medium text-red-500">Video not found</p>
          <Button variant="outline" onClick={() => void refetch()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const { transcription, analysis } = video;
  const isInProgress = video.status === "pending" || video.status === "processing";

  const copyTranscript = () => {
    if (!transcription) {
      return;
    }
    void navigator.clipboard
      .writeText(transcription.text)
      .then(() => toast.success("Transcript copied"))
      .catch(() => toast.error("Could not copy transcript"));
  };

  return (
    <div className="space-y-6">
      <BackLink />

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-6 p-6 md:flex-row">
          <div className="h-40 w-full shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-gray-100 to-gray-50 md:w-64">
            {video.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={video.thumbnail} alt={video.title} className="size-full object-cover" />
            ) : (
              <div className="flex size-full items-center justify-center">
                <VideoIcon className="size-10 text-muted-foreground/50" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{video.title}</h1>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium capitalize",
                  statusStyles[video.status],
                )}
              >
                {video.status}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-4" />
                {formatDuration(video.duration)}
              </span>
              {video.author && (
                <span className="inline-flex items-center gap-1.5">
                  <UserIcon className="size-4" />
                  {video.author}
                </span>
              )}
              <span>Added {new Date(video.createdAt).toLocaleDateString()}</span>
            </div>

            {video.description && (
              <p className="line-clamp-3 text-sm text-muted-foreground">{video.description}</p>
            )}

            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "outline", size: "sm", className: "gap-1.5" })}
            >
              Open original
              <ExternalLink className="size-3.5" />
            </a>
          </div>
        </div>
      </Card>

      {isInProgress && (
        <Card className="p-6 text-sm text-muted-foreground">
          This video is still being processed. Results will appear here when it is done.{" "}
          <Link href="/dashboard/history" className="font-medium text-foreground underline">
            Track progress
          </Link>
        </Card>
      )}

      {video.status === "failed" && (
        <Card className="border-red-100 bg-red-50 p-6 text-sm text-red-600">
          Processing failed for this video. Try submitting it again.
        </Card>
      )}

      {analysis && (
        <>
          <Card className="space-y-3 p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Summary</h2>
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-medium capitalize",
                  sentimentStyles[analysis.sentiment],
                )}
              >
                {analysis.sentiment}
              </span>
            </div>
            <p className="leading-relaxed text-gray-700">{analysis.summary}</p>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="space-y-3 p-6">
              <h2 className="text-lg font-semibold">Key points</h2>
              <ul className="list-disc space-y-2 pl-5 text-gray-700">
                {analysis.keyPoints.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </Card>

            <Card className="space-y-4 p-6">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">Topics</h2>
                <div className="flex flex-wrap gap-2">
                  {analysis.topics.map((topic) => (
                    <span
                      key={topic}
                      className="rounded-full bg-muted px-2.5 py-1 text-xs text-foreground"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-lg font-semibold">Suggested tags</h2>
                <div className="flex flex-wrap gap-2">
                  {analysis.suggestedTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </>
      )}

      {transcription && (
        <Card className="space-y-3 p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Transcript</h2>
              {!transcription.isMusic && (
                <p className="text-xs text-muted-foreground">
                  Confidence: {Math.round(transcription.confidence * 100)}%
                </p>
              )}
            </div>
            {!transcription.isMusic && (
              <Button variant="outline" size="sm" onClick={copyTranscript}>
                <Copy className="size-4" />
                Copy
              </Button>
            )}
          </div>

          {transcription.isMusic ? (
            <p className="text-sm text-muted-foreground">
              This video was detected as music, so there is no speech to transcribe.
            </p>
          ) : (
            <p className="max-h-96 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
              {transcription.text}
            </p>
          )}
        </Card>
      )}
    </div>
  );
}