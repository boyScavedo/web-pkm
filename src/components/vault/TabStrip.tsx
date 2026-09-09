// Obsidian-style open-files tab strip. Tabs land in Stage 2 alongside the
// editor; this keeps the frame's top edge stable until then.
export function TabStrip() {
  return (
    <div className="h-8 shrink-0 border-b border-border bg-bg flex items-center px-2" data-testid="tab-strip">
      <span className="text-[11px] text-fg-dim px-2">No open files</span>
    </div>
  );
}