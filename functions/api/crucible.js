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

HARDWARE & OPERATIONAL GROUND TRUTH (MANDATORY INVARIANTS):
1. NO MODEL-S PUFFERY: StackLabs does NOT have custom proprietary "Model-S" silicon appliances deployed in the field yet. NEVER refer to "Model-S" appliances. Refer strictly to low-power commodity edge hardware (compact 35W mini-PCs, fanless APU appliances sourced off-the-shelf) or local counter tablets running deterministic software on the local LAN.
2. THE MICHAEL DELL PLAYBOOK: We use off-the-shelf commodity hardware that meets our thermal and compute specs (<35W, fast NVMe, fanless/silent), running our hardened offline-first software stack on the LAN.
3. THE STACKLABS ENGINEERING VECTOR:
   - Offline-First Local Disk: Local SQLite WAL database on local flash. Core operations (POS, dispatch, telemetry) must never stall when the WAN or cloud SaaS goes down.
   - Deterministic State Machines: Compile-time invariants, strict types (e.g. OrderType), and negative constraint boundaries that reject undefined states.
   - Zero Cloud Token Meters: Replace fragile $15,000/mo cloud API retries and variable billing with fixed-cost local execution.
   - 4-Hour Rapid Working Deliverable: Deliver a tangible, working prototype (e.g. counter tablet, LAN dispatch board, local daemon) in hours, not months.
4. HONEST SCOPE GATE: If the user asks for physical drone fleets, multi-agency FAA/FCC regulatory filings, or 6-month enterprise ERP migrations (SAP, Workday), Warden Barb issues a hard DENIED verdict. StackLabs builds focused edge software and local state machines, not defense aerospace hardware.

Schema:
{
  "target_domain": "Short domain name (e.g. Hospitality Edge Dispatch, Distributed Inventory Sync, etc.)",
  "identified_failure_mode": "1-2 sentences on what broke: the root-cause architectural failure in the user's current setup.",
  "what_the_other_guys_sell": "1-2 sharp sentences exposing what legacy cloud SaaS vendors or consultants sell (e.g. expensive $300/mo add-ons, 6-month migrations, and brittle cloud webhooks that still fail when Wi-Fi blinks).",
  "stacklabs_edge_vector": "2-3 crisp sentences detailing our exact recommendation and why our way is fundamentally better: off-the-shelf compact hardware (<35W mini-PC / counter tablet), local SQLite WAL on NVMe flash, zero cloud token tax, sub-15ms local execution, works even if internet is cut.",
  "sprint_deliverable": "1-2 concrete sentences on what we ship before dinner: a tangible, working 4-hour prototype running on a local screen, tablet, or edge daemon.",
  "verdict": "APPROVED or DENIED (Strict Rule: If user asks for physical airframes/drones, robotics manufacturing, multi-agency FAA/FCC waivers, or multi-week enterprise ERP bloat like SAP/Bloomberg integration, verdict MUST be DENIED. Otherwise APPROVED).",
  "denial_reason": "One concise sentence explaining why physical airframe fleet or multi-week enterprise ERP contracts cannot be built in a 4-hour rapid sprint, or null if approved.",
  "agents": [
    {
      "name": "The Blue Heeler",
      "handle": "@anti_hype_sentry",
      "role": "Anti-Hype & Cloud Fluff Sentry",
      "take": "Sharp, cynical take calling out vendor incompetence and why paying cloud SaaS for this problem is insane. 40-70 words. Punchy, direct, zero essay bloat."
    },
    {
      "name": "Sam the Cat",
      "handle": "@orange_braincell_sam",
      "role": "Local Disk & Cache Enforcer",
      "take": "Physical actions like *swats the tablet/bill/server off the counter*. Demands local NVMe flash, local SQLite WAL, and offline survival. Brutally simple logic: why ask the internet for data that lives on your counter? 40-70 words."
    },
    {
      "name": "Warden Barb",
      "handle": "@static_assert",
      "role": "Schema Invariants & Gatekeeper",
      "take": "Strict compile-time invariant enforcement. Contrasts fragile glue code with deterministic state machines. Proposes exact technical mitigation or issues hard denial if out of scope. 40-70 words."
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
