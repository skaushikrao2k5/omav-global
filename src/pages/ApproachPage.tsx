import React from 'react';
import { CtaBand, Mono, PageBackdrop, PageHero, Section } from '../components/page/PageParts';
import LightRays from '../components/ui/LightRays';
import { useContent } from '../content/content';

interface ApproachPageProps {
  accentColor?: string;
  onRequestBriefing: () => void;
}

export const ApproachPage: React.FC<ApproachPageProps> = ({ onRequestBriefing }) => {
  const c = useContent().approachPage;
  return (
  <div className="relative text-ice">
    <PageBackdrop>
      <LightRays
        raysOrigin="top-center"
        raysColor="#ffffff"
        raysSpeed={1}
        lightSpread={0.5}
        rayLength={3}
        glow={0.6}
        haze={0.25}
        followMouse
        mouseInfluence={0.1}
        rayDensity={1}
        tilt={0}
        raySharpness={0.35}
        atmosphere={1}
        intensity={1}
        fadeDistance={1}
        saturation={1}
        noiseAmount={0}
        distortion={0}
        pulsating={false}
        cursorShadow
        clickPulse
        intro
        lightMode={false}
        maxDevicePixelRatio={1}
      />
    </PageBackdrop>
<div className="relative z-[1]">
    <PageHero
      tunnel={false}
      title={c.hero.title}
      lede={c.hero.lede}
      meta={c.hero.tags}
    />

    <Section id="pillars" title={c.pillars.title} lede={c.pillars.lede}>
      {/* No boxes: the pillars float in the light falling from above */}
      <div className="grid md:grid-cols-2 gap-x-16 gap-y-16 sm:gap-y-20">
        {c.pillars.items.map((p, i) => (
          <div key={`${i}-${p.title}`} className="omav-lit flex flex-col">
            <Mono className="text-signal">0{i + 1}</Mono>
            <h3 className="mt-5 uppercase text-[clamp(26px,2.6vw,38px)] leading-[1] tracking-[-0.02em] text-ice">{p.title}</h3>
            <p className="mt-5 max-w-[460px] text-[17px] leading-[1.6] text-ice/80">{p.text}</p>
            <p className="mt-6 max-w-[460px] text-[14px] leading-[1.55] text-ice/55">{p.detail}</p>
          </div>
        ))}
      </div>
    </Section>

    <Section id="standards" title={c.standards.title} lede={c.standards.lede}>
      <ul className="border-t border-hairline">
        {c.standards.items.map((s, i) => (
          <li
            key={`${i}-${s.title}`}
            className="grid md:grid-cols-[48px_minmax(0,4fr)_minmax(0,7fr)] gap-x-8 gap-y-3 py-8 sm:py-10 border-b border-hairline"
          >
            <span className="font-mono text-[12px] text-signal pt-1.5">0{i + 1}</span>
            <h3 className="font-display text-[20px] sm:text-[22px] leading-[1.2] text-ice">{s.title}</h3>
            <p className="text-[16px] leading-[1.65] text-ice/65 max-w-[640px]">{s.description}</p>
          </li>
        ))}
      </ul>
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
