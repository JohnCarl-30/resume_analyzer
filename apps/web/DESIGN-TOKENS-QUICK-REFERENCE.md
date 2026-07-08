# Design Tokens Quick Reference

A quick cheat sheet for using design tokens in the resume analyzer application.

## Import Statement

```tsx
import { GAP, PADDING, PADDING_X, PADDING_Y, MARGIN_TOP, COMPONENT_SPACING } from "@/lib/design-tokens";
```

## Gap Spacing (Space Between Elements)

```tsx
// 4px - Very tight (badges, pills)
className={GAP.tight}        // gap-1

// 8px - Inline elements (icons, buttons)
className={GAP.inline}       // gap-2

// 12px - Compact (small cards)
className={GAP.compact}      // gap-3

// 16px - Default (cards, lists)
className={GAP.default}      // gap-4

// 24px - Sections (major areas)
className={GAP.section}      // gap-6

// 32px - Major (page sections)
className={GAP.major}        // gap-8

// 48px - Page (top-level)
className={GAP.page}         // gap-12
```

## Padding

```tsx
// 16px - Default card padding
className={PADDING.default}    // p-4

// 24px - Generous card padding (mobile cards)
className={PADDING.generous}   // p-6

// 32px - Large section padding
className={PADDING.large}      // p-8
```

## Horizontal Padding

```tsx
// 8px - Inline
className={PADDING_X.inline}   // px-2

// 10px - Inputs/buttons
className={PADDING_X.input}    // px-2.5

// 16px - Default
className={PADDING_X.default}  // px-4

// 24px - Generous
className={PADDING_X.generous} // px-6
```

## Vertical Padding

```tsx
// 8px - Inline
className={PADDING_Y.inline}   // py-2

// 16px - Default
className={PADDING_Y.default}  // py-4

// 24px - Generous
className={PADDING_Y.generous} // py-6
```

## Margin Top

```tsx
// 8px - Inline separation
className={MARGIN_TOP.inline}  // mt-2

// 16px - Default separation
className={MARGIN_TOP.default} // mt-4

// 24px - Section separation
className={MARGIN_TOP.section} // mt-6

// 32px - Major separation
className={MARGIN_TOP.major}   // mt-8
```

## Component Patterns

```tsx
// Mobile Card
className={COMPONENT_SPACING.mobileCard.padding}     // p-6
className={COMPONENT_SPACING.mobileCard.gap}         // gap-4
className={COMPONENT_SPACING.mobileCard.sectionGap}  // gap-6

// Standard Card
className={COMPONENT_SPACING.card.padding}           // p-4
className={COMPONENT_SPACING.card.paddingGenerous}   // p-6
className={COMPONENT_SPACING.card.gap}               // gap-4

// Form Field
className={COMPONENT_SPACING.field.gap}              // gap-2
className={COMPONENT_SPACING.field.labelGap}         // gap-2

// Page Layout
className={COMPONENT_SPACING.page.section}           // gap-6
className={COMPONENT_SPACING.page.major}             // gap-8
```

## Common Combinations

### Card with Content

```tsx
<div className={`rounded-lg border ${PADDING.default}`}>
  <div className={`flex flex-col ${GAP.default}`}>
    <h2>Title</h2>
    <p>Content</p>
  </div>
</div>
```

### Mobile Card (Generous Spacing)

```tsx
<article className={`rounded-lg border ${COMPONENT_SPACING.mobileCard.padding}`}>
  <div className={`flex flex-col ${COMPONENT_SPACING.mobileCard.gap}`}>
    <h3>Title</h3>
    <p>Description</p>
  </div>
</article>
```

### Button Row

```tsx
<div className={`flex items-center ${GAP.inline}`}>
  <Button>Action</Button>
  <Button variant="outline">Cancel</Button>
</div>
```

### Section with Header

```tsx
<section className={`flex flex-col ${GAP.section}`}>
  <header className={`flex items-center justify-between ${GAP.default}`}>
    <h2>Section Title</h2>
    <Button>Action</Button>
  </header>
  <div>{/* Content */}</div>
</section>
```

### Form Field

```tsx
<div className={`flex flex-col ${GAP.inline}`}>
  <label>Label</label>
  <input />
  <span className="text-sm text-muted-foreground">Helper text</span>
</div>
```

### Hero Section

```tsx
<section className={`flex flex-col ${GAP.major}`}>
  <div className={`flex flex-col ${GAP.default}`}>
    <h1 className="text-4xl font-semibold">Heading</h1>
    <p className="text-muted-foreground">Description</p>
  </div>
  <div>{/* CTA Buttons */}</div>
</section>
```

## Quick Decision Tree

**How much space do I need?**

- Icons next to text? → `GAP.inline` (8px)
- Within a card? → `GAP.default` (16px)
- Between card sections? → `GAP.section` (24px)
- Between page sections? → `GAP.major` (32px)

**What padding do I need?**

- Standard card? → `PADDING.default` (16px)
- Mobile card? → `PADDING.generous` (24px)
- Hero section? → `PADDING.large` (32px)

**Which margin should I use?**

- Small space above? → `MARGIN_TOP.inline` (8px)
- Default space above? → `MARGIN_TOP.default` (16px)
- Section separator? → `MARGIN_TOP.section` (24px)

## Remember

1. Always import from `@/lib/design-tokens`
2. Use semantic names that describe intent
3. Prefer component patterns for common layouts
4. Test at all breakpoints
5. When in doubt, check existing components for patterns

## Don't Use

Avoid these arbitrary values:
- ❌ `gap-5`, `gap-7`, `gap-10`, `gap-11`
- ❌ `p-5`, `p-7`, `p-10`, `p-11`
- ❌ `mt-5`, `mt-7`, `mt-10`, `mt-11`

Use the scale instead:
- ✅ `gap-1`, `gap-2`, `gap-3`, `gap-4`, `gap-6`, `gap-8`, `gap-12`
- ✅ Use design token constants for semantic meaning
