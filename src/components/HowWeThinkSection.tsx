import React from 'react';
import { useContent } from '../content/content';

interface HowWeThinkSectionProps {
  accentColor?: string;
}

// Each scene's key explains what the globe is showing at that moment
type KeyMark = { shape: 'dot' | 'square' | 'diamond' | 'line' | 'ring'; tone: 'signal' | 'ember' | 'ice'; label: string };

// Text sits opposite the globe, which alternates left / right per scene
const TEXT_RIGHT = [true, false, true, false, true];

const TONE: Record<KeyMark['tone'], string> = {
  signal: 'var(--color-signal)',
  ember: 'var(--color-ember)',
  ice: 'var(--color-ice)',
};

function Mark({ shape, tone }: Pick<KeyMark, 'shape' | 'tone'>) {
  const c = TONE[tone];
  if (shape === 'line') return <span className="block w-4 h-px" style={{ background: c }} />;
  if (shape === 'ring') return <span className="block w-2.5 h-2.5 rounded-full" style={{ boxShadow: `inset 0 0 0 1px ${c}` }} />;
  if (shape === 'square') return <span className="block w-2 h-2" style={{ background: c }} />;
  if (shape === 'diamond') return <span className="block w-2 h-2 rotate-45" style={{ background: c }} />;
  return <span className="block w-2 h-2 rounded-full" style={{ background: c }} />;
}

// The cursor lights the glass from wherever it is over the card
const lightGlass = (e: React.PointerEvent<HTMLDivElement>) => {
  if (e.pointerType !== 'mouse') return;
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty('--mx', `${e.clientX - r.left}px`);
  el.style.setProperty('--my', `${e.clientY - r.top}px`);
  el.style.setProperty('--glow', '1');
};
const dimGlass = (e: React.PointerEvent<HTMLDivElement>) => e.currentTarget.style.setProperty('--glow', '0');

// The globe's five scenes are keyed to these section ids, whatever the text says
const SCENE_IDS = ['data', 'intelligence', 'understanding', 'strategy', 'impact'];

export const HowWeThinkSection: React.FC<HowWeThinkSectionProps> = () => {
  const story = useContent().homePage.story;
  const STEPS = story.steps.slice(0, 5).map((s, i) => ({
    ...s,
    id: SCENE_IDS[i],
    marks: s.marks as KeyMark[],
  }));
  return (
    <div className="relative">
      <div id="how" className="min-h-[80vh] flex items-center">
        <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-14">
          <div className="max-w-[560px] pointer-events-auto">
            <h2 className="text-[clamp(28px,3.2vw,46px)] leading-[1.05] text-ice">
              {story.title}
            </h2>
            <p className="mt-5 max-w-[480px] text-[17px] leading-[1.6] text-ice/70">{story.intro}</p>
            <ol className="mt-8 flex flex-wrap gap-x-5 gap-y-2 max-sm:gap-x-2 max-sm:gap-y-2 font-mono text-[11.5px] text-slate">
              {STEPS.map((s, i) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="hover:text-ice transition-colors duration-150 rounded-[4px] max-sm:inline-flex max-sm:items-center max-sm:min-h-9 max-sm:px-3 max-sm:rounded-full max-sm:bg-ice/[0.04] max-sm:shadow-[inset_0_0_0_1px_rgb(233_237_243/0.1)]"
                  >
                    <span className="text-signal">0{i + 1}</span> {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {STEPS.map((step, i) => (
        <section
          key={step.id}
          id={step.id}
          aria-labelledby={`${step.id}-title`}
          className="omav-step min-h-[115vh] flex items-center max-lg:items-start max-lg:pt-[16vh]"
        >
          <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-14">
            <div
              onPointerMove={lightGlass}
              onPointerLeave={dimGlass}
              className={`omav-glass max-w-[540px] pointer-events-auto ${TEXT_RIGHT[i] ? 'lg:ml-auto' : ''}`}
            >
              <div className="flex items-center gap-3 font-mono text-[12px]">
                <span className="text-signal">0{i + 1}</span>
                <span className="h-px flex-1 max-w-[120px] bg-hairline" aria-hidden="true" />
                <span className="text-slate">05</span>
              </div>
              <h3
                id={`${step.id}-title`}
                className="mt-5 uppercase text-[clamp(26px,7.4vw,40px)] lg:text-[clamp(34px,2.9vw,46px)] leading-[0.95] tracking-[-0.02em] text-ice"
              >
                {step.title}
              </h3>
              <p className="mt-6 text-[17px] sm:text-[18px] leading-[1.6] text-ice/75">{step.body}</p>

              <div className="reticle mt-8 px-4 py-3.5">
                <div className="font-mono text-[11px] text-slate">{step.keyTitle}</div>
                <ul className="mt-2.5 flex flex-wrap gap-x-5 gap-y-2 text-[12.5px] text-ice/80">
                  {step.marks.map((m) => (
                    <li key={m.label} className="flex items-center gap-2">
                      <Mark shape={m.shape} tone={m.tone} />
                      {m.label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      ))}

      <div className="h-[40vh]" />
    </div>
  );
};
