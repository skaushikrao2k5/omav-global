import React, { useState } from 'react';
import { Cloud, Cpu, Database, Layers, Server, Smartphone } from 'lucide-react';
import { Bullet, Card, CtaBand, Mono, PageBackdrop, PageHero, Section } from '../components/page/PageParts';
import Galaxy from '../components/ui/Galaxy';
import RubberSegment from '../components/ui/RubberSegment';
import { fill, useContent } from '../content/content';

interface SolutionsPageProps {
  accentColor?: string;
  onRequestBriefing: () => void;
}

// Icons stay in code; the capability text comes from Sanity, in this order
const CAPABILITY_ICONS = [Layers, Cpu, Smartphone, Cloud, Server, Database];
const ALL = '__all__';

export const SolutionsPage: React.FC<SolutionsPageProps> = ({ onRequestBriefing }) => {
  const c = useContent().solutionsPage;
  const [filter, setFilter] = useState(ALL);
  const shown = c.platforms.items.filter((p) => filter === ALL || p.category === filter);
  const filterItems = [
    { value: ALL, label: c.platforms.allFilterLabel },
    ...c.platforms.filters.map((f) => ({ value: f.category, label: f.label })),
  ];

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
        meta={c.hero.tags}
      />

      <Section id="platforms" title={c.platforms.title} lede={c.platforms.lede}>
        <div className="-mx-5 px-5 overflow-x-auto pb-2 mb-8">
          <RubberSegment
            items={filterItems}
            value={filter}
            onChange={setFilter}
            equalSlots={false}
            aria-label="Filter platforms by category"
          />
        </div>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {shown.map((p, i) => (
            <Card key={`${i}-${p.title}`} as="article" className="flex flex-col">
              <Mono className="text-signal">{p.category}</Mono>
              <h3 className="mt-4 font-display text-[21px] leading-[1.2] text-ice">{p.title}</h3>
              <p className="mt-3 text-[15px] leading-[1.6] text-ice/65">{p.description}</p>
              <ul className="mt-6 space-y-2.5 text-[14px] text-ice/80">
                {p.deliverables.map((d) => (
                  <li key={d} className="flex gap-3">
                    <Bullet />
                    {d}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-6">
                <div className="pt-5 border-t border-hairline flex gap-3 text-[13.5px] leading-[1.5] text-ember">
                  <Bullet />
                  {p.impact}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section id="capabilities" title={c.capabilities.title} lede={c.capabilities.lede}>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 border-t border-l border-hairline">
          {c.capabilities.items.map(({ title, description }, i) => {
            const Icon = CAPABILITY_ICONS[i % CAPABILITY_ICONS.length];
            return (
              <li key={`${i}-${title}`} className="border-r border-b border-hairline p-7 sm:p-8">
                <Icon size={20} className="text-signal" aria-hidden="true" />
                <h3 className="mt-5 font-display text-[18px] text-ice">{title}</h3>
                <p className="mt-2.5 text-[14.5px] leading-[1.6] text-ice/60">{description}</p>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section id="delivery" title={c.delivery.title} lede={c.delivery.lede}>
        <ol className="grid lg:grid-cols-3 gap-5">
          {c.delivery.phases.map((phase, i) => (
            <li key={`${i}-${phase.name}`} className="relative">
              <Card className="h-full">
                <div className="flex items-center gap-3 font-mono text-[12px]">
                  <span className="text-signal">0{i + 1}</span>
                  <span className="h-px flex-1 bg-hairline" aria-hidden="true" />
                  <span className="text-slate">
                    {fill(c.delivery.phaseLabel, { n: i + 1, total: c.delivery.phases.length })}
                  </span>
                </div>
                <h3 className="mt-6 font-display text-[22px] text-ice">{phase.name}</h3>
                <p className="mt-3 text-[15px] leading-[1.6] text-ice/65">{phase.description}</p>
                <ul className="mt-6 pt-5 border-t border-hairline space-y-2.5 text-[14px] text-ice/80">
                  {phase.points.map((pt) => (
                    <li key={pt} className="flex gap-3">
                      <Bullet />
                      {pt}
                    </li>
                  ))}
                </ul>
              </Card>
            </li>
          ))}
        </ol>
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
