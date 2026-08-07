"use client";

import { useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/keys";
import {
  createJobApplication,
  deleteJobApplication,
  listJobApplications,
  updateJobApplication,
  type CreateJobApplicationPayload,
  type UpdateJobApplicationPayload,
} from "../utils/job-application-api";
import {
  JOB_APPLICATION_STATUSES,
  type JobApplication,
  type JobApplicationStatus,
} from "../model/job-application";

export interface JobApplicationStats {
  total: number;
  active: number;
  interviewing: number;
  offers: number;
}

function buildStats(applications: JobApplication[]): JobApplicationStats {
  return {
    total: applications.length,
    active: applications.filter(
      (application) =>
        application.status !== "rejected" && application.status !== "offer",
    ).length,
    interviewing: applications.filter(
      (application) => application.status === "interviewing",
    ).length,
    offers: applications.filter((application) => application.status === "offer")
      .length,
  };
}

function buildStatusCounts(
  applications: JobApplication[],
): Record<JobApplicationStatus, number> {
  const counts = Object.fromEntries(
    JOB_APPLICATION_STATUSES.map((status) => [status, 0]),
  ) as Record<JobApplicationStatus, number>;

  for (const application of applications) {
    counts[application.status] += 1;
  }

  return counts;
}

export function useJobApplications() {
  const { isLoaded, isSignedIn } = useAuth();
  const queryClient = useQueryClient();
  const enabled = isLoaded && Boolean(isSignedIn);

  const query = useQuery({
    queryKey: queryKeys.jobApplications,
    queryFn: listJobApplications,
    enabled,
    staleTime: 30_000,
  });

  function invalidate() {
    return queryClient.invalidateQueries({ queryKey: queryKeys.jobApplications });
  }

  const createMutation = useMutation({
    mutationFn: (payload: CreateJobApplicationPayload) =>
      createJobApplication(payload),
    onSuccess: () => {
      void invalidate();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateJobApplicationPayload;
    }) => updateJobApplication(id, payload),
    onSuccess: () => {
      void invalidate();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteJobApplication(id),
    onSuccess: () => {
      void invalidate();
    },
  });

  const applications = useMemo(() => query.data ?? [], [query.data]);
  const stats = useMemo(() => buildStats(applications), [applications]);
  const statusCounts = useMemo(
    () => buildStatusCounts(applications),
    [applications],
  );

  return {
    applications,
    stats,
    statusCounts,
    isLoading: !isLoaded || (enabled && query.isPending),
    isSignedIn: Boolean(isSignedIn),
    error: query.error
      ? query.error instanceof Error
        ? query.error.message
        : "Unable to load your job applications."
      : "",
    refetch: () => {
      void query.refetch();
    },
    createApplication: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateApplication: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteApplication: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
