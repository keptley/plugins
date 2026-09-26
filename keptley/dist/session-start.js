import { readHookInput, config, guidanceFiles, repoInfo } from './common.js';
/**
 * SessionStart: inject org context, and check the session's CLAUDE.md files against the team's.
 *
 * The guidance check sends hashes, never content: a working copy of somebody's CLAUDE.md is theirs
 * until they commit it. Keptley answers with a line when the file on this machine is not the version
 * the team has, or when it holds one this session is not reading at all.
 *
 * Emits additionalContext via stdout JSON; silent when not configured.
 */
const input = await readHookInput();
const { apiUrl, token } = config();
if (token) {
    try {
        const res = await fetch(new URL('/v1/context', apiUrl), {
            method: 'POST',
            headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
            body: JSON.stringify({
                cwd: input.cwd,
                sessionId: input.session_id,
                ...repoInfo(input.cwd),
                // Hashes of the CLAUDE.md files this session reads, so Keptley can say when the agent is
                // following guidance the team does not have. The content stays on this machine.
                guidance: guidanceFiles(input.cwd),
            }),
            signal: AbortSignal.timeout(10_000),
        });
        if (res.ok) {
            const { context } = (await res.json());
            process.stdout.write(JSON.stringify({
                hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: context },
            }));
        }
    }
    catch (err) {
        console.error(`[keptley] session-start: ${err instanceof Error ? err.message : String(err)}`);
    }
}
//# sourceMappingURL=session-start.js.map