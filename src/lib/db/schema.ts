import { sql } from "drizzle-orm";
import {
  pgTable,
  pgEnum,
  uuid,
  text,
  timestamp,
  serial,
  bigserial,
  bigint,
  boolean,
  integer,
  jsonb,
  index,
  primaryKey,
  customType,
  unique,
} from "drizzle-orm/pg-core";

// --- Enums ---

export const paraCategory = pgEnum("para_category", [
  "inbox",
  "project",
  "area",
  "resource",
  "archive",
]);

export const noteStatus = pgEnum("note_status", [
  "inbox",
  "draft",
  "evergreen",
  "archived",
]);

// --- Custom types ---

export const ltree = customType<{ data: string }>({
  dataType() {
    return "ltree";
  },
  toDriver(value: string) {
    return value;
  },
  fromDriver(value) {
    return value as string;
  },
});

export const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
  toDriver(value: string) {
    return value;
  },
  fromDriver(value) {
    return value as string;
  },
});

// --- Core tables ---

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { withTimezone: true }),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (t) => [
    primaryKey({
      columns: [t.provider, t.providerAccountId],
    }),
    index("idx_accounts_user").on(t.userId),
  ],
);

export const sessions = pgTable(
  "sessions",
  {
    sessionToken: text("session_token").notNull().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { withTimezone: true }).notNull(),
  },
  (t) => [index("idx_sessions_user").on(t.userId)],
);

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { withTimezone: true }).notNull(),
  },
  (t) => [
    primaryKey({
      columns: [t.identifier, t.token],
    }),
  ],
);

export const workspaces = pgTable("workspaces", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const workspaceUsers = pgTable(
  "workspace_users",
  {
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("owner"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.workspaceId, t.userId] }),
    index("idx_workspace_users_user").on(t.userId),
  ],
);

export const folders = pgTable(
  "folders",
  {
    id: serial("id").primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    path: ltree("path").notNull(),
    // ponytail: no self-FK on parent_id (Drizzle circular type inference);
    // service layer validates parent references on write.
    parentId: integer("parent_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique("folders_workspace_path").on(t.workspaceId, t.path),
    index("idx_folders_path").using("gist", t.path),
    index("idx_folders_workspace").on(t.workspaceId),
  ],
);

export const notes = pgTable(
  "notes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    folderId: integer("folder_id").references(() => folders.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    content: text("content").notNull().default(""),
    format: text("format").notNull().default("markdown"),
    para: paraCategory("para").notNull().default("resource"),
    status: noteStatus("status").notNull().default("draft"),
    isFavorite: boolean("is_favorite").notNull().default(false),
    isTemplate: boolean("is_template").notNull().default(false),
    isDeleted: boolean("is_deleted").notNull().default(false),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    slug: text("slug"),
    coverImage: text("cover_image"),
    searchVector: tsvector("search_vector").generatedAlwaysAs(
      `setweight(to_tsvector('english', coalesce(title, '')), 'A') || setweight(to_tsvector('english', coalesce(content, '')), 'B')`,
    ),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("idx_notes_folder").on(t.folderId, t.createdAt.desc()),
    index("idx_notes_para")
      .on(t.para, t.createdAt.desc())
      .where(sql`is_deleted = false`),
    index("idx_notes_status")
      .on(t.status, t.updatedAt.desc())
      .where(sql`is_deleted = false`),
    index("idx_notes_workspace").on(t.workspaceId, t.updatedAt.desc()),
    index("idx_notes_favorites")
      .on(t.updatedAt.desc())
      .where(sql`is_favorite = true and is_deleted = false`),
    index("idx_notes_inbox")
      .on(t.createdAt.desc())
      .where(sql`status = 'inbox' and is_deleted = false`),
    index("idx_notes_search")
      .using("gin", t.searchVector)
      .where(sql`is_deleted = false`),
    index("idx_notes_title_trgm")
      .using("gin", t.title.op("gin_trgm_ops"))
      .where(sql`is_deleted = false`),
  ],
);

export const tags = pgTable(
  "tags",
  {
    id: serial("id").primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    color: text("color"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique("tags_workspace_name").on(t.workspaceId, t.name)],
);

export const noteTags = pgTable(
  "note_tags",
  {
    noteId: uuid("note_id")
      .notNull()
      .references(() => notes.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => [
    primaryKey({ columns: [t.noteId, t.tagId] }),
    index("idx_note_tags_tag").on(t.tagId),
  ],
);

export const noteLinks = pgTable(
  "note_links",
  {
    sourceNoteId: uuid("source_note_id")
      .notNull()
      .references(() => notes.id, { onDelete: "cascade" }),
    targetNoteId: uuid("target_note_id")
      .notNull()
      .references(() => notes.id, { onDelete: "cascade" }),
    linkText: text("link_text"),
    anchor: text("anchor"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.sourceNoteId, t.targetNoteId] }),
    index("idx_links_target").on(t.targetNoteId),
  ],
);

export const noteProperties = pgTable(
  "note_properties",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    noteId: uuid("note_id")
      .notNull()
      .references(() => notes.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    value: jsonb("value").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique("note_properties_note_key").on(t.noteId, t.key),
    index("idx_note_properties_note").on(t.noteId),
  ],
);

export const noteRevisions = pgTable(
  "note_revisions",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    noteId: uuid("note_id")
      .notNull()
      .references(() => notes.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    content: text("content").notNull(),
    revision: integer("revision").notNull(),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique("note_revisions_note_revision").on(t.noteId, t.revision),
    index("idx_revisions_note").on(t.noteId, t.revision.desc()),
  ],
);

export const assets = pgTable(
  "assets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    storageKey: text("storage_key").notNull(),
    originalFilename: text("original_filename").notNull(),
    mimeType: text("mime_type").notNull(),
    size: bigint("size", { mode: "number" }).notNull(),
    width: integer("width"),
    height: integer("height"),
    checksum: text("checksum"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("idx_assets_workspace").on(t.workspaceId, t.createdAt.desc())],
);

export const noteAssets = pgTable(
  "note_assets",
  {
    noteId: uuid("note_id")
      .notNull()
      .references(() => notes.id, { onDelete: "cascade" }),
    assetId: uuid("asset_id")
      .notNull()
      .references(() => assets.id, { onDelete: "cascade" }),
    position: integer("position").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.noteId, t.assetId] })],
);

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    status: text("status").notNull().default("active"),
    outcome: text("outcome"),
    deadline: timestamp("deadline", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("idx_projects_workspace").on(t.workspaceId, t.updatedAt.desc())],
);

export const projectNotes = pgTable(
  "project_notes",
  {
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    noteId: uuid("note_id")
      .notNull()
      .references(() => notes.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("reference"),
  },
  (t) => [
    primaryKey({ columns: [t.projectId, t.noteId] }),
    index("idx_project_notes_note").on(t.noteId),
  ],
);

export const schema = {
  paraCategory,
  noteStatus,
  users,
  accounts,
  sessions,
  verificationTokens,
  workspaces,
  workspaceUsers,
  folders,
  notes,
  tags,
  noteTags,
  noteLinks,
  noteProperties,
  noteRevisions,
  assets,
  noteAssets,
  projects,
  projectNotes,
};