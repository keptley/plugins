---
description: Answer from your team's own pages, with sources, or say who to ask
argument-hint: [question]
---

Answer this question from the team's own documentation: **$ARGUMENTS**

1. Call `keptley_ask` with the question. It decides whether the team's pages answer it, and its reply
   is one of three things. Keep to the one you get.
2. **An answer with numbered sources.** Give the answer, and cite each page by title and path as the
   reply does. If a source is marked as possibly out of date, say so plainly rather than repeating it
   as fact.
3. **"No page covers …"** with people named. Say exactly that: no page covers it, and who to ask. Cite
   nothing, quote no page, and do not add what the pages _do_ say about something nearby — a page that
   shares a word with the question is not an answer to it. Do not answer from your own knowledge
   either; offer to save the answer with `/keptley:save` once they have it.
4. **The closest passages, quoted.** Keptley could not check whether they answer the question. Read
   them; if one plainly answers it, answer and cite that page. If none does, say no page covers it and
   call `keptley_who_knows` for who to ask — never "the passages do not mention X" with the passages
   cited under it.
