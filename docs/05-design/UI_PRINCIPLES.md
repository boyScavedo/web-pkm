# UI Principles

## 1. Density over decoration

Every pixel should carry information. Whitespace is for separation, not
decoration. The interface should feel like an IDE or terminal, not a
marketing dashboard.

## 2. Keyboard-first

Every common action reachable via keyboard. Command palette for everything else.
Mouse interaction works but is not required.

## 3. Progressive disclosure

Show what's needed. Hide what's not. Dashboard surfaces critical info first,
details on demand. No walls of widgets.

## 4. Calm interface

No unnecessary animation. No flashing. No popups. No notification spam.
The interface is quiet until it needs to speak.

## 5. Monospace consistency

All text is monospace. Labels, titles, body, code, navigation. The uniform
font creates a technical, cohesive atmosphere.

## 6. High contrast on black

Cyan on black. White on black. The contrast ratio must be readable.
Avoid low-contrast combinations that strain the eyes.

## 7. Consistent interaction patterns

- Click to select
- Double-click to edit
- Escape to deselect/close
- Enter to confirm
- Cmd/Ctrl+K for command palette
- Cmd/Ctrl+N for new note
- Cmd/Ctrl+/ for search

## 8. Information hierarchy

Strong hierarchy through:
- Font weight (bold for headings, regular for body)
- Font size (11px labels, 13px body, 16px headings)
- Color (accent for active, muted for secondary, dim for disabled)
- Spacing (tight within sections, gaps between sections)

## 9. Responsive, not adaptive

Desktop-first. On smaller screens, sidebar collapses, content takes full width.
No separate mobile layout — the same components, reflowed.

## 10. No visual surprises

Transitions are instant or near-instant (< 100ms). No loading spinners for
fast operations. Skeleton screens for genuinely slow loads. The interface
should feel fast because it is fast.
