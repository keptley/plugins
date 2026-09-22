# Keptley for Claude Code

**Everything your team knows, kept and true.** Keptley holds your team's documentation, keeps it
honest as the code changes, and records what every AI session changed and why.

This repository is the official plugin marketplace. Installing the plugin connects your editor to
your team's Keptley organisation: Claude answers from your own pages, tells you when a page you
just contradicted needs updating, and writes what happened into your change ledger.

---

## Requirements

|         |                                                             |
| ------- | ----------------------------------------------------------- |
| Editor  | Claude Code, in the terminal or in VS Code                  |
| Node.js | 20 or newer, already required by Claude Code                |
| Account | A Keptley organisation, and a token from your Keptley admin |

Your admin creates the organisation by installing the Keptley GitHub App on your GitHub
organisation, then issues you a token from the Keptley web app.

---

## Install

**1. Add the marketplace and install the plugin.** In Claude Code, run:

```
/plugin marketplace add keptley/plugins
/plugin install keptley@keptley
```

**2. Add your token.** Open `~/.claude/settings.json` and add an `env` block:

```json
{
  "env": {
    "KEPTLEY_TOKEN": "kpt_your_token_here",
    "KEPTLEY_API_URL": "https://api.dev.keptley.com"
  }
}
```

`KEPTLEY_API_URL` is only needed while Keptley is in preview. Keep the token out of your
repository; it belongs to you and identifies your organisation.

**3. Restart Claude Code.** Then ask it something your team has written down, such as
_"how do we deploy the api?"_. The answer quotes your own pages and links to them.

To install for one project only, put the same `env` block in that project's
`.claude/settings.local.json` instead, which is useful when you work across more than one
organisation.

---

## What it does

**At the start of a session** it tells Claude what your team already knows: recent changes, who
owns what, and the pages that matter in this repository. Claude starts informed instead of
guessing.

**While you work** it records edits and commands for your change ledger. When you change something
a page describes, Claude says the page may now be wrong and offers to update it. It never edits a
page without you agreeing.

**When a session ends** it sends a summary to the ledger, so the record of your codebase says what
changed, who or which session changed it, and why.

**Tools Claude can call**, from any session:

| Tool                                      | What it answers                                        |
| ----------------------------------------- | ------------------------------------------------------ |
| `keptley_search`                          | The pages and passages that cover a question           |
| `keptley_ask`                             | The pages that answer it, quoted, or the person to ask |
| `keptley_page`, `keptley_page_history`    | A page, and how it reached its current state           |
| `keptley_save_doc`                        | Saves what you just wrote as a page, with provenance   |
| `keptley_check_drift`                     | Whether a change contradicts a page                    |
| `keptley_who_knows`                       | Who has written closest to a topic                     |
| `keptley_feature_status`, `keptley_goals` | Where work actually stands, derived, never typed       |
| `keptley_changes`                         | What changed, by whom, and why                         |
| `keptley_doubts`, `keptley_resolve_doubt` | Pages that may be out of date, and clearing them       |
| `keptley_slack`                           | Connect a Slack workspace to your organisation         |

---

## Commands

Typed in Claude Code, these do the whole job rather than leaving you to phrase it:

| Command                   | What it does                                                                  |
| ------------------------- | ----------------------------------------------------------------------------- |
| `/keptley:ask <question>` | Answers from your pages with sources, or says who to ask                      |
| `/keptley:stale`          | Pages a merged change may have made wrong, worst first, and offers to fix one |
| `/keptley:changes [7d]`   | What changed lately, by people and by AI, and why                             |
| `/keptley:save [path]`    | Saves what the session worked out as a page, after you approve it             |
| `/keptley:status [role]`  | Where the work stands, including what is merged with no page changed          |

Claude also uses Keptley's tools on its own when a question calls for them.

## What is sent, and what is not

The plugin sends your organisation's Keptley server: the repository and branch, the files a session
edited, the commands it ran, and the session summary. That record is what the change ledger is made
of, and only your organisation can read it.

It does not send file contents that the session did not touch, your environment, or anything at all
when `KEPTLEY_TOKEN` is unset. With no token the hooks exit immediately and silently: a missing or
expired token must never break, slow down or block a session.

---

## Updating

```
/plugin marketplace update keptley
/plugin update keptley@keptley
```

## Uninstalling

```
/plugin uninstall keptley@keptley
```

Removing the plugin stops all recording at once. Pages your team has already saved stay in Keptley.

---

## Other editors

Cursor, Windsurf, JetBrains and VS Code's own agent reach the same Keptley tools over MCP. They do
not use this plugin, and they do not record sessions in the change ledger; the hooks that do that
are a Claude Code feature.

In every example below, replace `kpt_...` with your token, and keep it out of version control.

**Claude Code in VS Code** uses the plugin, exactly as above. Nothing else to configure.

**Cursor** — `~/.cursor/mcp.json` for everything you work on, or `.cursor/mcp.json` for one project:

```json
{
  "mcpServers": {
    "keptley": {
      "url": "https://api.dev.keptley.com/mcp",
      "headers": { "Authorization": "Bearer ${env:KEPTLEY_TOKEN}" }
    }
  }
}
```

**Windsurf** — `~/.codeium/windsurf/mcp_config.json`, then Settings, Cascade, refresh the servers:

```json
{
  "mcpServers": {
    "keptley": {
      "serverUrl": "https://api.dev.keptley.com/mcp",
      "headers": { "Authorization": "Bearer ${env:KEPTLEY_TOKEN}" }
    }
  }
}
```

**VS Code with GitHub Copilot** — `.vscode/mcp.json` in the project. VS Code asks for the token the
first time and stores it itself, so nothing secret is committed:

```json
{
  "inputs": [
    {
      "type": "promptString",
      "id": "keptley-token",
      "description": "Keptley token",
      "password": true
    }
  ],
  "servers": {
    "keptley": {
      "type": "http",
      "url": "https://api.dev.keptley.com/mcp",
      "headers": { "Authorization": "Bearer ${input:keptley-token}" }
    }
  }
}
```

**JetBrains IDEs** (IntelliJ IDEA, PyCharm, WebStorm, GoLand, Rider) — Settings, Tools, AI
Assistant, Model Context Protocol (MCP), Add, then the URL `https://api.dev.keptley.com/mcp` with
the header `Authorization: Bearer kpt_...`. If your version has no field for headers, use Keptley
in Claude Code or Slack from that machine instead.

**Anything else that speaks MCP** connects to `https://api.dev.keptley.com/mcp` over Streamable
HTTP with an `Authorization: Bearer` header.

**Slack** is connected once by an admin, from the Keptley web app, and then answers questions in
channels and direct messages.

---

## Troubleshooting

**Claude does not mention Keptley.** Run `/plugin` and check that `keptley` is listed as installed
and enabled, then confirm `KEPTLEY_TOKEN` is set in the settings file for this project or user.

**Answers say a page cannot be found.** Keptley answers only from pages it holds, and never invents
one. If nothing covers the question, it names the person who has written closest to it.

**A token stopped working.** Tokens are revoked and reissued, never recovered. Ask your admin for a
new one.

---

## Support and terms

Questions, problems and feature requests: **admin@keptley.com**.

Keptley is a hosted service. The plugin is published by Keptley for use with a Keptley
subscription, and is not open source.

© Keptley. All rights reserved.
