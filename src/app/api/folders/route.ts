import { NextRequest } from "next/server";
import {
  buildFolderTree,
  createFolder,
  FolderError,
  listFolders,
} from "@/lib/pkm/folders";
import { fail, ok, readJson, requireUser } from "@/lib/http";
import { getOrCreateDefaultWorkspace } from "@/lib/pkm/notes";

export async function GET() {
  try {
    await requireUser();
    const workspaceId = await getOrCreateDefaultWorkspace();
    const folders = await listFolders(workspaceId);
    return ok({ folders: buildFolderTree(folders) });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireUser();
    const workspaceId = await getOrCreateDefaultWorkspace();
    const body = (await readJson(req)) as Record<string, unknown>;

    if (typeof body.name !== "string" || !body.name.trim()) {
      return fail(new FolderError("Folder name is required", "VALIDATION"));
    }
    if (
      body.parentId !== undefined &&
      body.parentId !== null &&
      typeof body.parentId !== "number"
    ) {
      return fail(new FolderError("parentId must be a number", "VALIDATION"));
    }

    const folder = await createFolder(
      workspaceId,
      body.name,
      body.parentId as number | null | undefined,
    );
    return ok({ folder }, 201);
  } catch (error) {
    return fail(error);
  }
}