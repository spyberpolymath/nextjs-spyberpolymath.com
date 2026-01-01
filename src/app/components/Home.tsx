"use client";

import { Code, Shield, Brain, Infinity, ChevronRight, Zap, Target, Lock, Leaf } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <main
      className="min-h-screen pt-20 md:pt-24 lg:pt-28 bg-[#0a0a0a] text-[#E0E0E0] antialiased overflow-x-hidden"
      aria-labelledby="home-title"
    >
      {/* Animated Grid Background */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.02]"
        aria-hidden="true"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,255,198,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,198,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Floating Particles Effect */}
      <div className="pointer-events-none fixed inset-0" aria-hidden="true">
        <div
          className="absolute top-1/3 left-1/5 w-2 h-2 rounded-full bg-[#00FFC6] opacity-40 animate-pulse"
          style={{ animation: "float 6s ease-in-out infinite" }}
        />
        <div
          className="absolute top-2/3 right-1/4 w-3 h-3 rounded-full bg-[#00FFC6] opacity-30 animate-pulse"
          style={{ animation: "float 8s ease-in-out infinite 2s" }}
        />
        <div
          className="absolute bottom-1/3 left-1/3 w-2 h-2 rounded-full bg-[#00FFC6] opacity-50 animate-pulse"
          style={{ animation: "float 7s ease-in-out infinite 1s" }}
        />
      </div>

      {/* Radial Glow Effects */}
      <div className="pointer-events-none fixed inset-0" aria-hidden="true">
        <div
          className="absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full opacity-5 blur-[120px]"
          style={{
            background: "radial-gradient(circle, rgba(0,255,198,1) 0%, transparent 70%)",
            animation: "glow 10s ease-in-out infinite",
          }}
        />
        <div
          className="absolute bottom-0 left-1/4 w-[600px] h-[600px] rounded-full opacity-5 blur-[120px]"
          style={{
            background: "radial-gradient(circle, rgba(0,255,198,1) 0%, transparent 70%)",
            animation: "glow 12s ease-in-out infinite 3s",
          }}
        />
      </div>

      {/* Hero Section - Asymmetric Split Layout */}
      <header className="relative max-w-7xl mx-auto px-6 pt-16 pb-12 md:pt-24 md:pb-20 z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="space-y-8">

            {/* Main Title */}
            <div>
              <h1
                id="home-title"
                className="text-6xl sm:text-7xl md:text-8xl font-black mb-4 bg-clip-text text-transparent leading-tight"
                style={{
                  backgroundImage: "linear-gradient(135deg, #00FFC6 0%, #ffffff 50%, #00FFC6 100%)",
                  backgroundSize: "200%",
                  animation: "shimmer 4s linear infinite",
                  textShadow: "0 0 60px rgba(0,255,198,0.4)",
                }}
              >
                spyber
                <br />
                polymath
              </h1>

              <div className="flex items-center gap-3 mb-6">
                <div className="h-1 w-12 rounded-full bg-[#00FFC6]" />
                <p className="text-xl md:text-2xl font-bold text-[#b0f5e6]">
                  I'm <span className="text-[#00FFC6]">Aman Anil</span>
                </p>
              </div>
            </div>

            {/* Role Tags */}
            <div className="flex flex-wrap gap-3">
              {[
                "Ethical Hacker",
                "AI Researcher",
                "Software Engineer",
                "Bug Bounty Hunter"
              ].map((role, i) => (
                <span
                  key={i}
                  className="px-4 py-2 rounded-lg font-mono text-xs font-semibold border transition-all duration-300 hover:scale-105"
                  style={{
                    backgroundColor: "rgba(0,255,198,0.1)",
                    borderColor: "rgba(0,255,198,0.3)",
                    color: "#00FFC6"
                  }}
                >
                  {role}
                </span>
              ))}
            </div>

            {/* Description */}
            <p className="text-lg text-[#b0f5e6] leading-relaxed max-w-xl">
              Blending hacking, AI, and minimalism to engineer technology that's silent, secure, and radically human. I build systems where{" "}
              <span className="text-[#00FFC6] font-semibold">privacy is power</span>,{" "}
              <span className="text-[#00FFC6] font-semibold">code is philosophy</span>, and every byte serves a purpose.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <a
                href="/contact"
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                style={{
                  backgroundColor: "#00FFC6",
                  color: "#0a0a0a",
                  boxShadow: "0 10px 40px rgba(0,255,198,0.4)",
                }}
              >
                <Lock className="w-5 h-5" />
                Get In Touch
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>

              <a
                href="/journey"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold border-2 transition-all duration-300 hover:scale-105"
                style={{
                  borderColor: "#00FFC6",
                  color: "#00FFC6",
                  backgroundColor: "rgba(0,255,198,0.05)"
                }}
              >
                <Target className="w-5 h-5" />
                My Journey
              </a>
            </div>
          </div>

          {/* Right Column - Visual Element */}
          <div className="relative flex items-center justify-center">
            <div className="relative">
              {/* Main Avatar Circle */}
              <div
                className="relative w-48 sm:w-64 md:w-72 lg:w-80 h-48 sm:h-64 md:h-72 lg:h-80 rounded-full border-4 flex items-center justify-center overflow-hidden"
                style={{
                  borderColor: "#00FFC6",
                  background: "linear-gradient(135deg, rgba(0,255,198,0.2), rgba(0,255,198,0.05))",
                  boxShadow: "0 30px 80px rgba(0,255,198,0.4), inset 0 0 50px rgba(0,255,198,0.1)",
                }}
                aria-hidden={false}
              >
                <Image
                  src="/aman-anil-spyberpolymath.jpeg"
                  alt="Avatar of Aman Anil"
                  width={640}
                  height={640}
                  priority
                  sizes="(max-width: 640px) 240px, (max-width: 1024px) 480px, 640px"
                  className="absolute inset-0 w-full h-full object-cover rounded-full"
                />
                <span className="text-9xl font-black text-[#00FFC6]" aria-hidden="true">AA</span>
              </div>

              {/* Orbiting Icons */}
              <div className="absolute inset-0" style={{ animation: "rotate 20s linear infinite" }} aria-hidden="true">
                <Shield className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-[#00FFC6] opacity-80" aria-hidden="true" focusable={false} />
              </div>
              <div className="absolute inset-0" style={{ animation: "rotate 25s linear infinite reverse" }} aria-hidden="true">
                <Brain className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-12 h-12 text-[#00FFC6] opacity-80" aria-hidden="true" focusable={false} />
              </div>
              <div className="absolute inset-0" style={{ animation: "rotate 30s linear infinite" }} aria-hidden="true">
                <Code className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-12 h-12 text-[#00FFC6] opacity-80" aria-hidden="true" focusable={false} />
              </div>

              {/* Decorative Rings */}
              <div
                className="absolute inset-0 -m-8 rounded-full border opacity-20"
                style={{ borderColor: "#00FFC6", animation: "ping 3s cubic-bezier(0, 0, 0.2, 1) infinite" }}
                aria-hidden="true"
              />
              <div
                className="absolute inset-0 -m-16 rounded-full border opacity-10"
                style={{ borderColor: "#00FFC6", animation: "ping 3s cubic-bezier(0, 0, 0.2, 1) infinite 1.5s" }}
                aria-hidden="true"
              />
            </div>
          </div>
        </div>

        {/* Bottom Tagline */}
        <div className="mt-16 text-center">
          <p className="text-xs uppercase tracking-widest text-[#b0f5e6] mb-2">Design-led engineering</p>
          <p className="text-3xl font-black text-[#00FFC6]">Security × Privacy × AI</p>
        </div>
      </header>

      {/* Stats - Compact Inline Cards */}
      <section className="relative max-w-7xl mx-auto px-6 py-12" aria-labelledby="stats-title">
        <h2 id="stats-title" className="sr-only">Key stats</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { value: "2+", label: "Years in Tech", icon: Code },
            { value: "18+", label: "Open Source Projects", icon: Brain },
            { value: "10+", label: "CTF/Red Team Labs", icon: Shield },
            { value: "∞", label: "Lines of Code", icon: Infinity },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="group relative rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-2 hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, rgba(0,255,198,0.1), rgba(0,0,0,0.8))",
                  borderColor: "rgba(0,255,198,0.3)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                }}
              >
                <div className="flex flex-col items-center text-center">
                  <Icon className="w-10 h-10 text-[#00FFC6] mb-3 group-hover:scale-110 transition-transform" />
                  <div className="text-4xl font-black text-[#00FFC6] mb-2">{stat.value}</div>
                  <div className="text-xs uppercase tracking-wider text-[#b0f5e6] font-semibold">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* About Section - Card Layout */}
      <section id="about" className="relative max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main About Card - Spans 2 columns */}
          <div
            className="lg:col-span-2 rounded-3xl p-10 border backdrop-blur-sm group hover:-translate-y-1 transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, rgba(0,255,198,0.1) 0%, rgba(0,0,0,0.9) 100%)",
              borderColor: "rgba(0,255,198,0.3)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 rounded-xl" style={{ backgroundColor: "rgba(0,255,198,0.2)" }}>
                <Brain className="w-10 h-10 text-[#00FFC6]" />
              </div>
              <div>
                <h3 className="text-4xl font-black text-[#00FFC6] mb-2">About Me</h3>
                <div className="h-1 w-20 rounded-full bg-[#00FFC6]" />
              </div>
            </div>
            <div className="space-y-4 text-base text-[#E0E0E0] leading-relaxed">
              <p>
                I'm <span className="text-[#00FFC6] font-semibold">Aman Anil</span>, a self-taught ethical hacker, AI enthusiast, and software engineer focused on privacy-first systems.
              </p>
              <p>
                My journey started with cybersecurity and digital minimalism, leading to open source work, AI research, and building robust, ethical applications.
              </p>
              <p>
                I believe technology should <span className="text-[#00FFC6] font-semibold">protect freedom</span> and <span className="text-[#00FFC6] font-semibold">serve humanity</span>. My work spans security research, machine learning, and scalable solutions — always with transparency and trust.
              </p>
            </div>
          </div>

          {/* Philosophy Card */}
          <div
            className="rounded-3xl p-10 border backdrop-blur-sm group hover:-translate-y-1 transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, rgba(0,255,198,0.1) 0%, rgba(0,0,0,0.9) 100%)",
              borderColor: "rgba(0,255,198,0.3)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 rounded-xl" style={{ backgroundColor: "rgba(0,255,198,0.2)" }}>
                <Code className="w-10 h-10 text-[#00FFC6]" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-[#00FFC6] mb-2">Code as Philosophy</h3>
                <div className="h-1 w-16 rounded-full bg-[#00FFC6]" />
              </div>
            </div>
            <p className="text-base text-[#E0E0E0] leading-relaxed">
              I see code as poetry: a way to express clarity, creativity, and purpose — shaping technology with soul. Every function, every system, is crafted to empower users and uphold ethical values.
            </p>
          </div>

          {/* Mission Banner */}
          <div
            className="lg:col-span-3 rounded-3xl p-10 border backdrop-blur-sm text-center group hover:-translate-y-1 transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, rgba(0,255,198,0.15) 0%, rgba(0,0,0,0.9) 100%)",
              borderColor: "rgba(0,255,198,0.4)",
              boxShadow: "0 20px 60px rgba(0,255,198,0.2)",
            }}
          >
            <Zap className="w-12 h-12 text-[#00FFC6] mx-auto mb-4" />
            <h4 className="text-3xl font-black text-[#00FFC6] mb-4">Why I Build</h4>
            <p className="text-lg text-[#E0E0E0] leading-relaxed max-w-4xl mx-auto">
              I believe technology must <span className="text-[#00FFC6] font-semibold">protect privacy</span>, <span className="text-[#00FFC6] font-semibold">elevate human focus</span>, and <span className="text-[#00FFC6] font-semibold">serve truth</span> — not profit. I build with silence, scale with purpose, and stay grounded in clarity.
            </p>
          </div>
        </div>
      </section>

      {/* Services - Modern Card Grid */}
      <section className="relative max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h3 className="text-4xl font-black text-[#00FFC6] mb-3">What I Do</h3>
          <div className="h-1 w-24 rounded-full bg-[#00FFC6] mx-auto" />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              number: "01",
              title: "Cyber Crime & Security Researcher",
              description: "Learning, testing, and simulating real-world vulnerabilities with ethical precision and advanced methodologies.",
              tags: ["Penetration Testing", "Vulnerability Research", "Security Auditing"],
              icon: Shield
            },
            {
              number: "02",
              title: "AI & Data Science Researcher",
              description: "Exploring privacy-first intelligence systems without external APIs or cloud dependencies for maximum security.",
              tags: ["Machine Learning", "Privacy Tech", "Data Analysis"],
              icon: Brain
            },
            {
              number: "03",
              title: "Software Engineer",
              description: "Building robust, scalable applications with Django, PostgreSQL, Flutter, and Next.js for modern solutions.",
              tags: ["Full Stack", "Backend Systems", "Mobile Apps"],
              icon: Code
            },
            {
              number: "04",
              title: "Digital Minimalism",
              description: "Writing code like building systems: quietly, intentionally, and without excess for maximum efficiency.",
              tags: ["Clean Code", "Efficiency", "Minimalism"],
              icon: Target
            },
          ].map((service, idx) => {
            const Icon = service.icon;
            return (
              <article
                key={idx}
                className="group relative rounded-3xl p-8 border transition-all duration-300 hover:-translate-y-2 overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, rgba(0,255,198,0.08) 0%, rgba(0,0,0,0.95) 100%)",
                  borderColor: "rgba(0,255,198,0.3)",
                  boxShadow: "0 15px 50px rgba(0,0,0,0.6)",
                }}
              >
                {/* Background Number */}
                <div className="absolute top-4 right-4 text-8xl font-black text-[#00FFC6] opacity-5">
                  {service.number}
                </div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl" style={{ backgroundColor: "rgba(0,255,198,0.2)" }}>
                        <Icon className="w-6 h-6 text-[#00FFC6]" />
                      </div>
                      <span className="text-xl font-black text-[#00FFC6]">{service.number}</span>
                    </div>
                    <ChevronRight className="w-6 h-6 text-[#00FFC6] opacity-50 group-hover:translate-x-2 group-hover:opacity-100 transition-all" />
                  </div>

                  <h5 className="text-2xl font-bold text-[#E0E0E0] mb-4 group-hover:text-[#00FFC6] transition-colors">
                    {service.title}
                  </h5>

                  <p className="text-sm text-[#b0f5e6] mb-6 leading-relaxed">
                    {service.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {service.tags.map((tag, j) => (
                      <span
                        key={j}
                        className="text-xs px-3 py-1.5 rounded-lg font-semibold"
                        style={{
                          backgroundColor: "#00FFC6",
                          color: "#0a0a0a"
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Hover Glow Effect */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: "radial-gradient(circle at center, rgba(0,255,198,0.1), transparent 70%)"
                  }}
                />
              </article>
            );
          })}
        </div>
      </section>

      {/* Values - Icon Cards */}
      <section id="values" className="relative max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h3 className="text-4xl font-black text-[#00FFC6] mb-3">Core Values</h3>
          <div className="h-1 w-24 rounded-full bg-[#00FFC6] mx-auto mb-4" />
          <p className="text-lg text-[#b0f5e6]">The principles that guide every line of code I write</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Lock,
              title: "Privacy First",
              description: "Building technology that respects user privacy and data sovereignty. No tracking, no surveillance, no compromise on personal freedom.",
            },
            {
              icon: Code,
              title: "Open Source Ethics",
              description: "Contributing to the open source community and building transparent solutions that can be audited, verified, and trusted.",
            },
            {
              icon: Shield,
              title: "Ethical Technology",
              description: "Using technology as a force for good, ensuring every line of code serves humanity's best interests, not just corporate profits.",
            },
            {
              icon: Leaf,
              title: "Sustainable Innovation",
              description: "Building solutions that are not only technically excellent but also environmentally conscious and socially responsible.",
            },
          ].map((value, i) => {
            const Icon = value.icon;
            return (
              <div
                key={i}
                className="group relative rounded-3xl p-8 border transition-all duration-300 hover:-translate-y-3"
                style={{
                  background: "linear-gradient(135deg, rgba(0,255,198,0.08) 0%, rgba(0,0,0,0.9) 100%)",
                  borderColor: "rgba(0,255,198,0.2)",
                  boxShadow: "0 15px 40px rgba(0,0,0,0.4)",
                }}
              >
                <div className="flex flex-col items-center text-center">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: "rgba(0,255,198,0.2)" }}
                  >
                    <Icon className="w-8 h-8 text-[#00FFC6]" />
                  </div>

                  <h6 className="text-xl font-bold text-[#00FFC6] mb-3">{value.title}</h6>
                  <p className="text-sm text-[#b0f5e6] leading-relaxed">{value.description}</p>
                </div>

                {/* Bottom accent line */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00FFC6] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
            );
          })}
        </div>
      </section>

      {/* Philosophy Quotes - Modern Layout */}
      <section id="philosophy" className="relative max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h3 className="text-4xl font-black text-[#00FFC6] mb-3">Philosophy</h3>
          <div className="h-1 w-24 rounded-full bg-[#00FFC6] mx-auto" />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div
            className="rounded-3xl p-10 border backdrop-blur-sm relative overflow-hidden group hover:-translate-y-2 transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, rgba(0,255,198,0.12) 0%, rgba(0,0,0,0.95) 100%)",
              borderColor: "rgba(0,255,198,0.4)",
              boxShadow: "0 25px 70px rgba(0,255,198,0.15)",
            }}
          >
            <div className="absolute top-6 left-6 text-9xl font-black text-[#00FFC6] opacity-5">"</div>
            <blockquote className="relative z-10">
              <p className="text-2xl italic text-[#b0f5e6] mb-6 font-light leading-relaxed">
                Master yourself, or someone else will.
              </p>
              <footer className="text-sm font-bold text-[#00FFC6]">— Lao Tzu</footer>
            </blockquote>
          </div>

          <div
            className="rounded-3xl p-10 border backdrop-blur-sm relative overflow-hidden group hover:-translate-y-2 transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, rgba(0,255,198,0.12) 0%, rgba(0,0,0,0.95) 100%)",
              borderColor: "rgba(0,255,198,0.4)",
              boxShadow: "0 25px 70px rgba(0,255,198,0.15)",
            }}
          >
            <div className="absolute top-6 left-6 text-9xl font-black text-[#00FFC6] opacity-5">"</div>
            <blockquote className="relative z-10">
              <p className="text-lg italic text-[#b0f5e6] mb-6 font-light leading-relaxed">
                Code is not just about solving problems. It's about creating a world where privacy is protected, technology serves humanity, and innovation happens with purpose — not just profit.
              </p>
              <footer className="text-sm font-bold text-[#00FFC6]">— Aman Anil (spyberpolymath)</footer>
            </blockquote>
          </div>
        </div>
      </section>

      {/* Bottom Spacing */}
      <div className="h-24" />

      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 200% 50%;
          }
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        @keyframes glow {
          0%, 100% {
            opacity: 0.05;
          }
          50% {
            opacity: 0.08;
          }
        }
        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes ping {
          75%, 100% {
            transform: scale(1.1);
            opacity: 0;
          }
        }
      `}</style>
    </main>
  );
}