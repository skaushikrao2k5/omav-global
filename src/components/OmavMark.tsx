import React from 'react';

// The OMAV emblem, cut from the master logo artwork (public/omav-logo-full.png)
// with a transparent background. Aspect 364 x 276.
export const EMBLEM_SRC = '/omav-emblem.png';
const EMBLEM_RATIO = 276 / 364;

interface OmavMarkProps {
  width?: number;
  className?: string;
}

export const OmavMark: React.FC<OmavMarkProps> = ({ width = 46, className = '' }) => (
  <img
    src={EMBLEM_SRC}
    width={width}
    height={Math.round(width * EMBLEM_RATIO)}
    alt=""
    aria-hidden="true"
    draggable={false}
    decoding="async"
    className={`block select-none ${className}`}
  />
);

// The full logo, as on the mark artwork: emblem, OMAV, and the motto beneath.
// Every place the brand appears uses this, at one of a few fixed sizes.
const LOCKUP = {
  chat: { w: 40, word: 10, motto: 7.5, gap: 2 },
  nav: { w: 48, word: 12.5, motto: 9.5, gap: 3 },
  sm: { w: 54, word: 13, motto: 10.5, gap: 4 },
  md: { w: 66, word: 15, motto: 12, gap: 5 },
};

export const OmavLockup: React.FC<{
  size?: keyof typeof LOCKUP;
  className?: string;
  idPrefix?: string;
}> = ({ size = 'sm', className = '' }) => {
  const s = LOCKUP[size];
  return (
    <span className={`omav-lockup inline-flex flex-col items-center leading-none ${className}`}>
      <OmavMark width={s.w} />
      <span
        className="font-jost text-ice tracking-[0.2em] pl-[0.2em]"
        style={{ fontSize: s.word, marginTop: s.gap }}
      >
        OMAV
      </span>
      <span lang="sa" className="font-sanskrit text-ice/75 whitespace-nowrap" style={{ fontSize: s.motto, marginTop: s.gap }}>
        ॥ अधिकाराणां कृते ॥
      </span>
    </span>
  );
};
