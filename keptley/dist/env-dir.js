import { isAbsolute } from 'node:path';
/**
 * A directory named by an environment variable, or the default. A value that is empty, only spaces, or
 * not an absolute path counts as unset: `KEPTLEY_OUTBOX_DIR=` in somebody's shell must not make the
 * plugin write its private files to a relative path, which is inside whatever repository the session is
 * in, and from there one `git add .` from being committed.
 */
export function dirFromEnv(name, fallback) {
    const value = process.env[name]?.trim();
    return value && isAbsolute(value) ? value : fallback();
}
//# sourceMappingURL=env-dir.js.map