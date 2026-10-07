import { flushOutbox, readHookInput, config, guidanceFiles, home, repoInfo, gitAuthor, } from './common.js';
import { tidy } from './outbox.js';
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
// The outbox kept within fourteen days and private, with or without a token (#1504).
tidy();
if (token) {
    // A laptop that was asleep, on a plane or behind bad wifi yesterday sends what it kept, before this
    // session adds anything of its own (#564).
    await flushOutbox({ max: 50, budgetMs: 6_000 });
    try {
        const res = await fetch(new URL('/v1/context', apiUrl), {
            method: 'POST',
            headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
            body: JSON.stringify({
                cwd: home(input.cwd),
                sessionId: input.session_id,
                ...repoInfo(input.cwd),
                ...gitAuthor(input.cwd),
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