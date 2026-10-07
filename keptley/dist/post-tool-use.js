import { readFileSync } from 'node:fs';
import { flushOutbox, home, readHookInput, post, postToolUseContext, repoInfo, } from './common.js';
import { redactCommand, redactSecrets } from './masking.js';
import { recall } from './session-state.js';
/** PostToolUse: capture edits and commands for the change ledger. Never blocks. */
const input = await readHookInput();
const tool = input.tool_name ?? '';
const kind = tool === 'Bash' ? 'command' : 'edit';
const str = (v) => (typeof v === 'string' ? v : '');
/**
 * A session often produces a document that never reaches the repository: a published artifact, or
 * a note written to a scratch directory. Nobody remembers to save those by hand, so they are
 * captured here from what the session did.
 *
 * With an artifact goes **the file it was published from** (#566). The link belongs to whoever published
 * it — they can edit it, republish it or delete it — so a page carrying only a link says "this existed"
 * and nothing about what it said. The file is named in the same tool call, is on the laptop for minutes,
 * and is what Keptley can still show.
 */
async function captureDocument(input) {
    const repo = repoInfo(input.cwd);
    if (!repo.repo)
        return;
    // A published artifact: the tool result carries the link.
    const result = JSON.stringify(input.tool_response ?? '');
    const artifact = /https:\/\/claude\.ai\/(?:code\/)?artifact\/[A-Za-z0-9_-]{6,}/.exec(result);
    if (artifact) {
        await post('/v1/documents', {
            sessionId: input.session_id,
            cwd: home(input.cwd),
            url: artifact[0],
            title: redactSecrets(str(input.tool_input?.['title'])) || undefined,
            occurredAt: new Date().toISOString(),
            ...publishedFile(str(input.tool_input?.['file_path'])),
            ...repo,
        }, { keep: true });
        return;
    }
    // A markdown file written outside the repository: only when the workspace keeps those (#1545), as the
    // api said when this session started. Not known (no answer, an older api) is not yes.
    const filePath = str(input.tool_input?.['file_path']);
    const body = str(input.tool_input?.['content']);
    if (filePath.match(/\.mdx?$/i) &&
        body &&
        !filePath.startsWith(input.cwd) &&
        recall(input.session_id)?.notesOutside === true) {
        await post('/v1/documents', {
            sessionId: input.session_id,
            cwd: home(input.cwd),
            filePath: home(filePath),
            body: redactSecrets(body),
            occurredAt: new Date().toISOString(),
            ...repo,
        }, { keep: true });
    }
}
/**
 * The file an artifact was published from, read from disk (#566).
 *
 * Only what Keptley keeps — `.html`, `.md`, `.txt` — and only up to two megabytes, which is what a
 * rendered artifact reasonably is. Anything else is left behind silently rather than half-sent: the link
 * is still captured, and a page with a link and no file is what the page was before this existed.
 */
function publishedFile(filePath) {
    if (!/\.(html?|md|markdown|txt)$/i.test(filePath))
        return {};
    try {
        const body = readFileSync(filePath, 'utf8');
        if (!body || Buffer.byteLength(body, 'utf8') > 2 * 1024 * 1024)
            return {};
        return { file: { name: filePath.split('/').pop() ?? filePath, body: redactSecrets(body) } };
    }
    catch {
        // Written to a temporary directory and already gone, or not readable. Nothing to send.
        return {};
    }
}
// A command is masked here, before it is sent or kept in the outbox (#1498), by the server's own rules.
const subject = kind === 'command'
    ? redactCommand(str(input.tool_input?.['command']))
    : home(str(input.tool_input?.['file_path']));
await captureDocument(input);
if (subject) {
    const reply = (await post('/v1/ledger/events', {
        sessionId: input.session_id,
        cwd: home(input.cwd),
        tool,
        kind,
        subject,
        occurredAt: new Date().toISOString(),
        ...repoInfo(input.cwd),
    }, { keep: true }));
    // A page describes the file just edited: tell Claude, once per page per session.
    const out = postToolUseContext(reply?.notice);
    if (out)
        process.stdout.write(out);
    // The api just answered, so anything kept while it could not be reached can go now (#564). Only on
    // evidence that it is up: retrying into a dead api on every tool call would slow every session down.
    if (reply !== null)
        await flushOutbox({ max: 10, budgetMs: 2_000 });
}
//# sourceMappingURL=post-tool-use.js.map