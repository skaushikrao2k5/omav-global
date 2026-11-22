import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { OmavLockup } from './OmavMark';
import PillNav from './ui/PillNav';
import { GestureToggle } from './GestureControl';
import { useContent } from '../content/content';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onRequestBriefing: () => void;
}

const NAV_PAGES = ['home', 'solutions', 'expertise', 'approach', 'about'] as const;

// PillNav renders plain anchors; route their clicks through the app instead
const navTarget: { go: ((page: string) => void) | null } = { go: null };
const NavAnchor = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(
  ({ href, onClick, ...rest }, ref) => (
    <a
      ref={ref}
      href={href}
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented && href?.startsWith('#') && navTarget.go) {
          e.preventDefault();
          navTarget.go(href.slice(1));
        }
      }}
    />
  )
);
NavAnchor.displayName = 'NavAnchor';

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate, onRequestBriefing }) => {
  const nav = useContent().siteSettings.navigation;
  const navItems = React.useMemo(
    () => NAV_PAGES.map((page) => ({ label: nav[page], href: `#${page}` })),
    [nav]
  );
  navTarget.go = (page) => {
    onNavigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Phones: once the page moves, the bar frosts over so copy never runs under the logo
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  return (
    <header className={`omav-header fixed top-0 left-0 right-0 z-50 ${scrolled ? 'is-scrolled' : ''}`}>
      <div
        aria-hidden="true"
        className="absolute inset-0 h-[110px] max-md:h-[92px] bg-gradient-to-b from-abyss/85 via-abyss/45 to-transparent pointer-events-none"
      />
      <div aria-hidden="true" className="omav-header-frost absolute inset-x-0 top-0 h-[72px] pointer-events-none md:hidden" />
      <div className="relative max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-14 h-[84px] max-md:h-[72px] flex items-center justify-between gap-3 sm:gap-4">
        {/* Logo and Contact are on screen from the first frame of the intro */}
        <NavAnchor
          href="#home"
          aria-label="OMAV, home"
          data-intro-early
          style={{ '--intro-delay': '0.1s' } as React.CSSProperties}
          className="omav-nav-brand shrink-0 rounded-[8px]"
        >
          <OmavLockup size="nav" />
        </NavAnchor>
        <div
          data-intro-reveal="fade"
          style={{ '--intro-delay': '0.1s' } as React.CSSProperties}
          className="min-w-0 flex-1"
        >
          <PillNav
            items={navItems}
            activeHref={`#${currentPage}`}
            linkComponent={NavAnchor}
            itemStyle="pill"
            hoverEffect="fill"
            indicator="dot"
            layout="split"
            surface="glass"
            size="md"
            bounce={0.3}
            stretch={0.5}
            collapse="auto"
            intro
            ariaLabel="Primary"
            highlightColor="#E9EDF3"
            highlightTextColor="#05070B"
            barColor="rgba(11, 16, 24, 0.72)"
            textColor="#E9EDF3"
            style={
              {
                '--pn-tile': 'linear-gradient(180deg, rgba(233, 237, 243, 0.07) 0%, rgba(233, 237, 243, 0.03) 100%)',
                '--pn-tile-rim':
                  'inset 0 0 0 1px rgba(233, 237, 243, 0.06), inset 0 1px 0 rgba(233, 237, 243, 0.08)',
                '--pn-edge': 'rgba(220, 228, 238, 0.1)',
                '--pn-ring': 'rgba(140, 200, 216, 0.9)',
              } as React.CSSProperties
            }
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onRequestBriefing}
            data-intro-early
            style={{ '--intro-delay': '0.55s' } as React.CSSProperties}
            className="btn btn-primary btn-sm shrink-0"
          >
            {nav.contactButton}
            <span className="btn-icon" aria-hidden="true">
              <ArrowUpRight size={15} />
            </span>
          </button>
          {/* Gesture control sits in the navbar's far-right corner (home, desktop) */}
          {currentPage === 'home' && (
            <span data-intro-reveal="fade" style={{ '--intro-delay': '0.35s' } as React.CSSProperties} className="max-md:hidden">
              <GestureToggle />
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
