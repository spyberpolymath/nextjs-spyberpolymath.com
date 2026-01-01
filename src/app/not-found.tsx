"use client";
import Link from "next/link";
import { Home, FolderOpen, Mail, ArrowRight } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen w-full relative overflow-hidden" style={{ backgroundColor: '#121212' }}>
            {/* Animated background grid */}
            <div className="absolute inset-0 opacity-20">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `linear-gradient(rgba(0, 255, 198, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 198, 0.1) 1px, transparent 1px)`,
                        backgroundSize: '20px 20px',
                        animation: 'gridMove 20s linear infinite'
                    }}
                />
                <style jsx>{`
                    @keyframes gridMove {
                        0% { transform: translate(0, 0); }
                        100% { transform: translate(20px, 20px); }
                    }
                `}</style>
            </div>

            {/* Glowing orbs */}
            <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full opacity-30 animate-pulse" style={{ backgroundColor: '#00FFC6', filter: 'blur(40px)' }} />
            <div className="absolute bottom-1/4 right-1/4 w-24 h-24 rounded-full opacity-20 animate-pulse" style={{ backgroundColor: '#00FFC6', filter: 'blur(30px)', animationDelay: '2s' }} />

            <div className="flex items-center justify-center min-h-screen px-6 py-8 sm:py-12 md:py-16 lg:py-20 relative z-10">
                <div className="max-w-4xl w-full">
                    {/* Main card container */}
                    <div
                        className="backdrop-blur-lg rounded-3xl p-8 md:p-12 border shadow-2xl"
                        style={{
                            backgroundColor: 'rgba(24, 26, 27, 0.8)',
                            borderColor: 'rgba(0, 255, 198, 0.3)',
                            boxShadow: '0 0 60px rgba(0, 255, 198, 0.1)'
                        }}
                    >
                        {/* 404 Large Number */}
                        <div className="text-center mb-8">
                            <div
                                className="text-8xl md:text-9xl font-black tracking-tighter mb-4"
                                style={{
                                    color: '#00FFC6',
                                    textShadow: '0 0 30px rgba(0, 255, 198, 0.8)',
                                    background: 'linear-gradient(45deg, #00FFC6, #b0f5e6)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}
                            >
                                404
                            </div>
                            <div className="w-24 h-1 mx-auto mb-6" style={{ background: 'linear-gradient(90deg, #00FFC6, transparent)' }} />
                        </div>

                        {/* Content section */}
                        <div className="grid md:grid-cols-2 gap-8 items-center">
                            {/* Left side - Text content */}
                            <div className="space-y-6">
                                <h1 className="text-3xl md:text-4xl font-bold" style={{ color: '#E0E0E0' }}>
                                    Oops! This page has gone on an adventure
                                </h1>
                                <p className="text-lg leading-relaxed" style={{ color: '#b0f5e6' }}>
                                    The page you're looking for seems to have wandered off into the digital wilderness.
                                    Don't worry though - let's get you back on track with these helpful options.
                                </p>

                                {/* Quick stats */}
                                <div className="grid grid-cols-3 gap-4 mt-8">
                                    <div className="text-center p-4 rounded-xl" style={{ backgroundColor: 'rgba(0, 255, 198, 0.1)' }}>
                                        <div className="text-2xl font-bold" style={{ color: '#00FFC6' }}>∞</div>
                                        <div className="text-sm" style={{ color: '#b0f5e6' }}>Possibilities</div>
                                    </div>
                                    <div className="text-center p-4 rounded-xl" style={{ backgroundColor: 'rgba(0, 255, 198, 0.1)' }}>
                                        <div className="text-2xl font-bold" style={{ color: '#00FFC6' }}>0</div>
                                        <div className="text-sm" style={{ color: '#b0f5e6' }}>Worries</div>
                                    </div>
                                    <div className="text-center p-4 rounded-xl" style={{ backgroundColor: 'rgba(0, 255, 198, 0.1)' }}>
                                        <div className="text-2xl font-bold" style={{ color: '#00FFC6' }}>100%</div>
                                        <div className="text-sm" style={{ color: '#b0f5e6' }}>Helpful</div>
                                    </div>
                                </div>
                            </div>

                            {/* Right side - Navigation cards */}
                            <div className="space-y-4">
                                <Link
                                    href="/"
                                    className="group block p-6 rounded-xl transition-all duration-300 transform hover:scale-105"
                                    style={{ backgroundColor: '#00FFC6', color: '#121212' }}
                                    onMouseEnter={(e) => {
                                        (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#00d9a6';
                                        (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 10px 40px rgba(0, 255, 198, 0.4)';
                                    }}
                                    onMouseLeave={(e) => {
                                        (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#00FFC6';
                                        (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'none';
                                    }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Home size={24} />
                                            <div>
                                                <div className="font-bold text-lg">Go Home</div>
                                                <div className="text-sm opacity-80">Back to safety</div>
                                            </div>
                                        </div>
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </Link>

                                <Link
                                    href="/projects"
                                    className="group block p-6 rounded-xl transition-all duration-300 border transform hover:scale-105"
                                    style={{ backgroundColor: 'rgba(24, 26, 27, 0.8)', borderColor: 'rgba(0, 255, 198, 0.3)', color: '#E0E0E0' }}
                                    onMouseEnter={(e) => {
                                        (e.currentTarget as HTMLAnchorElement).style.borderColor = '#00FFC6';
                                        (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 10px 40px rgba(0, 255, 198, 0.2)';
                                    }}
                                    onMouseLeave={(e) => {
                                        (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(0, 255, 198, 0.3)';
                                        (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'none';
                                    }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <FolderOpen size={24} style={{ color: '#00FFC6' }} />
                                            <div>
                                                <div className="font-bold text-lg">View Projects</div>
                                                <div className="text-sm" style={{ color: '#b0f5e6' }}>See my work</div>
                                            </div>
                                        </div>
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" style={{ color: '#00FFC6' }} />
                                    </div>
                                </Link>

                                <Link
                                    href="/contact"
                                    className="group block p-6 rounded-xl transition-all duration-300 border transform hover:scale-105"
                                    style={{ backgroundColor: 'rgba(24, 26, 27, 0.8)', borderColor: 'rgba(0, 255, 198, 0.3)', color: '#E0E0E0' }}
                                    onMouseEnter={(e) => {
                                        (e.currentTarget as HTMLAnchorElement).style.borderColor = '#00FFC6';
                                        (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 10px 40px rgba(0, 255, 198, 0.2)';
                                    }}
                                    onMouseLeave={(e) => {
                                        (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(0, 255, 198, 0.3)';
                                        (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'none';
                                    }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Mail size={24} style={{ color: '#00FFC6' }} />
                                            <div>
                                                <div className="font-bold text-lg">Contact Me</div>
                                                <div className="text-sm" style={{ color: '#b0f5e6' }}>Let's connect</div>
                                            </div>
                                        </div>
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" style={{ color: '#00FFC6' }} />
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}