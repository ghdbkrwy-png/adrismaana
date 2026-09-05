export const config = { runtime: "edge" };

const GOOGLE_BASE = "https://generativelanguage.googleapis.com";

function json(obj, status){
  return new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json" } });
}

export default async function handler(request){
  const API_KEY = process.env.GEMINI_API_KEY;
  if(!API_KEY) return json({ error: "GEMINI_API_KEY مو مضاف بمتغيرات البيئة على Vercel" }, 500);

  const url = new URL(request.url);
  const name = url.searchParams.get("name");
  if(!name) return json({ error: "missing name" }, 400);

  try{
    const upstream = await fetch(`${GOOGLE_BASE}/v1beta/${name}?key=${API_KEY}`);
    const data = await upstream.json();
    return json(data, upstream.status);
  }catch(err){
    return json({ error: String(err && err.message || err) }, 500);
  }
}
