"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { ParaCategory, NoteStatus } from "@/types";

type NoteEditorProps = {
  mode: "create" | "edit";
  noteId?: string;
  initialTitle?: string;
  initialContent?: string;
  initialPara?: ParaCategory;
  initialStatus?: NoteStatus;
  initialFavorite?: boolean;
};

// ADR-008 client boundary: server page fetches, this form mutates via
// /api/notes. Plain FormData fetch — no client router state needed.
export function NoteEditor({
  mode,
  noteId,
  initialTitle = "",
  initialContent = "",
  initialPara = "resource",
  initialStatus = "draft",
  initialFavorite = false,
}: NoteEditorProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [para, setPara] = useState<ParaCategory>(initialPara);
  const [status, setStatus] = useState<NoteStatus>(initialStatus);
  const [favorite, setFavorite] = useState(initialFavorite);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const endpoint = mode === "create" ? "/api/notes" : `/api/notes/${noteId}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, para, status, isFavorite: favorite }),
      });
      const body = await res.json();

      if (!res.ok) {
        setError(body?.error?.message ?? "Something went wrong");
        return;
      }

      if (mode === "create") {
        router.push(`/notes/${body.data.note.id}`);
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!noteId) return;
    if (!confirm("Delete this note?")) return;
    const res = await fetch(`/api/notes/${noteId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/notes");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="title" className="text-[12px] text-fg-dim">
          Title
        </label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title"
          required
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="para" className="text-[12px] text-fg-dim">
            PARA
          </label>
          <select
            id="para"
            value={para}
            onChange={(e) => setPara(e.target.value as ParaCategory)}
            className="w-full bg-black border border-border text-fg text-[13px] px-3 py-1.5 rounded-[2px] focus:outline-none focus:border-accent"
          >
            {(["inbox", "project", "area", "resource", "archive"] as ParaCategory[]).map(
              (p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ),
            )}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="status" className="text-[12px] text-fg-dim">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as NoteStatus)}
            className="w-full bg-black border border-border text-fg text-[13px] px-3 py-1.5 rounded-[2px] focus:outline-none focus:border-accent"
          >
            {(["inbox", "draft", "evergreen", "archived"] as NoteStatus[]).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-end gap-2 pb-2 text-[13px] text-fg cursor-pointer select-none">
          <input
            type="checkbox"
            checked={favorite}
            onChange={(e) => setFavorite(e.target.checked)}
            className="accent-[#00d4ff]"
          />
          <span className="text-[12px] text-fg-dim">favorite</span>
        </label>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="content" className="text-[12px] text-fg-dim">
          Content <span className="text-fg-dim/60">(Markdown)</span>
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={"Start writing. Supports #tags, [[wikilinks]], and markdown."}
          rows={14}
          className="w-full bg-black border border-border text-fg text-[13px] px-3 py-2 rounded-[2px] font-mono focus:outline-none focus:border-accent resize-y"
        />
      </div>

      {error ? <p className="text-[12px] text-danger">{error}</p> : null}
      {saved ? (
        <p className="text-[12px] text-accent">Saved.</p>
      ) : null}

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? "Saving…" : mode === "create" ? "Create note" : "Save changes"}
          </Button>
          <Button href="/notes" variant="ghost">
            Cancel
          </Button>
        </div>
        {mode === "edit" ? (
          <Button type="button" variant="ghost" onClick={handleDelete} className="text-danger hover:text-danger">
            Delete
          </Button>
        ) : null}
      </div>
    </form>
  );
}