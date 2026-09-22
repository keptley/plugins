import { readHookInput, config, repoInfo } from './common.js';
/**
 * SessionStart: inject org context and sync CLAUDE.md guidance.
 * Emits additionalContext via stdout JSON; silent when not configured.
 */
const input = await readHookInput();
const { apiUrl, token } = config();
if (token) {
    try {
        const res = await fetch(new URL('/v1/context', apiUrl), {
            method: 'POST',
            headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
            body: JSON.stringify({ cwd: input.cwd, sessionId: input.session_id, ...repoInfo(input.cwd) }),
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