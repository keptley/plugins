import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
export async function readHookInput() {
    const raw = readFileSync(0, 'utf8');
    return JSON.parse(raw);
}
export function config() {
    return {
        apiUrl: process.env['KEPTLEY_API_URL'] ?? 'https://api.keptley.com',
        token: process.env['KEPTLEY_TOKEN'],
    };
}
/**
 * POST and return the parsed reply, or null. Hooks must never block or fail the session, so every
 * failure (no token, network, timeout, bad JSON) is null, never a throw.
 */
export async function post(path, body) {
    const { apiUrl, token } = config();
    if (!token)
        return null;
    try {
        const res = await fetch(new URL(path, apiUrl), {
            method: 'POST',
            headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(8_000),
        });
        return res.ok ? await res.json() : null;
    }
    catch (err) {
        console.error(`[keptley] ${path}: ${err instanceof Error ? err.message : String(err)}`);
        return null;
    }
}
/**
 * The hook output that hands text to Claude as context after a tool call. Claude reads it; the
 * session is not blocked and Claude is not forced to do anything.
 */
export function postToolUseContext(notice) {
    if (typeof notice !== 'string' || notice.trim() === '')
        return null;
    return JSON.stringify({
        hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext: notice },
    });
}
/**
 * The repository and branch this session is in, read from git. Best effort: outside a repository,
 * or without a remote, it returns nothing and the api records the session without a repo.
 */
export function repoInfo(cwd) {
    const git = (...args) => {
        try {
            return execFileSync('git', args, {
                cwd,
                encoding: 'utf8',
                stdio: ['ignore', 'pipe', 'ignore'],
            }).trim();
        }
        catch {
            return null;
        }
    };
    const remote = git('remote', 'get-url', 'origin');
    const branch = git('rev-parse', '--abbrev-ref', 'HEAD');
    const match = remote ? /[:/]([^/]+\/[^/]+?)(?:\.git)?$/.exec(remote) : null;
    return {
        ...(match?.[1] ? { repo: match[1] } : {}),
        ...(branch && branch !== 'HEAD' ? { branch } : {}),
    };
}
//# sourceMappingURL=common.js.map