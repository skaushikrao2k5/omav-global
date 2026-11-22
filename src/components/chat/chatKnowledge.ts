import type { ChatAction, Entry } from './chatEngine';
import type { SiteContent } from '../../content/content';

// What the site assistant knows. Page content is read from the same data the
// pages render, so an edit there reaches the assistant too. The FAQs below are
// written by hand and must only say what the website says: if the site doesn't
// state it (a founding date, prices, open roles), the answer says so.

const EMAIL = 'contact@omavglobal.com';
const emailAction: ChatAction = { kind: 'email', label: `Email ${EMAIL}` };
const briefing: ChatAction = { kind: 'briefing', label: 'Open the briefing form' };
const page = (p: string, label: string, anchor?: string): ChatAction => ({ kind: 'page', page: p, anchor, label });

export const FAQ_GROUPS = ['About OMAV', 'What we do', 'Working with us', 'Security & governance', 'This website'] as const;

export type Faq = Entry & { group: (typeof FAQ_GROUPS)[number] };

const faq = (
  group: Faq['group'],
  id: string,
  title: string,
  body: Entry['body'],
  keywords: string[],
  action?: ChatAction
): Faq => ({ id: `faq-${id}`, group, title, topic: 'FAQ', body, keywords, action, isFaq: true });

const p = (text: string) => ({ type: 'p' as const, text });
const list = (items: string[]) => ({ type: 'list' as const, items });

