/**
 * Design Tokens - Spacing System
 * 
 * Consistent spacing scale based on 4px baseline grid.
 * Follow these scales for all spacing to maintain visual rhythm.
 */

/**
 * Spacing scale (in Tailwind units)
 * 1 unit = 0.25rem = 4px
 */
export const SPACING = {
  /** 4px - Minimal spacing for very tight elements */
  tight: "1" as const,
  /** 8px - Inline elements, icon gaps, small spacing */
  inline: "2" as const,
  /** 12px - Compact spacing within small components */
  compact: "3" as const,
  /** 16px - Default spacing within cards/components */
  default: "4" as const,
  /** 24px - Section spacing within major areas */
  section: "6" as const,
  /** 32px - Major section separation */
  major: "8" as const,
  /** 48px - Page-level spacing */
  page: "12" as const,
} as const;

/**
 * Gap utilities using the spacing scale
 */
export const GAP = {
  /** gap-1 (4px) - Minimal spacing for very tight elements */
  tight: `gap-${SPACING.tight}` as const,
  /** gap-2 (8px) - Inline elements, icon gaps */
  inline: `gap-${SPACING.inline}` as const,
  /** gap-3 (12px) - Compact spacing within small components */
  compact: `gap-${SPACING.compact}` as const,
  /** gap-4 (16px) - Default spacing within cards/components */
  default: `gap-${SPACING.default}` as const,
  /** gap-6 (24px) - Section spacing within major areas */
  section: `gap-${SPACING.section}` as const,
  /** gap-8 (32px) - Major section separation */
  major: `gap-${SPACING.major}` as const,
  /** gap-12 (48px) - Page-level spacing */
  page: `gap-${SPACING.page}` as const,
} as const;

/**
 * Padding utilities using the spacing scale
 */
export const PADDING = {
  /** p-1 (4px) */
  tight: `p-${SPACING.tight}` as const,
  /** p-2 (8px) */
  inline: `p-${SPACING.inline}` as const,
  /** p-3 (12px) */
  compact: `p-${SPACING.compact}` as const,
  /** p-4 (16px) - Default card padding */
  default: `p-${SPACING.default}` as const,
  /** p-6 (24px) - Generous card padding */
  generous: `p-${SPACING.section}` as const,
  /** p-8 (32px) - Large section padding */
  large: `p-${SPACING.major}` as const,
  /** p-12 (48px) - Page-level padding */
  page: `p-${SPACING.page}` as const,
} as const;

/**
 * Horizontal padding utilities
 */
export const PADDING_X = {
  /** px-2 (8px) */
  inline: `px-${SPACING.inline}` as const,
  /** px-2.5 (10px) - Input/button padding */
  input: "px-2.5" as const,
  /** px-3 (12px) */
  compact: `px-${SPACING.compact}` as const,
  /** px-4 (16px) - Default card horizontal padding */
  default: `px-${SPACING.default}` as const,
  /** px-6 (24px) - Generous horizontal padding */
  generous: `px-${SPACING.section}` as const,
  /** px-8 (32px) - Large section horizontal padding */
  large: `px-${SPACING.major}` as const,
} as const;

/**
 * Vertical padding utilities
 */
export const PADDING_Y = {
  /** py-1 (4px) */
  tight: `py-${SPACING.tight}` as const,
  /** py-2 (8px) */
  inline: `py-${SPACING.inline}` as const,
  /** py-3 (12px) */
  compact: `py-${SPACING.compact}` as const,
  /** py-4 (16px) - Default card vertical padding */
  default: `py-${SPACING.default}` as const,
  /** py-6 (24px) - Generous vertical padding */
  generous: `py-${SPACING.section}` as const,
  /** py-8 (32px) - Large section vertical padding */
  large: `py-${SPACING.major}` as const,
} as const;

/**
 * Margin utilities using the spacing scale
 */
export const MARGIN_TOP = {
  /** mt-1 (4px) */
  tight: `mt-${SPACING.tight}` as const,
  /** mt-2 (8px) */
  inline: `mt-${SPACING.inline}` as const,
  /** mt-3 (12px) */
  compact: `mt-${SPACING.compact}` as const,
  /** mt-4 (16px) */
  default: `mt-${SPACING.default}` as const,
  /** mt-6 (24px) */
  section: `mt-${SPACING.section}` as const,
  /** mt-8 (32px) */
  major: `mt-${SPACING.major}` as const,
} as const;

/**
 * Typography spacing
 */
export const TYPE_SPACING = {
  /** text-xs to text-sm line height */
  tight: "leading-5" as const,
  /** text-base default line height */
  default: "leading-6" as const,
  /** text-base comfortable line height */
  comfortable: "leading-7" as const,
  /** text-lg+ comfortable line height */
  relaxed: "leading-8" as const,
} as const;

/**
 * Typography scale with consistent sizing
 */
export const TYPE_SCALE = {
  /** text-xs (12px) - Captions, labels */
  xs: "text-xs" as const,
  /** text-sm (14px) - Body text, secondary text */
  sm: "text-sm" as const,
  /** text-base (16px) - Primary body text */
  base: "text-base" as const,
  /** text-lg (18px) - Card titles, small headings */
  lg: "text-lg" as const,
  /** text-xl (20px) - Section headings */
  xl: "text-xl" as const,
  /** text-2xl (24px) - Major headings */
  "2xl": "text-2xl" as const,
  /** text-3xl (30px) - Page titles */
  "3xl": "text-3xl" as const,
  /** text-4xl (36px) - Hero headings */
  "4xl": "text-4xl" as const,
} as const;

/**
 * Font weights with semantic names
 */
export const FONT_WEIGHT = {
  /** font-normal (400) - Body text */
  normal: "font-normal" as const,
  /** font-medium (500) - Card titles, labels */
  medium: "font-medium" as const,
  /** font-semibold (600) - Section headings */
  semibold: "font-semibold" as const,
  /** font-bold (700) - Emphasis */
  bold: "font-bold" as const,
} as const;

/**
 * Common component spacing patterns
 */
export const COMPONENT_SPACING = {
  /** Standard card internal spacing */
  card: {
    gap: GAP.default,
    padding: PADDING.default,
    paddingGenerous: PADDING.generous,
  },
  /** Button internal spacing */
  button: {
    gap: GAP.inline,
    paddingX: PADDING_X.input,
    paddingY: PADDING_Y.inline,
  },
  /** Form field spacing */
  field: {
    gap: GAP.inline,
    labelGap: GAP.inline,
  },
  /** Page layout spacing */
  page: {
    section: GAP.section,
    major: GAP.major,
  },
  /** Mobile card spacing */
  mobileCard: {
    padding: PADDING.generous,
    gap: GAP.default,
    sectionGap: GAP.section,
  },
} as const;

/**
 * Helper function to get spacing value
 */
export function spacing(key: keyof typeof SPACING): string {
  return SPACING[key];
}

/**
 * Helper function to build spacing classes
 */
export function spacingClass(
  type: "gap" | "p" | "px" | "py" | "pt" | "pb" | "pl" | "pr" | "m" | "mx" | "my" | "mt" | "mb" | "ml" | "mr",
  size: keyof typeof SPACING
): string {
  return `${type}-${SPACING[size]}`;
}
