// Vercel Edge Function — يقرا مفتاح Gemini من متغيرات البيئة على Vercel نفسه.
// ما في أي مفتاح بالكود ولا بالواجهة إطلاقًا.
export const config = { runtime: "edge" };

const GOOGLE_BASE = "https://generativelanguage.googleapis.com";

function json(obj, status){
  return new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json" } });
}

export default async function handler(request){
  if(request.method !== "POST") return json({ error: "method not allowed" }, 405);

  const API_KEY = process.env.GEMINI_API_KEY;
  if(!API_KEY) return json({ error: "GEMINI_API_KEY مو مضاف بمتغيرات البيئة على Vercel" }, 500);

  try{
    const { fileName, mimeType, sizeBytes } = await request.json();
    const upstream = await fetch(`${GOOGLE_BASE}/upload/v1beta/files?key=${API_KEY}`, {
      method: "POST",
      headers: {
        "X-Goog-Upload-Protocol": "resumable",
        "X-Goog-Upload-Command": "start",
        "X-Goog-Upload-Header-Content-Length": String(sizeBytes || 0),
        "X-Goog-Upload-Header-Content-Type": mimeType || "application/pdf",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ file: { display_name: fileName || "file" } })
    });
    if(!upstream.ok){
      const t = await upstream.text();
      return json({ error: t }, upstream.status);
    }
    const uploadUrl = upstream.headers.get("x-goog-upload-url");
    return json({ uploadUrl }, 200);
  }catch(err){
    return json({ error: String(err && err.message || err) }, 500);
  }
}
