import { flushOutbox, readHookInput, post, repoInfo, gitAuthor } from './common.js';
/** Stop: send the session summary to the ledger. The worker folds it into pages. */
const input = await readHookInput();
if (!input.stop_hook_active) {
    // Whatever this session could not send, before its own summary, so the ledger reads in order.
    await flushOutbox({ max: 50, budgetMs: 8_000 });
    await post('/v1/sessions/stop', {
        sessionId: input.session_id,
        cwd: input.cwd,
        transcriptPath: input.transcript_path ?? null,
        endedAt: new Date().toISOString(),
        ...repoInfo(input.cwd),
        ...gitAuthor(input.cwd),
    }, { keep: true });
}
//# sourceMappingURL=stop.js.map