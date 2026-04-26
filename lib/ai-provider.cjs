/**
 * AI provider facade.
 *
 * Primary: Anthropic Claude.
 * Fallback: OpenAI (used when Anthropic returns 401/429/5xx).
 *
 * Public API:
 *   const { generateArticle } = require('../lib/ai-provider.cjs');
 *   const text = await generateArticle({ prompt, maxTokens, model });
 *
 * Both providers must throw to signal hard failure. The wrapper catches
 * Anthropic failures and tries OpenAI; if both fail, the error is rethrown.
 */
const https = require('https');
const { AI_PROVIDERS } = require('../config/site.config.cjs');

function postJson(opts, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const req = https.request({
      ...opts,
      headers: { ...opts.headers, 'Content-Length': Buffer.byteLength(data) },
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
        catch { resolve({ status: res.statusCode, body: d }); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function callAnthropic({ prompt, model, maxTokens }) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY not set');
  const { status, body } = await postJson({
    hostname: 'api.anthropic.com',
    path: '/v1/messages',
    method: 'POST',
    headers: {
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
  }, {
    model: model || AI_PROVIDERS.primary.model,
    max_tokens: maxTokens || 4000,
    messages: [{ role: 'user', content: prompt }],
  });
  if (status >= 400) {
    const e = new Error(`anthropic ${status}: ${typeof body === 'string' ? body.slice(0,200) : JSON.stringify(body).slice(0,200)}`);
    e.status = status;
    throw e;
  }
  if (body?.content?.[0]?.text) return body.content[0].text;
  throw new Error('anthropic: no text in response');
}

async function callOpenAI({ prompt, model, maxTokens }) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY not set');
  const { status, body } = await postJson({
    hostname: 'api.openai.com',
    path: '/v1/chat/completions',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
  }, {
    model: model || AI_PROVIDERS.fallback.model,
    max_tokens: maxTokens || 4000,
    messages: [{ role: 'user', content: prompt }],
  });
  if (status >= 400) {
    const e = new Error(`openai ${status}: ${typeof body === 'string' ? body.slice(0,200) : JSON.stringify(body).slice(0,200)}`);
    e.status = status;
    throw e;
  }
  if (body?.choices?.[0]?.message?.content) return body.choices[0].message.content;
  throw new Error('openai: no text in response');
}

function isFallbackTrigger(err) {
  // Anthropic outage signals
  const s = err.status || 0;
  return s === 401 || s === 429 || s >= 500;
}

async function generateArticle({ prompt, maxTokens, model, provider }) {
  if (!prompt || typeof prompt !== 'string') throw new Error('generateArticle: prompt required');

  if (provider === 'openai') {
    return callOpenAI({ prompt, model, maxTokens });
  }

  try {
    return await callAnthropic({ prompt, model, maxTokens });
  } catch (err) {
    if (!isFallbackTrigger(err)) throw err;
    if (!process.env.OPENAI_API_KEY) {
      // No fallback configured — rethrow primary error.
      throw err;
    }
    // Try OpenAI as fallback.
    try {
      const text = await callOpenAI({ prompt, maxTokens });
      console.warn(`[ai-provider] anthropic failed (${err.status}), used openai fallback`);
      return text;
    } catch (err2) {
      const wrapped = new Error(`both providers failed — anthropic: ${err.message}; openai: ${err2.message}`);
      wrapped.primaryError = err;
      wrapped.fallbackError = err2;
      throw wrapped;
    }
  }
}

module.exports = { generateArticle, callAnthropic, callOpenAI };
