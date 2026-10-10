"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserVideos } from "@/lib/hooks/queries/videos";
import { AlertCircle, Plus, VideoIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { VideoCard } from "../components/video-card";

export default function VideosPage() {
  const [filter, setFilter] = useState<string>("all");
  const { data: videos, isLoading, error, refetch } = useUserVideos();

  if (error && !videos) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <AlertCircle className="size-12 text-red-500" />
        <p className="text-lg font-medium text-red-500">Failed to load videos</p>
        <Button onClick={() => void refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-[180px] w-full" />
        ))}
      </div>
    );
  }

  if (!videos?.length) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <VideoIcon className="size-12 text-muted-foreground" />
        <p className="text-lg font-medium text-gray-500">No videos found</p>
        <p className="text-sm text-muted-foreground">
          Submit a video to get started with AI-powered analysis
        </p>
        <Link href="/dashboard" className={buttonVariants()}>
          <Plus className="size-4" />
          Submit New Video
        </Link>
      </div>
    );
  }

  const filteredVideos = videos.filter((video) => {
    if (filter === "all") {
      return true;
    }
    if (filter === "analyzed") {
      return !!video.analysis;
    }
    if (filter === "transcribed") {
      return !!video.transcription;
    }
    return video.status === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Videos</h1>
          <p className="text-muted-foreground">Manage and view your processed videos</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={filter} onValueChange={(value) => setFilter(value ?? "all")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter videos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Videos</SelectItem>
              <SelectItem value="analyzed">Analyzed</SelectItem>
              <SelectItem value="transcribed">Transcribed</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Link href="/dashboard" className={buttonVariants()}>
            <Plus className="size-4" />
            New Video
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        {filteredVideos.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No videos match this filter
          </p>
        ) : (
          filteredVideos.map((video) => <VideoCard key={video.id} video={video} />)
        )}
      </div>
    </div>
  );
}