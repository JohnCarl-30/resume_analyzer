# Spacing Audit & Design Token Implementation

## Summary

This document outlines the spacing audit performed on the resume analyzer application and the implementation of consistent design tokens.

## Changes Made

### 1. Created Design Tokens System (`lib/design-tokens.ts`)

A comprehensive design token system has been created with:

- **Spacing Scale**: Based on 4px baseline grid (4, 8, 12, 16, 24, 32, 48px)
- **Semantic Spacing Constants**: Named constants for consistent application
- **Typography Scale**: Consistent text sizes with semantic names
- **Component-Specific Patterns**: Pre-configured spacing for common components

### 2. Refactored Components

The following components have been updated to use the new design token system:

#### **High-Visibility Pages**
- ✅ `app/page.tsx` (Landing page)
- ✅ `features/resumes/views/dashboard-view.tsx`
- ✅ `features/templates/components/template-card.tsx`
- ✅ `features/onboarding/views/deep-focus-wizard.tsx`
- ✅ `features/onboarding/components/step-target-role.tsx`
- ✅ `features/onboarding/components/step-document-upload.tsx`

#### **Key Improvements**

1. **Consistent Spacing Scale**
   - All spacing now uses the 4/8/12/16/24/32/48px scale
   - Removed arbitrary spacing values (e.g., `gap-5`, `gap-7`)
   - Applied semantic names (e.g., `GAP.section`, `PADDING.generous`)

2. **Enhanced Mobile Cards**
   - Increased padding from `p-4` to `p-6` for better readability
   - Improved section separation using consistent spacing tokens

3. **Better Visual Hierarchy**
   - Template card titles increased from `text-base` to `text-lg`
   - Reordered template card elements (title → description → label)
   - Consistent gap spacing throughout

4. **Accessibility Improvements**
   - Added screen reader progress indicator to wizard navigation
   - Added `role="progressbar"` with proper ARIA attributes to step indicators
   - Added `aria-live="polite"` for step announcements

## Design Token Usage Guide

### Importing Tokens

```tsx
import { GAP, PADDING, MARGIN_TOP, COMPONENT_SPACING } from "@/lib/design-tokens";
```

### Common Patterns

#### Gaps (Space between elements)

```tsx
// Inline elements (8px) - buttons, icons, small items
className={`flex items-center ${GAP.inline}`}

// Default spacing (16px) - within cards, list items
className={`flex flex-col ${GAP.default}`}

// Section spacing (24px) - between major sections
className={`flex flex-col ${GAP.section}`}

// Major sections (32px) - page-level separation
className={`flex flex-col ${GAP.major}`}
```

#### Padding

```tsx
// Card padding (16px)
className={`rounded-lg border ${PADDING.default}`}

// Generous padding (24px) - mobile cards, spacious layouts
className={`rounded-lg border ${PADDING.generous}`}

// Component-specific patterns
className={`rounded-lg border ${COMPONENT_SPACING.mobileCard.padding}`}
```

#### Margin

```tsx
// Top margin for sections
className={`${MARGIN_TOP.section} border-t`}

// Top margin for major elements
className={`${MARGIN_TOP.major} max-w-xl`}
```

### Component-Specific Spacing

```tsx
// Mobile card with pre-configured spacing
<article className={`rounded-lg border ${COMPONENT_SPACING.mobileCard.padding}`}>
  <div className={`flex ${COMPONENT_SPACING.mobileCard.gap}`}>
    {/* Content */}
  </div>
</article>

// Form fields
<div className={`flex flex-col ${COMPONENT_SPACING.field.gap}`}>
  <label>Label</label>
  <input />
</div>
```

## Spacing Scale Reference

| Token | Tailwind | Pixels | Use Case |
|-------|----------|--------|----------|
| `tight` | `1` | 4px | Minimal spacing, badges, tight groups |
| `inline` | `2` | 8px | Icon gaps, inline elements, button content |
| `compact` | `3` | 12px | Compact spacing in small components |
| `default` | `4` | 16px | Default card/component spacing |
| `section` | `6` | 24px | Between sections within a view |
| `major` | `8` | 32px | Between major sections |
| `page` | `12` | 48px | Page-level spacing |

## Remaining Components to Audit

