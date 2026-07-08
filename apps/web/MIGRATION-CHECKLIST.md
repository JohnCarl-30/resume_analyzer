# Design Token Migration Checklist

Quick checklist for migrating existing components to use the new design token system.

## Pre-Migration

- [ ] Read `DESIGN-TOKENS-QUICK-REFERENCE.md`
- [ ] Review at least one refactored component as an example
- [ ] Understand the spacing scale (4, 8, 12, 16, 24, 32, 48px)
- [ ] Have the component open in your IDE

## Step-by-Step Migration

### 1. Import Design Tokens

- [ ] Add import at top of file:
  ```tsx
  import { GAP, PADDING, PADDING_X, PADDING_Y, MARGIN_TOP, COMPONENT_SPACING } from "@/lib/design-tokens";
  ```

### 2. Identify Current Spacing

- [ ] Search for `gap-` in the component
- [ ] Search for `p-`, `px-`, `py-` in the component
- [ ] Search for `m-`, `mt-`, `mb-` in the component
- [ ] List all unique spacing values found

### 3. Map to Token System

For each spacing value found, map to the appropriate token:

**Gap Spacing:**
- [ ] `gap-1` → `${GAP.tight}`
- [ ] `gap-2` → `${GAP.inline}`
- [ ] `gap-3` → `${GAP.compact}`
- [ ] `gap-4` → `${GAP.default}`
- [ ] `gap-5` → `${GAP.section}` (closest: gap-6)
- [ ] `gap-6` → `${GAP.section}`
- [ ] `gap-8` → `${GAP.major}`

**Padding:**
- [ ] `p-2` → `${PADDING.inline}`
- [ ] `p-3` → `${PADDING.compact}`
- [ ] `p-4` → `${PADDING.default}`
- [ ] `p-5` → `${PADDING.generous}` (closest: p-6)
- [ ] `p-6` → `${PADDING.generous}`
- [ ] `p-8` → `${PADDING.large}`

**Margin Top:**
- [ ] `mt-2` → `${MARGIN_TOP.inline}`
- [ ] `mt-4` → `${MARGIN_TOP.default}`
- [ ] `mt-6` → `${MARGIN_TOP.section}`
- [ ] `mt-8` → `${MARGIN_TOP.major}`

### 4. Replace Spacing Values

- [ ] Replace gap values with token constants
- [ ] Replace padding values with token constants
- [ ] Replace margin values with token constants
- [ ] Use template literals: `` className={`flex ${GAP.default}`} ``

### 5. Check Component-Specific Patterns

Does your component match a common pattern?

- [ ] **Mobile card?** Use `${COMPONENT_SPACING.mobileCard.padding}`
- [ ] **Standard card?** Use `${COMPONENT_SPACING.card.padding}`
- [ ] **Form field?** Use `${COMPONENT_SPACING.field.gap}`
- [ ] **Page section?** Use `${COMPONENT_SPACING.page.section}`

### 6. Verify Visual Hierarchy

- [ ] Check that heading sizes follow scale (text-lg → text-3xl)
- [ ] Verify important elements are larger/bolder
- [ ] Confirm secondary text uses `text-muted-foreground`
- [ ] Ensure proper whitespace separates content

### 7. Accessibility Check

- [ ] Semantic HTML elements used (`section`, `nav`, `article`, etc.)
- [ ] Proper heading hierarchy (h1 → h2 → h3)
- [ ] Labels associated with inputs
- [ ] ARIA labels where appropriate
- [ ] Focus states visible
- [ ] Screen reader text for important UI (`.sr-only`)

### 8. Test & Verify

- [ ] Run `corepack pnpm typecheck` - no errors
- [ ] View component at mobile (320px)
- [ ] View component at tablet (768px)
- [ ] View component at desktop (1024px+)
- [ ] Test keyboard navigation
- [ ] Test with screen reader (optional but recommended)

### 9. Clean Up

- [ ] Remove commented-out old code
- [ ] Ensure consistent formatting
- [ ] Check for unused imports
- [ ] Verify no console errors

### 10. Documentation

- [ ] Update component comments if needed
- [ ] Note any non-standard spacing decisions
- [ ] Mark component as ✅ in `SPACING-AUDIT.md`

## Common Patterns

### Pattern 1: Card Component

