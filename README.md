# Keptley

Everything your team knows, kept and true. This repository is the Keptley plugin marketplace.

## Install

In Claude Code, in the terminal or in VS Code:

```
/plugin marketplace add keptley/plugins
/plugin install keptley@keptley
```

Then give it your Keptley token, once, in `~/.claude/settings.json`:

```json
{ "env": { "KEPTLEY_TOKEN": "kpt_...", "KEPTLEY_API_URL": "https://api.dev.keptley.com" } }
```

Your Keptley admin gives you the token. `KEPTLEY_API_URL` is needed only while Keptley runs in preview. Restart Claude Code after adding it.

## What it does

- **At the start of a session**, it tells Claude what your team already knows: recent changes,
  owners and the pages that matter here.
- **While you work**, it records edits and commands for your change ledger. When you change a file
  that a page describes, Claude tells you the page may need updating and offers to update it. It
  never edits a page without you agreeing.
- **At the end of a session**, it sends a summary to the ledger, so the record says what changed
  and why.
- **Tools** Claude can call: search your pages, ask, save a document, check drift, who knows about
  something, feature status, and what changed.

Without a token the plugin does nothing at all, and it never slows down or blocks a session.

Other editors that speak MCP (Cursor, Windsurf, JetBrains AI) connect to the same tools without the
plugin; see your Keptley settings.

## Updating

```
/plugin marketplace update keptley
/plugin update keptley@keptley
```
