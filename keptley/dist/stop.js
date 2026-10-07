import { flushOutbox, home, readHookInput, post, repoInfo, gitAuthor } from './common.js';
/** Stop: send the session summary to the ledger. The worker folds it into pages. */
const input = await readHookInput();
if (!input.stop_hook_active) {
    // Whatever this session could not send, before its own summary, so the ledger reads in order.
    await flushOutbox({ max: 50, budgetMs: 8_000 });
    await post('/v1/sessions/stop', {
        sessionId: input.session_id,
        // Under the home directory as `~/…`; the transcript's own path is not sent, because nothing reads
        // it and it names the person's home directory (#1499).
        cwd: home(input.cwd),
        endedAt: new Date().toISOString(),
        ...repoInfo(input.cwd),
        ...gitAuthor(input.cwd),
    }, { keep: true });
}
//# sourceMappingURL=stop.js.map