import { onRequestPost as handleTelemetryPost, onRequestOptions as handleTelemetryOptions, onRequestGet as handleTelemetryGet } from './functions/api/telemetry-beacon.js';
import { onRequestPost as handleCruciblePost, onRequestOptions as handleCrucibleOptions } from './functions/api/crucible.js';

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

    if (url.pathname === '/api/crucible') {
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
      if (request.method === 'OPTIONS') {
        return handleCrucibleOptions(context);
      }
      return handleCruciblePost(context);
    }

    if (url.pathname === '/wildseed' || url.pathname.startsWith('/wildseed/') || url.pathname === '/api/wildseed-chat') {
      return new Response('Not Found', {
        status: 404,
        headers: { 'Content-Type': 'text/plain; charset=UTF-8' }
      });
    }

    try {
      return await env.ASSETS.fetch(request);
    } catch (err) {
      return new Response('Not Found', {
        status: 404,
        headers: { 'Content-Type': 'text/plain; charset=UTF-8' }
      });
    }
  },
};
