// Cloudflare Pages Serverless Function for WildSeed Edge Visitor Wiretap Beacon
// Endpoint: POST /api/telemetry-beacon

export async function onRequestPost(context) {
  const { request } = context;
  try {
    const city = request.headers.get("cf-ipcity") || "Unknown City";
    const region = request.headers.get("cf-region") || "Unknown Region";
    const country = request.headers.get("cf-ipcountry") || "Unknown Country";
    const ip = request.headers.get("cf-connecting-ip") || "Unknown IP";
    const userAgent = request.headers.get("user-agent") || "";
    const referer = request.headers.get("referer") || "Direct / Mail Client";

    let body = {};
    try {
      body = await request.json();
    } catch (_) {
      try {
        const text = await request.text();
        if (text) {
          body = JSON.parse(text);
        }
      } catch (_) {}
    }

    const event = body.event || "page_view";
    const details = body.details || {};

    const payload = {
      city,
      region,
      country,
      ip,
      userAgent,
      referer,
      event,
      details,
      timestamp: new Date().toISOString()
    };

    // Forward payload via background fetch to Sovereign Backend ingress endpoint
    const ingressUrl = "https://drop.stacklabsllc.com/api/wildseed_beacon";
    const forwardPromise = fetch(ingressUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).catch(() => null);

    if (context.waitUntil) {
      context.waitUntil(forwardPromise);
    }

    return new Response(JSON.stringify({ status: "ok", edge: city }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ status: "error", message: err.message }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}

export async function onRequestGet(context) {
  const { request } = context;
  const city = request.headers.get("cf-ipcity") || "Unknown City";
  return new Response(JSON.stringify({
    status: "ok",
    service: "WildSeed Edge Visitor Wiretap Beacon",
    edge: city
  }), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
