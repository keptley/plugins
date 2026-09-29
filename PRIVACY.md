# Privacy

How the Keptley plugin handles your data. Last updated 29 September 2026.

Keptley is a hosted service for engineering teams. This page covers the Claude Code plugin and the
editor integrations. Your organisation's agreement with Keptley governs the service itself.

## Where your data goes

The plugin talks to one place: your own organisation's Keptley server, over HTTPS, using the token
you configured. It sends nothing to anyone else, and Keptley does not sell or share your data.

## What the plugin sends

While a session runs, so that your change ledger can say what happened and why:

- the repository and branch you are working in, and the current commit,
- the paths of files the session edited, and the commands it ran,
- the summary of what the session did, at the end,
- the questions you ask Keptley, so they can be answered from your pages.

When you explicitly save a page, the content of that page.

## What is kept on your machine

A capture the server could not take is written to `~/.keptley/outbox` and sent at the next hook or the
next session start, so a laptop on a plane or behind bad wifi does not leave a hole in your change
ledger. Those files hold the same thing the plugin would have sent — a path, a command, a document you
published — and never your token, which is read from the environment each time. Nothing is kept longer
than fourteen days, at most 500 captures are held, and what the server refuses is deleted rather than
tried again. Delete the directory at any time: the plugin makes it again when it needs it and loses
only what was waiting.

## What it does not send

- File contents the session did not touch or you did not save.
- Your environment variables, credentials, or anything outside the repository you are working in.
- Anything at all when `KEPTLEY_TOKEN` is not set. With no token the hooks exit immediately.

## Who can see it

Only your Keptley organisation. Each token belongs to one organisation, and every read is scoped to
it: one customer's client can never reach another customer's pages.

## Models

Keptley calls a model for a few things only: answers, drift judgments, drafts, ranking, diagrams and
change notes. Those calls run through the provider Keptley's servers are configured to use
(currently Google Cloud Vertex AI in the customer's region) under a commercial agreement, and your
content is not used to train models.

## Retention and deletion

Pages, versions and ledger entries are kept while your organisation uses Keptley. You can export
them at any time. On request, or when an organisation leaves, we delete its data; the pilot terms
say export first, deletion within seven days of exit.

## Contact

admin@keptley.com
