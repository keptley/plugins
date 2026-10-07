import { createHash } from 'node:crypto';
import { chmodSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync, } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { dirFromEnv } from './env-dir.js';
const DIR_MODE = 0o700;
const FILE_MODE = 0o600;
const KEPT_MS = 24 * 60 * 60 * 1000;
export function stateDir() {
    return dirFromEnv('KEPTLEY_SESSIONS_DIR', () => join(homedir(), '.keptley', 'sessions'));
}
function fileFor(sessionId) {
    return join(stateDir(), `${createHash('sha256').update(sessionId).digest('hex').slice(0, 32)}.json`);
}
/** Writes the session's state. Silent on failure: the hooks after it then read "unknown". */
export function remember(sessionId, state) {
    try {
        const dir = stateDir();
        mkdirSync(dir, { recursive: true, mode: DIR_MODE });
        if ((statSync(dir).mode & 0o777) !== DIR_MODE)
            chmodSync(dir, DIR_MODE);
        writeFileSync(fileFor(sessionId), JSON.stringify(state), { encoding: 'utf8', mode: FILE_MODE });
        forgetOld(dir);
    }
    catch (err) {
        console.error(`[keptley] session state: ${err instanceof Error ? err.message : String(err)}`);
    }
}
/** The session's state, or null when it is not known. */
export function recall(sessionId) {
    try {
        const kept = JSON.parse(readFileSync(fileFor(sessionId), 'utf8'));
        return typeof kept.notesOutside === 'boolean' ? { notesOutside: kept.notesOutside } : null;
    }
    catch {
        return null;
    }
}
/** The session is over: its state goes with it. */
export function forget(sessionId) {
    try {
        rmSync(fileFor(sessionId), { force: true });
    }
    catch {
        // Nothing to remove.
    }
}
function forgetOld(dir) {
    const before = Date.now() - KEPT_MS;
    for (const name of readdirSync(dir)) {
        try {
            const file = join(dir, name);
            if (statSync(file).mtimeMs < before)
                rmSync(file, { force: true });
        }
        catch {
            // Removed meanwhile by another hook.
        }
    }
}
//# sourceMappingURL=session-state.js.map