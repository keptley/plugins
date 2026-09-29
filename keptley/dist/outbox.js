import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
const MAX_KEPT = 500;
const MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;
/** A hook has ten seconds; a flush takes a slice of that and leaves the rest waiting. */
const DEFAULT_MAX_PER_FLUSH = 25;
const DEFAULT_BUDGET_MS = 3_000;
/**
 * A name that sorts the way the captures happened.
 *
 * Milliseconds, padded so the sort is lexicographic, and never repeating within this process: two edits
 * in one millisecond are two captures, and the ledger reads them in the order the session made them.
 */
let last = 0;
function stamp() {
    last = Math.max(Date.now(), last + 1);
    return String(last).padStart(14, '0');
}
export function outboxDir() {
    return process.env['KEPTLEY_OUTBOX_DIR'] ?? join(homedir(), '.keptley', 'outbox');
}
/** Keeps one capture. Silent on failure: a hook that cannot write to disk still must not fail. */
export function keep(path, body) {
    try {
        const dir = outboxDir();
        mkdirSync(dir, { recursive: true });
        const kept = { path, body, firstTriedAt: new Date().toISOString(), tries: 1 };
        const name = `${stamp()}-${randomUUID().slice(0, 8)}.json`;
        writeFileSync(join(dir, name), JSON.stringify(kept), 'utf8');
        prune(dir);
    }
    catch (err) {
        console.error(`[keptley] outbox: ${err instanceof Error ? err.message : String(err)}`);
    }
}
/** How many captures are waiting. Used to decide whether a flush is worth attempting at all. */
export function waiting() {
    return names(outboxDir()).length;
}
/**
 * Sends what is waiting, oldest first.
 *
 * Stops at the first capture that fails for a reason that might pass, because the api being unreachable
 * for one is the api being unreachable for the rest, and a hook has seconds to spend.
 */
export async function flush(send, opts = {}) {
    const dir = outboxDir();
    const max = opts.max ?? DEFAULT_MAX_PER_FLUSH;
    const until = Date.now() + (opts.budgetMs ?? DEFAULT_BUDGET_MS);
    let sent = 0;
    let dropped = 0;
    const all = names(dir);
    let at = 0;
    for (const name of all) {
        if (sent + dropped >= max || Date.now() > until)
            break;
        at += 1;
        const file = join(dir, name);
        const kept = read(file);
        if (!kept) {
            // Unreadable or not ours: a half-written file from a killed hook. Nothing to send, and said out
            // loud, because a capture that cannot be read is a capture that was lost.
            console.error(`[keptley] outbox: ${name} could not be read, and is gone`);
            remove(file);
            dropped += 1;
            continue;
        }
        if (Date.now() - Date.parse(kept.firstTriedAt) > MAX_AGE_MS) {
            console.error(`[keptley] outbox: dropping a capture kept since ${kept.firstTriedAt}`);
            remove(file);
            dropped += 1;
            continue;
        }
        const outcome = await send(kept.path, kept.body);
        if (outcome === 'sent') {
            remove(file);
            sent += 1;
        }
        else if (outcome === 'drop') {
            console.error(`[keptley] outbox: ${kept.path} was refused, and is not kept`);
            remove(file);
            dropped += 1;
        }
        else {
            // Still unreachable. Count the attempt and leave this and everything after it for next time.
            write(file, { ...kept, tries: kept.tries + 1 });
            at -= 1;
            break;
        }
    }
    return { sent, dropped, left: all.length - at };
}
function names(dir) {
    try {
        return readdirSync(dir)
            .filter((n) => n.endsWith('.json'))
            .sort();
    }
    catch {
        return [];
    }
}
function read(file) {
    try {
        const kept = JSON.parse(readFileSync(file, 'utf8'));
        return typeof kept?.path === 'string' && typeof kept.firstTriedAt === 'string' ? kept : null;
    }
    catch {
        return null;
    }
}
function write(file, kept) {
    try {
        writeFileSync(file, JSON.stringify(kept), 'utf8');
    }
    catch {
        // The capture stays as it was, which is the safe half of failing to write.
    }
}
function remove(file) {
    try {
        rmSync(file, { force: true });
    }
    catch {
        // Left behind, and dropped by age later. Better than a hook that throws.
    }
}
/** Bounded on purpose: the oldest go first, and the hook says how many. */
function prune(dir) {
    const all = names(dir);
    if (all.length <= MAX_KEPT)
        return;
    const over = all.slice(0, all.length - MAX_KEPT);
    for (const name of over)
        remove(join(dir, name));
    console.error(`[keptley] outbox: full, dropped the ${over.length} oldest captures`);
}
//# sourceMappingURL=outbox.js.map