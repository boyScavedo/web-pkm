import { NextRequest } from "next/server";
import {
  deleteFolder,
  FolderError,
  moveFolder,
  renameFolder,
} from "@/lib/pkm/folders";
import { fail, ok, readJson, requireUser } from "@/lib/http";
import { getOrCreateDefaultWorkspace } from "@/lib/pkm/notes";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireUser();
    const workspaceId = await getOrCreateDefaultWorkspace();
    const { id } = await params;
    const folderId = Number(id);
    if (!Number.isInteger(folderId)) {
      return fail(new FolderError("Invalid folder id", "VALIDATION"));
    }

    const body = (await readJson(req)) as Record<string, unknown>;
    const name = body.name;

    if (typeof name !== "string" || !name.trim()) {
      return fail(new FolderError("Folder name is required", "VALIDATION"));
    }

    const folder = await renameFolder(workspaceId, folderId, name);
    return ok({ folder });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireUser();
    const workspaceId = await getOrCreateDefaultWorkspace();
    const { id } = await params;
    const folderId = Number(id);
    if (!Number.isInteger(folderId)) {
      return fail(new FolderError("Invalid folder id", "VALIDATION"));
    }

    const body = (await readJson(req)) as Record<string, unknown>;
    if (
      body.parentId !== undefined &&
      body.parentId !== null &&
      typeof body.parentId !== "number"
    ) {
      return fail(new FolderError("parentId must be a number", "VALIDATION"));
    }

    const folder = await moveFolder(
      workspaceId,
      folderId,
      body.parentId as number | null,
    );
    return ok({ folder });
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireUser();
    const workspaceId = await getOrCreateDefaultWorkspace();
    const { id } = await params;
    const folderId = Number(id);
    if (!Number.isInteger(folderId)) {
      return fail(new FolderError("Invalid folder id", "VALIDATION"));
    }
    await deleteFolder(workspaceId, folderId);
    return ok({ folderId });
  } catch (error) {
    return fail(error);
  }
}