---
description: Read this team's compiled handbook, or one chapter of it, before answering from memory
argument-hint: [overview | architecture | changed | changelog]
---

Read the book rather than describing the system from memory.

1. If I named a chapter in **$ARGUMENTS**, call `keptley_chapter` with `chapter` set to it. If I named
   nothing, call `keptley_book` first and tell me which chapters exist and when each was compiled, then
   read the overview chapter.
2. Give me the chapter as it reads. Do not summarise a table into prose: every count, name, path and date
   in it is a database query, and a paraphrase of one is a number nobody can check.
3. Say which parts a person accepted and which are compiled. A chapter has at most one written paragraph;
   everything else is rows. If `hasNarrative` is false, say that nobody has written the connecting
   sentence yet rather than filling it in.
4. Read the chapter's own **What this chapter cannot tell you** section out to me. It is the honest half.
5. If I doubt a line, call `keptley_chapter` again with `sections: true` and follow the marker to what it
   was compiled from: the page at the version the chapter pinned, the diagram version, the pull requests,
   or the numbers a count counted.

Never add a fact to a chapter. If I ask something the chapter does not answer, say so and use
`keptley_search` or `keptley_ask`.
