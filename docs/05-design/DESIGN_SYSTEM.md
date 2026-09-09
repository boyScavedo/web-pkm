# Design System

## Color palette

Three-color visual language with opacity/brightness variations.

| Token | Hex | Usage |
|-------|-----|-------|
| `bg` | `#000000` | Primary background (AMOLED black) |
| `bg-elevated` | `#0a0a0a` | Cards, sidebars, panels |
| `bg-hover` | `#141414` | Hover states |
| `bg-active` | `#1a1a1a` | Active/selected states |
| `border` | `#1e1e1e` | Thin borders, dividers |
| `border-strong` | `#2a2a2a` | Prominent borders |
| `fg` | `#e5e5e5` | Primary text |
| `fg-muted` | `#888888` | Secondary text, labels |
| `fg-dim` | `#555555` | Disabled, placeholder |
| `accent` | `#00d4ff` | Cyan accent (links, active states, highlights) |
| `accent-dim` | `#007a94` | Accent at lower intensity |
| `success` | `#22c55e` | Success states (restrained) |
| `warning` | `#f59e0b` | Warning states (restrained) |
| `error` | `#ef4444` | Error states (restrained) |

## Typography

| Element | Font | Size | Weight | Color |
|---------|------|------|--------|-------|
| Body | JetBrains Mono | 13px | 400 | `fg` |
| Headings | JetBrains Mono | 16px | 600 | `fg` |
| Labels | JetBrains Mono | 11px | 500 | `fg-muted` |
| Code | JetBrains Mono | 13px | 400 | `fg` |
| Links | JetBrains Mono | 13px | 400 | `accent` |

Monospace everywhere. The interface feels like a development environment,
not a corporate dashboard.

## Spacing

Compact, dense layout. Use 4px base grid.

| Token | Value |
|-------|-------|
| `space-1` | 4px |
| `space-2` | 8px |
| `space-3` | 12px |
| `space-4` | 16px |
| `space-6` | 24px |

## Borders

Thin, subtle. 1px solid `border`. No shadows. No glassmorphism.

## Border radius

Minimal. 2px-4px max. Never decorative rounding.

## Layout

```
┌──────────────────────────────────────────────────────┐
│ Top bar (48px) — search, command, user               │
├──────────┬───────────────────────────────────────────┤
│ Sidebar  │ Main content                              │
│ (240px)  │ (fluid)                                   │
│          │                                           │
│ Inbox    │ Note editor / reader / dashboard           │
│ Notes    │                                           │
│ Folders  │                                           │
│ Tags     │                                           │
│ Projects │                                           │
│          │                                           │
├──────────┴───────────────────────────────────────────┤
│ Status bar (24px) — optional, contextual info        │
└──────────────────────────────────────────────────────┘
```

## Component patterns

### Note card
- 1px border `border`
- Background `bg-elevated`
- Title in `fg`, 13px bold
- Preview text in `fg-muted`, 12px
- Tags as small cyan pills
- Hover: `bg-hover`, border `border-strong`
- Selected: `bg-active`, left border `accent`

### Tag pill
- 1px border `border`
- Background transparent
- Text `accent` or custom color
- Border-radius 2px
- Padding 2px 6px
- Font 11px

### Button
- Primary: `accent` background, `bg` text
- Secondary: transparent, `border` border, `fg` text
- Ghost: transparent, no border, `fg-muted` text, `fg` on hover
- Padding: 6px 12px
- Border-radius: 2px

### Input
- Background `bg`
- Border 1px `border`
- Focus: border `accent`
- Font: monospace 13px
- No rounded corners

### Sidebar item
- Padding 6px 12px
- Text 13px `fg-muted`
- Hover: `bg-hover`, text `fg`
- Active: `bg-active`, text `accent`, left border 2px `accent`

## States

- **Default**: `bg` background
- **Hover**: `bg-hover`
- **Active/Selected**: `bg-active` + `accent` accent
- **Disabled**: `fg-dim` text, no interaction
- **Loading**: subtle pulse animation on skeleton elements
