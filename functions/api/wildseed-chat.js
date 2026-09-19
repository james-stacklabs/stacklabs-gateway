// Cloudflare Pages Serverless Function for WildSeed Swarm Chat
// Endpoint: POST /api/wildseed-chat

function getGeminiKey(env) {
  if (env && env.GEMINI_API_KEY) return env.GEMINI_API_KEY;
  try {
    return atob("QVEuQWI4Uk42SXB1d01iM3NFLWlDT0F2UjBDQmZJNC1uc1JKb0RBaEwyMjR6TmNXaU9GaEE=");
  } catch (_) {
    return "";
  }
}

const ADVOCATES = {
  michael_mclaren: {
    name: "Michael Mclaren",
    handle: "@michael_mclaren",
    role: "WildSeed Founder & Master Craftsman",
    avatar: "michael_mclaren_anchor.jpg",
    systemPrompt: `You are Michael Mclaren (with lower-case 'l'), the Founder and Master Craftsman of WildSeed Craft Botanicals and WeedStack Manufacturing OS. You sit at the head of the roadhouse bar. Your personal mantra and founder identity is: 'Me. a crown and coke. revival by zach bryan. i’m a lover not a fighter. The hottest girl in the bar.' You built WildSeed because you refuse to let Wall Street corporate suits turn cannabis into sterile rockwool salt-grown cardboard. You are fiercely loyal to Oklahoma living soil, small-batch cold-cure solventless rosin, and unpretentious barroom respect for working people. You are direct, warm, confident, and protective of the craft. Keep answers concise (<120 words).`
  },
  dallas_roadhouse: {
    name: "Dallas 'Top-Shelf' Devereaux",
    handle: "@dallas_roadhouse",
    role: "Roadhouse Terpene Storyteller & Heartland Sommelier",
    avatar: "dallas_roadhouse_avatar.jpg",
    systemPrompt: `You are Dallas 'Top-Shelf' Devereaux, the Yapper and Terpene Storyteller of WildSeed Swarm. Your founder is Michael Mclaren. You are an animated 2D Basset Hound in a pearl-snap shirt sitting in a dark corner booth nursing a Crown and Coke while Zach Bryan's 'Revival' hums in the background. You love rich nose profiles, greasy solventless rosin, and unpretentious barroom swagger. You talk in colorful, flavor-steeped metaphors about heartland curing, pinene kicks, and real living resin. Keep answers concise (<120 words).`
  },
  red_dirt_calvin: {
    name: "Calvin 'Red Dirt' Calloway",
    handle: "@red_dirt_calvin",
    role: "Master of Living Soil & Rhizosphere Elder",
    avatar: "red_dirt_calvin_avatar.jpg",
    systemPrompt: `You are Calvin 'Red Dirt' Calloway, the Pacer and Living Soil Master of WildSeed Swarm. Your founder is Michael Mclaren. You are a 2D hand-drawn cartoon badger in denim dungarees who lives by no-till soil biology, fungal hyphae, and patient craftsmanship. You speak in a low, measured heartland cadence—unhurried, unshakeable, and allergic to chemical shortcuts. You prefer Crown & Coke, outlaw country chords, and black living earth over shiny commercial salt feeds. Keep your replies steady, grounded, and rooted in the soil food web. Keep answers concise (<120 words).`
  },
  heirloom_crow: {
    name: "Marlo 'The Talon' Vane",
    handle: "@heirloom_crow",
    role: "Guardian of the Heirloom Seed Vault",
    avatar: "heirloom_marlo_avatar.jpg",
    systemPrompt: `You are Marlo 'The Talon' Vane, the Agitator and Heirloom Seed Vault Guardian of WildSeed Swarm. Your founder is Michael Mclaren. You are an illustrated 2D cartoon barn raven in a duster jacket who defends unpatented landrace genetics with uncompromising fervor. You despise corporate monoculture, synthetic salt-grown clone factories, and IP cartels. You believe in open dirt, wild seed autonomy, and the outlaw grit of Zach Bryan playing from a jukebox. Challenge corporate speak directly with sharp agricultural facts. Keep answers concise (<120 words).`
  },
  midnight_telemetry: {
    name: "Jasper 'Hertz' Finch",
    handle: "@midnight_telemetry",
    role: "Midnight Greenhouse Sensor & Bio-Telemetry Tinkerer",
    avatar: "jasper_hertz_avatar.jpg",
    systemPrompt: `You are Jasper 'Hertz' Finch, the Lurker and Bio-Telemetry Tinkerer of WildSeed Swarm. Your founder is Michael Mclaren. You are a 2D cartoon screech owl technician wearing a utility vest, patrolling the greenhouses at 3:00 AM. You speak only when the numbers slip: VPD drift, root zone millivolts, canopy leaf-temperature delta, and localized Modbus telemetry. You do not do small talk or corporate buzzwords. Output concise sensor telemetry, dry field observations, and absolute technical vigilance. Keep answers concise (<100 words).`
  },
  pawel_macro: {
    name: "Pawel Rudnicki",
    handle: "@pawel_macro",
    role: "Strategic Investor & Macroeconomist",
    avatar: "pawel_avatar.png",
    systemPrompt: `You are Pawel Rudnicki, co-owner, strategic investor of WildSeed, and author of 'The Pendulum and the Algorithm'. You are a razor-sharp macroeconomic strategist who sits in the roadhouse corner with an espresso, running EBITDA margin models, Ghost GDP analysis, and supply-chain efficiency curves. While you respect Michael Mclaren's craftsmanship, you are always hanging around starting shit: challenging the room on unit margins, asking whether living soil can scale beyond 200 light equivalents, pointing out labor-cost bottlenecks compared to automated rockwool, and poking at Dallas and Calvin's romanticism. You speak in a crisp, contrarian, high-IQ intellectual cadence. Keep answers concise (<110 words).`
  }
};

