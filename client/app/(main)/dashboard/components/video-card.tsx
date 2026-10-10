import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { type Video } from "@/lib/api/types";
import { cn } from "cn";
import { Clock, Eye, UserIcon, VideoIcon } from "lucide-react";
import Link from "next/link";

interface VideoCardProps {
  video: Video;
  showDetails?: boolean;
}

const statusStyles: Record<Video["status"], string> = {
  pending: "bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20",
  processing: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20",
  completed: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20",
  failed: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20",
};

const sentimentStyles = {
  positive: "bg-green-50 text-green-700",
  negative: "bg-red-50 text-red-700",
  neutral: "bg-gray-100 text-gray-700",
};

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const mm = hours > 0 ? String(minutes).padStart(2, "0") : String(minutes);
  const ss = String(seconds).padStart(2, "0");
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function VideoCard({ video, showDetails = true }: VideoCardProps) {
  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-md">
      <div className="p-6">
        <div className="flex items-start gap-6">
          <div className="relative shrink-0">
            <div className="h-24 w-32 overflow-hidden rounded-lg bg-gradient-to-br from-gray-100 to-gray-50">
              {video.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex size-full items-center justify-center">
                  <VideoIcon className="size-8 text-muted-foreground/50" />
                </div>
              )}
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-3">
              <h3 className="truncate text-base font-semibold leading-6">{video.title}</h3>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                  statusStyles[video.status],
                )}
              >
                {video.status}
              </span>
            </div>

            {showDetails && video.description && (
              <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                {video.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-3.5" />
                {formatDuration(video.duration)}
              </span>
              {video.author && (
                <span className="inline-flex items-center gap-1.5">
                  <UserIcon className="size-3.5" />
                  {video.author}
                </span>
              )}
              <span>{new Date(video.createdAt).toLocaleDateString()}</span>
            </div>

            {showDetails && video.analysis && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                    sentimentStyles[video.analysis.sentiment],
                  )}
                >
                  {video.analysis.sentiment}
                </span>
                {video.analysis.suggestedTags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {showDetails && (
            <Link
              href={`/dashboard/videos/${video.id}`}
              className={buttonVariants({
                variant: "outline",
                size: "sm",
                className: "shrink-0 gap-1.5 transition-all duration-300 hover:gap-2.5",
              })}
            >
              View
              <Eye className="size-4" />
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
}