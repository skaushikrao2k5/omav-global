// POST /api/briefing  (Vercel Function)
// Saves a briefing form enquiry to Sanity. Configure in Vercel > Settings >
// Environment Variables: SANITY_API_WRITE_TOKEN, VITE_SANITY_PROJECT_ID
// (and optionally SANITY_ENQUIRY_DATASET, default "enquiries").
import { handleBriefing } from './_lib/briefing';

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

export async function POST(request: Request): Promise<Response> {
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return json(415, { ok: false, error: 'Expected JSON.' });
  }
  const text = await request.text();
  if (text.length > 20_000) return json(413, { ok: false, error: 'Too large.' });
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return json(400, { ok: false, error: 'Invalid JSON.' });
  }
  const { status, body } = await handleBriefing(data, process.env);
  return json(status, body);
}

export function GET(): Response {
  return json(405, { ok: false, error: 'Use POST.' });
}
