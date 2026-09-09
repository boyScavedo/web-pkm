import { NextRequest } from "next/server";
import { getOrCreateDefaultWorkspace, restoreNote } from "@/lib/pkm/notes";
import { fail, ok, parseId, requireUser } from "@/lib/http";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireUser();
    const workspaceId = await getOrCreateDefaultWorkspace();
    const { id } = await params;
    const noteId = parseId(id);

    await restoreNote(workspaceId, noteId);
    return ok({ restored: true });
  } catch (error) {
    return fail(error);
  }
}