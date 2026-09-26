import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
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
    // The commit the session ended on. It is the only thing that ties a session to work that reached
    // the repository: without it every AI change is recorded as the person who pushed it, which is what
    // the ledger did for its first 348 entries (#400).
    const headSha = git('rev-parse', 'HEAD');
    const match = remote ? /[:/]([^/]+\/[^/]+?)(?:\.git)?$/.exec(remote) : null;
    return {
        ...(match?.[1] ? { repo: match[1] } : {}),
        ...(branch && branch !== 'HEAD' ? { branch } : {}),
        ...(headSha ? { headSha } : {}),
    };
}
/**
 * Who is running this session, from the local git identity.
 *
 * A token issued for a workspace rather than for a person names nobody, so every session under one was
 * recorded as `(unknown)` and counted towards nobody's seat (#143). `user.email` is what git already
 * puts on every commit this session makes, and Keptley only ever uses it to match somebody already in
 * the workspace: it never creates a person from it.
 *
 * Best effort and silent. A machine with no git identity sends nothing and the session stays unnamed,
 * which is the honest answer.
 */
export function gitAuthor(cwd) {
    const config = (key) => {
        try {
            return execFileSync('git', ['config', '--get', key], {
                cwd,
                encoding: 'utf8',
                stdio: ['ignore', 'pipe', 'ignore'],
            }).trim();
        }
        catch {
            return null;
        }
    };
    const email = config('user.email');
    const name = config('user.name');
    if (!email && !name)
        return {};
    return {
        author: {
            ...(email ? { email } : {}),
            ...(name ? { name } : {}),
        },
    };
}
/**
 * The guidance files this session is reading, as repository-relative path and hash.
 *
 * Hashes, never content. These files are edited locally long before anybody else sees them, and a
 * documentation tool that quietly uploads somebody's working copy has no business asking to be
 * trusted. A hash answers the one question worth asking: is this agent following the guidance the
 * team has, or guidance only this laptop has?
 *
 * Found with git rather than by walking the tree: `git ls-files` lists what the repository tracks, so
 * a CLAUDE.md inside node_modules or an untracked scratch copy never counts, and the paths are
 * already repository-relative, which is how Keptley stores them.
 */
export function guidanceFiles(cwd) {
    let listed;
    try {
        listed = execFileSync('git', ['ls-files', '-z', '*CLAUDE.md', 'CLAUDE.md'], {
            cwd,
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'ignore'],
            maxBuffer: 1024 * 1024,
        });
    }
    catch {
        return [];
    }
    const root = (() => {
        try {
            return execFileSync('git', ['rev-parse', '--show-toplevel'], {
                cwd,
                encoding: 'utf8',
                stdio: ['ignore', 'pipe', 'ignore'],
            }).trim();
        }
        catch {
            return cwd;
        }
    })();
    const out = [];
    // Distinct, because the two patterns above overlap on a root CLAUDE.md, and capped so a monorepo
    // full of them cannot make a session start slow.
    for (const path of new Set(listed.split('\0').filter(Boolean))) {
        if (out.length >= 20)
            break;
        try {
            const body = readFileSync(resolve(root, path), 'utf8');
            out.push({
                path: relative(root, resolve(root, path)),
                sha256: createHash('sha256').update(body).digest('hex'),
            });
        }
        catch {
            // Listed by git but not on disk: a deleted file in an unstaged state. Nothing to hash.
        }
    }
    return out.sort((a, b) => (a.path < b.path ? -1 : 1));
}
//# sourceMappingURL=common.js.map