// Cloudflare Pages Serverless Function for Live MARD Council Crucible
// Endpoint: POST /api/crucible

export async function onRequestPost(context) {
  const { request, env } = context;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  try {
    let body = {};
    try {
      body = await request.json();
    } catch (_) {
      return new Response(JSON.stringify({ ok: false, error: "Invalid JSON body" }), { status: 400, headers: corsHeaders });
    }

    const text = (body.text || "").trim();
    if (!text) {
      return new Response(JSON.stringify({ ok: false, error: "Missing problem text" }), { status: 400, headers: corsHeaders });
    }

    // Resolve API key from Cloudflare env or active developer fallback key
    const apiKey = env.GEMINI_API_KEY || "";

    const systemPrompt = `You are the StackLabs MARD Council deliberating on an operational problem statement submitted to the StackLabs Rapid Forge.
You must respond with pure, valid JSON with no markdown wrapping.
Schema:
{
  "target_domain": "Short domain name (e.g. Hospitality Edge Dispatch, Distributed Inventory Sync, etc.)",
  "identified_failure_mode": "One concise sentence explaining root cause failure.",
  "stacklabs_edge_vector": "One concise sentence detailing physical metal / local SQLite / edge solution.",
  "sprint_deliverable": "One concise sentence detailing exact 4-hour working prototype.",
  "verdict": "APPROVED or DENIED (Strict Rule: If user asks for physical airframes/drones, robotics manufacturing, multi-agency FAA/FCC waivers, or multi-week enterprise ERP bloat like SAP/Bloomberg integration, verdict MUST be DENIED. Otherwise APPROVED).",
  "denial_reason": "One concise sentence explaining why physical airframe fleet or multi-week enterprise ERP contracts cannot be built in a 4-hour rapid sprint, or null if approved.",
  "agents": [
    {
      "name": "The Blue Heeler",
      "handle": "@anti_hype_sentry",
      "role": "Anti-Hype & Cloud Fluff Sentry",
      "take": "Sharp, cynical take roasting cloud fees, SaaS dependencies, or vendor incompetence. Speak like a grizzled, direct working dog. Directly reference the specific companies, software, or physical bottlenecks in the user's text."
    },
    {
      "name": "Sam the Cat",
      "handle": "@orange_braincell_sam",
      "role": "Local Disk & Cache Enforcer",
      "take": "Physical actions like *swats the tablet/bill/server off the counter*. Demands local NVMe flash, local SQLite WAL, and offline survival. Has one orange brain cell, brutally simple logic. Directly reference the physical failure in the user's text."
    },
    {
      "name": "Warden Barb",
      "handle": "@static_assert",
      "role": "Schema Invariants & Gatekeeper",
      "take": "Strict, zero-bullshit engineering gatekeeper. Enforces typed schemas, hardware fallbacks, and fail-closed compile-time invariants. Proposes exact technical mitigation."
    }
  ]
}`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`;

    const geminiPayload = {
      contents: [
        {
          parts: [
            { text: `${systemPrompt}\n\nProblem statement:\n${text}` }
          ]
        }
      ],
      generationConfig: {
        response_mime_type: "application/json",
        temperature: 0.7
      }
    };

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiPayload)
    });

    if (!response.ok) {
      const errText = await response.text();
      return new Response(JSON.stringify({ ok: false, error: `Gemini API error: ${response.status}`, details: errText }), {
        status: 200,
        headers: corsHeaders
      });
    }

    const resJson = await response.json();
    const candidateText = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      return new Response(JSON.stringify({ ok: false, error: "No content generated" }), { status: 200, headers: corsHeaders });
    }

    const parsedData = JSON.parse(candidateText);
    return new Response(JSON.stringify({ ok: true, data: parsedData }), {
      status: 200,
      headers: corsHeaders
    });

  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 200,
      headers: corsHeaders
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
