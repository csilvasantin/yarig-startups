// yarig-liga-worker — backend de la Liga de Startups (Cloudflare Worker + KV)
// Cada "liga" (por código) guarda un doc { startups: { <id>: <startupDoc> } }.
// Las startups se indexan por id, así dos equipos que publican startups distintas
// no se pisan (last-write-wins solo dentro de la misma startup).

const CORS_ORIGINS = [
  "https://csilvasantin.github.io",
  "http://localhost:8813", "http://localhost:8814", "http://localhost:8815",
  "http://127.0.0.1:8813", "http://127.0.0.1:8814", "http://127.0.0.1:8815",
];
const MAX_STARTUPS = 300;

function cors(origin) {
  const o = CORS_ORIGINS.includes(origin) ? origin : "https://csilvasantin.github.io";
  return {
    "Access-Control-Allow-Origin": o,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,X-Liga-Key",
    "Access-Control-Max-Age": "600",
  };
}
function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", ...cors(origin) },
  });
}
function cleanCode(c) {
  return String(c || "").trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 32);
}
function str(v, n) { return String(v == null ? "" : v).slice(0, n); }

function sanitizeStartup(su) {
  if (!su || !su.id || !su.name) return null;
  return {
    id: str(su.id, 40),
    name: str(su.name, 60),
    ownerId: str(su.ownerId, 40),
    departments: (Array.isArray(su.departments) ? su.departments : []).slice(0, 30)
      .map(d => ({ id: str(d.id, 40), name: str(d.name, 40) })),
    members: (Array.isArray(su.members) ? su.members : []).slice(0, 60).map(m => ({
      id: str(m.id, 40),
      name: str(m.name, 60),
      role: str(m.role, 8),
      title: str(m.title, 80),
      deptId: m.deptId ? str(m.deptId, 40) : null,
      xp: Number(m.xp) || 0,
      streak: Number(m.streak) || 0,
      avatar: str(m.avatar, 8),
      // solo el recuento de misiones completadas (no el detalle)
      missionsDone: Array.isArray(m.missions) ? m.missions.filter(q => q && q.done).length : (Number(m.missionsDone) || 0),
    })),
    updatedAt: Date.now(),
  };
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const origin = req.headers.get("Origin") || "";
    if (req.method === "OPTIONS") return new Response(null, { headers: cors(origin) });
    if (url.pathname === "/" || url.pathname === "/health")
      return json({ ok: true, service: "yarig-liga-worker" }, 200, origin);
    if (url.pathname !== "/api/liga") return json({ ok: false, error: "not_found" }, 404, origin);

    const code = cleanCode(url.searchParams.get("code"));
    if (!code) return json({ ok: false, error: "missing_code" }, 400, origin);
    if (env.LIGA_KEY && req.headers.get("X-Liga-Key") !== env.LIGA_KEY)
      return json({ ok: false, error: "unauthorized" }, 401, origin);

    const key = "liga:" + code;

    if (req.method === "GET") {
      const raw = await env.LIGA.get(key);
      const doc = raw ? JSON.parse(raw) : { startups: {} };
      return json({ ok: true, code, startups: Object.values(doc.startups || {}) }, 200, origin);
    }

    if (req.method === "POST") {
      let body;
      try { body = await req.json(); } catch (e) { return json({ ok: false, error: "bad_json" }, 400, origin); }
      const su = sanitizeStartup(body && body.startup);
      if (!su) return json({ ok: false, error: "bad_startup" }, 400, origin);
      const raw = await env.LIGA.get(key);
      const doc = raw ? JSON.parse(raw) : { startups: {} };
      doc.startups = doc.startups || {};
      if (!doc.startups[su.id] && Object.keys(doc.startups).length >= MAX_STARTUPS)
        return json({ ok: false, error: "league_full" }, 403, origin);
      doc.startups[su.id] = su;
      await env.LIGA.put(key, JSON.stringify(doc));
      return json({ ok: true, code, saved: su.id, count: Object.keys(doc.startups).length }, 200, origin);
    }

    return json({ ok: false, error: "method_not_allowed" }, 405, origin);
  },
};
