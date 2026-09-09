export type ParaCategory = "inbox" | "project" | "area" | "resource" | "archive";

export type NoteStatus = "inbox" | "draft" | "evergreen" | "archived";

export interface NoteSummary {
  id: string;
  title: string;
  para: ParaCategory;
  status: NoteStatus;
  isFavorite: boolean;
  isDeleted: boolean;
  folderId: number | null;
  updatedAt: Date;
  createdAt: Date;
}

export interface Note extends NoteSummary {
  content: string;
  format: string;
  slug: string | null;
  coverImage: string | null;
  deletedAt: Date | null;
}

export interface Backlink {
  id: string;
  title: string;
  linkText: string | null;
}

export interface TagCount {
  id: number;
  name: string;
  color: string | null;
  count: number;
}

export interface FolderPath {
  id: number;
  name: string;
  path: string;
}

export interface Revision {
  id: number;
  noteId: string;
  title: string;
  content: string;
  revision: number;
  createdAt: Date;
}