# Changelog

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
