"use client";

import { cn } from "@/lib/utils";

interface ChipGroupProps<T extends string> {
  legend: string;
  hint?: string;
  options: readonly T[] | readonly { value: T; label: string }[];
  value: T | null;
  onChange: (value: T) => void;
}

function normalise<T extends string>(
  option: T | { value: T; label: string },
): { value: T; label: string } {
  return typeof option === "string" ? { value: option, label: option } : option;
}

/**
 * A single-select row of chips.
 *
 * Rendered as radio inputs rather than buttons so arrow keys move between
 * options and screen readers announce the group and its selection.
 */
export function ChipGroup<T extends string>({
  legend,
  hint,
  options,
  value,
  onChange,
}: ChipGroupProps<T>) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-foreground">{legend}</legend>
      {hint ? <p className="mt-1 text-caption text-muted-foreground">{hint}</p> : null}

      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => {
          const { value: optionValue, label } = normalise(option);
          const selected = value === optionValue;

          return (
            <label
              key={optionValue}
              className={cn(
                "cursor-pointer rounded-full border px-3.5 py-2 text-sm transition-colors",
                "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring",
                selected
                  ? "border-transparent bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-foreground/25 hover:text-foreground",
              )}
            >
              <input
                type="radio"
                name={legend}
                value={optionValue}
                checked={selected}
                onChange={() => onChange(optionValue)}
                className="sr-only"
              />
              {label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
