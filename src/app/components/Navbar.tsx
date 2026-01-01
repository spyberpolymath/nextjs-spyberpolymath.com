"use client";

import { useState, useEffect, type ComponentType } from 'react';
import Link from 'next/link';
import {
  Menu,
  X,
  FolderGit2,
  Mail,
  Route,
  ChevronDown,
  Briefcase,
  BookOpen,
  Send,
  Shield,
  User
} from 'lucide-react';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  type NavChild = { href: string; label: string; icon?: ComponentType<{ className?: string }> };
  type NavLink = { label: string; icon?: ComponentType<{ className?: string }> } & (
    | { children: NavChild[] }
    | { href: string }
  );

  const navLinks: NavLink[] = [
    {
      label: 'Journey',
      href: '/journey',
      icon: Route
    },
    {
      label: 'Projects',
      href: '/projects',
      icon: FolderGit2
    },
    {
      label: 'Expertise',
      href: '/expertise',
      icon: Briefcase
    },
    {
      label: 'Blog',
      href: '/blog',
      icon: BookOpen
    },
    {
      label: 'Newsletter',
      href: '/newsletter',
      icon: Send
    },
    ...(isLoggedIn ? [{
      label: 'Accounts',
      href: '/accounts',
      icon: User
    }] : [{
      label: 'Login',
      href: '/auth',
      icon: Shield
    }]),
    {
      label: 'Contact',
      href: '/contact',
      icon: Mail
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('section[id]');
      const scrollPos = window.scrollY + 100;

      // Track scroll position for navbar style
      setScrolled(window.scrollY > 20);

      sections.forEach((section) => {
        const el = section as HTMLElement;
        const sectionTop = el.offsetTop;
        const sectionHeight = el.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (sectionId && scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
          // store as '/#id' to compare consistently with link hrefs which may be '/#id' or '/path'
          setActiveSection(`/#${sectionId}`);
        }
      });
    };

    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(handleScroll);
        ticking = true;
        setTimeout(() => { ticking = false; }, 100);
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    handleScroll(); // Initial call

    // Check login status
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
    setIsLoggedIn(!!token);

    // Listen for storage changes (login/logout)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        setIsLoggedIn(!!e.newValue);
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Keyboard handler: close mobile menu on Escape and allow left/right navigation if needed
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKey);

    return () => {
      window.removeEventListener('scroll', throttledScroll);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('keydown', handleKey);
    };
  }, []);

  const handleLinkClick = (href: string) => {
    setIsOpen(false);

    if (href.startsWith('/#')) {
      const targetId = href.substring(2);
      const target = document.getElementById(targetId);
      if (target) {
        const offsetTop = target.offsetTop - 80;
        const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({
          top: offsetTop,
          behavior: prefersReduced ? 'auto' : 'smooth'
        });
      }
    }
  };

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-[#181A1B]/98 backdrop-blur-2xl shadow-lg' : 'bg-transparent'
        } h-16 sm:h-20 md:h-22 lg:h-24`}
    >
      {/* Animated border bottom */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-[1px] transition-all duration-500 ${scrolled ? 'opacity-100' : 'opacity-0'
          }`}
        style={{
          background: 'linear-gradient(90deg, transparent, #00FFC6, transparent)'
        }}
      />

      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex items-center justify-between h-16 sm:h-20 md:h-22 lg:h-24">
          {/* Brand Logo */}
          <Link
            href="/"
            className="relative z-10"
          >
            <div className="relative flex items-center">
              <img
                src="/logo.png"
                alt="Spyberpolymath Logo"
                className="h-16 sm:h-20 md:h-24 lg:h-28 w-auto transition-transform duration-300 hover:scale-105"
                style={{
                  filter: scrolled ? 'drop-shadow(0 0 12px rgba(0,255,198,0.4))' : 'drop-shadow(0 0 8px rgba(0,255,198,0.2))'
                }}
              />
            </div>
          </Link>

          {/* Desktop Navigation - Floating Card Style */}
          <div
            className={`hidden lg:flex items-center gap-1.5 px-2 py-2 rounded-2xl transition-all duration-500 ${scrolled
              ? 'bg-[#121212]/60 backdrop-blur-xl border border-[#00FFC6]/20'
              : 'bg-[#121212]/40 backdrop-blur-md border border-[#00FFC6]/10'
              }`}
            role="menubar"
            aria-label="Primary"
            style={{
              boxShadow: scrolled ? '0 8px 32px rgba(0,255,198,0.15), inset 0 1px 0 rgba(0,255,198,0.1)' : 'none'
            }}
          >
            {navLinks.map((link) => (
              'children' in link ? (
                <div key={link.label} className="relative group">
                  {/* Dropdown implementation placeholder */}
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => handleLinkClick(link.href)}
                  className={`
                    relative px-4 py-2 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 flex items-center gap-2.5 group
                    ${activeSection === link.href.split('/')[1] || activeSection === link.href
                      ? 'text-[#121212] bg-[#00FFC6]'
                      : 'text-[#00FFC6] hover:bg-[#00FFC6]/15'
                    }
                  `}
                  role="menuitem"
                  aria-current={activeSection === link.href ? 'page' : undefined}
                  style={{
                    boxShadow: activeSection === link.href.split('/')[1] || activeSection === link.href
                      ? '0 0 20px rgba(0,255,198,0.5), 0 4px 15px rgba(0,255,198,0.3)'
                      : 'none'
                  }}
                >
                  {/* Animated icon container */}
                  {link.icon && (
                    <div className="relative">
                      {/* Icon glow on hover */}
                      <div className="absolute inset-0 bg-[#00FFC6] opacity-0 group-hover:opacity-50 rounded-full blur-md transition-opacity duration-300" />
                      <link.icon className="w-[18px] h-[18px] transition-all duration-300 group-hover:scale-125 group-hover:-rotate-12 relative z-10" />
                    </div>
                  )}
                  <span className="relative z-10">{link.label}</span>

                  {/* Active indicator dot */}
                  {(activeSection === link.href.split('/')[1] || activeSection === link.href) && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#121212] rounded-full animate-pulse" />
                  )}
                </Link>
              )
            ))}
          </div>

          {/* Mobile menu button - Morphing Icon */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`lg:hidden relative p-3.5 rounded-xl transition-all duration-300 border group ${isOpen
              ? 'bg-[#00FFC6] border-[#00FFC6]'
              : 'bg-[#121212]/60 border-[#00FFC6]/30 hover:border-[#00FFC6] hover:bg-[#00FFC6]/10'
              }`}
            aria-label="Toggle navigation"
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
            style={{
              boxShadow: isOpen ? '0 0 25px rgba(0,255,198,0.6)' : 'none'
            }}
          >
            <div className="relative w-6 h-6">
              {isOpen ? (
                <X className="w-6 h-6 text-[#121212] absolute inset-0 transition-all duration-300 rotate-90" />
              ) : (
                <Menu className="w-6 h-6 text-[#00FFC6] absolute inset-0 transition-all duration-300 group-hover:scale-110" />
              )}
            </div>
          </button>
        </div>

        {/* Mobile Navigation - Staggered Cards */}
        <div
          id="mobile-navigation"
          className={`lg:hidden fixed left-0 right-0 bg-[#181A1B]/98 backdrop-blur-2xl transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-[calc(100vh-4rem)] sm:max-h-[calc(100vh-5rem)] md:max-h-[calc(100vh-5.5rem)] lg:max-h-[calc(100vh-6rem)] opacity-100 pb-4 shadow-lg' : 'max-h-0 opacity-0'
            }`}
          aria-hidden={!isOpen}
        >
          <div className="space-y-3 pt-2">
            {navLinks.map((link, index) => (
              'children' in link ? (
                <div key={link.label} className="px-2">
                  {/* Dropdown implementation placeholder */}
                </div>
              ) : (
                <div
                  key={link.href}
                  style={{
                    animation: isOpen ? `slideInStagger 0.4s ease-out ${index * 0.1}s both` : 'none'
                  }}
                >
                  <Link
                    href={link.href}
                    onClick={() => handleLinkClick(link.href)}
                    className={`
                      flex items-center gap-4 px-4 py-3 rounded-2xl font-bold text-base tracking-wide transition-all duration-300 group relative
                      ${activeSection === link.href.split('/')[1] || activeSection === link.href
                        ? 'text-[#121212] bg-[#00FFC6] border-2 border-[#00FFC6]'
                        : 'text-[#00FFC6] bg-[#121212]/60 border-2 border-[#00FFC6]/20 hover:border-[#00FFC6] hover:bg-[#00FFC6]/10'
                      }
                    `}
                    role="menuitem"
                    tabIndex={0}
                    style={{
                      boxShadow: activeSection === link.href.split('/')[1] || activeSection === link.href
                        ? '0 0 30px rgba(0,255,198,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
                        : '0 4px 15px rgba(0,0,0,0.3)'
                    }}
                  >
                    {/* Icon with animated background */}
                    {link.icon && (
                      <div className="relative flex-shrink-0">
                        <div className={`absolute inset-0 rounded-lg transition-all duration-300 ${activeSection === link.href.split('/')[1] || activeSection === link.href
                          ? 'bg-[#121212]/20'
                          : 'bg-[#00FFC6]/10 group-hover:bg-[#00FFC6]/20'
                          }`} style={{ margin: '-6px' }} />
                        <link.icon className="w-6 h-6 transition-all duration-300 group-hover:scale-125 relative z-10" />
                      </div>
                    )}

                    <span className="relative z-10 flex-1">{link.label}</span>

                    {/* Arrow indicator */}
                    <ChevronDown
                      className={`w-5 h-5 transition-all duration-300 group-hover:translate-x-1 ${activeSection === link.href.split('/')[1] || activeSection === link.href
                        ? 'opacity-100 rotate-[-90deg]'
                        : 'opacity-60 group-hover:opacity-100 rotate-[-90deg]'
                        }`}
                      aria-hidden
                    />
                  </Link>
                </div>
              )
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInStagger {
          from {
            opacity: 0;
            transform: translateX(-30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        
        /* Respect reduced motion preference */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;