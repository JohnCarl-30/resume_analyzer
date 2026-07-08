# Visual Spacing Scale Guide

A visual reference for understanding the spacing scale used in the design token system.

## The Spacing Scale

All spacing follows a consistent 4px baseline grid:

```
tight    ▌ 4px   (1 unit)   gap-1   GAP.tight
inline   ▌▌ 8px   (2 units)  gap-2   GAP.inline
compact  ▌▌▌ 12px  (3 units)  gap-3   GAP.compact
default  ▌▌▌▌ 16px  (4 units)  gap-4   GAP.default
section  ▌▌▌▌▌▌ 24px  (6 units)  gap-6   GAP.section
major    ▌▌▌▌▌▌▌▌ 32px  (8 units)  gap-8   GAP.major
page     ▌▌▌▌▌▌▌▌▌▌▌▌ 48px (12 units) gap-12  GAP.page
```

## Visual Examples

### GAP.tight (4px / gap-1)
Used for: Badge content, tight pill spacing, minimal grouping

```
┌─────┬─────┬─────┐
│ Tag │ Tag │ Tag │  ← 4px gaps between tags
└─────┴─────┴─────┘
```

### GAP.inline (8px / gap-2)
Used for: Icon + text, button content, inline elements

```
┌────┐ Text Button     ← 8px gap between icon and text
│ 📄 │
└────┘
```

### GAP.compact (12px / gap-3)
Used for: Compact form fields, small card sections

```
┌────────────────────┐
│ Label              │
│                    │  ← 12px gap
│ [Input field]      │
│                    │  ← 12px gap
│ Helper text        │
└────────────────────┘
```

### GAP.default (16px / gap-4)
Used for: Card content, standard list spacing, default components

```
┌────────────────────┐
│ Card Title         │
│                    │  ← 16px gap
│ Card description   │
│ with some content  │
│                    │  ← 16px gap
│ More content here  │
└────────────────────┘
```

### GAP.section (24px / gap-6)
Used for: Between major card sections, section headers

```
┌────────────────────┐
│ Section Title      │
│ Description        │
│                    │
│                    │  ← 24px gap
│ Section Content    │
│ ┌────────────────┐ │
│ │ Nested Card    │ │
│ └────────────────┘ │
└────────────────────┘
```

### GAP.major (32px / gap-8)
Used for: Between page sections, major layout divisions

```
┌──────────────────────────┐
│ Hero Section             │
│ Large heading and CTA    │
└──────────────────────────┘
              ↕ 32px gap
┌──────────────────────────┐
│ Features Section         │
│ Grid of feature cards    │
└──────────────────────────┘
```

### GAP.page (48px / gap-12)
Used for: Top-level page spacing, hero to content separation

```
┌──────────────────────────┐
│                          │
│ Hero Section             │
│ (full height)            │
│                          │
└──────────────────────────┘
              ↕ 48px gap
┌──────────────────────────┐
│ Main Content             │
│                          │
```

## Padding Scale

Same scale applies to padding:

```
PADDING.inline     8px   px-2 / py-2
PADDING.compact    12px  px-3 / py-3
PADDING.default    16px  px-4 / py-4
PADDING.generous   24px  px-6 / py-6
PADDING.large      32px  px-8 / py-8
```

### Visual Padding Examples

```
┌─────────────────┐  ← PADDING.default (16px)
│                 │
│   Card Content  │  ← Content has 16px padding on all sides
│                 │
└─────────────────┘

┌───────────────────┐  ← PADDING.generous (24px)
│                   │
│   Mobile Card     │  ← 50% more padding for better touch
│   Content         │     targets and readability
│                   │
└───────────────────┘
```

## Real-World Layout Examples

### Example 1: Dashboard Card

```
┌─────────────────────────────────────────┐
│                                         │ ← 24px padding (generous)
│  ┌────┐  Resume Title                  │
│  │ 📄 │  Subtitle text                 │ ← 12px gap (compact)
│  └────┘                                 │
│                                         │ ← 24px margin-top (section)
│  Progress Bar ████████░░░░ 75%         │
│                                         │ ← 16px gap (default)
│  ┌─────────────┬─────────────┐         │
│  │ Words: 42   │ Fixes: 8    │         │ ← 12px gap (compact)
│  └─────────────┴─────────────┘         │
│                                         │ ← 24px margin-top (section)
│  ────────────────────────────────────  │ ← border-t
│  Updated: 2 days ago      [Open]       │ ← 16px padding-y (default)
│                                         │
└─────────────────────────────────────────┘
```

### Example 2: Wizard Step

