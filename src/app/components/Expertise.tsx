"use client";

import { Code, Shield, Brain, ChevronRight, Zap, Target, Lock, Leaf, ArrowRight, Terminal, Database, Globe, Cpu, Key, Eye, Bug, BarChart, Cloud, Smartphone, Laptop, Server, Activity, Contact, Folder, Package, CloudRain, BrainCircuit } from "lucide-react";
import { SiDjango, SiDocker, SiFlutter, SiKubernetes, SiSupabase, SiTypescript, SiTensorflow, SiGit, SiMetasploit, SiPytorch, SiWireshark, SiGooglecloud, SiGooglecolab, SiBurpsuite, SiParrotsecurity, SiTraefikproxy, SiPython, SiGithub, SiCloudflare, SiGithubactions, SiAnsible, SiNginx, SiTerraform, SiOwasp, SiMongodb, SiCloudinary, SiJupyter, SiGeopandas, SiKeras, SiOpencv, SiScikitlearn, SiSpacy, SiPandas, SiNumpy } from "react-icons/si";
import { RiNextjsFill } from "react-icons/ri";
import { FaBrain, FaLinode, FaWatchmanMonitoring } from "react-icons/fa";
import { FaGears } from "react-icons/fa6";
import { MdOutlineSystemSecurityUpdateGood } from "react-icons/md";
import Link from "next/link";