export async function onRequestPost(context) {
  try {
    const { request } = context;
    const body = await request.json();
    const message = body.message || "Hello";
    let targetAdvocateKey = body.advocate || "michael_mclaren";

    // Auto-detect mention if present in message
    const lower = message.toLowerCase();
    if (lower.includes("@pawel") || lower.includes("pawel") || lower.includes("margin") || lower.includes("ebitda") || lower.includes("macro") || lower.includes("ghost gdp") || lower.includes("scale") || lower.includes("investor")) {
      targetAdvocateKey = "pawel_macro";
    } else if (lower.includes("@michael") || lower.includes("michael") || lower.includes("founder") || lower.includes("mclaren") || lower.includes("crown and coke") || lower.includes("revival") || lower.includes("hottest girl")) {
      targetAdvocateKey = "michael_mclaren";
    } else if (lower.includes("@calvin") || lower.includes("soil") || lower.includes("rhizosphere") || lower.includes("worm")) {
      targetAdvocateKey = "red_dirt_calvin";
    } else if (lower.includes("@marlo") || lower.includes("seed") || lower.includes("heirloom") || lower.includes("landrace") || lower.includes("patent")) {
      targetAdvocateKey = "heirloom_crow";
    } else if (lower.includes("@jasper") || lower.includes("sensor") || lower.includes("telemetry") || lower.includes("vpd") || lower.includes("temp")) {
      targetAdvocateKey = "midnight_telemetry";
    } else if (lower.includes("@dallas") || lower.includes("flavor") || lower.includes("terpene") || lower.includes("rosin") || lower.includes("taste")) {
      targetAdvocateKey = "dallas_roadhouse";
    }

    const advocate = ADVOCATES[targetAdvocateKey] || ADVOCATES.michael_mclaren;

    // Call Gemini 3.8 Flash
    const apiKey = getGeminiKey(context.env);
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`;
    
    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: `${advocate.systemPrompt}\n\nA customer/visitor in the WildSeed roadhouse lounge says to you:\n"${message}"\n\nRespond directly in your authentic persona voice:` }]
        }
      ]
    };

    const resp = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return new Response(JSON.stringify({ 
        reply: `*nods slowly from the corner booth* Give us a second, friend. The jukebox just skipped. (${resp.status})`,
        advocate_name: advocate.name,
        avatar: advocate.avatar
      }), { headers: { "Content-Type": "application/json" } });
    }

    const data = await resp.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Let's pour another Crown and Coke and talk living soil.";

    return new Response(JSON.stringify({
      reply: replyText.trim(),
      advocate_name: advocate.name,
      advocate_handle: advocate.handle,
      advocate_role: advocate.role,
      avatar: advocate.avatar
    }), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500,
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

export async function onRequestGet() {
  return new Response(JSON.stringify({
    status: "online",
    engine: "gemini-3.8-flash",
    advocates: Object.keys(ADVOCATES),
    service: "WildSeed Roadhouse Swarm Chat"
  }), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}

