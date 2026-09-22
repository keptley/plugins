# Changelog

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
