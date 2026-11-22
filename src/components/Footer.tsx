import React from 'react';
import { OmavLockup } from './OmavMark';
import { ArrowUp } from 'lucide-react';
import { useContent } from '../content/content';

interface FooterProps {
  onNavigate?: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const f = useContent().siteSettings.footer;
  const links: [string, string][] = [
    ['home', f.homeLink],
    ['solutions', f.solutionsLink],
    ['expertise', f.expertiseLink],
    ['approach', f.approachLink],
    ['about', f.aboutLink],
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNav = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="relative z-10 bg-[#05070B] border-t border-[#DCE4EE]/8 py-10 sm:py-12">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-14 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
        {/* Brand & Copyright */}
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-5">
          <OmavLockup size="sm" />
          <span className="text-xs text-[#8C96A6] text-center md:text-left">{f.copyright}</span>
        </div>

        {/* Navigation links */}
        <nav
          aria-label="Footer"
          className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs font-medium text-[#AEB7C3]"
        >
          {links.map(([page, label]) => (
            <button
              key={page}
              onClick={() => handleNav(page)}
              className="hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer text-[#AEB7C3]"
            >
              {label}
            </button>
          ))}
          <button
            onClick={scrollToTop}
            className="hover:text-white inline-flex items-center gap-1 transition-colors cursor-pointer text-[#8CC8D8] bg-transparent border-none p-0"
          >
            <span>{f.backToTop}</span>
            <ArrowUp size={12} />
          </button>
        </nav>
      </div>
    </footer>
  );
};
