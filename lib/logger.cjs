/**
 * Structured logger — minimal, no deps.
 * Output is one-line JSON-friendly text for easy grep/parsing in CI logs.
 *
 * Usage:
 *   const log = require('../lib/logger.cjs').create('notify-google');
 *   log.info('starting', { urls: 5 });
 *   log.error('api failed', { url, status: 500 });
 */

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };
const MIN_LEVEL = LEVELS[(process.env.LOG_LEVEL || 'info').toLowerCase()] || LEVELS.info;

function fmt(level, ctx, msg, extra) {
  const ts = new Date().toISOString();
  const tag = ctx ? `[${ctx}]` : '';
  let line = `${ts} ${level.toUpperCase()} ${tag} ${msg}`;
  if (extra && Object.keys(extra).length) {
    try { line += ' ' + JSON.stringify(extra); } catch { line += ' [unserializable]'; }
  }
  return line;
}

function emit(level, ctx, msg, extra) {
  if (LEVELS[level] < MIN_LEVEL) return;
  const out = fmt(level, ctx, msg, extra);
  if (level === 'error') console.error(out);
  else if (level === 'warn') console.warn(out);
  else console.log(out);
}

function create(ctx) {
  return {
    debug: (m, e) => emit('debug', ctx, m, e),
    info:  (m, e) => emit('info',  ctx, m, e),
    warn:  (m, e) => emit('warn',  ctx, m, e),
    error: (m, e) => emit('error', ctx, m, e),
    child: (subCtx) => create(`${ctx}:${subCtx}`),
  };
}

module.exports = { create };
