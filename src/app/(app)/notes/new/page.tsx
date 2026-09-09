import { NoteEditor } from "@/components/notes/NoteEditor";

export default function NewNotePage() {
  return (
    <div className="p-4 flex flex-col gap-4 max-w-3xl">
      <h1 className="text-[16px] font-semibold text-fg">New note</h1>
      <NoteEditor mode="create" />
    </div>
  );
}