import { describe, expect, test } from "vitest";
import { buildFolderTree, folderLabel } from "@/lib/pkm/folders";
import type { FolderRow } from "@/lib/pkm/folders";

describe("folderLabel", () => {
  test("normalizes names to ltree-safe labels", () => {
    expect(folderLabel("Project Notes")).toBe("project_notes");
    expect(folderLabel("  My.Mixed-Name! ")).toBe("my_mixed_name");
    expect(folderLabel("----")).toBe("folder");
    expect(folderLabel("")).toBe("folder");
  });
});

describe("buildFolderTree", () => {
  const row = (id: number, name: string, path: string): FolderRow =>
    ({ id, name, path } as FolderRow);

  test("assembles nested tree from flat, path-sorted rows", () => {
    const tree = buildFolderTree([
      row(2, "Sub", "root.sub"),
      row(1, "Root", "root"),
      row(3, "Leaf", "root.sub.leaf"),
    ]);
    expect(tree).toHaveLength(1);
    expect(tree[0].id).toBe(1);
    expect(tree[0].children).toHaveLength(1);
    expect(tree[0].children[0].id).toBe(2);
    expect(tree[0].children[0].children[0].id).toBe(3);
  });

  test("multi-root vaults keep both roots", () => {
    const tree = buildFolderTree([
      row(1, "A", "a"),
      row(2, "B", "b"),
    ]);
    expect(tree.map((n) => n.name)).toEqual(["A", "B"]);
  });
});