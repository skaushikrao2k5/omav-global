// Keeps Sanity in step with the site's text.
//
//   node scripts/sanity-sync.mjs            regenerate the Studio schema only
//   node scripts/sanity-sync.mjs --seed     ...and create any missing content documents
//   node scripts/sanity-sync.mjs --force    ...and overwrite them with src/content/defaults.json
//
// src/content/defaults.json is the source of truth for the shape of the
// content. The Studio schema (../studio-omav/schemaTypes/siteContent.generated.ts)
// is generated from it, so adding a field to the JSON and running this script
// makes it editable in Sanity. --seed never touches documents that already
// exist, so editors' changes are safe; --force replaces them (use with care).
//
// Needs SANITY_API_WRITE_TOKEN (and VITE_SANITY_PROJECT_ID / VITE_SANITY_DATASET)
// in .env.local for --seed / --force.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const defaults = JSON.parse(fs.readFileSync(path.join(root, 'src/content/defaults.json'), 'utf8'));
const studioOut = path.resolve(root, '../studio-omav/schemaTypes/siteContent.generated.ts');

// ---- Editorial metadata ------------------------------------------------------

const DOC_TITLES = {
  siteSettings: 'Site settings',
  homePage: 'Home page',
  solutionsPage: 'Solutions page',
  expertisePage: 'Expertise page',
  approachPage: 'Approach page',
  aboutPage: 'About page',
  briefingForm: 'Briefing form',
};

// Keys the site needs but editors should not see (layout ids, globe marker shapes)
const HIDDEN = new Set(['id', 'shape', 'tone']);

// Lists whose length is tied to the design (the globe has five scenes)
const FIXED_LENGTH = { 'homePage.story.steps': 5 };

const LABELS = {
  line1: 'Tagline, line 1',
  line2: 'Tagline, line 2',
  lede: 'Intro paragraph',
  tags: 'Tags under the title',
  cta: 'Call to action band',
  items: 'Items',
  clientBenefit: 'What it changes',
};

const DESCRIPTIONS = {
  'homePage.hero.line1': 'Typed out on the loading screen.',
  'homePage.hero.line2': 'Typed out on the loading screen, after line 1.',
  'homePage.index.items': 'Links to the inner pages. Keep the order: Solutions, Expertise, Approach, About.',
  'solutionsPage.platforms.filters': 'Filter buttons. "Category" must match a platform\'s category exactly.',
  'solutionsPage.platforms.items': 'Each platform\'s category must match one of the filter categories above.',
  'solutionsPage.delivery.phaseLabel': '{n} is replaced with the phase number and {total} with the number of phases.',
  'briefingForm.success.body': '{name} and {mandate} are replaced with what the visitor entered.',
  'briefingForm.fields.mandates': 'Options in the "Focus mandate" dropdown.',
};

// ---- Schema generation -------------------------------------------------------

const humanize = (key) =>
  LABELS[key] ??
  key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/^./, (c) => c.toUpperCase())
    .replace(/\b([A-Z])([a-z]+)/g, (m, a, b, i) => (i === 0 ? m : a.toLowerCase() + b));

const isLong = (s) => typeof s === 'string' && (s.length > 80 || s.includes('\n'));
const FN = (src) => `__FN__${src}__FN__`;

function field(key, value, p) {
  const f = { name: key, title: humanize(key) };
  if (DESCRIPTIONS[p]) f.description = DESCRIPTIONS[p];
  if (HIDDEN.has(key)) f.hidden = true;

  if (typeof value === 'string') {
    Object.assign(f, isLong(value) ? { type: 'text', rows: value.length > 260 ? 6 : 3 } : { type: 'string' });
  } else if (Array.isArray(value)) {
    f.type = 'array';
    if (value.every((v) => typeof v === 'string')) {
      f.of = [{ type: value.some(isLong) ? 'text' : 'string' }];
    } else {
      // Union of keys across the items, in first-seen order
      const shape = {};
      for (const item of value) for (const [k, v] of Object.entries(item)) if (!(k in shape)) shape[k] = v;
      const keys = Object.keys(shape);
      const visible = keys.filter((k) => !HIDDEN.has(k) && typeof shape[k] === 'string');
      f.of = [
        {
          type: 'object',
          name: `${key}Item`,
          fields: keys.map((k) => field(k, shape[k], `${p}.${k}`)),
          preview: { select: { title: visible[0] ?? keys[0], ...(visible[1] ? { subtitle: visible[1] } : {}) } },
        },
      ];
    }
    if (FIXED_LENGTH[p]) {
      f.validation = FN(`(Rule: any) => Rule.length(${FIXED_LENGTH[p]}).error('This list must have exactly ${FIXED_LENGTH[p]} items.')`);
    }
  } else if (value && typeof value === 'object') {
    f.type = 'object';
    f.fields = Object.entries(value).map(([k, v]) => field(k, v, `${p}.${k}`));
  } else {
    f.type = 'string';
  }
  return f;
}

