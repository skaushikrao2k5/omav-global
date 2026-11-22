import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, ArrowUp, ChevronDown, Mail, X } from 'lucide-react';
import { Bullet } from '../page/PageParts';
import { BotMark } from './ChatBot';
import { useContent } from '../../content/content';
import { ask, buildIndex, type ChatAction, type ChatIndex, type Entry, type Reply } from './chatEngine';
import { EMAIL, FALLBACKS, FAQ_GROUPS, FAQS, STARTERS, briefing, loadKnowledge } from './chatKnowledge';

type Message =
  | { id: number; from: 'user'; text: string }
  | { id: number; from: 'bot'; reply: Reply };

const reduced = () => !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const THINK_MS = 320;

const Answer: React.FC<{ entry: Entry }> = ({ entry }) => (
  <>
    <div className="font-mono text-[10.5px] text-slate">{entry.topic}</div>
    <h3 className="mt-1 text-[15px] leading-[1.3] text-ice">{entry.title}</h3>
    {entry.body.map((b, i) =>
      b.type === 'list' ? (
        <ul key={i} className="mt-2.5 grid gap-1.5">
          {b.items.map((item) => (
            <li key={item} className="flex gap-2.5 text-[13.5px] leading-[1.5] text-ice/80">
              <Bullet />
              {item}
            </li>
          ))}
        </ul>
      ) : b.type === 'note' ? (
        <p key={i} className="mt-2.5 text-[13.5px] leading-[1.5] text-ice/80">
          <span className="font-mono text-[11px] text-signal">{b.label}: </span>
          {b.text}
        </p>
      ) : (
        <p key={i} className="mt-2.5 text-[13.5px] leading-[1.55] text-ice/80">
          {b.text}
        </p>
      )
    )}
  </>
);