export const FAQS: Faq[] = [
  faq(
    'About OMAV',
    'what',
    'What is OMAV Global?',
    [
      p(
        'OMAV Global Ventures Pvt. Ltd. is a multidisciplinary advisory practice. We bring legal rigour, technological fluency and an international outlook to the questions government bodies, enterprises and research institutions find hardest to answer.'
      ),
    ],
    ['omav', 'company', 'firm', 'overview', 'introduction', 'what is omav', 'who are omav', 'pvt ltd', 'ventures', 'about omav', 'about you', 'about the company'],
    page('about', 'Go to About')
  ),
  faq(
    'About OMAV',
    'mission',
    'What does OMAV do?',
    [
      p(
        'We transform governance and public systems through AI-driven intelligence and technology, bridging private innovation and public institutions so governments serve citizens more securely and efficiently.'
      ),
      p('The work moves through five steps: data, intelligence, understanding, strategy and impact.'),
    ],
    ['mission', 'purpose', 'what do you do', 'what does omav do', 'what you do', 'governance', 'public systems'],
    page('home', 'See the five steps', 'how')
  ),
  faq(
    'About OMAV',
    'founders',
    'Who founded OMAV?',
    [p('OMAV Global Ventures Pvt. Ltd. was co-founded by Priya Lalwani and Varad Ozarkar, to bring strategy, technology and governance to the institutions shaping what comes next.')],
    ['founder', 'founders', 'cofounder', 'co founder', 'leadership', 'leader', 'owner', 'ceo', 'team', 'who runs', 'who founded', 'who started'],
    page('about', 'Meet the founders', 'founders')
  ),
  faq(
    'About OMAV',
    'founded',
    'When was OMAV founded?',
    [p(`This website doesn’t give a founding date. The team can tell you more at ${EMAIL}.`)],
    ['founded', 'established', 'history', 'how old', 'when was', 'when did', 'since when', 'what year'],
    page('about', 'See the recognition', 'recognition')
  ),
  faq(
    'About OMAV',
    'motto',
    'What does the motto mean?',
    [
      p('॥ अधिकाराणां कृते ॥ means “For the sake of rights.”'),
      p('It is the principle at the centre of our mark and the benchmark for every system we construct.'),
    ],
    ['motto', 'sanskrit', 'tagline', 'अधिकाराणां', 'कृते', 'adhikaranam', 'rights', 'logo', 'emblem'],
    page('about', 'Go to About')
  ),
  faq(
    'About OMAV',
    'offices',
    'Where are your offices?',
    [p('Our offices are in New York and Mumbai.')],
    ['office', 'offices', 'location', 'located', 'address', 'headquarters', 'hq', 'based', 'new york', 'mumbai', 'india', 'usa', 'america', 'where are you'],
    emailAction
  ),
  faq(
    'About OMAV',
    'recognition',
    'What recognition has OMAV received?',
    [
      list([
        '2025: Harvard India Conference invitation',
        '2024: State AI recruitment and Cyber Safe platforms, felicitated by the Hon’ble Chief Minister of Maharashtra',
        '2023: DSCI and NASSCOM honour at the Bombay Stock Exchange',
        '2022: GovTech Innovation Award',
        '2021: New Jersey–India Mission on Investment',
      ]),
    ],
    ['recognition', 'award', 'awards', 'achievement', 'achievements', 'honour', 'honor', 'milestone', 'milestones', 'track record', 'credentials'],
    page('about', 'See the recognition', 'recognition')
  ),

  faq(
    'What we do',
    'solutions',
    'What solutions do you offer?',
    [
      list([
        'AI voice bots and citizen services',
        'Contract intelligence and legal tech',
        'Cyber intelligence and predictive policing',
        'Constitutional digital governance',
        'Cloud and on-premises sovereign solutions',
        'Infrastructure managed services',
      ]),
    ],
    ['solution', 'solutions', 'product', 'products', 'platform', 'platforms', 'offer', 'offering', 'offerings', 'services', 'what do you offer', 'what do you sell'],
    page('solutions', 'See all solutions', 'platforms')
  ),
  faq(
    'What we do',
    'practices',
    'What are your areas of expertise?',
    [
      list([
        'Strategic intelligence and research',
        'AI governance and responsible innovation',
        'Cyber and digital-law advisory',
        'Public-sector strategy',
        'International partnerships',
        'Policy-led technology transformation',
      ]),
      p('Each engagement draws on several of these at once.'),
    ],
    ['expertise', 'practice', 'practices', 'specialise', 'specialize', 'specialty', 'domain', 'domains', 'advisory', 'consulting', 'consultancy', 'areas of expertise'],
    page('expertise', 'Explore the practices', 'practices')
  ),
  faq(
    'What we do',
    'build',
    'Do you build software, or only advise?',
    [
      p('Both. Alongside advisory work we offer end-to-end engineering for high-security public mandates:'),
      list([
        'Digital transformation',
        'Software development',
        'Mobile app development',
        'Cloud solutions',
        'On-premises infrastructure',
        'Managed infrastructure services',
      ]),
    ],
    ['build', 'develop', 'developer', 'engineering', 'only advise', 'capabilities'],
    page('solutions', 'See our capabilities', 'capabilities')
  ),
  faq(
    'What we do',
    'support',
    'Do you provide ongoing support?',
    [
      p(
        'Yes. Our managed infrastructure services cover 24/7 security monitoring, threat forensics, automated zero-day patching and mission-critical availability. Delivery also includes continuous monitoring, updates as legal standards evolve, and executive training.'
      ),
    ],
    ['support', 'maintenance', 'maintain', 'monitoring', '24 7', '247', 'uptime', 'after launch', 'ongoing', 'managed'],
    page('solutions', 'See how we deliver', 'delivery')
  ),

  faq(
    'Working with us',
    'clients',
    'Who do you work with?',
    [
      p(
        'Government bodies, state administrations, security leadership, enterprises and research institutions navigating technology, law and sovereignty.'
      ),
      p('Our work bridges municipal bodies, state administrations, national agencies and bilateral state missions.'),
    ],
    ['client', 'clients', 'customer', 'customers', 'government', 'governments', 'enterprise', 'enterprises', 'university', 'private', 'research institution', 'who do you work with', 'who do you serve'],
    page('approach', 'See how we work', 'standards')
  ),
  faq(
    'Working with us',
    'where',
    'Which countries do you work in?',
    [
      p('Our work reaches across the United States, India and partner democracies, with international bridges connecting US, Indian, European and emerging sovereign ecosystems.'),
    ],
    ['country', 'countries', 'international', 'global', 'abroad', 'europe', 'european', 'united states', 'partner democracies', 'where do you work', 'overseas'],
    page('approach', 'See our reach', 'standards')
  ),
  faq(
    'Working with us',
    'process',
    'How does an engagement work?',
    [
      p('We deliver in three phases:'),
      list([
        'Discovery and strategy: goals, a regulatory and security feasibility audit, and a target roadmap',
        'Development: secure, tested engineering with bias controls built in',
        'Optimization and support: monitoring, updates and capability transfer',
      ]),
    ],
    ['engagement', 'process', 'phase', 'phases', 'methodology', 'timeline', 'steps', 'how do you work', 'how does it work', 'get started', 'start'],
    page('solutions', 'See how we deliver', 'delivery')
  ),
  faq(
    'Working with us',
    'contact',
    'How do I contact OMAV?',
    [
      p(`Write to ${EMAIL}. Advisory mandates, public systems modernization, research collaborations and speaking enquiries are all welcome. You can also use the briefing form.`),
    ],
    ['contact', 'email', 'mail', 'reach', 'phone', 'call', 'telephone', 'number', 'talk', 'speak', 'meeting', 'book', 'enquiry', 'inquiry', 'briefing', 'consultation', 'get in touch', 'speaking', 'collaboration', 'collaborate'],
    emailAction
  ),
  faq(
    'Working with us',
    'price',
    'How much does it cost?',
    [p(`This website doesn’t publish pricing. Write to ${EMAIL} with what you are working on and the team can advise.`)],
    ['price', 'pricing', 'cost', 'costs', 'fee', 'fees', 'charge', 'charges', 'budget', 'quote', 'rate', 'rates', 'how much', 'expensive'],
    emailAction
  ),
  faq(
    'Working with us',
    'careers',
    'Are you hiring?',
    [p(`This website doesn’t list open roles or internships. You can ask the team directly at ${EMAIL}.`)],
    ['career', 'careers', 'job', 'jobs', 'hiring', 'vacancy', 'vacancies', 'internship', 'intern', 'apply', 'work for you', 'join', 'are you hiring'],
    emailAction
  ),

  faq(
    'Security & governance',
    'confidential',
    'How do you handle confidentiality?',
    [
      p(
        'We operate under strict confidentiality protocols. Our engagements with state departments and intelligence leadership prioritize classified handling and institutional protection.'
      ),
    ],
    ['confidential', 'confidentiality', 'discretion', 'privacy', 'secret', 'classified', 'nda', 'privilege'],
    page('approach', 'See our standards', 'standards')
  ),
  faq(
    'Security & governance',
    'bias',
    'How do you keep AI fair and accountable?',
    [
      p(
        'We test for bias mathematically, aligned with constitutional equal-protection doctrines, and build audit trails into automated decisions. Every system we recommend is benchmarked against constitutional rights, public auditability and legal precedent.'
      ),
    ],
    ['bias', 'fair', 'fairness', 'ethical', 'ethics', 'responsible', 'accountable', 'accountability', 'audit', 'constitutional', 'transparent', 'transparency', 'safe ai', 'ai safety'],
    page('expertise', 'See AI governance', 'practices')
  ),
  faq(
    'Security & governance',
    'sovereign',
    'Can systems run on our own infrastructure?',
    [
      p(
        'Yes. We deploy across secure government clouds and air-gapped on-premises data enclaves, with zero-trust data protection and hybrid failover, for environments where data sovereignty is essential.'
      ),
    ],
    ['on premise', 'on premises', 'onprem', 'air gapped', 'airgapped', 'sovereign', 'sovereignty', 'data residency', 'data locality', 'self hosted', 'own infrastructure', 'own servers', 'zero trust'],
    page('solutions', 'See sovereign solutions', 'platforms')
  ),

  faq(
    'This website',
    'globe',
    'What does the globe on the home page show?',
    [
      p(
        'It shows real population density for 2020 on a 1 km grid, from NASA SEDAC. Click anywhere on it to read the density at that point, zoom with the controls beneath it, and switch between day and night.'
      ),
    ],
    ['globe', 'earth', 'map', 'population', 'density', 'dataset', 'nasa', 'sedac', 'gpw', 'cesium', 'night lights', 'day night'],
    page('home', 'Go to the globe')
  ),
  faq(
    'This website',
    'gestures',
    'How does gesture control work?',
    [
      p(
        'On a computer with a webcam, on the home page, press the palm button beside Contact. Hand tracking runs in your browser, and you can then control the globe:'
      ),
      list([
        'Open palm: turn the Earth, at the top of the page',
        'Two palms apart or together: zoom in or out',
        'One to four fingers: go to scenes one to four',
        'Thumbs up: go to the fifth scene',
        'Fist: back to the top',
      ]),
    ],
    ['gesture', 'gestures', 'hand', 'hands', 'palm', 'webcam', 'camera', 'mediapipe', 'fingers', 'thumbs up'],
    page('home', 'Go to the home page')
  ),
  faq(
    'This website',
    'bot',
    'How does this assistant work?',
    [
      p(
        'I’m not an AI model. I match the words in your question to what this website says and show you that information. What you type stays in your browser: it isn’t stored or sent anywhere.'
      ),
    ],
    ['assistant', 'chatbot', 'chat bot', 'are my messages stored', 'stored', 'how do you work', 'how does this work'],
  ),
];