**Before:**
```tsx
<div className="rounded-lg border bg-background p-4">
  <div className="flex flex-col gap-3">
    {/* content */}
  </div>
</div>
```

**After:**
```tsx
<div className={`rounded-lg border bg-background ${PADDING.default}`}>
  <div className={`flex flex-col ${GAP.compact}`}>
    {/* content */}
  </div>
</div>
```

### Pattern 2: Section with Header

**Before:**
```tsx
<section className="flex flex-col gap-6">
  <header className="flex items-center justify-between gap-4">
    <h2>Title</h2>
    <Button>Action</Button>
  </header>
  <div>{/* content */}</div>
</section>
```

**After:**
```tsx
<section className={`flex flex-col ${GAP.section}`}>
  <header className={`flex items-center justify-between ${GAP.default}`}>
    <h2>Title</h2>
    <Button>Action</Button>
  </header>
  <div>{/* content */}</div>
</section>
```

### Pattern 3: Button Row

**Before:**
```tsx
<div className="flex items-center gap-2">
  <Button>Primary</Button>
  <Button variant="outline">Secondary</Button>
</div>
```

**After:**
```tsx
<div className={`flex items-center ${GAP.inline}`}>
  <Button>Primary</Button>
  <Button variant="outline">Secondary</Button>
</div>
```

### Pattern 4: Form Field

**Before:**
```tsx
<div className="flex flex-col gap-2">
  <label>Label</label>
  <input />
  <span className="text-sm text-muted-foreground">Helper</span>
</div>
```

**After:**
```tsx
<div className={`flex flex-col ${GAP.inline}`}>
  <label>Label</label>
  <input />
  <span className="text-sm text-muted-foreground">Helper</span>
</div>
```

## Troubleshooting

### Issue: TypeScript errors after adding tokens

**Solution:** Make sure you imported the tokens:
```tsx
import { GAP, PADDING } from "@/lib/design-tokens";
```

### Issue: Spacing looks different after migration

**Possible causes:**
1. You might have chosen the wrong token (check the scale)
2. The old spacing was non-standard (document the decision)
3. Browser caching (hard refresh with Cmd+Shift+R)

**Fix:** Compare px values in browser DevTools

### Issue: Component looks cramped

**Solution:** Use the next larger token:
- `GAP.inline` (8px) → `GAP.compact` (12px)
- `GAP.default` (16px) → `GAP.section` (24px)
- `PADDING.default` (16px) → `PADDING.generous` (24px)

### Issue: Too much whitespace

**Solution:** Use the next smaller token:
- `GAP.section` (24px) → `GAP.default` (16px)
- `GAP.default` (16px) → `GAP.compact` (12px)
- `PADDING.generous` (24px) → `PADDING.default` (16px)

### Issue: Breaking responsive design

**Check:**
1. Did you keep the responsive prefixes? (sm:, md:, lg:)
2. Are you using template literals correctly? `` className={`base ${token}`} ``
3. Test at all breakpoints

## Quick Reference

| Old | New | Pixels |
|-----|-----|--------|
| `gap-1` | `${GAP.tight}` | 4px |
| `gap-2` | `${GAP.inline}` | 8px |
| `gap-3` | `${GAP.compact}` | 12px |
| `gap-4` | `${GAP.default}` | 16px |
| `gap-6` | `${GAP.section}` | 24px |
| `gap-8` | `${GAP.major}` | 32px |
| `p-4` | `${PADDING.default}` | 16px |
| `p-6` | `${PADDING.generous}` | 24px |
| `mt-4` | `${MARGIN_TOP.default}` | 16px |
| `mt-6` | `${MARGIN_TOP.section}` | 24px |

## When You're Done

- [ ] Mark component as migrated in `SPACING-AUDIT.md`
- [ ] Commit with message: `refactor: migrate [component-name] to design tokens`
- [ ] Test in dev environment
- [ ] Consider reviewing with team member

## Need Help?

1. Check `DESIGN-TOKENS-QUICK-REFERENCE.md` for common patterns
2. Look at already-migrated components:
   - `features/templates/components/template-card.tsx`
   - `features/resumes/views/dashboard-view.tsx`
   - `features/onboarding/components/step-target-role.tsx`
3. Review `SPACING-AUDIT.md` for rationale and guidelines
4. Ask team for code review

---

**Remember:** The goal is consistency and maintainability. When in doubt, check existing refactored components for patterns!
