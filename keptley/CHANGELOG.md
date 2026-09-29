# Changelog

## 0.10.0

- `/keptley:produced` lists what your team's sessions made and nobody committed — artifacts, documents,
  notes, plans, reports — newest first, with who made each one and which of them nobody has opened yet.
  It is the answer to "did somebody already write this?", which until now lived in a terminal scrollback
  on somebody else's laptop. The same list is available to any editor through the `keptley_produced`
  tool.

## 0.9.0

- Every document a session produces says what it is, from where it came from: an artifact, a plan, a
  note, a document, or a report when `/keptley:save` is told so. Nothing reads the text to decide, so
  the word beside a document is a fact about where it came from rather than a guess about what it says.

## 0.8.0

- The file behind an artifact comes with the link. Publishing an artifact sends the `.html` or `.md` it
  was published from, and Keptley keeps it against that version of the page: the link belongs to whoever
  published it and can be edited or deleted, and a page carrying only a link says "this existed" and
  nothing about what it said. Only `.html`, `.md` and `.txt`, only up to 2 MB, only the file named in that
  publish — `PRIVACY.md` says exactly that.

## 0.7.0

- A session in a repository Keptley does not know is recorded under _Written here_ instead of being
  refused: the files it edited, the commands it ran and the documents it produced. Before this, a new
  checkout or a repository nobody had connected lost everything the session did. The repository's name
  is not recorded, and `PRIVACY.md` says how to keep a project out of it entirely.
- Nothing a session did is lost because the server could not be reached. A capture that fails for a
  reason that might pass — no network, a timeout, a server that is restarting — is kept in
  `~/.keptley/outbox` and sent at the next hook or the next session start, oldest first, with the time
  it happened rather than the time it arrived. A capture the server refused on its own terms is not
  kept, because tomorrow it is refused again. The outbox holds at most 500 captures, nothing older than
  a fortnight, and never your token; `PRIVACY.md` says so in the same words.

## 0.6.0

- `/keptley:book` reads the team's compiled handbook, or one chapter of it, through the new
  `keptley_book` and `keptley_chapter` tools. A chapter is compiled from rows, so the command tells
  Claude to read it rather than paraphrase it: a summary of a table is a number nobody can check. Asked
  for the sections of a chapter, it follows each marker to what it was compiled from — the page at the
  version the chapter pinned, the diagram version, the pull requests, or the numbers a count counted.

## 0.5.0

- A session says who is running it, from the git identity already on your commits. A token issued for
  a workspace rather than for a person named nobody, so the work every session did was recorded
  against `(unknown)` and counted towards nobody's seat. Keptley matches the address to somebody
  already in your workspace and never creates a person from it.

## 0.4.0

- The session reports the commit it ended on, which is what ties the work it did to what reached
  your repository. Without it every AI change was recorded against whoever pushed it.
- The session's own summary becomes the reason in the change ledger, so "what changed" is finally
  answered by "and why".

## 0.3.0

- A session is told when the `CLAUDE.md` it is reading is not the version the team has: which
  version Keptley holds, the pull request that made it and why. Working from an uncommitted
  CLAUDE.md means working from instructions nobody else has, and every page written in that session
  inherits them.
- It also says when Keptley holds guidance this checkout is not reading at all.
- Only hashes of those files are sent, never their content: a working copy of your CLAUDE.md is
  yours until you commit it.

## 0.2.0

- Five commands: `/keptley:ask`, `/keptley:stale`, `/keptley:changes`, `/keptley:save`,
  `/keptley:status`.
- The editor is told what Keptley is when it connects, and which tool answers what.
- Tool names and descriptions written for the person reading them, saying which numbers are
  derived from your repositories rather than written by a model.

## 0.1.0

First release.

- Session start: Claude begins knowing recent changes, owners and the pages that matter here.
- While you work: edits and commands recorded for the change ledger, and a warning when a file you
  changed is described by a page.
- Session end: the summary goes to the ledger.
- Tools over MCP: search, ask, save, drift, who knows, feature status, changes.
