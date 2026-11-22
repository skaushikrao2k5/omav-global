import React, { useState } from 'react';
import { Card, CtaBand, Mono, PageHero, Section } from '../components/page/PageParts';
import { useContent } from '../content/content';

interface ExpertisePageProps {
  accentColor?: string;
  onRequestBriefing: () => void;
}

export const ExpertisePage: React.FC<ExpertisePageProps> = ({ onRequestBriefing }) => {
  const c = useContent().expertisePage;
  const PRACTICES = c.practices.items;
  const [active, setActive] = useState(0);
  const p = PRACTICES[Math.min(active, PRACTICES.length - 1)];
  const two = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="relative bg-abyss text-ice">
      <PageHero
        title={c.hero.title}
        lede={c.hero.lede}
        meta={c.hero.tags}
      />

      <Section id="practices" title={c.practices.title} lede={c.practices.lede}>
        <div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-8 lg:gap-12 items-start">
          {/* Index */}
          <ol className="border-t border-hairline" role="tablist" aria-label="Practices">
            {PRACTICES.map((item, i) => {
              const on = i === active;
              return (
                <li key={`${i}-${item.title}`} className="border-b border-hairline">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={on}
                    aria-controls="practice-panel"
                    onClick={() => setActive(i)}
                    className={`group w-full grid grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-4 py-5 text-left cursor-pointer rounded-[7px] transition-colors duration-150 ${
                      on ? 'text-ice' : 'text-ice/55 hover:text-ice'
                    }`}
                  >
                    <span className={`font-mono text-[12px] ${on ? 'text-signal' : 'text-slate'}`}>0{i + 1}</span>
                    <span className="font-display text-[17px] sm:text-[19px] leading-tight">{item.title}</span>
                    <span
                      aria-hidden="true"
                      className={`w-2 h-2 rounded-full transition-[background-color,transform] duration-200 ${
                        on ? 'bg-signal scale-100' : 'bg-ice/15 scale-75 group-hover:bg-ice/40'
                      }`}
                    />
                  </button>
                </li>
              );
            })}
          </ol>

          {/* Detail */}
          <div id="practice-panel" role="tabpanel" aria-live="polite" className="lg:sticky lg:top-28">
            <Card key={active} className="omav-pop">
              <Mono className="text-signal">
                {c.practices.practiceLabel} {two(active + 1)} / {two(PRACTICES.length)}
              </Mono>
              <h3 className="mt-4 font-display text-[clamp(22px,2.2vw,30px)] leading-[1.15] text-ice">{p.title}</h3>
              <p className="mt-4 text-[16px] leading-[1.65] text-ice/75">{p.summary}</p>

              <ul className="mt-7 flex flex-wrap gap-2">
                {p.domains.map((d) => (
                  <li key={d} className="px-3 h-8 inline-flex items-center rounded-[8px] bg-ice/[0.05] text-[13px] text-ice/80">
                    {d}
                  </li>
                ))}
              </ul>

              <dl className="mt-8 grid sm:grid-cols-2 gap-6 pt-7 border-t border-hairline">
                <div>
                  <dt className="font-mono text-[11.5px] text-slate">{c.practices.methodologyLabel}</dt>
                  <dd className="mt-2 text-[14.5px] leading-[1.6] text-ice/80">{p.methodology}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[11.5px] text-slate">{c.practices.benefitLabel}</dt>
                  <dd className="mt-2 text-[14.5px] leading-[1.6] text-ember">{p.clientBenefit}</dd>
                </div>
              </dl>
            </Card>
          </div>
        </div>
      </Section>

      <CtaBand
        title={c.cta.title}
        body={c.cta.body}
        action={c.cta.button}
        onAction={onRequestBriefing}
      />
    </div>
  );
};