function documentType(name, content) {
  const groups = Object.keys(content).map((k, i) => ({ name: k, title: humanize(k), ...(i === 0 ? { default: true } : {}) }));
  return {
    name,
    title: DOC_TITLES[name] ?? humanize(name),
    type: 'document',
    groups,
    fields: Object.entries(content).map(([k, v]) => ({
      ...field(k, v, `${name}.${k}`),
      group: k,
      options: { collapsible: false },
    })),
    preview: { prepare: FN(`() => ({ title: ${JSON.stringify(DOC_TITLES[name] ?? name)} })`) },
  };
}

const types = Object.entries(defaults).map(([name, content]) => documentType(name, content));
const body = JSON.stringify(types, null, 2).replace(/"__FN__(.*?)__FN__"/g, (_, src) => JSON.parse(`"${src}"`));

fs.writeFileSync(
  studioOut,
  `// GENERATED by omav-global/scripts/sanity-sync.mjs from src/content/defaults.json.
// Do not edit by hand: change the JSON (or the script) and run \`npm run sanity:sync\`.
/* eslint-disable */
import type {SchemaTypeDefinition} from 'sanity'

export const SITE_CONTENT_TYPES = ${JSON.stringify(Object.keys(defaults))} as const

export const DOC_TITLES: Record<string, string> = ${JSON.stringify(
    Object.fromEntries(Object.keys(defaults).map((k) => [k, DOC_TITLES[k] ?? k])),
    null,
    2
  )}

export const siteContentTypes = ${body} as unknown as SchemaTypeDefinition[]
`
);
console.log(`Schema: ${types.length} document types -> ${path.relative(root, studioOut)}`);

// The admin dashboard lays out its editor in the same order as the site
const dashboardShape = path.resolve(root, '../omav-admin-dashboard/src/lib/content-shape.json');
if (fs.existsSync(path.dirname(dashboardShape))) {
  fs.copyFileSync(path.join(root, 'src/content/defaults.json'), dashboardShape);
  console.log(`Dashboard field order -> ${path.relative(root, dashboardShape)}`);
}

// ---- Seeding -----------------------------------------------------------------

const mode = process.argv.includes('--force') ? 'force' : process.argv.includes('--seed') ? 'seed' : null;
if (mode) {
  const env = Object.fromEntries(
    fs
      .readFileSync(path.join(root, '.env.local'), 'utf8')
      .split(/\r?\n/)
      .map((l) => l.match(/^\s*([A-Z0-9_]+)\s*=\s*"?(.*?)"?\s*$/))
      .filter(Boolean)
      .map((m) => [m[1], m[2]])
  );
  const projectId = process.env.VITE_SANITY_PROJECT_ID || env.VITE_SANITY_PROJECT_ID;
  const dataset = process.env.VITE_SANITY_DATASET || env.VITE_SANITY_DATASET || 'production';
  const token = process.env.SANITY_API_WRITE_TOKEN || env.SANITY_API_WRITE_TOKEN;
  if (!projectId || !token) {
    console.error('Missing VITE_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN in .env.local');
    process.exit(1);
  }

  // Sanity needs a _key on every object inside an array
  let n = 0;
  const withKeys = (v) =>
    Array.isArray(v)
      ? v.map((x) => (x && typeof x === 'object' && !Array.isArray(x) ? { _key: `k${(n++).toString(36)}`, ...withKeys(x) } : withKeys(x)))
      : v && typeof v === 'object'
        ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, withKeys(x)]))
        : v;

  const op = mode === 'force' ? 'createOrReplace' : 'createIfNotExists';
  const mutations = Object.entries(defaults).map(([name, content]) => ({
    [op]: { _id: name, _type: name, ...withKeys(content) },
  }));

  const res = await fetch(`https://${projectId}.api.sanity.io/v2025-02-19/data/mutate/${dataset}?returnIds=true`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ mutations }),
  });
  const json = await res.json();
  if (!res.ok) {
    console.error('Seeding failed:', json.error?.description || json.message || json);
    process.exit(1);
  }
  const changed = (json.results || []).filter((r) => r.operation !== 'none').map((r) => r.id);
  console.log(
    mode === 'force'
      ? `Replaced ${changed.length} documents in "${dataset}".`
      : `Seeded "${dataset}": ${changed.length ? `created ${changed.join(', ')}` : 'all documents already existed, nothing changed'}.`
  );
}
