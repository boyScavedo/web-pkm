import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { NoteEditor } from "@/components/notes/NoteEditor";
import { getEditableNote, getOrCreateDefaultWorkspace } from "@/lib/pkm/notes";

function formatDate(d: Date) {
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function NotePage({ params }: PageProps<"/notes/[id]">) {
  const { id } = await params;
  const workspaceId = await getOrCreateDefaultWorkspace();
  const note = await getEditableNote(workspaceId, id);

  if (note) {
    return (
      <div className="p-4 flex flex-col gap-4 max-w-3xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[16px] text-accent">
              {note.isFavorite ? "★" : "☆"}
            </span>
            <h1 className="text-[16px] font-semibold text-fg">{note.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge>{note.para}</Badge>
            <Badge>{note.status}</Badge>
            <span className="text-[11px] text-fg-dim">
              updated {formatDate(note.updatedAt)}
            </span>
          </div>
        </div>
        <NoteEditor
          mode="edit"
          noteId={note.id}
          initialTitle={note.title}
          initialContent={note.content}
          initialPara={note.para}
          initialStatus={note.status}
          initialFavorite={note.isFavorite}
        />
      </div>
    );
  }

  notFound();
}