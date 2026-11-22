import React from 'react';
import { Card, CtaBand, Mono, PageBackdrop, PageHero, Section } from '../components/page/PageParts';
import Galaxy from '../components/ui/Galaxy';
import CardSwap, { Card as SwapCard, type CardSwapHandle } from '../components/ui/CardSwap';
import { useContent, type SiteContent } from '../content/content';

interface AboutPageProps {
  accentColor?: string;
  onRequestBriefing: () => void;
}

type About = SiteContent['aboutPage'];
type Founder = About['founders']['people'][number];
const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('');

const FounderCard: React.FC<{ f: Founder; role: string; className?: string }> = ({ f, role, className = '' }) => (
  <Card as="article" className={`!p-8 sm:!p-10 h-full ${className}`}>
    <div className="flex items-start justify-between gap-4">
      <div>
        <h3 className="font-display text-[26px] sm:text-[30px] leading-tight text-ice">{f.name}</h3>
        <Mono className="mt-2">{role}</Mono>
      </div>
      <span
        aria-hidden="true"
        className="grid place-items-center w-12 h-12 rounded-full font-display text-[15px] text-abyss bg-ice shrink-0"
      >
        {initials(f.name)}
      </span>
    </div>
    <div className="mt-6 pb-6 border-b border-hairline font-mono text-[11.5px] text-signal">{f.focus}</div>
    <div className="mt-6 space-y-4 text-[15.5px] leading-[1.7] text-ice/72">
      {f.bio.map((para, i) => (
        <p key={i}>{para}</p>
      ))}
    </div>
  </Card>
);

