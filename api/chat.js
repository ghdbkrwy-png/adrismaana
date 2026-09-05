export const config = { runtime: "edge" };

const GOOGLE_BASE = "https://generativelanguage.googleapis.com";

function json(obj, status){
  return new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json" } });
}

export default async function handler(request){
  if(request.method !== "POST") return json({ error: "method not allowed" }, 405);

  const API_KEY = process.env.GEMINI_API_KEY;
  const TEXT_MODEL = process.env.GEMINI_TEXT_MODEL || "gemini-3.6-flash";
  if(!API_KEY) return json({ error: "GEMINI_API_KEY مو مضاف بمتغيرات البيئة على Vercel" }, 500);

  try{
    const body = await request.json(); // { systemInstruction, contents }
    const upstream = await fetch(
      `${GOOGLE_BASE}/v1beta/models/${TEXT_MODEL}:streamGenerateContent?alt=sse&key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: body.contents,
          systemInstruction: body.systemInstruction ? { parts:[{ text: body.systemInstruction }] } : undefined,
          generationConfig: { temperature: 0.4 }
        })
      }
    );
    return new Response(upstream.body, {
      status: upstream.status,
      headers: { "Content-Type": "text/event-stream" }
    });
  }catch(err){
    return json({ error: String(err && err.message || err) }, 500);
  }
}
