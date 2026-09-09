# E2E Test Matrix

## Authentication
| Test | Steps | Expected |
|------|-------|----------|
| Sign in | Navigate to /auth/signin, enter credentials | Redirect to dashboard |
| Sign out | Click user menu, sign out | Redirect to /auth/signin |
| Unauthenticated access | Navigate to /notes directly | Redirect to /auth/signin |

## Notes
| Test | Steps | Expected |
|------|-------|----------|
| Create note | Click new note, type title and content, save | Note appears in list |
| Edit note | Open note, change title, save | Title updates |
| Delete note | Open note, delete | Note moves to trash |
| Restore note | Open trash, restore note | Note reappears in list |
| Soft delete | Delete note, check it's not in main list | Hidden from normal view |
| Auto-save | Edit note, wait | Note saved automatically |

## Editor
| Test | Steps | Expected |
|------|-------|----------|
| Markdown rendering | Type markdown syntax | Renders correctly |
| Code block | Type ``` and code | Syntax highlighted |
| Wikilink creation | Type [[New Note]] | Link created |
| Wikilink navigation | Click [[Existing Note]] | Navigate to note |
| Frontmatter editing | Edit YAML properties | Properties saved |

## Links
| Test | Steps | Expected |
|------|-------|----------|
| Create wikilink | Type [[Note]] in editor | note_links row created |
| Backlink appears | Note A links to B, open B | A appears in backlinks |
| Rename target | Rename note B, check note A | Link updated |
| Broken link | Link to non-existent note | Shows as broken link |
| Outgoing links | Open note with links | All outgoing links listed |

## Tags
| Test | Steps | Expected |
|------|-------|----------|
| Add tag | Type tag name, add to note | Tag appears on note |
| Filter by tag | Click tag in sidebar | Notes filtered |
| Remove tag | Remove tag from note | Tag removed |
| Tag count | Check tag list | Correct count shown |

## Folders
| Test | Steps | Expected |
|------|-------|----------|
| Create folder | Create folder in sidebar | Folder appears |
| Create nested folder | Create subfolder | Hierarchy correct |
| Move note to folder | Drag or assign note | Note in new folder |
| Folder subtree | Open folder | All descendant notes visible |

## Search
| Test | Steps | Expected |
|------|-------|----------|
| Title search | Search by note title | Note found |
| Content search | Search by content word | Note found |
| Tag filter + search | Search with tag filter | Correct results |
| Empty search | Search for non-existent | Empty results |
| Search ranking | Search with multiple matches | Most relevant first |

## PARA
| Test | Steps | Expected |
|------|-------|----------|
| Assign PARA | Set note PARA to project | Note in project view |
| Filter by PARA | Click PARA category | Notes filtered |
| Move between PARA | Change from project to archive | Note moves |

## Assets
| Test | Steps | Expected |
|------|-------|----------|
| Upload image | Drag image into editor | Image uploaded, embedded |
| Image persistence | Reload page | Image still visible |
| Delete asset | Remove image from note | Asset orphaned (or cleaned) |

## Import/Export
| Test | Steps | Expected |
|------|-------|----------|
| Import vault | Upload ZIP of Markdown files | Notes created |
| Import preserves links | Import with [[links]] | Links resolved |
| Import preserves tags | Import with tags in frontmatter | Tags created |
| Export vault | Export to ZIP | Valid Markdown files |
| Round-trip | Import then export | Content matches |

## Dashboard
| Test | Steps | Expected |
|------|-------|----------|
| Inbox count | Create inbox note | Count updates |
| Recent notes | Edit a note | Appears in recent |
| Orphan notes | Note with no links | Shows in orphan list |
| Broken links | Note with broken [[link]] | Shows in broken links |