The following components still need spacing audit and refactoring:

### High Priority
- [ ] `features/editor/views/analysis-workspace.tsx`
- [ ] `features/editor/components/workspace/*.tsx`
- [ ] `features/onboarding/components/step-suggestions.tsx`
- [ ] `features/onboarding/components/step-template-selection.tsx`
- [ ] `features/onboarding/components/step-job-description.tsx`

### Medium Priority
- [ ] `features/editor/components/editors/*.tsx` (all editor components)
- [ ] `app/analyses/page.tsx`
- [ ] `app/analysis/[id]/page.tsx`
- [ ] `app/create-resume/page.tsx`

### Low Priority (UI Components - already well-structured)
- [ ] `components/ui/dialog.tsx`
- [ ] `components/ui/alert-dialog.tsx`
- [ ] `components/ui/table.tsx`

## Audit Checklist for New Components

When creating or updating components, check:

### Spacing
- [ ] Uses tokens from `design-tokens.ts` instead of arbitrary values
- [ ] Gap spacing follows the scale (gap-1, gap-2, gap-3, gap-4, gap-6, gap-8, gap-12)
- [ ] Padding follows the scale (p-1, p-2, p-3, p-4, p-6, p-8, p-12)
- [ ] No unusual spacing values (gap-5, gap-7, p-5, etc.)

### Typography
- [ ] Clear hierarchy (heading → subheading → body → caption)
- [ ] Appropriate font sizes from TYPE_SCALE
- [ ] Proper font weights (normal, medium, semibold)
- [ ] Comfortable line height (leading-6 for body, leading-7 for comfortable)

### Visual Hierarchy
- [ ] Important elements are larger/bolder
- [ ] Secondary text uses `text-muted-foreground`
- [ ] Proper use of whitespace to separate content
- [ ] Clear grouping of related elements

### Accessibility
- [ ] Semantic HTML (section, nav, article, etc.)
- [ ] Proper heading hierarchy (h1 → h2 → h3)
- [ ] Labels associated with inputs
- [ ] ARIA labels where needed
- [ ] Focus states visible
- [ ] Screen reader text for important UI (sr-only class)

### Interactive States
- [ ] Hover states defined
- [ ] Focus states visible (focus-visible:ring-2)
- [ ] Active/pressed states
- [ ] Disabled states (opacity-50, pointer-events-none)
- [ ] Loading states with proper feedback

### Responsive Design
- [ ] Mobile-first approach
- [ ] Breakpoints used appropriately (sm:, md:, lg:)
- [ ] Touch targets minimum 44x44px
- [ ] No horizontal scrolling on mobile

## Migration Strategy

For developers working on existing components:

1. **Import design tokens** at the top of your component file
2. **Replace hardcoded spacing** with token constants
3. **Test responsive behavior** at all breakpoints
4. **Verify accessibility** with keyboard navigation
5. **Run type check** to ensure no errors: `corepack pnpm typecheck`

### Example Migration

**Before:**
```tsx
<div className="flex flex-col gap-5 p-4">
  <div className="flex items-center gap-3">
    <h2 className="text-base">Title</h2>
  </div>
</div>
```

**After:**
```tsx
import { GAP, PADDING } from "@/lib/design-tokens";

<div className={`flex flex-col ${GAP.section} ${PADDING.default}`}>
  <div className={`flex items-center ${GAP.compact}`}>
    <h2 className="text-lg font-semibold">Title</h2>
  </div>
</div>
```

## Benefits

1. **Consistency**: All components use the same spacing scale
2. **Maintainability**: Change spacing in one place, updates everywhere
3. **Semantic**: Named constants make intent clear
4. **Predictable**: Users experience consistent rhythm throughout the app
5. **Accessible**: Proper spacing improves readability for all users

## Next Steps

1. Continue refactoring remaining components (see checklist above)
2. Add design token usage to team onboarding materials
3. Consider creating a Storybook or component gallery with spacing examples
4. Audit color usage for consistency (separate from spacing)
5. Create animation/transition tokens for consistent motion design

## Questions?

For questions about design tokens or spacing guidelines, refer to:
- `/ui-design` skill for comprehensive design principles
- This audit document for implementation details
- `lib/design-tokens.ts` for available tokens and their usage
