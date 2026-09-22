import { readHookInput, post, postToolUseContext, repoInfo } from './common.js';
/** PostToolUse: capture edits and commands for the change ledger. Never blocks. */
const input = await readHookInput();
const tool = input.tool_name ?? '';
const kind = tool === 'Bash' ? 'command' : 'edit';
const str = (v) => (typeof v === 'string' ? v : '');
/**
 * A session often produces a document that never reaches the repository: a published artifact, or
 * a note written to a scratch directory. Nobody remembers to save those by hand, so they are
 * captured here from what the session did.
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
            cwd: input.cwd,
            url: artifact[0],
            title: str(input.tool_input?.['title']) || undefined,
            ...repo,
        });
        return;
    }
    // A markdown file written outside the repository.
    const filePath = str(input.tool_input?.['file_path']);
    const body = str(input.tool_input?.['content']);
    if (filePath.match(/\.mdx?$/i) && body && !filePath.startsWith(input.cwd)) {
        await post('/v1/documents', {
            sessionId: input.session_id,
            cwd: input.cwd,
            filePath,
            body,
            ...repo,
        });
    }
}
const subject = kind === 'command' ? str(input.tool_input?.['command']) : str(input.tool_input?.['file_path']);
await captureDocument(input);
if (subject) {
    const reply = (await post('/v1/ledger/events', {
        sessionId: input.session_id,
        cwd: input.cwd,
        tool,
        kind,
        subject,
        occurredAt: new Date().toISOString(),
        ...repoInfo(input.cwd),
    }));
    // A page describes the file just edited: tell Claude, once per page per session.
    const out = postToolUseContext(reply?.notice);
    if (out)
        process.stdout.write(out);
}
//# sourceMappingURL=post-tool-use.js.map