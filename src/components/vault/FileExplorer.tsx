import Link from "next/link";
import { PlusIcon } from "@/components/vault/icons";

// Obsidian-style file explorer (left sidebar). The tree lands in Stage 1;
// for now the vault empty state plus a working "new note" transition path.
export function FileExplorer() {
  return (
    <aside className="w-60 shrink-0 border-r border-border bg-bg flex flex-col min-h-0">
      <div className="flex items-center justify-between px-3 h-10 border-b border-border">
        <span className="text-[11px] uppercase tracking-wider text-fg-muted">
          Vault
        </span>
        <Link
          href="/notes/new"
          aria-label="New note"
          title="New note"
          data-testid="new-note"
          className="w-5 h-5 flex items-center justify-center rounded-[2px] text-fg-muted hover:text-fg hover:bg-bg-hover transition-colors"
        >
          <PlusIcon width={14} height={14} />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        <p className="text-[12px] text-fg-dim px-2 py-1" data-testid="explorer-empty">
          No files yet.
        </p>
        <p className="text-[11px] text-fg-dim px-2 py-1">
          File explorer lands in Stage 1.
        </p>
      </div>
    </aside>
  );
}