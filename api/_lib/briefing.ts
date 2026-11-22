// Briefing form submissions -> Sanity (private "enquiries" dataset).
//
// Shared by the Vercel function (api/briefing.ts) and the local dev server
// (vite.config.ts). Runs only on the server: the write token never reaches the
// browser. Files under api/_lib are not exposed as routes by Vercel.

import { createHash } from 'node:crypto';

export interface BriefingEnv {
  SANITY_API_WRITE_TOKEN?: string;
  SANITY_PROJECT_ID?: string;
  VITE_SANITY_PROJECT_ID?: string;
  SANITY_ENQUIRY_DATASET?: string;
}

export interface BriefingResult {
  status: number;
  body: { ok: boolean; error?: string; field?: string };
}

const LIMITS = { name: 120, email: 200, institution: 160, mandate: 160, message: 4000, page: 40 } as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Forms filled faster than a person could are treated as bots
const MIN_FILL_MS = 2500;

const clean = (v: unknown, max: number) =>
  typeof v === 'string'
    ? v
        // eslint-disable-next-line no-control-regex
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
        .trim()
        .slice(0, max)
    : '';

const fail = (status: number, error: string, field?: string): BriefingResult => ({
  status,
  body: { ok: false, error, ...(field ? { field } : {}) },
});

export async function handleBriefing(raw: unknown, env: BriefingEnv): Promise<BriefingResult> {
  if (!raw || typeof raw !== 'object') return fail(400, 'Invalid request.');
  const input = raw as Record<string, unknown>;

  // Honeypot: a hidden field people never see. Bots that fill it get a quiet
  // "success" so they don't retry, and nothing is stored.
  if (clean(input.website, 200)) return { status: 200, body: { ok: true } };
  const startedAt = Number(input.startedAt);
  if (Number.isFinite(startedAt) && Date.now() - startedAt < MIN_FILL_MS) return { status: 200, body: { ok: true } };

  const name = clean(input.name, LIMITS.name);
  const email = clean(input.email, LIMITS.email).toLowerCase();
  const institution = clean(input.institution, LIMITS.institution);
  const mandate = clean(input.mandate, LIMITS.mandate);
  const message = clean(input.message, LIMITS.message);
  const page = clean(input.page, LIMITS.page);

  if (!name) return fail(422, 'Please enter your name.', 'name');
  if (!EMAIL_RE.test(email)) return fail(422, 'Please enter a valid email address.', 'email');

  const projectId = env.SANITY_PROJECT_ID || env.VITE_SANITY_PROJECT_ID;
  const token = env.SANITY_API_WRITE_TOKEN;
  const dataset = env.SANITY_ENQUIRY_DATASET || 'enquiries';
  if (!projectId || !token) {
    console.error('briefing: SANITY_API_WRITE_TOKEN or project id is not configured');
    return fail(500, 'The form is not configured yet.');
  }

  const submittedAt = new Date().toISOString();
  // One client record per email address (same id scheme as the admin
  // dashboard), so everyone who writes in joins the client list
  const contactId = `contact-${createHash('sha256').update(email).digest('hex').slice(0, 32)}`;

  try {
    const res = await fetch(`https://${projectId}.api.sanity.io/v2025-02-19/data/mutate/${dataset}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mutations: [
          {
            create: {
              _type: 'briefingRequest',
              status: 'new',
              name,
              email,
              institution,
              mandate,
              message,
              page,
              submittedAt,
            },
          },
          {
            createIfNotExists: {
              _id: contactId,
              _type: 'contact',
              email,
              source: 'website',
              subscribed: true,
              createdAt: submittedAt,
              enquiryCount: 0,
            },
          },
          {
            patch: {
              id: contactId,
              // Their latest details, without undoing an unsubscribe or tags set by the team
              set: { name, ...(institution ? { institution } : {}), lastEnquiryAt: submittedAt },
              inc: { enquiryCount: 1 },
            },
          },
        ],
      }),
    });
    if (!res.ok) {
      console.error('briefing: Sanity rejected the enquiry', res.status, await res.text().catch(() => ''));
      return fail(502, 'Could not save the enquiry.');
    }
    return { status: 200, body: { ok: true } };
  } catch (err) {
    console.error('briefing: could not reach Sanity', err);
    return fail(502, 'Could not save the enquiry.');
  }
}
