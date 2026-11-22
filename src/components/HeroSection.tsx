import React from 'react';
import TextType from './ui/TextType';
import { useContent } from '../content/content';

interface HeroSectionProps {
  onExplore: () => void;
  onRequestBriefing: () => void;
  accentColor?: string;
}

// The tagline types itself out on the intro's first frames: line one, then line
// two, with the cursor handing over between them and resting after the second.
// Both lines are edited in Sanity (Home page > Hero).
const TYPE_MS = 52;
const START_MS = 350;
const GAP_MS = 260;
const timing = (line1: string, line2: string) => {
  const line2At = START_MS + line1.length * TYPE_MS + GAP_MS;
  return { line2At, doneAt: line2At + line2.length * TYPE_MS };
};

// A ghost copy of the full line holds the final size, so nothing below the
// headline shifts while it types
const TypedLine: React.FC<{ text: string; delay: number; active: boolean; cursor: boolean; className: string }> = ({
  text,
  delay,
  active,
  cursor,
  className,
}) => (
  <span className={`grid ${className}`}>
    <span className="invisible col-start-1 row-start-1" aria-hidden="true">
      {text}
    </span>
    {active && (
    <TextType
      as="span"
      text={text}
      loop={false}
      typingSpeed={TYPE_MS}
      initialDelay={delay}
      typeEffect="blur"
      showCursor={cursor}
      cursorStyle="underscore"
      cursorGlide
      cursorColor="#8CC8D8"
      cursorBlinkDuration={0.55}
      className="col-start-1 row-start-1"
    />
    )}
  </span>
);

export const HeroSection: React.FC<HeroSectionProps> = () => {
  const reveal = (delay: string) =>
    ({ 'data-intro-reveal': true, style: { '--intro-delay': delay } as React.CSSProperties }) as const;

  const hero = useContent().homePage.hero;
  // Timed from the text present when the hero mounts
  const [{ line2At, doneAt }] = React.useState(() => timing(hero.line1, hero.line2));

  // 0: typing line one, 1: typing line two, 2: done, 3: cursor rested away
  const [phase, setPhase] = React.useState(0);
  React.useEffect(() => {
    const t = [
      window.setTimeout(() => setPhase(1), line2At),
      window.setTimeout(() => setPhase(2), doneAt),
      window.setTimeout(() => setPhase(3), doneAt + 4200),
    ];
    return () => t.forEach((id) => window.clearTimeout(id));
  }, [line2At, doneAt]);

  return (
    <div className="omav-hero-copy min-h-screen min-h-[100svh] relative flex items-center pt-28 pb-20 max-md:items-start max-md:pt-[104px]">
      <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-14">
        <div className="max-w-[min(720px,52vw)] max-md:max-w-none pointer-events-auto">
          <h1
            aria-label={`${hero.line1} ${hero.line2}`}
            className="m-0 uppercase text-[clamp(28px,8.4vw,40px)] md:text-[clamp(34px,4.3vw,64px)] leading-[1.02] tracking-[-0.02em]"
          >
            <span aria-hidden="true">
              <TypedLine text={hero.line1} delay={START_MS} active cursor={phase === 0} className="text-ice" />
              <TypedLine
                text={hero.line2}
                delay={0}
                active={phase >= 1}
                cursor={phase === 1 || phase === 2}
                className="mt-2 text-slate"
              />
            </span>
            <span
              aria-hidden="true"
              style={{ animationDelay: `${doneAt / 1000}s` }}
              className="omav-hero-rule block mt-6 max-md:mt-5 h-px w-[min(220px,40%)] bg-gradient-to-r from-signal/80 via-ice/30 to-transparent"
            />
          </h1>

          <p
            {...reveal('0.15s')}
            className="mt-6 max-w-[420px] text-[15.5px] sm:text-[16px] leading-[1.65] text-ice/65"
          >
            {hero.subtitle}
          </p>

          {/* Instrument readout: what the globe is showing */}
          <div
            {...reveal('0.4s')}
            className="mt-10 max-md:mt-6 font-mono text-[11.5px] leading-[1.6] text-slate"
          >
            {hero.liveLayerLabel} <span className="text-ice/80">{hero.liveLayerValue}</span> {hero.liveLayerSource}
          </div>
        </div>
      </div>

      <div
        aria-hidden="true"
        {...reveal('1s')}
        className="absolute left-5 sm:left-8 lg:left-14 bottom-8 hidden sm:flex items-center gap-3 font-mono text-[11px] text-slate select-none"
      >
        <span className="block w-9 h-px bg-slate/70 animate-omav-cue" />
        {hero.scrollCue}
      </div>
    </div>
  );
};
