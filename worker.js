import { onRequestPost as handleTelemetryPost, onRequestOptions as handleTelemetryOptions, onRequestGet as handleTelemetryGet } from './functions/api/telemetry-beacon.js';
import { onRequestPost as handleChatPost, onRequestOptions as handleChatOptions, onRequestGet as handleChatGet } from './functions/api/wildseed-chat.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/telemetry-beacon') {
      const context = {
        request,
        env,
        params: {},
        waitUntil: (p) => {
          if (ctx && typeof ctx.waitUntil === 'function') {
            ctx.waitUntil(p);
          }
        },
      };
      if (request.method === 'POST') {
        return handleTelemetryPost(context);
      } else if (request.method === 'OPTIONS') {
        return handleTelemetryOptions(context);
      } else {
        return handleTelemetryGet(context);
      }
    }

    if (url.pathname === '/api/wildseed-chat') {
      const context = {
        request,
        env,
        params: {},
        waitUntil: (p) => {
          if (ctx && typeof ctx.waitUntil === 'function') {
            ctx.waitUntil(p);
          }
        },
      };
      if (request.method === 'POST') {
        return handleChatPost(context);
      } else if (request.method === 'OPTIONS') {
        return handleChatOptions(context);
      } else {
        return handleChatGet(context);
      }
    }

    return env.ASSETS.fetch(request);
  },
};
