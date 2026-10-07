# Privacy

How the Keptley plugin handles your data. Last updated 7 October 2026.

Keptley is a hosted service for engineering teams. This page covers the Claude Code plugin and the
editor integrations. Your organisation's agreement with Keptley governs the service itself.

## Where your data goes

The plugin talks to one place: your own organisation's Keptley server, over HTTPS, using the token
you configured. It sends nothing to anyone else, and Keptley does not sell or share your data.

## What the plugin sends

While a session runs, so that your change ledger can say what happened and why:

- the working directory, the repository (from git's `origin`) and branch you are working in, and the
  current commit,
- your git name and email, used only to match you to a member of your workspace: Keptley never creates
  a person from them,
- the paths and SHA-256 hashes of the repository's `CLAUDE.md` files, never their contents,
- the paths of files the session edited, and the commands it ran; what looks like a secret in a command
  is masked on your machine before it is sent, and again by the server before it is kept,
- at the end, that the session ended, and the path of its transcript on your machine, never the
  transcript itself,
- the questions you ask Keptley, so they can be answered from your pages.

When you explicitly save a page, the content of that page. When a session writes a Markdown file
outside the working directory, such as a plan or a note, its path and contents, so the documents a
session produces are not lost; only in a git repository.

When a session publishes an artifact, the file it was published from — the `.html` or `.md` that was just
written — so the page can still show what the artifact said after the artifact itself is edited or
deleted. Only `.html`, `.md` and `.txt`, only up to 2 MB, and only the file named in that publish: never
the directory around it. The file is stored privately in your organisation's own bucket and is handed
back only to your organisation, over the api. What looks like a secret in a document or file is masked on
your machine before it is sent, and again by the server before it is kept.

## What is kept on your machine

A capture the server could not take is written to `~/.keptley/outbox` and sent at the next hook or the
next session start, so a laptop on a plane or behind bad wifi does not leave a hole in your change
ledger. Those files hold the same thing the plugin would have sent — a path, a command, a document you
published — and never your token, which is read from the environment each time. Nothing is kept longer
than fourteen days, at most 500 captures are held, and what the server refuses is deleted rather than
tried again. Delete the directory at any time: the plugin makes it again when it needs it and loses
only what was waiting.

## A repository Keptley does not know

The plugin runs per user account, so it also runs in projects your workspace has not connected, and
sends what it would send anywhere. Keptley keeps nothing of such a session unless your workspace has
turned on recording sessions elsewhere; then it is kept under _Written here_ (the paths it edited, the
commands it ran, the documents it produced), the name of the repository is not recorded, and no
repository is created from it. For a project you do not want sent at all, leave `KEPTLEY_TOKEN` unset
for it.

## What it does not send

- The contents of files the session edited or read. Only what is listed above: a page you save, the
  file an artifact was published from, and a Markdown file the session wrote outside the working
  directory.
- Your environment variables or credentials. The token is sent as the request's credential and never
  written to disk.
- The session's transcript.
- Anything at all when `KEPTLEY_TOKEN` is not set: the hooks start, find no token and end without a
  network call, and nothing is kept on your machine.

## Who can see it

Only your Keptley organisation. Each token belongs to one organisation, and every read is scoped to
it: one customer's client can never reach another customer's pages.

## Models

Keptley calls a model for a few things only: answers, drift judgments, drafts, ranking, diagrams and
change notes. Those calls run through the provider Keptley's servers are configured to use
(currently Google Cloud Vertex AI, on its global endpoint, which Claude requires) under a commercial
agreement, and your content is not used to train models.

## Retention and deletion

Pages, versions and ledger entries are kept while your organisation uses Keptley. You can export
them at any time. On request, or when an organisation leaves, we delete its data; the pilot terms
say export first, deletion within seven days of exit.

## Contact

admin@keptley.com