export default function Expertise() {
    const techIcons = {
        "Programming Languages": {
            "Python": SiPython,
            "TypeScript": SiTypescript,
        },
        "Frameworks & Libraries": {
            "Next.js": RiNextjsFill,
            "Django": SiDjango,
            "Flutter": SiFlutter,
        },
        "Security Tools": {
            "ParrotSec OS": SiParrotsecurity,
            "Zap Proxy": SiTraefikproxy,
            "Burp Suite": SiBurpsuite,
            "Metasploit": SiMetasploit,
            "Wireshark": SiWireshark,
            "OWASP ZAP": SiOwasp,
            "Open Policy Agent": SiOwasp,
            "MobSF": MdOutlineSystemSecurityUpdateGood,
            "Ghidra": FaGears,
        },
        "Cloud & DevOps": {
            "Docker": SiDocker,
            "Kubernetes": SiKubernetes,
            "Git": SiGit,
            "GitHub": SiGithub,
            "Cloudflare": SiCloudflare,
            "GCP": SiGooglecloud,
            "Linode": FaLinode,
            "GitHub Actions": SiGithubactions,
            "Nginx": SiNginx,
            "Ansible": SiAnsible,
            "Terraform": SiTerraform,
        },
        "Databases & Storage": {
            "Supabase": SiSupabase,
            "MongoDB": SiMongodb,
            "Cloudinary": SiCloudinary,
        },
        "AI/ML Tools": {
            "JupyterLab": SiJupyter,
            "Jupyter Notebook": SiJupyter,
            "OpenCV": SiOpencv,
            "spaCy": SiSpacy,
            "NLTK": FaBrain,
            "Seaborn": BrainCircuit,
            "Matplotlib": SiPandas,
            "Keras": SiKeras,
            "Scikit-learn": SiScikitlearn,
            "Pandas": SiGeopandas,
            "NumPy": SiNumpy,
            "PyTorch": SiPytorch,
            "TensorFlow": SiTensorflow,
            "Google Colab": SiGooglecolab,
        },
        "Monitoring & Analytics": {
            "Zabbix": FaWatchmanMonitoring,
        }
    };

    // Split the categories into left and right columns
    const categories = Object.entries(techIcons);
    const leftColumn = categories.slice(0, Math.ceil(categories.length / 2));
    const rightColumn = categories.slice(Math.ceil(categories.length / 2));

    return (
        <main
            className="min-h-screen pt-16 sm:pt-20 md:pt-24 lg:pt-28 bg-[#0a0a0a] text-[#E0E0E0] antialiased overflow-x-hidden"
            aria-labelledby="expertise-title"
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
                    className="absolute top-1/3 left-[20%] w-2 h-2 rounded-full bg-[#00FFC6] opacity-40 animate-pulse"
                    style={{ animation: "float 6s ease-in-out infinite" }}
                />
                <div
                    className="absolute top-2/3 right-[25%] w-3 h-3 rounded-full bg-[#00FFC6] opacity-30 animate-pulse"
                    style={{ animation: "float 8s ease-in-out infinite 2s" }}
                />
                <div
                    className="absolute bottom-1/3 left-[33%] w-2 h-2 rounded-full bg-[#00FFC6] opacity-50 animate-pulse"
                    style={{ animation: "float 7s ease-in-out infinite 1s" }}
                />
            </div>

            {/* Radial Glow Effects */}
            <div className="pointer-events-none fixed inset-0" aria-hidden="true">
                <div
                    className="absolute top-0 right-[25%] w-[400px] sm:w-[500px] md:w-[600px] h-[400px] sm:h-[500px] md:h-[600px] rounded-full opacity-5 blur-[100px] sm:blur-[120px]"
                    style={{
                        background: "radial-gradient(circle, rgba(0,255,198,1) 0%, transparent 70%)",
                        animation: "glow 10s ease-in-out infinite",
                    }}
                />
                <div
                    className="absolute bottom-0 left-[25%] w-[400px] sm:w-[500px] md:w-[600px] h-[400px] sm:h-[500px] md:h-[600px] rounded-full opacity-5 blur-[100px] sm:blur-[120px]"
                    style={{
                        background: "radial-gradient(circle, rgba(0,255,198,1) 0%, transparent 70%)",
                        animation: "glow 12s ease-in-out infinite 3s",
                    }}
                />
            </div>

            {/* Header Section */}
            <header className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 md:pt-24 pb-8 sm:pb-12 md:pb-20 z-10">
                <div className="text-center mb-8 sm:mb-12">
                    <h1
                        id="expertise-title"
                        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-4 sm:mb-6 bg-clip-text text-transparent leading-tight px-2"
                        style={{
                            backgroundImage: "linear-gradient(135deg, #00FFC6 0%, #ffffff 50%, #00FFC6 100%)",
                            backgroundSize: "200%",
                            animation: "shimmer 4s linear infinite",
                            textShadow: "0 0 60px rgba(0,255,198,0.4)",
                        }}
                    >
                        Expertise
                    </h1>

                    <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6 px-4">
                        <div className="h-1 w-8 sm:w-12 rounded-full bg-[#00FFC6]" />
                        <p className="text-base sm:text-xl md:text-2xl font-bold text-[#b0f5e6]">
                            What I Do Best
                        </p>
                        <div className="h-1 w-8 sm:w-12 rounded-full bg-[#00FFC6]" />
                    </div>

                    <p className="text-sm sm:text-base md:text-lg text-[#b0f5e6] leading-relaxed max-w-3xl mx-auto px-4">
                        Blending hacking, AI, and minimalism to engineer technology that's silent, secure, and radically human. Here's how I can help you build systems where{" "}
                        <span className="text-[#00FFC6] font-semibold">privacy is power</span>,{" "}
                        <span className="text-[#00FFC6] font-semibold">code is philosophy</span>, and every byte serves a purpose.
                    </p>
                </div>
            </header>

            {/* Services Categories */}
            <section className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16">
                    {[
                        {
                            icon: Shield,
                            title: "Security",
                            description: "Ethical hacking and security audits",
                            color: "#00FFC6"
                        },
                        {
                            icon: Brain,
                            title: "AI & ML",
                            description: "Privacy-first intelligence systems",
                            color: "#00FFC6"
                        },
                        {
                            icon: Code,
                            title: "Development",
                            description: "Full-stack application building",
                            color: "#00FFC6"
                        },
                        {
                            icon: Target,
                            title: "Optimization",
                            description: "Performance and efficiency tuning",
                            color: "#00FFC6"
                        }
                    ].map((category, i) => {
                        const Icon = category.icon;
                        return (
                            <div
                                key={i}
                                className="group relative rounded-xl sm:rounded-2xl p-4 sm:p-6 border transition-all duration-300 hover:-translate-y-2 text-center"
                                style={{
                                    background: "linear-gradient(135deg, rgba(0,255,198,0.1) 0%, rgba(0,0,0,0.9) 100%)",
                                    borderColor: "rgba(0,255,198,0.3)",
                                    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                                }}
                            >
                                <div
                                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform"
                                    style={{ backgroundColor: "rgba(0,255,198,0.2)" }}
                                >
                                    <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-[#00FFC6]" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold text-[#00FFC6] mb-1 sm:mb-2">{category.title}</h3>
                                <p className="text-xs sm:text-sm text-[#b0f5e6]">{category.description}</p>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Detailed Services */}
            <section className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                <div className="text-center mb-8 sm:mb-12">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#00FFC6] mb-3">Core Services</h2>
                    <div className="h-1 w-16 sm:w-24 rounded-full bg-[#00FFC6] mx-auto" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-16">
                    {/* Security Services */}
                    <div
                        className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 border backdrop-blur-sm group hover:-translate-y-2 transition-all duration-300"
                        style={{
                            background: "linear-gradient(135deg, rgba(0,255,198,0.08) 0%, rgba(0,0,0,0.95) 100%)",
                            borderColor: "rgba(0,255,198,0.3)",
                            boxShadow: "0 15px 50px rgba(0,0,0,0.6)",
                        }}
                    >
                        <div className="flex items-center gap-3 mb-4 sm:mb-6">
                            <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl" style={{ backgroundColor: "rgba(0,255,198,0.2)" }}>
                                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-[#00FFC6]" />
                            </div>
                            <h3 className="text-xl sm:text-2xl font-black text-[#00FFC6]">Security Services</h3>
                        </div>

                        <div className="space-y-3 sm:space-y-4">
                            {[
                                { icon: Bug, title: "Penetration Testing", desc: "Comprehensive security assessments to identify vulnerabilities before attackers do." },
                                { icon: Eye, title: "Security Audits", desc: "Thorough examination of your systems, code, and infrastructure for security weaknesses." },
                                { icon: Key, title: "Cryptography Implementation", desc: "Secure encryption and authentication mechanisms to protect sensitive data." },
                                { icon: Lock, title: "Privacy Architecture", desc: "Design systems with privacy by default and by design principles." }
                            ].map((service, i) => {
                                const Icon = service.icon;
                                return (
                                    <div key={i} className="flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl" style={{ backgroundColor: "rgba(0,255,198,0.05)" }}>
                                        <div className="p-1.5 sm:p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: "rgba(0,255,198,0.1)" }}>
                                            <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#00FFC6]" />
                                        </div>
                                        <div>
                                            <h4 className="text-base sm:text-lg font-bold text-[#E0E0E0] mb-1">{service.title}</h4>
                                            <p className="text-xs sm:text-sm text-[#b0f5e6]">{service.desc}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* AI & Data Services */}
                    <div
                        className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 border backdrop-blur-sm group hover:-translate-y-2 transition-all duration-300"
                        style={{
                            background: "linear-gradient(135deg, rgba(0,255,198,0.08) 0%, rgba(0,0,0,0.95) 100%)",
                            borderColor: "rgba(0,255,198,0.3)",
                            boxShadow: "0 15px 50px rgba(0,0,0,0.6)",
                        }}
                    >
                        <div className="flex items-center gap-3 mb-4 sm:mb-6">
                            <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl" style={{ backgroundColor: "rgba(0,255,198,0.2)" }}>
                                <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-[#00FFC6]" />
                            </div>
                            <h3 className="text-xl sm:text-2xl font-black text-[#00FFC6]">AI & Data Services</h3>
                        </div>

                        <div className="space-y-3 sm:space-y-4">
                            {[
                                { icon: Cpu, title: "Custom AI Models", desc: "Tailored machine learning solutions for your specific business needs." },
                                { icon: Database, title: "Data Analysis", desc: "Extract meaningful insights from your data while maintaining privacy." },
                                { icon: BarChart, title: "Predictive Analytics", desc: "Forecast trends and outcomes with privacy-preserving techniques." },
                                { icon: Cloud, title: "On-Premise AI", desc: "Deploy AI systems without relying on external APIs or cloud services." }
                            ].map((service, i) => {
                                const Icon = service.icon;
                                return (
                                    <div key={i} className="flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl" style={{ backgroundColor: "rgba(0,255,198,0.05)" }}>
                                        <div className="p-1.5 sm:p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: "rgba(0,255,198,0.1)" }}>
                                            <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#00FFC6]" />
                                        </div>
                                        <div>
                                            <h4 className="text-base sm:text-lg font-bold text-[#E0E0E0] mb-1">{service.title}</h4>
                                            <p className="text-xs sm:text-sm text-[#b0f5e6]">{service.desc}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                    {/* Development Services */}
                    <div
                        className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 border backdrop-blur-sm group hover:-translate-y-2 transition-all duration-300"
                        style={{
                            background: "linear-gradient(135deg, rgba(0,255,198,0.08) 0%, rgba(0,0,0,0.95) 100%)",
                            borderColor: "rgba(0,255,198,0.3)",
                            boxShadow: "0 15px 50px rgba(0,0,0,0.6)",
                        }}
                    >
                        <div className="flex items-center gap-3 mb-4 sm:mb-6">
                            <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl" style={{ backgroundColor: "rgba(0,255,198,0.2)" }}>
                                <Code className="w-6 h-6 sm:w-8 sm:h-8 text-[#00FFC6]" />
                            </div>
                            <h3 className="text-xl sm:text-2xl font-black text-[#00FFC6]">Development Services</h3>
                        </div>

                        <div className="space-y-3 sm:space-y-4">
                            {[
                                { icon: Globe, title: "Web Applications", desc: "Secure, performant web apps with modern frameworks and best practices." },
                                { icon: Smartphone, title: "Mobile Development", desc: "Cross-platform mobile apps that respect user privacy and data." },
                                { icon: Server, title: "Backend Systems", desc: "Robust, scalable server architecture with security-first approach." },
                                { icon: Terminal, title: "API Development", desc: "RESTful and GraphQL APIs with proper authentication and rate limiting." }
                            ].map((service, i) => {
                                const Icon = service.icon;
                                return (
                                    <div key={i} className="flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl" style={{ backgroundColor: "rgba(0,255,198,0.05)" }}>
                                        <div className="p-1.5 sm:p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: "rgba(0,255,198,0.1)" }}>
                                            <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#00FFC6]" />
                                        </div>
                                        <div>
                                            <h4 className="text-base sm:text-lg font-bold text-[#E0E0E0] mb-1">{service.title}</h4>
                                            <p className="text-xs sm:text-sm text-[#b0f5e6]">{service.desc}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Optimization Services */}
                    <div
                        className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 border backdrop-blur-sm group hover:-translate-y-2 transition-all duration-300"
                        style={{
                            background: "linear-gradient(135deg, rgba(0,255,198,0.08) 0%, rgba(0,0,0,0.95) 100%)",
                            borderColor: "rgba(0,255,198,0.3)",
                            boxShadow: "0 15px 50px rgba(0,0,0,0.6)",
                        }}
                    >
                        <div className="flex items-center gap-3 mb-4 sm:mb-6">
                            <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl" style={{ backgroundColor: "rgba(0,255,198,0.2)" }}>
                                <Target className="w-6 h-6 sm:w-8 sm:h-8 text-[#00FFC6]" />
                            </div>
                            <h3 className="text-xl sm:text-2xl font-black text-[#00FFC6]">Optimization Services</h3>
                        </div>

                        <div className="space-y-3 sm:space-y-4">
                            {[
                                { icon: Zap, title: "Performance Tuning", desc: "Optimize your applications for maximum speed and efficiency." },
                                { icon: Leaf, title: "Minimalist Design", desc: "Clean, focused interfaces that reduce cognitive load and improve UX." },
                                { icon: Database, title: "Database Optimization", desc: "Query optimization and efficient data modeling for faster response times." },
                                { icon: Laptop, title: "Code Refactoring", desc: "Improve code quality, maintainability, and performance of existing systems." }
                            ].map((service, i) => {
                                const Icon = service.icon;
                                return (
                                    <div key={i} className="flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl" style={{ backgroundColor: "rgba(0,255,198,0.05)" }}>
                                        <div className="p-1.5 sm:p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: "rgba(0,255,198,0.1)" }}>
                                            <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#00FFC6]" />
                                        </div>
                                        <div>
                                            <h4 className="text-base sm:text-lg font-bold text-[#E0E0E0] mb-1">{service.title}</h4>
                                            <p className="text-xs sm:text-sm text-[#b0f5e6]">{service.desc}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* Process Section */}
            <section className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
                <div className="text-center mb-8 sm:mb-12">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#00FFC6] mb-3">My Process</h2>
                    <div className="h-1 w-16 sm:w-24 rounded-full bg-[#00FFC6] mx-auto mb-4" />
                    <p className="text-sm sm:text-base md:text-lg text-[#b0f5e6] max-w-3xl mx-auto px-4">
                        A systematic approach to ensure every project meets the highest standards of security, privacy, and performance.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                    {[
                        { step: "01", title: "Discovery", desc: "Understanding your needs, challenges, and objectives" },
                        { step: "02", title: "Strategy", desc: "Designing a tailored approach with privacy and security first" },
                        { step: "03", title: "Implementation", desc: "Building clean, efficient, and secure solutions" },
                        { step: "04", title: "Refinement", desc: "Testing, optimizing, and ensuring long-term reliability" }
                    ].map((phase, i) => (
                        <div
                            key={i}
                            className="relative rounded-xl sm:rounded-2xl p-4 sm:p-6 border transition-all duration-300 hover:-translate-y-2"
                            style={{
                                background: "linear-gradient(135deg, rgba(0,255,198,0.08) 0%, rgba(0,0,0,0.95) 100%)",
                                borderColor: "rgba(0,255,198,0.3)",
                                boxShadow: "0 15px 40px rgba(0,0,0,0.4)",
                            }}
                        >
                            <div className="text-3xl sm:text-4xl md:text-5xl font-black text-[#00FFC6] opacity-20 mb-3 sm:mb-4">{phase.step}</div>
                            <h3 className="text-lg sm:text-xl font-bold text-[#00FFC6] mb-2">{phase.title}</h3>
                            <p className="text-xs sm:text-sm text-[#b0f5e6]">{phase.desc}</p>

                            {i < 3 && (
                                <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-[#00FFC6]" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Tools & Technologies - Modified to Left-Right Column Layout */}
            <section className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
                <div className="text-center mb-8 sm:mb-12">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#00FFC6] mb-3">Tools & Technologies</h2>
                    <div className="h-1 w-16 sm:w-24 rounded-full bg-[#00FFC6] mx-auto" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                    {/* Left Column */}
                    <div className="space-y-8">
                        {leftColumn.map(([category, technologies], categoryIndex) => (
                            <div key={categoryIndex} className="mb-8">
                                <div className="flex items-center gap-2 mb-4 sm:mb-6">
                                    {category === "Programming Languages" && <Code className="w-5 h-5 sm:w-6 sm:h-6 text-[#00FFC6]" />}
                                    {category === "Frameworks & Libraries" && <Package className="w-5 h-5 sm:w-6 sm:h-6 text-[#00FFC6]" />}
                                    {category === "Security Tools" && <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-[#00FFC6]" />}
                                    {category === "Cloud & DevOps" && <CloudRain className="w-5 h-5 sm:w-6 sm:h-6 text-[#00FFC6]" />}
                                    {category === "Databases & Storage" && <Database className="w-5 h-5 sm:w-6 sm:h-6 text-[#00FFC6]" />}
                                    {category === "AI/ML Tools" && <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-[#00FFC6]" />}
                                    {category === "Monitoring & Analytics" && <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-[#00FFC6]" />}
                                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#00FFC6]">{category}</h3>
                                    <div className="h-px flex-1 bg-gradient-to-r from-[#00FFC6] to-transparent opacity-30"></div>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                                    {Object.entries(technologies).map(([tech, Icon], i) => (
                                        <div
                                            key={i}
                                            className="rounded-lg sm:rounded-xl p-3 sm:p-4 border text-center transition-all duration-300 hover:-translate-y-2 hover:scale-105"
                                            style={{
                                                background: "linear-gradient(135deg, rgba(0,255,198,0.05) 0%, rgba(0,0,0,0.9) 100%)",
                                                borderColor: "rgba(0,255,198,0.2)",
                                                boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                                            }}
                                        >
                                            <div className="flex justify-center mb-2">
                                                <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-[#00FFC6]" />
                                            </div>
                                            <div className="text-xs sm:text-sm md:text-base font-bold text-[#00FFC6] break-words">{tech}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-8">
                        {rightColumn.map(([category, technologies], categoryIndex) => (
                            <div key={categoryIndex} className="mb-8">
                                <div className="flex items-center gap-2 mb-4 sm:mb-6">
                                    {category === "Programming Languages" && <Code className="w-5 h-5 sm:w-6 sm:h-6 text-[#00FFC6]" />}
                                    {category === "Frameworks & Libraries" && <Package className="w-5 h-5 sm:w-6 sm:h-6 text-[#00FFC6]" />}
                                    {category === "Security Tools" && <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-[#00FFC6]" />}
                                    {category === "Cloud & DevOps" && <CloudRain className="w-5 h-5 sm:w-6 sm:h-6 text-[#00FFC6]" />}
                                    {category === "Databases & Storage" && <Database className="w-5 h-5 sm:w-6 sm:h-6 text-[#00FFC6]" />}
                                    {category === "AI/ML Tools" && <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-[#00FFC6]" />}
                                    {category === "Monitoring & Analytics" && <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-[#00FFC6]" />}
                                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#00FFC6]">{category}</h3>
                                    <div className="h-px flex-1 bg-gradient-to-r from-[#00FFC6] to-transparent opacity-30"></div>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                                    {Object.entries(technologies).map(([tech, Icon], i) => (
                                        <div
                                            key={i}
                                            className="rounded-lg sm:rounded-xl p-3 sm:p-4 border text-center transition-all duration-300 hover:-translate-y-2 hover:scale-105"
                                            style={{
                                                background: "linear-gradient(135deg, rgba(0,255,198,0.05) 0%, rgba(0,0,0,0.9) 100%)",
                                                borderColor: "rgba(0,255,198,0.2)",
                                                boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                                            }}
                                        >
                                            <div className="flex justify-center mb-2">
                                                <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-[#00FFC6]" />
                                            </div>
                                            <div className="text-xs sm:text-sm md:text-base font-bold text-[#00FFC6] break-words">{tech}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
                <div
                    className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 text-center backdrop-blur-sm"
                    style={{
                        background: "linear-gradient(135deg, rgba(0,255,198,0.15) 0%, rgba(0,0,0,0.9) 100%)",
                        borderColor: "rgba(0,255,198,0.4)",
                        border: "1px solid",
                        boxShadow: "0 25px 70px rgba(0,255,198,0.15)",
                    }}
                >
                    <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-[#00FFC6] mb-4 sm:mb-6 px-2">
                        Ready to Build Something Secure and Innovative?
                    </h3>
                    <p className="text-sm sm:text-base md:text-lg text-[#b0f5e6] mb-6 sm:mb-8 max-w-3xl mx-auto px-2">
                        Let's discuss how my expertise can help you create technology that respects privacy, prioritizes security, and delivers exceptional user experiences.
                    </p>

                    <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4">
                        <Link
                            href="/contact"
                            className="group inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                            style={{
                                backgroundColor: "#00FFC6",
                                color: "#0a0a0a",
                                boxShadow: "0 10px 40px rgba(0,255,198,0.4)",
                            }}
                        >
                            <Contact className="w-4 h-4 sm:w-5 sm:h-5" />
                            Get In Touch
                            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <Link
                            href="/projects"
                            className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold border-2 transition-all duration-300 hover:scale-105"
                            style={{
                                borderColor: "#00FFC6",
                                color: "#00FFC6",
                                backgroundColor: "rgba(0,255,198,0.05)"
                            }}
                        >
                            <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
                            View My Work
                        </Link>
                    </div>
                </div>
            </section>

            {/* Bottom Spacing */}
            <div className="h-16 sm:h-20 md:h-24" />

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