```
┌───────────────────────────────────────────────┐
│                                               │
│              What job are you                 │ ← 12px gap (compact)
│            applying for?                      │
│                                               │
│      Use the job title from the posting       │
│                                               │ ← 32px margin-top (major)
│  ┌─────────────────────────────────────────┐ │
│  │                                         │ │ ← 16px padding
│  │  Job title                             │ │
│  │  ─────────────────────────────────     │ │ ← 16px gap
│  │  [Input: Senior Frontend Engineer]     │ │
│  │                                         │ │
│  │  ─────────────────────────────────     │ │
│  │  [Next: Paste Job Post]  →            │ │
│  │                                         │ │
│  └─────────────────────────────────────────┘ │
│                                               │
└───────────────────────────────────────────────┘
```

### Example 3: Template Card

```
┌─────────────────────────┐
│                         │
│   ┌───────────────┐     │
│   │ Template      │     │ ← Preview with 16px padding
│   │ Preview       │     │
│   └───────────────┘     │
│                         │
├─────────────────────────┤ ← border-b separator
│                         │ ← 16px padding
│  Minimalist Grid        │ ← text-lg title (improved!)
│                         │ ← 16px gap
│  Clean and simple       │ ← description
│  layout for modern      │
│  resumes                │
│                         │ ← 16px gap
│  Scanner friendly       │ ← label (moved to bottom)
│                         │
└─────────────────────────┘
```

## Decision Flow Chart

```
Need spacing between elements?
│
├─ Icons next to text?
│  └─ Use GAP.inline (8px)
│
├─ Within a compact component?
│  └─ Use GAP.compact (12px)
│
├─ Standard card content?
│  └─ Use GAP.default (16px)
│
├─ Between card sections?
│  └─ Use GAP.section (24px)
│
├─ Between page sections?
│  └─ Use GAP.major (32px)
│
└─ Hero to content?
   └─ Use GAP.page (48px)
```

## Comparison: Before vs After

### Mobile Card - Before (cramped)

```
┌─────────────────────┐  ← 16px padding
│ ┌──┐ Resume Title  │
│ │📄│ Subtitle      │  ← Feels tight
│ └──┘               │
│ Progress Bar       │  ← Not enough breathing room
│ Stats | More Stats │
│ ─────────────────  │
│ Footer             │  ← Content feels squished
└─────────────────────┘
```

### Mobile Card - After (comfortable)

```
┌───────────────────────┐  ← 24px padding (+50%)
│                       │
│  ┌──┐  Resume Title  │
│  │📄│  Subtitle      │  ← Better spacing
│  └──┘                │
│                       │  ← More breathing room
│  Progress Bar        │
│                       │
│  Stats | More Stats  │
│                       │
│  ───────────────────  │
│  Footer              │  ← Easier to read and tap
│                       │
└───────────────────────┘
```

## Typography + Spacing Hierarchy

```
┌─────────────────────────────────────┐
│                                     │
│  Page Title (text-3xl, semibold)   │ ← 4-8px gap below
│  Subtitle (text-base, muted)       │
│                                     │ ← 24-32px gap (section/major)
│  Section Heading (text-xl, medium) │ ← 8-12px gap below
│  Description text                  │
│                                     │ ← 16-24px gap (default/section)
│  Card Title (text-lg, semibold)    │ ← 8px gap below
│  Card body text                    │
│                                     │ ← 16px gap (default)
│  Secondary text (text-sm, muted)   │
│                                     │
└─────────────────────────────────────┘
```

## Pro Tips

1. **Smaller elements = smaller gaps**
   - Badges and pills: `GAP.tight` (4px)
   - Icons and text: `GAP.inline` (8px)

2. **Increase spacing at larger screens**
   ```tsx
   className={`flex flex-col ${GAP.default} md:${GAP.section}`}
   ```

3. **Mobile cards need more padding**
   - Desktop cards: `PADDING.default` (16px)
   - Mobile cards: `PADDING.generous` (24px)
   - Better for touch targets!

4. **Visual weight affects spacing**
   - Heavy elements need more space
   - Light elements can be closer

5. **Borders act as visual separators**
   - Can use smaller gaps when borders present
   - Border + `pt-4` creates clear sections

## Quick Reference Table

| Element Type | Gap | Padding | Example |
|-------------|-----|---------|---------|
| Badge row | `GAP.tight` | `PADDING.inline` | Tags, pills |
| Button content | `GAP.inline` | `PADDING_X.input` | Icon + text |
| Form field | `GAP.inline` | - | Label → input → help |
| Card content | `GAP.default` | `PADDING.default` | Standard card |
| Mobile card | `GAP.default` | `PADDING.generous` | Touch-friendly |
| Section header | `GAP.section` | - | Header → content |
| Page section | `GAP.major` | - | Major divisions |

---

**Remember:** When in doubt, use the spacing scale. Avoid arbitrary values. Consistency creates a professional, polished feel.

For implementation details, see:
- `DESIGN-TOKENS-QUICK-REFERENCE.md` - Usage examples
- `SPACING-AUDIT.md` - Full audit and rationale
- `lib/design-tokens.ts` - Token definitions
