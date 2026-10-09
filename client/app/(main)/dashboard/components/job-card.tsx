import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { JobStatus } from "@/lib/api/types";
import { CheckCircledIcon } from "@radix-ui/react-icons";
// ИСПРАВЛЕНО: Правильный путь до утилиты cn (стандарт для shadcn/ui)
import { cn } from "@/lib/utils";
import {
  AlertCircleIcon,
  AlertTriangle,
  CheckCircleIcon,
  Clock,
  ClockIcon,
  ExternalLink,
  Eye,
  Loader2Icon,
  PlayCircle,
  PlayCircleIcon,
  XCircleIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface JobCardProps {
  job: JobStatus & { thumbnail?: string };
  showDetails?: boolean;
}

const stateColors = {
  waiting:
    "border-yellow-200 bg-gradient-to-r from-yellow-50/80 to-yellow-50/30",
  active: "border-blue-200 bg-gradient-to-r from-blue-50/80 to-blue-50/30",
  completed:
    "border-green-200 bg-gradient-to-r from-green-50/80 to-green-50/30",
  failed: "border-red-200 bg-gradient-to-r from-red-50/80 to-red-50/30",
  delayed:
    "border-orange-200 bg-gradient-to-r from-orange-50/80 to-orange-50/30",
};

const stateIconColors = {
  waiting: "text-yellow-500 group-hover:text-yellow-600",
  active: "text-blue-500 group-hover:text-blue-600",
  completed: "text-green-500 group-hover:text-green-600",
  failed: "text-red-500 group-hover:text-red-600",
  delayed: "text-orange-500 group-hover:text-orange-600",
};

const stateBadgeStyles = {
  waiting: "bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20",
  active: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20",
  completed: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20",
  failed: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20",
  delayed: "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-600/20",
};

const stateMessages = {
  waiting: "Queued for processing",
  active: "Processing in progress",
  completed: "Processing complete", // ИСПРАВЛЕНО: С заглавной буквы
  failed: "Processing failed",
  delayed: "Processing delayed",
};

const StateIcons = ({
  state,
  className,
}: {
  state: JobStatus["state"];
  className?: string;
}) => {
  const icons = {
    completed: CheckCircleIcon,
    failed: XCircleIcon,
    active: Loader2Icon,
    waiting: ClockIcon,
    delayed: AlertCircleIcon,
  };

  const Icon = icons[state as keyof typeof icons] || Clock;

  return (
    <Icon
      className={cn(
        "transition-all duration-300",
        stateIconColors[state as keyof typeof stateIconColors],
        state === "active" && "animate-spin",
        className
      )}
    />
  );
};

export function JobCard({ job, showDetails = true }: JobCardProps) {
  const videoInfo = job.result?.videoInfo;
  const isProcessing = job.state === "active" || job.state === "waiting";

  return (
    <Card
      className={cn(
        // ИСПРАВЛЕНО: Опечатка transtion-all -> transition-all
        "group relative overflow-hidden transition-all duration-300 hover:shadow-md",
        stateColors[job.state],
        "border-2"
      )}
    >
      <div className="p-6">
        <div className="flex items-start gap-6">
          <div className="relative shrink-0">
            <div className="h-20 w-32 rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
              {job.thumbnail || videoInfo ? (
                <div className="relative size-full">
                  <Image
                    src={job.thumbnail || "/placeholder"}
                    alt={videoInfo?.title || "Video thumbnail"}
                    fill
                    className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div
                    className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity
                  duration-300 flex items-center justify-center"
                  >
                    <PlayCircleIcon
                      className="size-8 text-white drop-shadow-lg transform scale-90 group-hover:scale-100
                    transition-transform duration-300"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60" />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full w-full">
                  <PlayCircle className="size-8 text-muted-foreground/50" />
                </div>
              )}
            </div>
            <div className="absolute -right-1 -bottom-1 p-1.5 rounded-full bg-white shadow-sm border-2 border-white">
              <StateIcons state={job.state} className="size-5" />
            </div>
          </div>

          {/* Центральный контент */}
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-base font-semibold leading-6 truncate">
                {videoInfo?.title || "Untitled Video"} {/* ИСПРАВЛЕНО: untitle -> Untitled */}
              </h3>
              <Badge
                variant={"secondary"}
                className={cn(
                  "capitalize transition-colors duration-300",
                  stateBadgeStyles[job.state]
                )}
              >
                {job.state}
              </Badge>
            </div>
            {videoInfo?.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {videoInfo.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              {videoInfo && (
                <>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="size-3.5" />
                    {Math.floor(videoInfo.duration / 60)}m
                  </span>
                  <span className="text-muted-foreground/30">.</span>
                </>
              )}
              <span>{stateMessages[job.state]}</span>
              {job.attempts > 0 && (
                <>
                  <span className="text-muted-foreground/30">.</span>
                  <span className="text-muted-foreground/90">
                    Attempt {job.attempts}/3
                  </span>
                </>
              )}
            </div>

            {isProcessing && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {job.state === "active" ? (
                      <Loader2Icon className="size-3.5 animate-spin" />
                    ) : (
                      <CheckCircledIcon className="size-3.5 text-green-500" />
                    )}
                    <span className="text-muted-foreground/75">
                      {job.state === "waiting" ? "Queued" : "Processing"}
                    </span>
                  </div>
                  <span className="font-medium text-muted-foreground/90">
                    {job.progress.toFixed(2)}%
                  </span>
                </div>
                <Progress
                  value={job.progress}
                  className="h-1.5 [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-blue-400"
                />
              </div>
            )}
            
            {job.state === "completed" &&
              job.result &&
              showDetails &&
              job.videoStatus && (
                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={"secondary"}
                      className={cn(
                        "transition-colors duration-300",
                        job.videoStatus.hasTranscription
                          ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20"
                          : "bg-green-50 text-red-700 ring-1 ring-inset ring-red-600/20"
                      )}
                    >
                      Transcription
                    </Badge>
                    <span>
                      {job.videoStatus.hasTranscription
                        ? "Complete"
                        : "Pending"}
                    </span>
                  </div>
                  <div>
                    <Badge>Analysis</Badge>
                    <span>
                      {job.videoStatus.hasAnalysis ? "Complete" : "Pending"}
                    </span>
                  </div>
                </div>
              )}

            {job.failedReason && (
              <div className="mt-4 flex items-start gap-2 rounded-md border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                <AlertTriangle className="h-5 w-5 shrink-0 text-red-500" />
                <p className="leading-relaxed">{job.failedReason}</p>
              </div>
            )}

            <div className="flex items-start gap-3 mt-4"> {/* Убрал ml-4 и добавил mt-4 для выравнивания */}
              {videoInfo && (
                <a
                  href={videoInfo.videoUrl}
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
                >
                  <PlayCircle className="size-4 text-muted-foreground/50" /> {/* Поправил размер иконки, size-8 была слишком большой для текста */}
                  <span className="hidden sm:inline">YouTube</span>
                  <ExternalLink className="h-3 w-3 opacity-50" />
                </a>
              )}
              {showDetails && (
                <Link href={`/dashboard/history/${job.id}`}>
                  <Button
                    variant={"outline"}
                    size={"sm"}
                    className="gap-1.5 transition-all duration-300 hover:gap-2.5"
                  >
                    Details
                    <Eye className="size-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}