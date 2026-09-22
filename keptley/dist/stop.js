import { readHookInput, post, repoInfo } from './common.js';
/** Stop: send the session summary to the ledger. The worker folds it into pages. */
const input = await readHookInput();
if (!input.stop_hook_active) {
    await post('/v1/sessions/stop', {
        sessionId: input.session_id,
        cwd: input.cwd,
        transcriptPath: input.transcript_path ?? null,
        endedAt: new Date().toISOString(),
        ...repoInfo(input.cwd),
    });
}
//# sourceMappingURL=stop.js.map