// Words people use for a topic that the page text doesn't, by page-data title
const SYNONYMS: Record<string, string[]> = {
  'AI Voice Bots & Citizen Services': ['voice', 'voicebot', 'bot', 'bots', 'chatbot', 'call center', 'call centre', 'helpline', 'emergency', 'grievance', 'citizen', 'citizens', 'dialect', 'language', 'languages', 'multilingual', 'ivr'],
  'Contract Intelligence & Legal Tech': ['contract', 'contracts', 'legal', 'legaltech', 'law', 'tender', 'tenders', 'procurement', 'compliance', 'clause', 'clauses', 'regulatory'],
  'Cyber Intelligence & Predictive Policing': ['cyber', 'cybersecurity', 'security', 'police', 'policing', 'crime', 'cybercrime', 'law enforcement', 'osint', 'threat', 'threats', 'intelligence agency'],
  'Constitutional Digital Governance': ['recruitment', 'recruit', 'hiring engine', 'merit', 'exam', 'public employment', 'fairness', 'constitutional', 'bias', 'hr'],
  'Cloud & On-Premises Sovereign Solutions': ['cloud', 'on premise', 'on premises', 'air gapped', 'sovereign', 'sovereignty', 'hybrid', 'data center', 'data centre', 'encryption', 'zero trust', 'resilience'],
  'Infrastructure Managed Services': ['managed', 'infrastructure', 'disaster recovery', 'backup', 'uptime', 'patching', 'legacy', 'it support', 'modernization', 'modernisation', 'operations'],
  'Digital Transformation': ['digital', 'transformation', 'portal', 'portals', 'modernize', 'modernise', 'workflow'],
  'Software Development': ['software', 'coding', 'code', 'web', 'website development', 'programming'],
  'Mobile App Development': ['mobile', 'app', 'apps', 'android', 'ios', 'cyber safe', 'maharashtra cyber safe'],
  'Cloud Solutions': ['cloud', 'migration', 'aws', 'azure', 'government cloud'],
  'On-Premises Infrastructure': ['on premise', 'on premises', 'servers', 'data center', 'data centre', 'defense', 'defence', 'classified'],
  'Managed Infrastructure Services': ['managed', '24 7', 'monitoring', 'patching', 'availability'],
  'Discovery & Strategy': ['discovery', 'roadmap', 'feasibility', 'assessment', 'scoping', 'first step'],
  Development: ['build phase', 'testing', 'engineering phase'],
  'Optimization & Support': ['optimisation', 'optimization', 'maintenance', 'training', 'telemetry', 'long term'],
  'Strategic Intelligence & Research': ['research', 'osint', 'geopolitics', 'geopolitical', 'supply chain', 'foresight', 'risk', 'risks'],
  'AI Governance & Responsible Innovation': ['ai', 'artificial intelligence', 'governance', 'responsible', 'algorithm', 'algorithmic', 'machine learning', 'ml', 'ai policy', 'ai regulation'],
  'Cyber & Digital-Law Advisory': ['cyber law', 'digital law', 'data protection', 'gdpr', 'dpdp', 'incident response', 'digital evidence', 'regulation', 'lawyer', 'legal advice'],
  'Public-Sector Strategy': ['public sector', 'government', 'civic', 'ministry', 'department', 'budget overrun', 'legacy systems'],
  'International Partnerships': ['international', 'partnership', 'partnerships', 'partner', 'bilateral', 'treaty', 'treaties', 'cross border', 'export controls', 'technology transfer', 'new jersey', 'phil murphy'],
  'Policy-Led Technology Transformation': ['policy', 'policies', 'legislation', 'legislative', 'statute', 'administrative law', 'citizen rights', 'democratic'],
  Intelligence: ['understand', 'risks'],
  Advisory: ['advice', 'counsel', 'decisions'],
  'Global perspective': ['global', 'international', 'borders'],
  'Institutional credibility': ['credibility', 'trust', 'credible', 'reputation', 'governors', 'chief ministers'],
  'Discretion & sovereign privilege': ['confidential', 'confidentiality', 'privacy', 'classified'],
  'Multidisciplinary composition': ['team', 'multidisciplinary', 'engineers', 'lawyers', 'legal scholars', 'strategists'],
  'Objective integrity & constitutional compliance': ['vendor', 'neutral', 'objective', 'independent', 'integrity', 'compliance'],
  'Sub-national to multilateral reach': ['municipal', 'state', 'national', 'multilateral', 'partner democracies', 'reach'],
  'Priya Lalwani': ['priya', 'lalwani', 'columbia', 'mba', 'cofounder', 'operations', 'chief strategy officer', 'govtech'],
  'Varad Ozarkar': ['varad', 'ozarkar', 'cofounder', 'recruitment system'],
  'Harvard India Conference invitation': ['harvard', 'conference', '2025'],
  'State AI recruitment & Cyber Safe platforms': ['2024', 'maharashtra', 'chief minister', 'cyber safe', 'recruitment engine'],
  'DSCI & NASSCOM BSE honoree': ['2023', 'dsci', 'nasscom', 'bse', 'bombay stock exchange', 'ring the bell'],
  'GovTech Innovation Award': ['2022', 'govtech', 'innovation award', 'incident response'],
  'New Jersey–India Mission on Investment': ['2021', 'new jersey', 'phil murphy', 'investment', 'governor', 'mission'],
  Data: ['data', 'information', 'open data', 'first step', 'how you think'],
  Understanding: ['interpret', 'lens'],
  Strategy: ['direction', 'partnerships', 'programmes'],
  Impact: ['delivery', 'outcome', 'outcomes', 'results'],
};

