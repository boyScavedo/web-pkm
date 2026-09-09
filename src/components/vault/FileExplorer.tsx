"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { NoteSummary } from "@/types";
import type { FolderNode } from "@/lib/pkm/folders";
import {
  ChevronIcon,
  FileIcon,
  FolderIcon,
  FolderPlusIcon,
  MoveIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@/components/vault/icons";

type Folder = FolderNode;
type MenuAction =
  | { type: "new-note"; parentId: number | null }
  | { type: "new-folder"; parentId: number | null; name: string }
  | { type: "rename"; folder: Folder }
  | { type: "move"; folder: Folder }
  | { type: "delete"; folder: Folder };

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error?.message ?? "Request failed");
  return body.data as T;
}

function flatFolders(nodes: Folder[]): Folder[] {
  const out: Folder[] = [];
  const walk = (list: Folder[]) => {
    for (const n of list) {
      out.push(n);
      walk(n.children);
    }
  };
  walk(nodes);
  return out;
}

export function FileExplorer() {
  const router = useRouter();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [notes, setNotes] = useState<NoteSummary[]>([]);
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());
  const [pending, setPending] = useState<
    | { kind: "new-note"; parentId: number | null }
    | { kind: "new-folder"; parentId: number | null; name: string }
    | { kind: "rename"; folder: Folder; name: string }
  | null
  >(null);
  const [inputValue, setInputValue] = useState("");
  const [menu, setMenu] = useState<{ x: number; y: number; folder: Folder } | null>(null);
  const [moveFor, setMoveFor] = useState<Folder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const [f, n] = await Promise.all([
        api<{ folders: Folder[] }>("/api/folders"),
        // ponytail: tree lists up to 100 most-recent notes; virtualized/all
        // listing is a follow-up once real vaults outgrow it.
        api<{ notes: NoteSummary[] }>("/api/notes?limit=100"),
      ]);
      setFolders(f.folders);
      setNotes(n.notes);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load vault");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await load();
    })();
  }, [load]);

  useEffect(() => {
    if (pending && pending.kind !== "new-note") inputRef.current?.focus();
  }, [pending]);

  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [menu]);

  async function runAction(action: MenuAction) {
    setMenu(null);
    try {
      if (action.type === "new-folder" || action.type === "rename") {
        setPending(
          action.type === "new-folder"
            ? { kind: "new-folder", parentId: action.parentId, name: "" }
            : { kind: "rename", folder: action.folder, name: action.folder.name },
        );
        setInputValue(action.type === "rename" ? action.folder.name : "");
        return;
      }
      if (action.type === "move") {
        setMoveFor(action.folder);
        return;
      }
      if (action.type === "delete") {
        if (!confirm(`Delete folder "${action.folder.name}" and its notes?`)) return;
        await api(`/api/folders/${action.folder.id}`, { method: "DELETE" });
        setLoading(true); await load();
        return;
      }
      if (action.type === "new-note") {
        const note = await api<{ note: { id: string } }>("/api/notes", {
          method: "POST",
          body: JSON.stringify({
            title: "Untitled",
            content: "",
            folderId: action.parentId,
          }),
        });
        router.push(`/notes/${note.note.id}`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
    }
  }

  async function commitInput() {
    if (!pending) return;
    const value = inputValue.trim();
    try {
      if (pending.kind === "new-folder") {
        await api("/api/folders", {
          method: "POST",
          body: JSON.stringify({ name: value, parentId: pending.parentId }),
        });
      } else if (pending.kind === "rename") {
        await api(`/api/folders/${pending.folder.id}`, {
          method: "PATCH",
          body: JSON.stringify({ name: value }),
        });
      }
      setPending(null);
      setInputValue("");
      setLoading(true); await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
    }
  }

  async function commitMove(target: number | null) {
    if (!moveFor) return;
    try {
      await api(`/api/folders/${moveFor.id}`, {
        method: "POST",
        body: JSON.stringify({ parentId: target }),
      });
      setMoveFor(null);
      setLoading(true); await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Move failed");
    }
  }

  const all = flatFolders(folders);
  const notesByFolder = new Map<number, NoteSummary[]>();
  for (const n of notes) {
    if (n.folderId === null) continue;
    const list = notesByFolder.get(n.folderId) ?? [];
    list.push(n);
    notesByFolder.set(n.folderId, list);
  }
  const rootNotes = notes.filter((n) => n.folderId === null);

  function renderFolder(folder: Folder, depth: number) {
    const isCollapsed = collapsed.has(folder.id);
    const folderNotes = notesByFolder.get(folder.id) ?? [];
    return (
      <li key={folder.id}>
        <div
          className="relative flex items-center gap-1 pr-2 text-[13px] text-fg-muted hover:text-fg hover:bg-bg-hover cursor-pointer select-none"
          style={{ paddingLeft: `${8 + depth * 14}px` }}
          onContextMenu={(e) => {
            e.preventDefault();
            setMenu({ x: e.clientX, y: e.clientY, folder });
          }}
        >
          <button
            type="button"
            aria-label={isCollapsed ? `Expand ${folder.name}` : `Collapse ${folder.name}`}
            className={`w-4 h-4 flex items-center justify-center text-fg-dim transition-transform ${isCollapsed ? "-rotate-90" : ""}`}
            onClick={() =>
              setCollapsed((prev) => {
                const next = new Set(prev);
                if (next.has(folder.id)) next.delete(folder.id);
                else next.add(folder.id);
                return next;
              })
            }
          >
            <ChevronIcon width={12} height={12} />
          </button>
          <FolderIcon width={14} height={14} />
          <span className="truncate">{folder.name}</span>
        </div>
        {!isCollapsed && (
          <ul>
            {folderNotes.map((n) => (
              <li key={n.id}>
                <Link
                  href={`/notes/${n.id}`}
                  className="flex items-center gap-1 pl-[36px] pr-2 py-0.5 text-[13px] text-fg-muted hover:text-fg hover:bg-bg-hover truncate"
                >
                  <FileIcon width={13} height={13} />
                  <span className="truncate">{n.title}</span>
                </Link>
              </li>
            ))}
            {folder.children.map((child) => renderFolder(child, depth + 1))}
          </ul>
        )}
      </li>
    );
  }

  return (
    <aside className="w-60 shrink-0 border-r border-border bg-bg flex flex-col min-h-0 relative">
      <div className="flex items-center justify-between px-3 h-10 border-b border-border">
        <span className="text-[11px] uppercase tracking-wider text-fg-muted">
          Vault
        </span>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            aria-label="New folder"
            title="New folder"
            data-testid="new-folder"
            onClick={() => setPending({ kind: "new-folder", parentId: null, name: "" })}
            className="w-5 h-5 flex items-center justify-center rounded-[2px] text-fg-muted hover:text-fg hover:bg-bg-hover transition-colors"
          >
            <FolderPlusIcon width={14} height={14} />
          </button>
          <button
            type="button"
            aria-label="New note"
            title="New note"
            data-testid="new-note"
            onClick={() => runAction({ type: "new-note", parentId: null })}
            className="w-5 h-5 flex items-center justify-center rounded-[2px] text-fg-muted hover:text-fg hover:bg-bg-hover transition-colors"
          >
            <PlusIcon width={14} height={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-1 py-2">
        {pending && pending.kind !== "new-note" ? (
          <div className="flex items-center gap-1 pl-2 py-0.5">
            <FolderIcon width={14} height={14} className="shrink-0" />
            <input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitInput();
                if (e.key === "Escape") setPending(null);
              }}
              placeholder={pending.kind === "rename" ? pending.folder.name : "Folder name"}
              data-testid={pending.kind === "rename" ? "folder-rename-input" : "folder-name-input"}
              className="flex-1 min-w-0 bg-black border border-accent text-[13px] px-1.5 py-0.5 focus:outline-none"
            />
          </div>
        ) : null}

        {loading ? (
          <p className="text-[12px] text-fg-dim px-2 py-1">Loading…</p>
        ) : showEmpty(rootNotes, all) ? (
          <p className="text-[12px] text-fg-dim px-2 py-1" data-testid="explorer-empty">
            No files yet.
          </p>
        ) : (
          <ul>
            {rootNotes.length > 0 ? (
              <li>
                <ul>
                  {rootNotes.map((n) => (
                    <li key={n.id}>
                      <Link
                        href={`/notes/${n.id}`}
                        className="flex items-center gap-1 pl-2 pr-2 py-0.5 text-[13px] text-fg-muted hover:text-fg hover:bg-bg-hover truncate"
                      >
                        <FileIcon width={13} height={13} />
                        <span className="truncate">{n.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ) : null}
            {folders.map((folder) => renderFolder(folder, 0))}
          </ul>
        )}

        {error ? (
          <p className="px-2 py-1 text-[11px] text-error">{error}</p>
        ) : null}
      </div>

      {menu ? (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          items={[
            { label: "New note", icon: <PlusIcon width={13} height={13} />, action: () => runAction({ type: "new-note", parentId: menu.folder.id }) },
            { label: "New folder", icon: <FolderPlusIcon width={13} height={13} />, action: () => runAction({ type: "new-folder", parentId: menu.folder.id, name: "" }) },
            { label: "Rename", icon: <PencilIcon width={13} height={13} />, action: () => runAction({ type: "rename", folder: menu.folder }) },
            { label: "Move to…", icon: <MoveIcon width={13} height={13} />, action: () => runAction({ type: "move", folder: menu.folder }) },
            { label: "Delete", icon: <TrashIcon width={13} height={13} />, action: () => runAction({ type: "delete", folder: menu.folder }) },
          ]}
        />
      ) : null}

      {moveFor ? (
        <div className="absolute inset-0 z-10 bg-black/60 flex items-center justify-center px-6">
          <div className="bg-bg-elevated border border-border p-4 w-full max-w-[220px]">
            <p className="text-[12px] text-fg mb-2">Move “{moveFor.name}” to…</p>
            <div className="flex flex-col gap-0.5 max-h-48 overflow-y-auto">
              <button
                type="button"
                onClick={() => commitMove(null)}
                className="text-left text-[13px] text-fg-muted hover:text-fg hover:bg-bg-hover px-2 py-1"
              >
                / (vault root)
              </button>
              {all.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  disabled={f.id === moveFor.id}
                  onClick={() => commitMove(f.id)}
                  className="text-left text-[13px] text-fg-muted hover:text-fg hover:bg-bg-hover px-2 py-1 disabled:opacity-40"
                >
                  /{f.path.replaceAll(".", "/")}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setMoveFor(null)}
              className="mt-3 text-[12px] text-fg-dim hover:text-fg"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </aside>
  );
}

function showEmpty(rootNotes: NoteSummary[], folders: Folder[]) {
  return rootNotes.length === 0 && folders.length === 0;
}

function ContextMenu({
  x,
  y,
  items,
}: {
  x: number;
  y: number;
  items: { label: string; icon: React.ReactNode; action: () => void }[];
}) {
  return (
    <div
      className="fixed z-20 bg-bg-elevated border border-border py-1 min-w-[160px]"
      style={{ left: Math.min(x, window.innerWidth - 172), top: Math.min(y, window.innerHeight - items.length * 30 - 8) }}
    >
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={item.action}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-[13px] text-fg-muted hover:text-fg hover:bg-bg-hover"
        >
          <span className="text-fg-dim">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </div>
  );
}