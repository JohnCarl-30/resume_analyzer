const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function getHomeMastheadEyebrow(
  quotaError: string,
  canUpload: boolean,
) {
  if (quotaError) {
    return "Workspace";
  }
  return canUpload ? "Workspace" : "Saved check";
}

export function getHomeMastheadHeadline(
  quotaError: string,
  canUpload: boolean,
) {
  if (quotaError) {
    return "Plan status unavailable";
  }
  return canUpload ? "Ready for your next match?" : "Your check is saved";
}

export function getFirstName(displayName: string) {
  const first = displayName.trim().split(/\s+/)[0];
  return first && first !== "Your" ? first : null;
}

export function formatSavedCheckDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Recent";
  }
  return dateFormatter.format(date);
}

export function scoreToneClass(score: number) {
  if (score >= 75) {
    return "text-foreground";
  }
  if (score >= 50) {
    return "text-muted-foreground";
  }
  return "text-destructive";
}

export function savedCheckRowLabel(input: {
  fileName: string;
  score: number;
  targetRole: string;
  uploadedAt: string;
}) {
  const role = input.targetRole || "Target role not set";
  return `Open ${input.fileName}, ${input.score}% match, ${role}, ${formatSavedCheckDate(input.uploadedAt)}`;
}
