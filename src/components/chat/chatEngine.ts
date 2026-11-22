// The site assistant's matching: no model and no network. A question is reduced
// to keywords and scored against what the website says. Anything that doesn't
// match well enough gets an honest "I don't have that", never a guess.

export type ChatAction =
  | { kind: 'page'; page: string; anchor?: string; label: string }
  | { kind: 'briefing'; label: string }
  | { kind: 'email'; label: string };

export type Block =
  | { type: 'p'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'note'; label: string; text: string };

export interface Entry {
  id: string;
  title: string;
  topic: string; // shown above the answer, e.g. "Solutions"
  body: Block[];
  keywords?: string[]; // single words or exact phrases
  action?: ChatAction;
  isFaq?: boolean;
}

export type Reply =
  | { kind: 'answer'; entry: Entry; related: Entry[] }
  | { kind: 'smalltalk'; text: string }
  | { kind: 'none'; suggestions: Entry[] };

const STOP = new Set(
  `a an and are am as at be been being but by can could did do does for from get give had has have how i if in into is it its
  me my of on or our please s shall she he should show so some tell than that the their them then there these they this to
  us was we were what when where which who whom whose why will with would you your yours want need know like about any
  more much many very just also really mean means meaning`
    .split(/\s+/)
    .filter(Boolean)
);
// Names everything here is about: they only count when nothing else was asked
const SOFT = new Set(['omav', 'global', 'company', 'firm', 'website', 'site', 'service', 'servic']);

const WEIGHT = { keyword: 5, title: 4, body: 1 };
const MIN_SCORE = 2.6;
const RELATED_RATIO = 0.55;

export const normalise = (s: string) =>
  (s.normalize('NFKC').toLowerCase().match(/[\p{L}\p{M}\p{N}]+/gu) ?? []).join(' ');

function stem(word: string) {
  let w = word;
  if (w.length > 4 && w.endsWith('ies')) w = `${w.slice(0, -3)}y`;
  else if (w.length > 5 && w.endsWith('ing')) w = w.slice(0, -3);
  else if (w.length > 4 && w.endsWith('ed')) w = w.slice(0, -2);
  else if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) w = w.slice(0, -1);
  if (w.length > 4 && w.endsWith('e')) w = w.slice(0, -1);
  return w;
}

const tokens = (s: string) =>
  normalise(s)
    .split(' ')
    .filter((w) => w && !STOP.has(w))
    .map(stem);

function editDistance(a: string, b: string, max: number) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = row;
  }
  return prev[b.length];
}

// How well a question word fits a set of words: exact, a shared stem
// ("sovereign" / "sovereignty"), or a likely typo ("govrnance")
// A word the site really uses is never treated as a typo ("contact" is not
// "contract"), and short stems don't count as shared ("globe" is not "global").
function fit(word: string, set: Set<string>, known: boolean) {
  if (set.has(word)) return 1;
  let best = 0;
  const reach = word.length >= 8 ? 2 : 1;
  for (const w of set) {
    if (word.length >= 5 && w.length >= 5 && (w.startsWith(word) || word.startsWith(w))) best = Math.max(best, 0.8);
    else if (!known && word.length >= 5 && w[0] === word[0] && editDistance(word, w, reach) <= reach) best = Math.max(best, 0.6);
  }
  return best;
}

export const blockText = (b: Block) =>
  b.type === 'list' ? b.items.join(' ') : b.type === 'note' ? `${b.label} ${b.text}` : b.text;

interface Indexed {
  entry: Entry;
  keyword: Set<string>;
  title: Set<string>;
  body: Set<string>;
  phrases: string[];
}

export function buildIndex(entries: Entry[]) {
  const items: Indexed[] = entries.map((entry) => ({
    entry,
    keyword: new Set((entry.keywords ?? []).filter((k) => !k.includes(' ')).flatMap(tokens)),
    title: new Set(tokens(entry.title)),
    body: new Set(tokens(entry.body.map(blockText).join(' '))),
    phrases: [entry.title, ...(entry.keywords ?? [])].map(normalise).filter((k) => k.includes(' ')),
  }));
  const df = new Map<string, number>();
  for (const it of items) {
    for (const w of new Set([...it.keyword, ...it.title, ...it.body])) df.set(w, (df.get(w) ?? 0) + 1);
  }
  return { items, df, n: items.length };
}
export type ChatIndex = ReturnType<typeof buildIndex>;

const TALK: [RegExp, string][] = [
  [
    /^(hi+|hello+|hey+|hiya|namaste|namaskar|good (morning|afternoon|evening))( there| omav)?$/,
    'Hello. Ask me about OMAV’s solutions, expertise, approach or founders, or open the FAQs above.',
  ],
  [/^(how are you|how are you doing|how s it going)$/, 'Ready to help. What would you like to know about OMAV?'],
  [/^(thanks?|thank you|thanks a lot|thank you so much|thx|ok thanks|okay thanks|great thanks)$/, 'You’re welcome. Anything else you’d like to know?'],
  [/^(bye|goodbye|see you|see ya)$/, 'Goodbye. You can reach the team any time at contact@omavglobal.com.'],
  [
    /^(who are you|what are you|are you (a )?(bot|robot|human|real|person|ai|chatbot)|is this (a )?(bot|ai|chatbot)|what can you do|help|help me)$/,
    'I’m OMAV’s site assistant, not a person or an AI model. I match the words in your question to what this website says and show you that information. For anything else, the team is at contact@omavglobal.com.',
  ],
];

export function ask(question: string, index: ChatIndex, suggestions: Entry[]): Reply {
  const text = normalise(question);
  for (const [re, reply] of TALK) if (re.test(text)) return { kind: 'smalltalk', text: reply };

  let words = [...new Set(tokens(question))];
  const specific = words.filter((w) => !SOFT.has(w));
  if (specific.length) words = specific;

  const padded = ` ${text} `;
  const scored = index.items
    .map((it) => {
      let score = 0;
      let matched = 0;
      for (const w of words) {
        const idf = Math.max(0.6, 1 + Math.log(index.n / ((index.df.get(w) ?? 0) + 1)));
        const known = index.df.has(w);
        const s = Math.max(
          fit(w, it.keyword, known) * WEIGHT.keyword,
          fit(w, it.title, known) * WEIGHT.title,
          fit(w, it.body, known) * WEIGHT.body
        );
        if (s > 0) matched++;
        score += s * idf;
      }
      // A question that covers more of what was asked ranks above one lucky word,
      // and one that misses most of it isn't about this ("best restaurant in Mumbai")
      if (words.length) score = matched / words.length < 0.5 ? 0 : score * (0.5 + (0.5 * matched) / words.length);
      for (const p of it.phrases) if (padded.includes(` ${p} `)) score += 6 + p.split(' ').length;
      return { it, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  const top = scored[0];
  if (!top || top.score < MIN_SCORE) return { kind: 'none', suggestions };
  return {
    kind: 'answer',
    entry: top.it.entry,
    related: scored
      .slice(1)
      .filter((r) => r.score >= Math.max(MIN_SCORE, top.score * RELATED_RATIO))
      .slice(0, 3)
      .map((r) => r.it.entry),
  };
}
