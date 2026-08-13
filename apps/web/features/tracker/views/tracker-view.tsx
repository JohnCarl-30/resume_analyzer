"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  DotsHorizontalIcon,
  ExclamationTriangleIcon,
  ExternalLinkIcon,
  Pencil1Icon,
  PlusIcon,
  TrashIcon,
} from "@radix-ui/react-icons";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { AppShellHeader } from "@/features/auth/components/app-shell-header";
import { useAnalysisQuota } from "@/features/account/view-models/use-analysis-quota";
import { getAnalysisQuotaNavigationState } from "@/lib/analysis-quota-navigation";
import { GAP, PADDING } from "@/lib/design-tokens";
import {
  toFormValues,
  type JobApplication,
  type JobApplicationFormValues,
  type JobApplicationStatus,
} from "../model/job-application";
import { useJobApplications } from "../view-models/use-job-applications";
import { ApplicationFormDialog } from "../components/application-form-dialog";
import { StatusMenu } from "../components/status-menu";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return dateFormatter.format(date);
}

function formValuesToPayload(values: JobApplicationFormValues) {
  return {
    company: values.company.trim(),
    role: values.role.trim(),
    status: values.status,
    location: values.location.trim() || undefined,
    jobUrl: values.jobUrl.trim() || undefined,
    notes: values.notes.trim() || undefined,
  };
}

interface ApplicationRowProps {
  application: JobApplication;
  onStatusChange: (application: JobApplication, status: JobApplicationStatus) => void;
  onEdit: (application: JobApplication) => void;
  onDelete: (application: JobApplication) => void;
  disabled: boolean;
}

