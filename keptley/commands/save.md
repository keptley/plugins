---
description: Save what we just worked out as a page, with provenance
argument-hint: [path, for example docs/runbooks/deploy.md]
---

Save what this session established as a page in Keptley.

1. Decide the path: **$ARGUMENTS** if I gave one, otherwise propose one that matches how this
   repository already organises its documentation, and ask me.
2. Check `keptley_search` first: if a page already covers this, update that page instead of adding
   a second one that will contradict it.
3. Write it as Markdown a new colleague could follow. Commands must be ones we actually ran.
4. Show it to me. Only after I approve, call `keptley_save_doc`, with a one-line reason for the
   page history.
