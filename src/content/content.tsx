import React, { createContext, useContext, useEffect, useState } from 'react';
import defaults from './defaults.json';

// Site text comes from Sanity (project omav, public "production" dataset), with
// src/content/defaults.json as the fallback and as the shape of every page.
//
// Loading: the last published content is cached in localStorage, so repeat
// visits render instantly and refresh in the background. A first visit waits
// briefly for Sanity (see loadInitialContent) so edited text doesn't swap in
// after the page has painted.

export type SiteContent = typeof defaults;

const PROJECT_ID = import.meta.env.VITE_SANITY_PROJECT_ID as string | undefined;
const DATASET = (import.meta.env.VITE_SANITY_DATASET as string | undefined) || 'production';
const API_VERSION = '2025-02-19';
const CACHE_KEY = 'omav-content-v1';
const DOC_TYPES = Object.keys(defaults) as (keyof SiteContent)[];

// One request for every page: { "homePage": *[_id == "homePage"][0], ... }
const QUERY = `{${DOC_TYPES.map((t) => `"${t}": *[_id == "${t}"][0]`).join(', ')}}`;

// Sanity's values win wherever an editor has filled them in; anything empty or
// missing keeps the built-in text, so a half-finished edit never blanks the page
function merge<T>(base: T, remote: unknown): T {
  if (remote === null || remote === undefined) return base;
  if (typeof base === 'string') return (typeof remote === 'string' && remote.trim() ? remote : base) as T;
  if (Array.isArray(base)) {
    if (!Array.isArray(remote) || remote.length === 0) return base;
    // Items line up by position; new items use the first default as their shape
    return remote.map((item, i) => merge(base[i] ?? base[0], item)) as T;
  }
  if (base && typeof base === 'object') {
    if (typeof remote !== 'object' || Array.isArray(remote)) return base;
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(base as Record<string, unknown>)) {
      out[k] = merge(v, (remote as Record<string, unknown>)[k]);
    }
    return out as T;
  }
  return base;
}

function readCache(): SiteContent | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? merge(defaults, JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

async function fetchContent(): Promise<SiteContent | null> {
  if (!PROJECT_ID) return null;
  const url = `https://${PROJECT_ID}.apicdn.sanity.io/v${API_VERSION}/data/query/${DATASET}?query=${encodeURIComponent(
    QUERY
  )}&perspective=published`;
  try {
    // Revalidate every time: Sanity's CDN updates on publish, but the browser's
    // HTTP cache would otherwise keep serving the copy from an earlier visit
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) {
      console.warn(`Content: Sanity answered ${res.status}; showing built-in text`);
      return null;
    }
    const { result } = await res.json();
    if (!result) return null;
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(result));
    } catch {
      /* storage full or blocked: fine, we just won't cache */
    }
    return merge(defaults, result);
  } catch (err) {
    console.warn('Content: could not load from Sanity; showing built-in text', err);
    return null;
  }
}

// One request shared by the first render and the background refresh; a failed
// attempt is forgotten so the next caller tries again
let latest: Promise<SiteContent | null> | null = null;
const refresh = () =>
  (latest ??= fetchContent().then((c) => {
    if (!c) latest = null;
    return c;
  }));

// Called before the first render: cached content immediately when we have it,
// otherwise Sanity's content if it answers within `waitMs`, else the defaults
export async function loadInitialContent(waitMs = 1200): Promise<SiteContent> {
  const cached = readCache();
  const fresh = refresh();
  if (cached) return cached;
  const timeout = new Promise<null>((r) => setTimeout(() => r(null), waitMs));
  return (await Promise.race([fresh, timeout])) ?? defaults;
}

const ContentCtx = createContext<SiteContent>(defaults);

export const ContentProvider: React.FC<{ initial: SiteContent; children: React.ReactNode }> = ({ initial, children }) => {
  const [content, setContent] = useState(initial);
  useEffect(() => {
    let alive = true;
    // Background refresh: picks up anything published since the cached copy
    refresh().then((fresh) => {
      if (alive && fresh && JSON.stringify(fresh) !== JSON.stringify(content)) setContent(fresh);
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <ContentCtx.Provider value={content}>{children}</ContentCtx.Provider>;
};

export const useContent = () => useContext(ContentCtx);

// "Phase {n} of {total}" -> "Phase 1 of 3"
export const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (m, k) => (k in values ? String(values[k]) : m));
