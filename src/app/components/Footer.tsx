'use client';

import { useEffect, useState } from 'react';
import { Copyright, Heart, Code } from 'lucide-react';
import Link from 'next/link';

const Footer = () => {
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<string>('');

  useEffect(() => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.toLocaleString('default', { month: 'long' }));
  }, []);

  return (
    <footer
      className="w-full mt-20 border-t relative overflow-hidden"
      role="contentinfo"
      aria-label="Site footer"
      style={{
        backgroundColor: '#121212',
        borderColor: 'rgba(0,255,198,0.2)'
      }}
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-5" aria-hidden="true">
        <div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(0,255,198,0.4), transparent 70%)',
            animation: 'pulse 8s ease-in-out infinite'
          }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(0,255,198,0.4), transparent 70%)',
            animation: 'pulse 10s ease-in-out infinite 2s'
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-10 sm:py-12">
          {/* Copyright and Credits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center text-center md:text-left">
            {/* Left: branding and date */}
            <div className="flex items-center justify-center md:justify-start gap-3 text-[#b0f5e6]">
              <Copyright className="w-4 h-4" aria-hidden="true" />
              <span className="font-semibold text-sm md:text-base">{currentYear} {currentMonth}</span>
            </div>

            {/* Center: site link (keeps visual placement) */}
            <div className="flex items-center justify-center">
              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-[#00FFC6] hover:underline transition"
              >
                Spyber Polymath | By Amna Anil
              </Link>
            </div>

            {/* Right: crafted with and tagline */}
            <div className="flex flex-col items-center md:items-end justify-center gap-2 text-sm">
              <div className="flex items-center gap-2 text-white">
                <span className="sr-only">Crafted with code and heart by Aman Anil</span>
                <span>Crafted with</span>
                <Code className="w-4 h-4 text-white" aria-label="Code" />
                <span>and</span>
                <Heart className="w-4 h-4 text-[#00FFC6] heartbeat-animation" aria-label="Heart" />
                <span>by Aman Anil &mdash; always learning</span>
              </div>
              <p className="text-xs uppercase tracking-widest text-[#00FFC6] font-bold opacity-60">
                Security × Privacy × AI
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Border Accent */}
        <div
          className="h-1 w-full mt-4 rounded"
          style={{
            background: 'linear-gradient(to right, transparent, rgba(0,255,198,0.5), transparent)'
          }}
          aria-hidden="true"
        />
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.05; }
          50% { opacity: 0.08; }
        }
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(1.2); }
          50% { transform: scale(1); }
        }

        /* Respect users who prefer reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .animate-pulse,
          .heartbeat-animation {
            animation: none !important;
          }
        }

        /* Small adjustments for very small screens */
        @media (max-width: 420px) {
          footer { padding-bottom: 12px; }
        }
      `}</style>
    </footer>
  );
};

export default Footer;