import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getOrCreateDefaultWorkspace, listNotes } from "@/lib/pkm/notes";
import type { ParaCategory } from "@/types";

const PARA_VALUES: ParaCategory[] = [
  "inbox",
  "project",
  "area",
  "resource",
  "archive",
];

function formatDate(d: Date) {
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function NotesPage({
  searchParams,
}: PageProps<"/notes">) {
  const { para } = await searchParams;
  const activePara = PARA_VALUES.includes(para as ParaCategory)
    ? (para as ParaCategory)
    : undefined;

  const workspaceId = await getOrCreateDefaultWorkspace();
  const { notes, pagination } = await listNotes(workspaceId, {
    para: activePara,
    limit: 50,
  });

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <h1 className="text-[16px] font-semibold text-fg">
            {activePara ? activePara : "Notes"}
          </h1>
          <span className="text-[12px] text-fg-dim">
            {pagination.total} {pagination.total === 1 ? "note" : "notes"}
          </span>
        </div>
        <Button variant="primary" href="/notes/new">
          + new note
        </Button>
      </div>

      {notes.length === 0 ? (
        <Card className="p-8 flex flex-col items-center gap-3 text-center">
          <p className="text-[13px] text-fg-muted">
            {activePara
              ? `Nothing in ${activePara} yet.`
              : "No notes yet. The vault is empty."}
          </p>
          <p className="text-[12px] text-fg-dim max-w-md">
            Content is stored as Markdown with wikilinks, tags, and properties.
          </p>
          <div className="flex gap-2">
            <Badge>markdown</Badge>
            <Badge>[[]] links</Badge>
            <Badge>PARA</Badge>
          </div>
        </Card>
      ) : (
        <ul className="flex flex-col gap-1">
          {notes.map((note) => (
            <li key={note.id}>
              <Card className="hover:border-border-strong transition-colors">
                <Link
                  href={`/notes/${note.id}`}
                  className="flex items-center justify-between gap-3 px-3 py-2"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-accent">{note.isFavorite ? "★" : "☆"}</span>
                    <span className="text-[13px] text-fg truncate">
                      {note.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge>{note.para}</Badge>
                    <span className="text-[11px] text-fg-dim">
                      {formatDate(note.updatedAt)}
                    </span>
                  </div>
                </Link>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}