const kw = (title: string, ...more: string[]) => [...(SYNONYMS[title] ?? []), ...more];

// Everything the pages say, as one searchable list, built from the same content
// the pages render (Sanity, falling back to the built-in text)
export async function loadKnowledge(c: SiteContent): Promise<Entry[]> {
  try {
    const sol = c.solutionsPage;
    const exp = c.expertisePage;
    const app = c.approachPage;
    const abt = c.aboutPage;
    const steps = c.homePage.story.steps;
    return [
      ...FAQS,
      ...sol.platforms.items.map(
        (x, i): Entry => ({
          id: `platform-${i}`,
          title: x.title,
          topic: 'Solutions',
          keywords: kw(x.title, x.category),
          body: [p(x.description), { type: 'list', items: x.deliverables }, { type: 'note', label: 'Impact', text: x.impact }],
          action: page('solutions', 'See it on Solutions', 'platforms'),
        })
      ),
      ...sol.capabilities.items.map(
        (x, i): Entry => ({
          id: `capability-${i}`,
          title: x.title,
          topic: 'Capabilities',
          keywords: kw(x.title),
          body: [p(x.description)],
          action: page('solutions', 'See our capabilities', 'capabilities'),
        })
      ),
      ...sol.delivery.phases.map(
        (x, i): Entry => ({
          id: `phase-${i}`,
          title: x.name,
          topic: `Delivery, phase ${i + 1} of ${sol.delivery.phases.length}`,
          keywords: kw(x.name),
          body: [p(x.description), { type: 'list', items: x.points }],
          action: page('solutions', 'See how we deliver', 'delivery'),
        })
      ),
      ...exp.practices.items.map(
        (x, i): Entry => ({
          id: `practice-${i}`,
          title: x.title,
          topic: 'Expertise',
          keywords: kw(x.title),
          body: [
            p(x.summary),
            { type: 'list', items: x.domains },
            { type: 'note', label: 'How we work', text: x.methodology },
            { type: 'note', label: 'What it changes', text: x.clientBenefit },
          ],
          action: page('expertise', 'See it on Expertise', 'practices'),
        })
      ),
      ...app.pillars.items.map(
        (x, i): Entry => ({
          id: `pillar-${i}`,
          title: x.title,
          topic: 'Approach',
          keywords: kw(x.title),
          body: [p(x.text), p(x.detail)],
          action: page('approach', 'See our approach', 'pillars'),
        })
      ),
      ...app.standards.items.map(
        (x, i): Entry => ({
          id: `standard-${i}`,
          title: x.title,
          topic: 'Our standards',
          keywords: kw(x.title),
          body: [p(x.description)],
          action: page('approach', 'See our standards', 'standards'),
        })
      ),
      ...abt.founders.people.map(
        (x, i): Entry => ({
          id: `founder-${i}`,
          title: x.name,
          topic: 'Co-founder',
          keywords: kw(x.name),
          body: [{ type: 'note', label: 'Focus', text: x.focus }, ...x.bio.map(p)],
          action: page('about', 'See the founders', 'founders'),
        })
      ),
      ...abt.recognition.milestones.map(
        (x, i): Entry => ({
          id: `milestone-${i}`,
          title: x.title,
          topic: `Recognition, ${x.year}`,
          keywords: kw(x.title),
          body: [p(x.detail)],
          action: page('about', 'See the recognition', 'recognition'),
        })
      ),
      ...steps.map(
        (x, i): Entry => ({
          id: `step-${i}`,
          title: x.title,
          topic: `How we think, step ${i + 1} of ${steps.length}`,
          keywords: kw(x.title),
          body: [p(x.body)],
          action: page('home', 'See it on the home page', x.id || 'how'),
        })
      ),
    ];
  } catch (err) {
    console.warn('Assistant: page content unavailable', err);
    return FAQS;
  }
}

// What a visitor sees first, and when a question finds nothing
export const STARTERS = ['faq-what', 'faq-solutions', 'faq-founders', 'faq-contact'];
export const FALLBACKS = ['faq-solutions', 'faq-practices', 'faq-clients', 'faq-contact'];
export { EMAIL, briefing };
