import { Card } from "@/components/ui/card";
import { JobStatus } from "@/lib/api/types";
import { cn } from "cn";
import {
  AlertCircleIcon,
  CheckCircleIcon,
  Clock,
  ClockIcon,
  Loader2Icon,
  XCircleIcon,
} from "lucide-react";
import Image from "next/image";

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
  completed: "processing complete",
  failed: "Processing failed",
  delayed: "Processing delayed",
};

const stateIcons = ({
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
        className,
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
        "group relative overflow-hidden transtion-all duration-300 hover:shadow-md",
        stateColors[job.state],
        "border-2",
      )}
    >
      <div className="p-6">
        <div className="flex items-start gap-6">
          <div className="relative shrink-0">
            <div className="h-20 w-32 rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
              {job.thumbnail || videoInfo ? (
                <div className="relative size-full">
                  <Image
                    src={job.thumbnail || videoInfo?.thumbnail}
                    alt={videoInfo?.title || "Video thumbnail"}
                    fill
                    className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              ) : (
                <div></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
