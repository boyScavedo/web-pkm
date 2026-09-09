// Obsidian-style status bar (bottom edge).
export function StatusBar() {
  return (
    <footer className="h-6 shrink-0 border-t border-border bg-bg flex items-center justify-between px-4 text-[11px] text-fg-dim" data-testid="status-bar">
      <span>~/pkm vault</span>
      <span>sync: on</span>
    </footer>
  );
}