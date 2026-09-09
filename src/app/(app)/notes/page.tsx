import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function NotesPage() {
  const emptyNotes: Array<unknown> = [];

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-[16px] font-semibold text-fg">Notes</h1>
        <Button variant="primary" href="/notes/new">
          + new note
        </Button>
      </div>

      {emptyNotes.length === 0 ? (
        <Card className="p-8 flex flex-col items-center gap-3 text-center">
          <p className="text-[13px] text-fg-muted">
            No notes yet. The vault is empty.
          </p>
          <p className="text-[12px] text-fg-dim max-w-md">
            Notes appear here once the database is connected. Content is
            stored as Markdown with wikilinks, tags, and properties.
          </p>
          <div className="flex gap-2">
            <Badge>markdown</Badge>
            <Badge>[[]] links</Badge>
            <Badge>PARA</Badge>
          </div>
        </Card>
      ) : null}
    </div>
  );
}