const ChatPanel: React.FC<{
  open: boolean;
  currentPage: string;
  onClose: () => void;
  onNavigate: (page: string) => void;
  onRequestBriefing: () => void;
}> = ({ open, currentPage, onClose, onNavigate, onRequestBriefing }) => {
  const [tab, setTab] = useState<'chat' | 'faq'>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [thinking, setThinking] = useState(false);
  const [openFaqGroup, setOpenFaqGroup] = useState<string | null>(FAQ_GROUPS[0]);
  const [knowledge, setKnowledge] = useState<Entry[]>(FAQS);
  const indexRef = useRef<ChatIndex>(buildIndex(FAQS));
  const nextId = useRef(1);
  const timer = useRef(0);
  const logRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const content = useContent();
  useEffect(() => {
    let alive = true;
    loadKnowledge(content).then((entries) => {
      if (!alive) return;
      indexRef.current = buildIndex(entries);
      setKnowledge(entries);
    });
    return () => {
      alive = false;
      window.clearTimeout(timer.current);
    };
  }, [content]);

  const byId = useMemo(() => new Map(knowledge.map((e) => [e.id, e])), [knowledge]);
  const pick = (ids: string[]) => ids.map((id) => byId.get(id)).filter((e): e is Entry => !!e);

  // Opening: focus the input, except on touch screens, where that would throw
  // the keyboard up over the panel before anything has been read
  useEffect(() => {
    if (!open) return;
    if (window.matchMedia?.('(pointer: coarse)').matches) panelRef.current?.focus();
    else inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Keep the start of the newest message in view: answers can be long
  useEffect(() => {
    const log = logRef.current;
    const last = log?.querySelector<HTMLElement>('[data-msg]:last-of-type');
    if (log && last) log.scrollTop = Math.max(0, last.offsetTop - 12);
  }, [messages, tab]);

  const respond = (question: string, make: () => Reply) => {
    setTab('chat');
    setMessages((m) => [...m, { id: nextId.current++, from: 'user', text: question }]);
    setThinking(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(
      () => {
        setThinking(false);
        setMessages((m) => [...m, { id: nextId.current++, from: 'bot', reply: make() }]);
      },
      reduced() ? 0 : THINK_MS
    );
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = draft.trim();
    if (!q || thinking) return;
    setDraft('');
    respond(q, () => ask(q, indexRef.current, pick(FALLBACKS)));
  };

  const openEntry = (entry: Entry) => respond(entry.title, () => ({ kind: 'answer', entry, related: [] }));

  const runAction = (a: ChatAction) => {
    if (a.kind === 'briefing') {
      onRequestBriefing();
      return;
    }
    if (a.kind === 'email') return; // a plain mailto link
    if (a.page !== currentPage) onNavigate(a.page);
    else if (!a.anchor) window.scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' });
    // On a phone the panel would cover what it just opened
    if (window.matchMedia?.('(max-width: 639px)').matches) onClose();
    const { anchor } = a;
    if (!anchor) return;
    // The page may still be loading: wait briefly for the section to exist
    const t0 = performance.now();
    const seek = () => {
      const el = document.getElementById(anchor);
      if (el) {
        el.scrollIntoView({
          behavior: reduced() ? 'auto' : 'smooth',
          block: el.classList.contains('omav-step') ? 'center' : 'start',
        });
      } else if (performance.now() - t0 < 4000) window.setTimeout(seek, 120);
    };
    window.setTimeout(seek, 80);
  };

  const ActionLink: React.FC<{ action: ChatAction }> = ({ action }) =>
    action.kind === 'email' ? (
      <a href={`mailto:${EMAIL}`} className="omav-chat-action">
        <Mail size={13} aria-hidden="true" />
        {action.label}
      </a>
    ) : (
      <button type="button" onClick={() => runAction(action)} className="omav-chat-action">
        {action.label}
        <ArrowRight size={13} aria-hidden="true" />
      </button>
    );

  const Chips: React.FC<{ entries: Entry[]; label?: string }> = ({ entries, label }) =>
    entries.length ? (
      <div className="mt-3">
        {label && <div className="mb-1.5 font-mono text-[10.5px] text-slate">{label}</div>}
        <div className="flex flex-wrap gap-1.5">
          {entries.map((e) => (
            <button key={e.id} type="button" onClick={() => openEntry(e)} className="omav-chat-chip">
              {e.title}
            </button>
          ))}
        </div>
      </div>
    ) : null;

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Ask OMAV, the site assistant"
      tabIndex={-1}
      hidden={!open}
      className="omav-chat-panel"
    >
      <header className="flex items-center gap-2.5 pl-3.5 pr-2 pt-3 pb-2.5">
        <BotMark size={34} thinking={thinking} />
        <div className="min-w-0 flex-1">
          <div className="text-[14.5px] leading-tight text-ice">Ask OMAV</div>
          <div className="mt-0.5 truncate font-mono text-[10.5px] text-slate">Answers from this website</div>
        </div>
        <button type="button" onClick={onClose} aria-label="Close the assistant" className="omav-chat-icon">
          <X size={17} aria-hidden="true" />
        </button>
      </header>

      <div role="tablist" aria-label="Assistant views" className="mx-3.5 grid grid-cols-2 gap-1 rounded-[10px] bg-ice/[0.05] p-1">
        {(['chat', 'faq'] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`h-8 rounded-[7px] text-[12.5px] transition-colors duration-150 cursor-pointer ${
              tab === t ? 'bg-ice text-abyss' : 'text-ice/65 hover:text-ice'
            }`}
          >
            {t === 'chat' ? 'Chat' : 'FAQs'}
          </button>
        ))}
      </div>

      {tab === 'chat' ? (
        <div ref={logRef} role="log" aria-live="polite" className="omav-chat-scroll relative flex-1 px-3.5 pt-3.5 pb-2">
          <div className="omav-chat-bot">
            <p className="text-[13.5px] leading-[1.55] text-ice/85">
              Hello. I can tell you about OMAV’s solutions, expertise, approach and founders. Ask in your own words, or
              pick a question.
            </p>
            <Chips entries={pick(STARTERS)} />
          </div>

          {messages.map((m) =>
            m.from === 'user' ? (
              <div key={m.id} data-msg className="omav-chat-user">
                {m.text}
              </div>
            ) : (
              <div key={m.id} data-msg className="omav-chat-bot">
                {m.reply.kind === 'smalltalk' && (
                  <p className="text-[13.5px] leading-[1.55] text-ice/85">{m.reply.text}</p>
                )}
                {m.reply.kind === 'answer' && (
                  <>
                    <Answer entry={m.reply.entry} />
                    {m.reply.entry.action && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <ActionLink action={m.reply.entry.action} />
                        {m.reply.entry.id === 'faq-contact' && <ActionLink action={briefing} />}
                      </div>
                    )}
                    <Chips entries={m.reply.related} label="Related" />
                  </>
                )}
                {m.reply.kind === 'none' && (
                  <>
                    <p className="text-[13.5px] leading-[1.55] text-ice/85">
                      I couldn’t find that on this website. Try different words, pick a topic below, or ask the team
                      directly.
                    </p>
                    <div className="mt-3">
                      <ActionLink action={{ kind: 'email', label: `Email ${EMAIL}` }} />
                    </div>
                    <Chips entries={m.reply.suggestions} />
                  </>
                )}
              </div>
            )
          )}

          {thinking && (
            <div className="omav-chat-typing" aria-label="Looking that up">
              <span />
              <span />
              <span />
            </div>
          )}
        </div>
      ) : (
        <div className="omav-chat-scroll flex-1 px-3.5 pt-3 pb-3">
          {FAQ_GROUPS.map((group) => {
            const on = openFaqGroup === group;
            return (
              <section key={group} className="border-b border-hairline">
                <h3>
                  <button
                    type="button"
                    aria-expanded={on}
                    onClick={() => setOpenFaqGroup(on ? null : group)}
                    className="flex w-full items-center justify-between gap-3 py-3 text-left text-[13.5px] text-ice cursor-pointer"
                  >
                    {group}
                    <ChevronDown
                      size={15}
                      aria-hidden="true"
                      className={`text-slate transition-transform duration-200 ${on ? 'rotate-180' : ''}`}
                    />
                  </button>
                </h3>
                {on && (
                  <ul className="grid gap-0.5 pb-2.5">
                    {FAQS.filter((f) => f.group === group).map((f) => (
                      <li key={f.id}>
                        <button
                          type="button"
                          onClick={() => openEntry(f)}
                          className="w-full rounded-[7px] px-2 py-2 text-left text-[13px] leading-[1.4] text-ice/70 hover:bg-ice/[0.05] hover:text-ice transition-colors duration-150 cursor-pointer"
                        >
                          {f.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}

      <form onSubmit={submit} className="px-3.5 pt-2 pb-3">
        <div className="flex items-center gap-1.5 rounded-[12px] bg-ice/[0.05] pl-3 pr-1.5 shadow-[inset_0_0_0_1px_rgb(220_228_238/0.12)] focus-within:shadow-[inset_0_0_0_1px_rgb(140_200_216/0.7)]">
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={300}
            placeholder="Ask about OMAV…"
            aria-label="Your question"
            autoComplete="off"
            className="omav-chat-input min-w-0 flex-1 h-11 bg-transparent text-ice placeholder:text-slate outline-none"
          />
          <button
            type="submit"
            disabled={!draft.trim() || thinking}
            aria-label="Send"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-[8px] bg-ice text-abyss cursor-pointer transition-opacity duration-150 disabled:opacity-30 disabled:cursor-default"
          >
            <ArrowUp size={15} aria-hidden="true" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPanel;