function ApplicationRow({
  application,
  onStatusChange,
  onEdit,
  onDelete,
  disabled,
}: ApplicationRowProps) {
  return (
    <article className="flex flex-col gap-3 border-b border-border px-4 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <h3 className="truncate text-base font-semibold text-foreground">
            {application.role}
          </h3>
          <span className="text-sm text-muted-foreground">
            {application.company}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          {application.location ? <span>{application.location}</span> : null}
          {application.jobUrl ? (
            <a
              href={application.jobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
            >
              Job post
              <ExternalLinkIcon aria-hidden="true" />
            </a>
          ) : null}
          <span>Updated {formatDate(application.updatedAt)}</span>
        </div>
        {application.notes ? (
          <p className="mt-1 line-clamp-2 max-w-prose text-sm text-muted-foreground">
            {application.notes}
          </p>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-2 self-start sm:self-center">
        <StatusMenu
          value={application.status}
          onChange={(status) => onStatusChange(application, status)}
          disabled={disabled}
          align="end"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Actions for ${application.role} at ${application.company}`}
            >
              <DotsHorizontalIcon aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onEdit(application)}>
              <Pencil1Icon aria-hidden="true" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => onDelete(application)}
            >
              <TrashIcon aria-hidden="true" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </article>
  );
}

function TrackerSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="flex items-center justify-between border-b border-border px-4 py-4 last:border-b-0"
        >
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-7 w-24" />
        </div>
      ))}
    </div>
  );
}

export function TrackerView() {
  const {
    applications,
    stats,
    isLoading,
    error,
    createApplication,
    isCreating,
    updateApplication,
    isUpdating,
    deleteApplication,
    isDeleting,
  } = useJobApplications();
  const { quota, error: quotaError, isLoading: quotaLoading } = useAnalysisQuota();
  const quotaNav = getAnalysisQuotaNavigationState(quota, {
    isLoading: quotaLoading,
    error: quotaError,
  });

  const [isCreateOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<JobApplication | null>(null);
  const [pendingDelete, setPendingDelete] = useState<JobApplication | null>(null);

  const displayStats = [
    { label: "Tracked", value: stats.total, description: "Total applications" },
    { label: "Active", value: stats.active, description: "In the pipeline" },
    {
      label: "Interviewing",
      value: stats.interviewing,
      description: "Conversations open",
    },
    { label: "Offers", value: stats.offers, description: "Decisions to make" },
  ];

  async function handleCreate(values: JobApplicationFormValues) {
    await createApplication(formValuesToPayload(values));
    setCreateOpen(false);
    toast.success("Application added");
  }

  async function handleEdit(values: JobApplicationFormValues) {
    if (!editing) {
      return;
    }

    await updateApplication({
      id: editing.id,
      payload: formValuesToPayload(values),
    });
    setEditing(null);
    toast.success("Application updated");
  }

  async function handleStatusChange(
    application: JobApplication,
    status: JobApplicationStatus,
  ) {
    if (application.status === status) {
      return;
    }

    try {
      await updateApplication({ id: application.id, payload: { status } });
      toast.success("Status updated");
    } catch (statusError) {
      toast.error(
        statusError instanceof Error
          ? statusError.message
          : "Unable to update status.",
      );
    }
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) {
      return;
    }

    try {
      await deleteApplication(pendingDelete.id);
      toast.success("Application removed");
    } catch (deleteError) {
      toast.error(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete application.",
      );
    } finally {
      setPendingDelete(null);
    }
  }

  return (
    <>
      <AppShellHeader active="tracker" quotaNav={quotaNav} />
      <main id="main-content" className="min-h-screen bg-background text-foreground">
        <section
          className={`mx-auto flex w-full max-w-5xl flex-col ${GAP.major} px-4 py-12 sm:px-6 lg:px-8 lg:py-16`}
        >
          <header
            className={`flex flex-col ${GAP.default} border-b border-border pb-8 md:flex-row md:items-end md:justify-between`}
          >
            <div className={`flex max-w-2xl flex-col ${GAP.inline}`}>
              <h1 className="display-serif text-3xl sm:text-4xl">
                Job applications
              </h1>
              <p className="text-sm text-muted-foreground sm:text-base">
                Track where your resume went and how each conversation is moving.
              </p>
            </div>
            <Button type="button" onClick={() => setCreateOpen(true)}>
              <PlusIcon data-icon="inline-start" aria-hidden="true" />
              Add application
            </Button>
          </header>

          <dl className="grid overflow-hidden rounded-lg border border-border bg-card sm:grid-cols-2 lg:grid-cols-4">
            {displayStats.map((stat) => (
              <div
                key={stat.label}
                className={`border-b ${PADDING.default} last:border-b-0 sm:border-b lg:border-b-0 lg:border-r lg:last:border-r-0`}
              >
                <dt className="text-sm text-muted-foreground">{stat.label}</dt>
                <dd className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-semibold tracking-tight">
                    {stat.value}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {stat.description}
                  </span>
                </dd>
              </div>
            ))}
          </dl>

          {error ? (
            <Alert variant="destructive">
              <ExclamationTriangleIcon aria-hidden="true" />
              <AlertTitle>Tracker unavailable</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {isLoading ? (
            <TrackerSkeleton />
          ) : applications.length === 0 && !error ? (
            <Empty className="border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <PlusIcon aria-hidden="true" />
                </EmptyMedia>
                <EmptyTitle>No applications yet</EmptyTitle>
                <EmptyDescription>
                  Add your first application to start tracking companies, roles,
                  and where each one stands.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button type="button" onClick={() => setCreateOpen(true)}>
                  <PlusIcon data-icon="inline-start" aria-hidden="true" />
                  Add application
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <div className="overflow-hidden rounded-lg border border-border bg-background">
              {applications.map((application) => (
                <ApplicationRow
                  key={application.id}
                  application={application}
                  onStatusChange={handleStatusChange}
                  onEdit={setEditing}
                  onDelete={setPendingDelete}
                  disabled={isUpdating}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <ApplicationFormDialog
        open={isCreateOpen}
        onOpenChange={setCreateOpen}
        mode="create"
        isSubmitting={isCreating}
        onSubmit={handleCreate}
      />

      <ApplicationFormDialog
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditing(null);
          }
        }}
        mode="edit"
        initialValues={editing ? toFormValues(editing) : undefined}
        isSubmitting={isUpdating}
        onSubmit={handleEdit}
      />

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this application?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `${pendingDelete.role} at ${pendingDelete.company} will be removed from your tracker. This can't be undone.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={(event) => {
                event.preventDefault();
                void handleConfirmDelete();
              }}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
