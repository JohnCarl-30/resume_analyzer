"use client";

import { CheckIcon, ChevronDownIcon } from "@radix-ui/react-icons";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  STATUS_META,
  STATUS_OPTIONS,
  type JobApplicationStatus,
} from "../model/job-application";

interface StatusMenuProps {
  value: JobApplicationStatus;
  onChange: (status: JobApplicationStatus) => void;
  disabled?: boolean;
  align?: "start" | "end";
}

export function StatusMenu({
  value,
  onChange,
  disabled,
  align = "start",
}: StatusMenuProps) {
  const current = STATUS_META[value];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          className="gap-1.5"
        >
          <Badge variant={current.badgeVariant}>{current.label}</Badge>
          <ChevronDownIcon aria-hidden="true" className="text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="min-w-40">
        {STATUS_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onSelect={() => onChange(option.value)}
            className="justify-between"
          >
            <span>{option.label}</span>
            <CheckIcon
              aria-hidden="true"
              className={cn(
                "text-primary",
                option.value === value ? "opacity-100" : "opacity-0",
              )}
            />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
