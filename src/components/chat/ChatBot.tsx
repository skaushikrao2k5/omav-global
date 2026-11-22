import React, { Suspense, lazy, useEffect, useId, useRef, useState } from 'react';
import { ErrorBoundary } from '../ErrorBoundary';
import { OmavLockup } from '../OmavMark';

// The floating assistant. Only this launcher loads with the page: the panel and
// everything it knows arrive when someone hovers or opens it.
const loadPanel = () => import('./ChatPanel');
const ChatPanel = lazy(loadPanel);

// A small character drawn from the OMAV emblem: the banded globe, the wings, and
// the blue centre as its eye, which rests, blinks and glows while it thinks
export const BotMark: React.FC<{ size?: number; thinking?: boolean }> = ({ size = 36, thinking = false }) => {
  const id = useId().replace(/:/g, '');
  return (
    <svg
      viewBox="-150 -104 300 218"
      width={size}
      height={(size * 218) / 300}
      aria-hidden="true"
      className={`omav-bot-mark ${thinking ? 'is-thinking' : ''}`}
    >
      <defs>
        <clipPath id={`${id}d`}>
          <circle r="100" />
        </clipPath>
        <linearGradient id={`${id}b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F4F6F9" />
          <stop offset="1" stopColor="#A3ACB9" />
        </linearGradient>
        <radialGradient id={`${id}e`}>
          <stop offset="0" stopColor="#8090F0" />
          <stop offset="0.55" stopColor="#3A48B6" />
          <stop offset="1" stopColor="#171D5E" />
        </radialGradient>
      </defs>
      <g clipPath={`url(#${id}d)`}>
        <rect x="-100" y="-100" width="200" height="24" fill={`url(#${id}b)`} />
        <rect x="-100" y="-68" width="200" height="26" fill={`url(#${id}b)`} />
        <rect x="-100" y="-36" width="200" height="24" fill={`url(#${id}b)`} />
        <rect x="-100" y="-6" width="200" height="20" fill={`url(#${id}b)`} />
        <rect x="-100" y="58" width="200" height="42" fill="#626B79" />
      </g>
      <circle r="24" fill="#05070B" />
      <circle className="omav-bot-eye" r="20" fill={`url(#${id}e)`} stroke="#E4E8EE" strokeWidth="3" />
      <path
        d="M -143 25 C -128 12 -108 6 -88 6 C -58 6 -22 30 0 57 C 22 30 58 6 88 6 C 108 6 128 12 143 25 C 126 22 108 25 92 27 C 60 31 28 52 7.5 80 L -7.5 80 C -28 52 -60 31 -92 27 C -108 25 -126 22 -143 25 Z"
        fill="#DDE2E9"
        stroke="#05070B"
        strokeWidth="3"
      />
      <path d="M -6 84 L 6 84 L 0 100 Z" fill="#DDE2E9" />
    </svg>
  );
};

export const ChatBot: React.FC<{
  currentPage: string;
  onNavigate: (page: string) => void;
  onRequestBriefing: () => void;
}> = ({ currentPage, onNavigate, onRequestBriefing }) => {
  const [open, setOpen] = useState(false);
  const [everOpened, setEverOpened] = useState(false);
  const [raised, setRaised] = useState(false);
  const launcherRef = useRef<HTMLButtonElement | null>(null);

  // On phones the hero globe's dock sits at this corner: stand above it until
  // the story takes over and the dock has gone
  useEffect(() => {
    if (currentPage !== 'home') {
      setRaised(false);
      return;
    }
    const onScroll = () => setRaised(window.scrollY < (window.innerHeight || 1) * 0.03);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [currentPage]);

  const show = () => {
    setEverOpened(true);
    setOpen(true);
  };
  const close = () => {
    setOpen(false);
    // Back to the launcher, once it has been unhidden
    requestAnimationFrame(() => launcherRef.current?.focus());
  };

  return (
    <div className={`omav-chat ${raised ? 'is-raised' : ''}`}>
      {everOpened && (
        <ErrorBoundary>
          <Suspense fallback={null}>
            <ChatPanel
              open={open}
              currentPage={currentPage}
              onClose={close}
              onNavigate={onNavigate}
              onRequestBriefing={() => {
                setOpen(false);
                onRequestBriefing();
              }}
            />
          </Suspense>
        </ErrorBoundary>
      )}
      <button
        ref={launcherRef}
        type="button"
        data-intro-reveal="fade"
        style={{ '--intro-delay': '1.6s' } as React.CSSProperties}
        hidden={open}
        onClick={show}
        onPointerEnter={loadPanel}
        onFocus={loadPanel}
        aria-label="Ask OMAV: open the site assistant"
        className="omav-chat-launcher"
      >
        <OmavLockup size="chat" />
        <span className="omav-chat-tip" aria-hidden="true">
          Ask OMAV
        </span>
      </button>
    </div>
  );
};
