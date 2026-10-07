import { readHookInput } from './common.js';
import { forget } from './session-state.js';
/**
 * SessionEnd: the session is over, so what the api said at its start goes (#1545). Not on Stop, which
 * Claude Code runs after every reply, not once at the end. Nothing is sent.
 */
const input = await readHookInput();
forget(input.session_id);
//# sourceMappingURL=session-end.js.map