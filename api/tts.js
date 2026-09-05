export const config = { runtime: "edge" };

const GOOGLE_BASE = "https://generativelanguage.googleapis.com";

function json(obj, status){
  return new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json" } });
}

export default async function handler(request){
  if(request.method !== "POST") return json({ error: "method not allowed" }, 405);

  const API_KEY = process.env.GEMINI_API_KEY;
  const TTS_MODEL = process.env.GEMINI_TTS_MODEL || "gemini-3.1-flash-tts-preview";
  if(!API_KEY) return json({ error: "GEMINI_API_KEY مو مضاف بمتغيرات البيئة على Vercel" }, 500);

  try{
    const body = await request.json(); // { prompt, speechConfig }
    const upstream = await fetch(`${GOOGLE_BASE}/v1beta/models/${TTS_MODEL}:generateContent?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts:[{ text: body.prompt }] }],
        generationConfig: { responseModalities: ["AUDIO"], speechConfig: body.speechConfig }
      })
    });
    const data = await upstream.json();
    return json(data, upstream.status);
  }catch(err){
    return json({ error: String(err && err.message || err) }, 500);
  }
}
