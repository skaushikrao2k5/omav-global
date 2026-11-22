# Content & enquiries (Sanity)

The site's text and the briefing form run on Sanity project **omav** (`uj3vfr7a`).

| What | Where |
| --- | --- |
| Edit page text, read enquiries | https://omav.sanity.studio (sign in with your Sanity account) |
| Admin dashboard (enquiries, replies, client emails, page text) | `../omav-admin-dashboard` (see its README) |
| Studio source | `../studio-omav` (sibling folder, separate from this app) |
| Page text | public dataset `production`, one document per page |
| Form enquiries | **private** dataset `enquiries` (readable only when signed in) |

## Editing text

Open the Studio > **OMAV website**, pick a page, edit, press **Publish**. The live
site shows the change on the next page load with no rebuild or redeploy. Empty fields
fall back to the built-in text, so a half-finished edit never blanks the page.

Enquiries arrive in **Enquiries > New**. Set a status (In progress, Replied, Closed,
Spam) and add internal notes there.

## How it works

- `src/content/defaults.json`: every string on the site, and the shape of each
  page's Sanity document. It is also the fallback if Sanity can't be reached.
- `src/content/content.tsx`: fetches the published text in one request from
  Sanity's CDN, merges it over the defaults, and caches it for instant repeat visits.
  Components read it with `useContent()`.
- `api/briefing.ts` (Vercel Function) + `api/_lib/briefing.ts`: validates the
  form (with a honeypot and a minimum fill time against bots) and writes to the
  private dataset with the server-only token. It also adds or updates the sender
  in the client list (`contact` documents) that the admin dashboard emails from.
  `npm run dev` serves the same route locally via `vite.config.ts`.

## Adding or changing editable fields

1. Edit `src/content/defaults.json` (add the key with its default text) and use
   it in the component via `useContent()`.
2. `npm run sanity:sync` regenerates the Studio schema
   (`../studio-omav/schemaTypes/siteContent.generated.ts`).
3. `cd ../studio-omav && npx sanity deploy` publishes the updated Studio.

`npm run sanity:seed` creates any missing page documents from the defaults and
never overwrites existing edits. `node scripts/sanity-sync.mjs --force` replaces
them with the defaults, which discards editors' changes.

## Environment variables

Local: `.env.local` (git-ignored). Vercel: Project > Settings > Environment Variables.

| Name | Notes |
| --- | --- |
| `VITE_SANITY_PROJECT_ID` | `uj3vfr7a` |
| `VITE_SANITY_DATASET` | `production` |
| `SANITY_API_WRITE_TOKEN` | **Server-only.** Never prefix with `VITE_`. |
| `SANITY_ENQUIRY_DATASET` | Optional, defaults to `enquiries` |

When the site gets a new domain, add it under sanity.io/manage > API > CORS origins
(`*.vercel.app`, `omavglobal.com` and `localhost:3000` are already allowed).
