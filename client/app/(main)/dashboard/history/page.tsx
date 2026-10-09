"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAllJobs } from "@/lib/hooks/queries/video";
import { AlertCircle, Clock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { JobCard } from "../components/job-card";

export default function HistoryPage() {
  const [filter, setFilter] = useState<string>("all");
  const { data, isLoading, error, refetch } = useAllJobs();

  if (error && !data) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <AlertCircle className="size-12 text-red-500" />
        <p className="text-lg font-medium text-red-500">Failed to load jobs</p>
        <Button onClick={() => void refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
              <Skeleton className="h-8 w-[100px]" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!data.jobs.length) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <Clock className="size-12 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No jobs found</p>
        <p className="text-sm text-muted-foreground">
          Start creating a new job to see it here
        </p>
        <Link href="/dashboard/create" className={buttonVariants({ variant: "outline" })}>
          Create Job
        </Link>
      </div>
    );
  }

  const filteredJobs = data.jobs.filter((job) => {
    if (filter === "all") {
      return true;
    }

    if (filter === "active") {
      return job.state === "active" || job.state === "waiting";
    }

    return job.state === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Video Jobs</h1>
          <p className="text-muted-foreground">
            Track the status of your processing jobs
          </p>
        </div>
        <Select value={filter} onValueChange={(value) => setFilter(value ?? "all")}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Jobs</SelectItem>
            <SelectItem value="active">Active Jobs</SelectItem>
            <SelectItem value="completed">Completed Jobs</SelectItem>
            <SelectItem value="failed">Failed Jobs</SelectItem>
            <SelectItem value="delayed">Delayed Jobs</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No jobs match this filter
          </p>
        ) : (
          filteredJobs.map((job) => <JobCard key={job.id} job={job} />)
        )}
      </div>
    </div>
  );
}