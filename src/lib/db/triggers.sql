-- Revision trigger: saves a full snapshot whenever note title/content changes.
-- Run after migrations.

CREATE OR REPLACE FUNCTION save_note_revision() RETURNS trigger AS $$
BEGIN
  IF OLD.content IS DISTINCT FROM NEW.content OR OLD.title IS DISTINCT FROM NEW.title THEN
    INSERT INTO note_revisions (note_id, title, content, revision, metadata)
    SELECT NEW.id, NEW.title, NEW.content,
      COALESCE((SELECT max(revision) + 1 FROM note_revisions WHERE note_id = NEW.id), 1),
      jsonb_build_object('changed_at', now());
    NEW.updated_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_note_revision ON notes;
CREATE TRIGGER trg_note_revision
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION save_note_revision();

-- Revision retention: keep most recent 20 revisions per note.
-- Run periodically (e.g. on note save or daily cron).
CREATE OR REPLACE FUNCTION prune_old_revisions() RETURNS void AS $$
BEGIN
  DELETE FROM note_revisions r
  WHERE r.id IN (
    SELECT r2.id FROM note_revisions r2
    WHERE r2.note_id = r.note_id
      AND r2.revision < (
        SELECT COALESCE(min(revision), 0)
        FROM (
          SELECT revision FROM note_revisions
          WHERE note_id = r2.note_id
          ORDER BY revision DESC
          LIMIT 20
        ) keep
      )
  );
END;
$$ LANGUAGE plpgsql;