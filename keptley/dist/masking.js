/**
 * Secrets taken out of a capture before it leaves the laptop or waits in the outbox (#1498).
 *
 * The server has always masked what it keeps, but a command typed with a key in it was sent to it
 * verbatim, and written verbatim to `~/.keptley/outbox` while the server could not be reached. These are
 * the server's own rules (packages/core/src/redact-secrets.ts and sessions.ts), copied rather than
 * imported because the plugin runs on a customer's machine with no dependencies and none of the server's
 * code. masking.test.ts fails the moment the two copies differ. The server keeps masking too: a capture
 * from an older plugin, or from another editor, still arrives unmasked.
 */
// --- redactSecrets: prose, documents and titles (core: redact-secrets.ts) ---
const MASK = '[redacted]';
const KEYS = [
    /\bAKIA[0-9A-Z]{16}\b/g,
    /\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{22,})\b/g,
    /\bxox[abeoprs]-[A-Za-z0-9-]{8,}/g,
    /\bAIza[0-9A-Za-z_-]{35}\b/g,
    /\b[rs]k_(?:live|test)_[A-Za-z0-9]{16,}\b/g,
    /\bsk-(?:ant-)?[A-Za-z0-9_-]{20,}/g,
    /\bkpt_[A-Za-z0-9_-]{20,}/g,
    /\bya29\.[A-Za-z0-9_-]{20,}/g,
    /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g,
];
const PRIVATE_KEY_BLOCK = /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?(?:-----END [A-Z ]*PRIVATE KEY-----|$)/g;
const URL_PASSWORD = /\b([a-z][a-z0-9+.-]*:\/\/[^\s:/@]+:)[^\s@/]+@/gi;
const BEARER = /\b(bearer\s+)[A-Za-z0-9._~+/-]{8,}=*/gi;
const ASSIGNED = /\b((?:[a-z0-9_]*[_-])?(?:api[_-]?key|secret(?:[_-]?key)?|token|password|passwd|pwd|private[_-]?key|access[_-]?key|client[_-]?secret))(["']?\s*[:=]\s*["']?)([^\s"',;]{6,})/gi;
const PLACEHOLDER = /^(?:x{3,}|<.*>|\$\{?[A-Za-z_]+\}?|your[_-].*|example.*|changeme|placeholder|\.\.\.|\*+|\[redacted\])$/i;
/** In the server's order; compared with core's SECRET_PATTERNS by masking.test.ts. */
export const SECRET_PATTERNS = [
    PRIVATE_KEY_BLOCK,
    ...KEYS,
    URL_PASSWORD,
    BEARER,
    ASSIGNED,
    PLACEHOLDER,
];
export function redactSecrets(text) {
    let out = text.replace(PRIVATE_KEY_BLOCK, MASK);
    for (const re of KEYS)
        out = out.replace(re, MASK);
    return out
        .replace(URL_PASSWORD, `$1${MASK}@`)
        .replace(BEARER, `$1${MASK}`)
        .replace(ASSIGNED, (all, name, sep, value) => PLACEHOLDER.test(value) ? all : `${name}${sep}${MASK}`);
}
// --- redactCommand: a command line (core: sessions.ts) ---
const ALWAYS_A_VALUE = /(?<=^|[\s;|&(])(--?(?:password|passwd|pwd|token|api[-_]?key|apikey|auth|authorization|bearer|credential|credentials)(?:[= ]))\S+/gi;
const USUALLY_A_NAME = /(?<=^|[\s;|&(])(--?(?:secret|secret[-_]?id|secret[-_]?name|key|key[-_]?name|keyring|kms[-_]?key)(?:[= ]))(\S+)/gi;
const KNOWN_KEY = /\b(sk-ant-|sk-|kpt_|ghp_|gho_|ghs_|github_pat_|xoxb-|xoxp-|AIza|ya29\.)[A-Za-z0-9_-]{8,}/g;
const ASSIGNMENT = /\b([A-Z][A-Z0-9_]*(?:TOKEN|SECRET|PASSWORD|PASSWD|KEY|CREDENTIALS)=)\S+/g;
const LOOKS_GENERATED = /(?<=^|[\s=:'"(])[A-Za-z0-9_+/-]{24,}={0,2}(?=$|[\s'")&;|])/g;
const MIXED = (run) => /[a-z]/.test(run) && /[A-Z]/.test(run) && /\d/.test(run) && !/^[A-Za-z]+$/.test(run);
/** In the server's order; compared with core's COMMAND_PATTERNS by masking.test.ts. */
export const COMMAND_PATTERNS = [
    ALWAYS_A_VALUE,
    USUALLY_A_NAME,
    KNOWN_KEY,
    ASSIGNMENT,
    LOOKS_GENERATED,
];
/** Whether a word reads as something somebody named, rather than something a machine generated. */
export function looksLikeAName(word) {
    const text = word.replace(/^["']|["',]$/g, '');
    if (!text || text.length > 120)
        return false;
    if (KNOWN_KEY.test(text))
        return false;
    if (!/^[a-z0-9][a-z0-9._/-]*$/.test(text))
        return false;
    return text.split(/[-_./]/).every((part) => part.length <= 15 && !/\d{4,}/.test(part));
}
export function redactCommand(command) {
    const masked = command
        .replace(ALWAYS_A_VALUE, '$1***')
        .replace(USUALLY_A_NAME, (_match, flag, word) => looksLikeAName(word) ? `${flag}${word}` : `${flag}***`)
        .replace(KNOWN_KEY, '$1***')
        .replace(ASSIGNMENT, '$1***')
        .replace(LOOKS_GENERATED, (run) => (MIXED(run) ? '***' : run));
    return redactSecrets(masked).slice(0, 500);
}
//# sourceMappingURL=masking.js.map