// Side by side on wide screens. On phones the two founders share one row of
// equal tabs and one swipeable track, so neither sits above the other.
const Founders: React.FC<{ people: Founder[]; role: string }> = ({ people: FOUNDERS, role }) => {
  const trackRef = React.useRef<HTMLDivElement | null>(null);
  const [current, setCurrent] = React.useState(0);

  const go = (i: number) => {
    const t = trackRef.current;
    const card = t?.children[i] as HTMLElement | undefined;
    if (t && card) t.scrollTo({ left: card.offsetLeft - t.offsetLeft, behavior: 'smooth' });
  };

  const onScroll = () => {
    const t = trackRef.current;
    if (!t) return;
    const i = Math.round(t.scrollLeft / Math.max(1, t.scrollWidth - t.clientWidth));
    if (i !== current) setCurrent(i);
  };

  return (
    <>
      <div className="hidden lg:grid lg:grid-cols-2 gap-5">
        {FOUNDERS.map((f) => (
          <FounderCard key={f.name} f={f} role={role} />
        ))}
      </div>

      <div className="lg:hidden">
        <div role="tablist" aria-label="Founders" className="grid grid-cols-2 gap-2 p-1.5 rounded-[14px] bg-ice/[0.04] shadow-[inset_0_0_0_1px_rgb(220_228_238/0.1)]">
          {FOUNDERS.map((f, i) => (
            <button
              key={f.name}
              type="button"
              role="tab"
              aria-selected={current === i}
              onClick={() => go(i)}
              className={`flex items-center justify-center gap-2.5 h-12 rounded-[10px] text-[14px] transition-[background-color,color] duration-300 cursor-pointer ${
                current === i ? 'bg-ice text-abyss' : 'text-ice/70'
              }`}
            >
              <span
                aria-hidden="true"
                className={`grid place-items-center w-7 h-7 rounded-full font-display text-[11px] transition-colors duration-300 ${
                  current === i ? 'bg-abyss text-ice' : 'bg-ice/10 text-ice'
                }`}
              >
                {initials(f.name)}
              </span>
              {f.name.split(' ')[0]}
            </button>
          ))}
        </div>
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="omav-founders mt-5 -mx-5 sm:-mx-8 px-5 sm:px-8 flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-px-5 sm:scroll-px-8"
        >
          {FOUNDERS.map((f) => (
            <div key={f.name} className="snap-start shrink-0 w-[88%] sm:w-[80%]">
              <FounderCard f={f} role={role} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

// Recognition as a stack of cards, one per milestone, with the years beside it
// as an index that follows the front card and jumps to any other
const Milestones: React.FC<{ items: About['recognition']['milestones']; cardLabel: string }> = ({ items: MILESTONES, cardLabel }) => {
  const swapRef = React.useRef<CardSwapHandle | null>(null);
  const [front, setFront] = React.useState(0);

  return (
    <div className="grid lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] gap-10 lg:gap-16 items-center">
      <ol className="order-2 lg:order-1 grid gap-1">
        {MILESTONES.map((m, i) => (
          <li key={`${i}-${m.year}`}>
            <button
              type="button"
              onClick={() => swapRef.current?.goTo(i)}
              aria-current={front === i ? 'true' : undefined}
              className={`group w-full grid grid-cols-[64px_minmax(0,1fr)] items-baseline gap-4 rounded-[10px] px-4 py-3.5 text-left transition-[background-color,color] duration-300 cursor-pointer ${
                front === i ? 'bg-ice/[0.06]' : 'hover:bg-ice/[0.03]'
              }`}
            >
              <span className={`font-mono text-[13px] transition-colors duration-300 ${front === i ? 'text-signal' : 'text-slate'}`}>
                {m.year}
              </span>
              <span
                className={`text-[15.5px] leading-[1.35] transition-colors duration-300 ${
                  front === i ? 'text-ice' : 'text-ice/55 group-hover:text-ice/80'
                }`}
              >
                {m.title}
              </span>
            </button>
          </li>
        ))}
      </ol>

      <div className="order-1 lg:order-2 h-[300px] sm:h-[440px] lg:h-[500px]">
        <CardSwap
          ref={swapRef}
          theme="omav"
          width={480}
          height={330}
          cardDistance={56}
          verticalDistance={62}
          depth={90}
          skewAmount={5}
          visibleCards={4}
          cardRadius={18}
          delay={5000}
          speed={1}
          bounce={0.3}
          parallax={0.4}
          hoverSpread={0.1}
          dim={0.55}
          autoplay
          pauseOnHover
          draggable
          onChange={setFront}
          ariaLabel="Recognition and public impact"
        >
          {MILESTONES.map((m, i) => (
            <SwapCard key={`${i}-${m.year}`}>
              <article className="flex h-full flex-col p-7 sm:p-8">
                <div className="flex items-center justify-between font-mono text-[11.5px] text-slate">
                  <span>
                    <span className="text-signal">{String(i + 1).padStart(2, '0')}</span> / {String(MILESTONES.length).padStart(2, '0')}
                  </span>
                  <span>{cardLabel}</span>
                </div>
                <div className="mt-4 font-display text-[40px] leading-none text-signal">{m.year}</div>
                <h3 className="mt-3 font-display text-[20px] leading-[1.25] text-ice">{m.title}</h3>
                <p className="mt-auto pt-3 text-[14px] leading-[1.55] text-ice/65">{m.detail}</p>
              </article>
            </SwapCard>
          ))}
        </CardSwap>
      </div>
    </div>
  );
};

export const AboutPage: React.FC<AboutPageProps> = ({ onRequestBriefing }) => {
  const c = useContent().aboutPage;
  return (
  <div className="relative text-ice">
      <PageBackdrop>
        <Galaxy
          density={1}
          glowIntensity={0.3}
          flareIntensity={1}
          starSpeed={0.5}
          mouseRepulsion
          clickWarp
          starColors={[]}
          hueShift={140}
          saturation={0}
          starSize={1}
          twinkleIntensity={0.3}
          speed={1}
          rotationSpeed={0.1}
          layers={4}
          direction="forward"
          repulsionStrength={2}
          mouseInteraction
          intro
          lightMode={false}
          dpr={1}
        />
      </PageBackdrop>
<div className="relative z-[1]">
    <PageHero
      tunnel={false}
      title={c.hero.title}
      lede={c.hero.lede}
      aside={
        <figure className="flex flex-col items-center text-center">
          {/* The dark logo as supplied: transparent, directly on the galaxy */}
          <img
            src="/logo-dark.svg"
            alt="The OMAV logo: a striped globe with a blue centre, wings and a pen nib, the word OMAV, and the motto अधिकाराणां कृते"
            width={290}
            height={278}
            className="w-[min(300px,72vw)] h-auto"
          />
          <figcaption className="mt-8">
            <Mono className="text-signal">{c.hero.mottoTitle}</Mono>
            <p className="mt-3 max-w-[340px] text-[15px] leading-[1.6] text-ice/75 [text-shadow:0_2px_18px_rgb(5_7_11/0.9)]">
              {c.hero.mottoBody}
            </p>
          </figcaption>
        </figure>
      }
    />

    <Section id="founders" title={c.founders.title} lede={c.founders.lede}>
      <Founders people={c.founders.people} role={c.founders.roleLabel} />
    </Section>
    <Section id="recognition" title={c.recognition.title} lede={c.recognition.lede}>
      <Milestones items={c.recognition.milestones} cardLabel={c.recognition.cardLabel} />
    </Section>

    <CtaBand
      title={c.cta.title}
      body={c.cta.body}
      action={c.cta.button}
      onAction={onRequestBriefing}
    />
  </div>
</div>
  );
};
