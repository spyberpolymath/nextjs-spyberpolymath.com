'use client';

import { useState, useEffect } from 'react';
import { GraduationCap, User, Dna, Shield, Github, Brain, Users, Award, Key, Search, FileText, Calendar, MapPin, Trophy, Sparkles, Zap, ChevronRight, ArrowRight } from 'lucide-react';

export default function Journey() {
    const [activeSection, setActiveSection] = useState('education');
    const [isVisible, setIsVisible] = useState(false);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const sections = [
        { id: 'education', label: 'Education', icon: GraduationCap },
        { id: 'experience', label: 'Experience', icon: Users },
        // { id: 'certifications', label: 'Certifications', icon: Award },
        // { id: 'research', label: 'Research', icon: Brain }
    ];

    return (
        <div className="min-h-screen pt-20 md:pt-24 lg:pt-28 relative overflow-hidden" style={{
            background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 25%, #121212 50%, #1a1a1a 75%, #0a0a0a 100%)',
            color: '#E0E0E0'
        }}>
            <style jsx global>{`
                @keyframes gradientShift {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(3deg); }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideInLeft {
                    from { opacity: 0; transform: translateX(-50px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(50px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes pulse-glow {
                    0%, 100% { opacity: 0.6; }
                    50% { opacity: 1; }
                }
                @keyframes rotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .gradient-text {
                    background: linear-gradient(45deg, #00FFC6, #00D4AA, #E0E0E0, #00FFC6);
                    background-size: 300% 300%;
                    background-clip: text;
                    -webkit-background-clip: text;
                    color: transparent;
                    animation: gradientShift 4s ease infinite;
                }
                .fade-in-up {
                    animation: fadeInUp 0.8s ease-out forwards;
                }
                .slide-in-left {
                    animation: slideInLeft 0.6s ease-out forwards;
                }
                .slide-in-right {
                    animation: slideInRight 0.6s ease-out forwards;
                }
                .card-stack {
                    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .card-stack:hover {
                    transform: translateY(-12px) scale(1.02);
                }
                .timeline-dot {
                    transition: all 0.3s ease;
                }
                .timeline-dot:hover {
                    transform: scale(1.5);
                    box-shadow: 0 0 20px rgba(0, 255, 198, 0.6);
                }
                .nav-pill {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .nav-pill:hover {
                    transform: translateX(5px);
                }
                /* Respect reduced motion */
                @media (prefers-reduced-motion: reduce) {
                    .fade-in-up, .slide-in-left, .slide-in-right, [style*="animation:"] {
                        animation: none !important;
                        transition: none !important;
                    }
                }

                /* Disable hover-only effects on touch devices */
                @media (hover: none) and (pointer: coarse) {
                    .nav-pill:hover, .card-stack:hover, .timeline-dot:hover {
                        transform: none !important;
                        box-shadow: none !important;
                    }
                }
            `}</style>

            {/* Animated Background */}
            <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
                <div className="absolute w-96 h-96 rounded-full blur-3xl opacity-20"
                    style={{
                        background: 'radial-gradient(circle, #00FFC6 0%, transparent 70%)',
                        top: '10%',
                        left: '5%',
                        animation: 'float 8s ease-in-out infinite'
                    }}></div>
                <div className="absolute w-80 h-80 rounded-full blur-3xl opacity-15"
                    style={{
                        background: 'radial-gradient(circle, #00D4AA 0%, transparent 70%)',
                        bottom: '10%',
                        right: '5%',
                        animation: 'float 10s ease-in-out infinite 2s'
                    }}></div>
                <div className="absolute w-64 h-64 rounded-full blur-2xl opacity-10"
                    style={{
                        background: 'radial-gradient(circle, #00FFC6 0%, transparent 70%)',
                        top: '50%',
                        right: '20%',
                        animation: 'float 12s ease-in-out infinite 4s'
                    }}></div>
            </div>

            {/* Hero Section with Vertical Layout */}
            <section className="relative px-4 sm:px-6 lg:px-8 pt-12 pb-8">
                <div className={`max-w-7xl mx-auto ${isVisible ? 'fade-in-up' : 'opacity-0'}`}>
                    {/* Compact Badge */}
                    <div className="flex justify-center mb-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md"
                            style={{
                                background: 'rgba(0, 255, 198, 0.08)',
                                border: '1px solid rgba(0, 255, 198, 0.3)',
                                boxShadow: '0 8px 32px rgba(0, 255, 198, 0.1)'
                            }}>
                            <Trophy className="w-4 h-4" style={{ color: '#00FFC6' }} />
                            <span className="text-xs font-semibold tracking-wider" style={{ color: '#00FFC6' }}>Professional Journey</span>
                        </div>
                    </div>

                    {/* Compact Title */}
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4 gradient-text text-center leading-tight tracking-tight">
                        My Journey
                    </h1>

                    {/* Compact Subtitle */}
                    <p className="text-sm sm:text-base max-w-2xl mx-auto leading-relaxed mb-8 text-center px-4"
                        style={{ color: '#b0f5e6' }}>
                        A comprehensive overview of my educational background, professional experience, certifications, and research contributions in cybersecurity and technology.
                    </p>
                </div>
                {/* Mobile nav toggle */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 flex justify-end lg:hidden">
                    <button
                        onClick={() => setMobileNavOpen(!mobileNavOpen)}
                        aria-expanded={mobileNavOpen}
                        aria-controls="journey-nav"
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border"
                        style={{ background: 'rgba(0,0,0,0.4)', borderColor: 'rgba(255,255,255,0.04)' }}
                    >
                        <span className="text-sm font-semibold" style={{ color: '#00FFC6' }}>{mobileNavOpen ? 'Close' : 'Sections'}</span>
                        <ChevronRight className="w-4 h-4" style={{ transform: mobileNavOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 200ms' }} />
                    </button>
                </div>
            </section>

            {/* Main Content Area with Sidebar Navigation */}
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <aside className="lg:w-64 lg:sticky lg:top-8 lg:self-start">
                        <nav id="journey-nav" className={`backdrop-blur-xl rounded-2xl p-4 border ${mobileNavOpen ? 'block' : 'hidden lg:block'}`}
                            style={{
                                background: 'linear-gradient(135deg, rgba(24, 26, 27, 0.8) 0%, rgba(18, 18, 18, 0.8) 100%)',
                                borderColor: 'rgba(0, 255, 198, 0.15)',
                                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
                            }}>
                            <div className="space-y-2">
                                {sections.map((section) => {
                                    const Icon = section.icon;
                                    const isActive = activeSection === section.id;
                                    return (
                                        <button
                                            key={section.id}
                                            onClick={() => { setActiveSection(section.id); setMobileNavOpen(false); }}
                                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setActiveSection(section.id); setMobileNavOpen(false); } }}
                                            aria-current={isActive ? 'true' : undefined}
                                            aria-pressed={isActive}
                                            className={`nav-pill w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${isActive ? '' : 'hover:pl-6'}`}
                                            style={{
                                                background: isActive
                                                    ? 'linear-gradient(135deg, rgba(0, 255, 198, 0.2), rgba(0, 212, 170, 0.1))'
                                                    : 'transparent',
                                                color: isActive ? '#00FFC6' : '#b0f5e6',
                                                borderLeft: isActive ? '3px solid #00FFC6' : '3px solid transparent'
                                            }}
                                        >
                                            <Icon className="w-5 h-5" />
                                            <span>{section.label}</span>
                                            {isActive && <ArrowRight className="w-4 h-4 ml-auto" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </nav>
                    </aside>

                    {/* Content Area */}
                    <main className="flex-1 min-w-0">
                        {/* Education Section */}
                        {activeSection === 'education' && (
                            <div className="slide-in-right space-y-6">
                                {/* Header Card */}
                                <div className="backdrop-blur-xl rounded-2xl p-6 border"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(24, 26, 27, 0.8) 0%, rgba(18, 18, 18, 0.8) 100%)',
                                        borderColor: 'rgba(0, 255, 198, 0.15)',
                                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
                                    }}>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-3 rounded-xl"
                                            style={{
                                                background: 'linear-gradient(135deg, rgba(0, 255, 198, 0.2), rgba(0, 212, 170, 0.1))'
                                            }}>
                                            <GraduationCap className="w-8 h-8" style={{ color: '#00FFC6' }} />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black gradient-text">Education</h2>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Calendar className="w-3 h-3" style={{ color: '#b0f5e6' }} />
                                                <span className="text-xs font-medium" style={{ color: '#b0f5e6' }}>2019 - Present</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-sm leading-relaxed" style={{ color: '#E0E0E0' }}>
                                        My educational journey spans multiple disciplines in computer science and cybersecurity, combining theoretical foundation with practical application in cutting-edge security research and technology development.
                                    </p>
                                </div>

                                {/* Timeline Education Cards */}
                                <div className="relative">
                                    {/* Timeline Line */}
                                    <div className="absolute left-6 top-0 bottom-0 w-0.5"
                                        style={{ background: 'linear-gradient(180deg, #00FFC6, #00D4AA)' }}></div>

                                    <div className="space-y-8">
                                        {[
                                            {
                                                icon: GraduationCap,
                                                title: "SSLC (Secondary School Leaving Certificate)",
                                                institution: "Preethi Dham English Medium High School, Bangalore",
                                                status: "Completed",
                                                statusColor: "#00FFC6",
                                                description: "Completed secondary education with a strong foundation in mathematics, science, and computer basics. Developed analytical thinking, communication skills, and participated in academic and extracurricular activities.",
                                                focus: [
                                                    "Mathematics & Science: Core subjects fostering analytical and logical reasoning",
                                                    "Computer Basics: Introduction to computers and digital literacy",
                                                    "Communication Skills: English language proficiency and public speaking",
                                                    "Extracurricular Activities: Participation in sports, arts, and leadership programs"
                                                ],
                                                tags: ["Mathematics", "Science", "Computer Basics", "Communication", "Extracurricular"]
                                            },
                                            {
                                                icon: GraduationCap,
                                                title: "Diploma in Computer Science",
                                                institution: "Al Khateeb Polytechnic College, Bangalore",
                                                status: "Completed",
                                                statusColor: "#00FFC6",
                                                description: "Foundation in computer science fundamentals including systems programming, algorithms, and database management. Gained practical experience with Linux systems and server administration.",
                                                focus: [
                                                    "Systems Programming: Low-level programming and operating system concepts",
                                                    "Algorithms & Data Structures: Computational thinking and optimization",
                                                    "Linux Administration: System configuration and command-line proficiency",
                                                    "Database Systems: Relational database design and management"
                                                ],
                                                tags: ["Systems Programming", "Algorithms", "Linux", "Database Management"]
                                            },
                                            {
                                                icon: User,
                                                title: "Bachelor of Computer Applications",
                                                institution: "Bangalore College of Management Studies, Bangalore",
                                                specialization: "Specialization: Cybersecurity & Ethical Hacking",
                                                status: "Ongoing",
                                                statusColor: "#FFB800",
                                                description: "Comprehensive undergraduate program focused on cybersecurity principles, ethical hacking methodologies, and digital forensics. Combining practical hands-on experience with theoretical security frameworks.",
                                                focus: [
                                                    "Cybersecurity Fundamentals: Security principles and risk assessment",
                                                    "Ethical Hacking: Penetration testing and vulnerability assessment",
                                                    "Digital Forensics: Evidence collection and analysis techniques",
                                                    "Network Security: Secure communication and infrastructure protection"
                                                ],
                                                tags: ["Cybersecurity", "Ethical Hacking", "Digital Forensics", "Network Security"]
                                            }
                                            // {
                                            //     icon: User,
                                            //     title: "Master of Science",
                                            //     institution: "REVA University, Bangalore",
                                            //     specialization: "Specialization: Cybersecurity & Digital Forensics",
                                            //     status: "In Progress",
                                            //     statusColor: "#FFB800",
                                            //     description: "Advanced graduate program focusing on cutting-edge cybersecurity research, incident response methodologies, and security operations. Emphasis on practical application and research-driven learning.",
                                            //     focus: [
                                            //         "Advanced Cybersecurity: Modern threat landscape and defense strategies",
                                            //         "Digital Forensics: Advanced investigation and evidence analysis",
                                            //         "Incident Response: Crisis management and recovery procedures",
                                            //         "Security Operations: SOC management and threat hunting"
                                            //     ],
                                            //     tags: ["Advanced Security", "Digital Forensics", "Incident Response", "Security Operations"]
                                            // },
                                            // {
                                            //     icon: Dna,
                                            //     title: "PhD in Cybersecurity",
                                            //     institution: "Helsinki, Finland",
                                            //     specialization: "Research Focus: Advanced Cybersecurity & Threat Intelligence",
                                            //     status: "In Progress",
                                            //     statusColor: "#FFB800",
                                            //     description: "Doctoral research program concentrating on advanced cybersecurity research, threat intelligence, and security operations. Contributing to the academic and practical advancement of cybersecurity knowledge.",
                                            //     focus: [
                                            //         "Advanced Cybersecurity Research: Novel approaches to security challenges",
                                            //         "Threat Intelligence: Predictive threat modeling and attribution",
                                            //         "Digital Forensics: Advanced investigation methodologies",
                                            //         "Security Operations: Next-generation SOC technologies"
                                            //     ],
                                            //     tags: ["Research", "Threat Intelligence", "Advanced Forensics", "Security Innovation"]
                                            // }
                                        ].map((education, index) => {
                                            const Icon = education.icon;
                                            return (
                                                <div key={index} className="relative pl-16" style={{ animationDelay: `${index * 0.1}s` }}>
                                                    {/* Timeline Dot */}
                                                    <div className="timeline-dot absolute left-3 w-6 h-6 rounded-full border-4"
                                                        style={{
                                                            background: education.statusColor,
                                                            borderColor: '#121212',
                                                            boxShadow: `0 0 20px ${education.statusColor}80`
                                                        }} aria-hidden="true" />

                                                    {/* Card */}
                                                    <article className="card-stack backdrop-blur-xl rounded-2xl p-6 border"
                                                        style={{
                                                            background: 'linear-gradient(135deg, rgba(18, 18, 18, 0.9) 0%, rgba(15, 15, 15, 0.9) 100%)',
                                                            borderColor: 'rgba(0, 255, 198, 0.12)',
                                                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
                                                        }}>
                                                        <div className="flex items-start justify-between gap-4 mb-4">
                                                            <div className="flex items-start gap-3 flex-1">
                                                                <div className="p-2 rounded-lg"
                                                                    style={{
                                                                        background: 'linear-gradient(135deg, rgba(0, 255, 198, 0.15), rgba(0, 212, 170, 0.08))'
                                                                    }}>
                                                                    <Icon className="w-6 h-6" style={{ color: '#00FFC6' }} />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <h3 className="text-lg font-bold gradient-text mb-1">
                                                                        {education.title}
                                                                    </h3>
                                                                    <div className="flex items-center gap-2">
                                                                        <MapPin className="w-3 h-3" style={{ color: '#b0f5e6' }} />
                                                                        <p className="text-sm font-medium" style={{ color: '#b0f5e6' }}>
                                                                            {education.institution}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <span className="px-2 py-1 rounded-full text-xs font-bold"
                                                                style={{
                                                                    background: education.statusColor,
                                                                    color: '#121212'
                                                                }}>
                                                                {education.status}
                                                            </span>
                                                        </div>

                                                        {education.specialization && (
                                                            <p className="text-xs font-medium mb-3 px-3 py-1.5 rounded-lg inline-block"
                                                                style={{
                                                                    color: '#b0f5e6',
                                                                    background: 'rgba(0, 255, 198, 0.05)',
                                                                    border: '1px solid rgba(0, 255, 198, 0.1)'
                                                                }}>
                                                                {education.specialization}
                                                            </p>
                                                        )}

                                                        <p className="text-sm leading-relaxed mb-4" style={{ color: '#E0E0E0' }}>
                                                            {education.description}
                                                        </p>

                                                        <div className="mb-4">
                                                            <h5 className="text-xs font-semibold mb-2 flex items-center gap-2" style={{ color: '#00FFC6' }}>
                                                                <Sparkles className="w-3 h-3" />
                                                                Key Areas of Focus:
                                                            </h5>
                                                            <ul className="text-xs space-y-1.5" style={{ color: '#b0f5e6' }}>
                                                                {education.focus.map((item, focusIndex) => (
                                                                    <li key={focusIndex} className="flex items-start gap-2">
                                                                        <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: '#00FFC6' }} />
                                                                        <span className="flex-1">{item}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>

                                                        <div className="flex flex-wrap gap-1.5">
                                                            {education.tags.map((tag, tagIndex) => (
                                                                <span key={tagIndex} className="px-2 py-1 rounded-full text-xs font-semibold"
                                                                    style={{
                                                                        background: 'rgba(35, 35, 35, 0.6)',
                                                                        color: '#b0f5e6',
                                                                        border: '1px solid rgba(0, 255, 198, 0.2)'
                                                                    }}>
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </article>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Experience Section */}
                        {activeSection === 'experience' && (
                            <div className="slide-in-right space-y-6">
                                {/* Header Card */}
                                <div className="backdrop-blur-xl rounded-2xl p-6 border"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(24, 26, 27, 0.8) 0%, rgba(18, 18, 18, 0.8) 100%)',
                                        borderColor: 'rgba(0, 255, 198, 0.15)',
                                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
                                    }}>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-3 rounded-xl"
                                            style={{
                                                background: 'linear-gradient(135deg, rgba(0, 255, 198, 0.2), rgba(0, 212, 170, 0.1))'
                                            }}>
                                            <Users className="w-8 h-8" style={{ color: '#00FFC6' }} />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black gradient-text">Professional Experience</h2>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Calendar className="w-3 h-3" style={{ color: '#b0f5e6' }} />
                                                <span className="text-xs font-medium" style={{ color: '#b0f5e6' }}>2023 - Present</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-sm leading-relaxed" style={{ color: '#E0E0E0' }}>
                                        My professional journey encompasses diverse roles in cybersecurity consulting, open-source development, and research. Each position has contributed to my expertise in security analysis, team leadership, and innovative technology development.
                                    </p>
                                </div>

                                {/* Timeline Experience Cards */}
                                <div className="relative">
                                    <div className="absolute left-6 top-0 bottom-0 w-0.5"
                                        style={{ background: 'linear-gradient(180deg, #00FFC6, #00D4AA)' }}></div>

                                    <div className="space-y-8">
                                        {[
                                            {
                                                icon: Shield,
                                                title: "Cloud DevSecOps Engineer and Team Leader",
                                                company: "Lovosis Technology Private Limited.",
                                                duration: "December 2025 - Present",
                                                status: "Current",
                                                statusColor: "#00FFC6",
                                                location: "Bengaluru North, Karnataka, India",
                                                description: "I lead a team of Cloud DevSecOps and Full-Stack Engineers as a Cloud DevSecOps Engineer & Team Leader, focusing on building and managing reliable, scalable, and secure cloud infrastructure. I drive automation across deployment pipelines, enhance CI/CD workflows, and integrate security best practices into every stage of the development lifecycle. My role includes guiding the team, optimizing cloud and security resources, enforcing compliance, and ensuring high system availability. I work closely with development, operations, and security teams to deliver seamless, secure, and efficient end-to-end operations.",
                                                achievements: [
                                                    "Team Leadership: Guided Cloud DevSecOps and Full-Stack Engineers for secure cloud infrastructure",
                                                    "Security Integration: Integrated security best practices into development lifecycle",
                                                    "Automation: Enhanced CI/CD workflows and deployment pipelines",
                                                    "Compliance: Enforced compliance and optimized cloud and security resources",
                                                    "Collaboration: Worked with development, operations, and security teams"
                                                ],
                                                skills: ["Ethical Hacking", "Cloud DevSecOps", "Cloud Security", "CI/CD", "Compliance", "Team Leadership"]
                                            },
                                            {
                                                icon: Users,
                                                title: "DevOps Engineer & Team Leader",
                                                company: "Lovosis Technology Private Limited.",
                                                duration: "August 2025 - December 2025",
                                                status: "Completed",
                                                statusColor: "#888888",
                                                location: "Bengaluru North, Karnataka, India",
                                                description: "I lead a team of DevOps Engineers and Full Stack Engineer to build and manage reliable, scalable, and secure infrastructure. I focus on automating deployments, improving CI/CD pipelines, and ensuring smooth collaboration between development and operations team. My role includes guiding the team, optimizing cloud resources, and maintaining high system uptime.",
                                                achievements: [
                                                    "Team Leadership: Guided DevOps and Full Stack Engineers for reliable infrastructure",
                                                    "Automation: Improved CI/CD pipelines and automated deployments",
                                                    "Cloud Optimization: Enhanced resource usage and system uptime",
                                                    "Collaboration: Fostered smooth communication between development and operations"
                                                ],
                                                skills: ["DevOps", "CI/CD", "Cloud Infrastructure", "Team Leadership"]
                                            },
                                            {
                                                icon: Zap,
                                                title: "Full Stack Engineer & SEO Specialist",
                                                company: "Lovosis Technology Private Limited.",
                                                duration: "October 2024 - August 2025",
                                                status: "Completed",
                                                statusColor: "#888888",
                                                location: "Abbigere, Bengaluru North, Karnataka, India",
                                                description: "I'm a Full Stack Engineer and SEO Specialist skilled in Django, Next.js, Flutter and Database Management. I build scalable web and mobile apps with clean code and modern UI. My SEO expertise covers technical audits, keyword strategy, and site optimization, ensuring the platforms I create are both high-performance and search-engine optimized.",
                                                achievements: [
                                                    "Web & Mobile Apps: Built scalable platforms using Django, Next.js, Flutter",
                                                    "SEO Optimization: Conducted technical audits and implemented keyword strategies",
                                                    "UI/UX: Developed modern, user-friendly interfaces",
                                                    "Database Management: Ensured robust and efficient data handling"
                                                ],
                                                skills: ["Full Stack Development", "Django", "Next.js", "Flutter", "SEO", "Database Management"]
                                            },
                                            {
                                                icon: Award,
                                                title: "Web Developer & SEO Specialist (Intern)",
                                                company: "Goodiebasket",
                                                duration: "August 2024 - October 2024",
                                                status: "Completed",
                                                statusColor: "#888888",
                                                location: "Judicial Layout, GKVK, Yelahanka, Bengaluru, Karnataka",
                                                description: "Website Developer and SEO Manager at Goodie Basket, responsible for developing and maintaining its eCommerce website while optimizing SEO for Google and social media platforms. Expertise includes SEO, WordPress, Google Sheets, and MS Excel. I analyze website structures, generate SEO reports, and implement strategies to improve search rankings, driving organic traffic and enhancing online visibility.",
                                                achievements: [
                                                    "eCommerce Development: Built and maintained Goodie Basket's website",
                                                    "SEO Management: Improved Google and social media rankings",
                                                    "Reporting: Generated SEO reports and data-driven insights",
                                                    "Optimization: Enhanced online visibility and organic traffic"
                                                ],
                                                skills: ["Web Development", "SEO", "WordPress", "Google Sheets", "MS Excel"]
                                            },
                                            {
                                                icon: Github,
                                                title: "Full Stack Developer (Intern)",
                                                company: "Zetacoding Innovative Solutions",
                                                duration: "January 2024 - March 2024",
                                                status: "Completed",
                                                statusColor: "#888888",
                                                location: "#6, 2nd Floor, 1st Cross Rd, KHB Colony, Gandhi Nagar, Yelahanka, Bengaluru",
                                                description: "Interned for three months focusing on Django development. Gained hands-on experience in building scalable web applications, working with Django, Bootstrap, and SQLite3. Collaborated with a team to develop innovative solutions, enhancing backend development, database management, and API integration skills.",
                                                achievements: [
                                                    "Django Development: Built scalable web applications",
                                                    "Team Collaboration: Worked with developers on innovative solutions",
                                                    "Database Management: Used SQLite3 for efficient data handling",
                                                    "API Integration: Enhanced backend and API skills"
                                                ],
                                                skills: ["Django", "Bootstrap", "SQLite3", "Backend Development", "API Integration"]
                                            },
                                            {
                                                icon: Shield,
                                                title: "Network Engineer (Intern)",
                                                company: "Micro Silicon Technologies",
                                                duration: "October 2023 - January 2024",
                                                status: "Completed",
                                                statusColor: "#888888",
                                                location: "F Block, Sahakar Nagar, Byatarayanapura, Bengaluru, Karnataka",
                                                description: "Worked as a Network and Hardware Engineer, maintaining and optimizing network infrastructure, ensuring seamless connectivity, and troubleshooting hardware issues. Gained experience in network configuration, hardware installation, and system maintenance, contributing to efficient technical operations.",
                                                achievements: [
                                                    "Network Maintenance: Ensured seamless connectivity and optimized infrastructure",
                                                    "Hardware Engineering: Installed and troubleshooted hardware systems",
                                                    "System Maintenance: Maintained efficient technical environment",
                                                    "Technical Growth: Developed strong network and hardware engineering skills"
                                                ],
                                                skills: ["Network Engineering", "Hardware Installation", "System Maintenance", "Troubleshooting"]
                                            }
                                        ].map((experience, index) => {
                                            const Icon = experience.icon;
                                            return (
                                                <div key={index} className="relative pl-16" style={{ animationDelay: `${index * 0.1}s` }}>
                                                    <div className="timeline-dot absolute left-3 w-6 h-6 rounded-full border-4"
                                                        style={{
                                                            background: experience.statusColor,
                                                            borderColor: '#121212',
                                                            boxShadow: `0 0 20px ${experience.statusColor}80`
                                                        }} aria-hidden="true" />

                                                    <article className="card-stack backdrop-blur-xl rounded-2xl p-6 border"
                                                        style={{
                                                            background: 'linear-gradient(135deg, rgba(18, 18, 18, 0.9) 0%, rgba(15, 15, 15, 0.9) 100%)',
                                                            borderColor: 'rgba(0, 255, 198, 0.12)',
                                                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
                                                        }}>
                                                        <div className="flex items-start justify-between gap-4 mb-4">
                                                            <div className="flex items-start gap-3 flex-1">
                                                                <div className="p-2 rounded-lg"
                                                                    style={{
                                                                        background: 'linear-gradient(135deg, rgba(0, 255, 198, 0.15), rgba(0, 212, 170, 0.08))'
                                                                    }}>
                                                                    <Icon className="w-6 h-6" style={{ color: '#00FFC6' }} />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <h3 className="text-lg font-bold mb-1" style={{ color: '#00FFC6' }}>
                                                                        {experience.title}
                                                                    </h3>
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <MapPin className="w-3 h-3" style={{ color: '#b0f5e6' }} />
                                                                        <p className="text-sm font-medium" style={{ color: '#b0f5e6' }}>
                                                                            {experience.company}
                                                                        </p>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <Calendar className="w-3 h-3" style={{ color: '#888' }} />
                                                                        <span className="text-xs" style={{ color: '#888' }}>
                                                                            {experience.duration}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <span className="px-2 py-1 rounded-full text-xs font-bold"
                                                                style={{
                                                                    background: experience.statusColor,
                                                                    color: '#121212'
                                                                }}>
                                                                {experience.status}
                                                            </span>
                                                        </div>

                                                        {experience.location && (
                                                            <div className="flex items-center gap-2 mb-3 ml-11">
                                                                <MapPin className="w-3 h-3" style={{ color: '#666' }} />
                                                                <span className="text-xs" style={{ color: '#666' }}>
                                                                    {experience.location}
                                                                </span>
                                                            </div>
                                                        )}

                                                        <p className="text-sm leading-relaxed mb-4" style={{ color: '#E0E0E0' }}>
                                                            {experience.description}
                                                        </p>

                                                        <div className="mb-4">
                                                            <h5 className="text-xs font-semibold mb-2 flex items-center gap-2" style={{ color: '#00FFC6' }}>
                                                                <Sparkles className="w-3 h-3" />
                                                                Key Achievements:
                                                            </h5>
                                                            <ul className="text-xs space-y-1.5" style={{ color: '#b0f5e6' }}>
                                                                {experience.achievements.map((achievement, achievementIndex) => (
                                                                    <li key={achievementIndex} className="flex items-start gap-2">
                                                                        <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: '#00FFC6' }} />
                                                                        <span className="flex-1">{achievement}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>

                                                        <div className="flex flex-wrap gap-1.5">
                                                            {experience.skills.map((skill, skillIndex) => (
                                                                <span key={skillIndex} className="px-2 py-1 rounded-full text-xs font-semibold"
                                                                    style={{
                                                                        background: 'rgba(35, 35, 35, 0.6)',
                                                                        color: '#b0f5e6',
                                                                        border: '1px solid rgba(0, 255, 198, 0.2)'
                                                                    }}>
                                                                    {skill}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </article>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Certifications Section - COMMENTED OUT */}

                        {/* {activeSection === 'certifications' && (
                            <div className="slide-in-right space-y-6">
                                <div className="backdrop-blur-xl rounded-2xl p-6 border"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(24, 26, 27, 0.8) 0%, rgba(18, 18, 18, 0.8) 100%)',
                                        borderColor: 'rgba(0, 255, 198, 0.15)',
                                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
                                    }}>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-3 rounded-xl"
                                            style={{
                                                background: 'linear-gradient(135deg, rgba(0, 255, 198, 0.2), rgba(0, 212, 170, 0.1))'
                                            }}>
                                            <Award className="w-8 h-8" style={{ color: '#00FFC6' }} />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black gradient-text">Certifications</h2>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Award className="w-3 h-3" style={{ color: '#b0f5e6' }} />
                                                <span className="text-xs font-medium" style={{ color: '#b0f5e6' }}>Industry Recognition</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-sm leading-relaxed" style={{ color: '#E0E0E0' }}>
                                        My professional certifications demonstrate expertise across multiple domains of cybersecurity, digital forensics, and technology leadership. Each certification represents mastery of specific skills and adherence to industry standards.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold mb-4 gradient-text">
                                        Cybersecurity Certifications
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {[
                                            {
                                                icon: Shield,
                                                title: "Certified Ethical Hacker (CEH)",
                                                issuer: "EC-Council",
                                                status: "In Progress",
                                                statusColor: "#FFB800",
                                                description: "Industry-leading certification in ethical hacking techniques, penetration testing, and vulnerability assessment methodologies.",
                                                skills: ["Ethical Hacking", "Penetration Testing", "Vulnerability Assessment"]
                                            },
                                            {
                                                icon: Search,
                                                title: "Computer Hacking Forensic Investigator (CHFI)",
                                                issuer: "EC-Council",
                                                status: "In Progress",
                                                statusColor: "#FFB800",
                                                description: "Advanced certification in digital forensics covering evidence acquisition, analysis, and presentation in legal proceedings.",
                                                skills: ["Digital Forensics", "Investigation", "Incident Response"]
                                            },
                                            {
                                                icon: Brain,
                                                title: "Certified Threat Intelligence Analyst (CTIA)",
                                                issuer: "EC-Council",
                                                status: "In Progress",
                                                statusColor: "#FFB800",
                                                description: "Specialized certification in threat intelligence analysis, red teaming, and security analysis methodologies.",
                                                skills: ["Threat Intelligence", "Red Teaming", "Security Analysis"]
                                            },
                                            {
                                                icon: Award,
                                                title: "Offensive Security Certified Professional (OSCP)",
                                                issuer: "Offensive Security",
                                                status: "In Progress",
                                                statusColor: "#FFB800",
                                                description: "Hands-on certification in advanced penetration testing, exploitation techniques, and comprehensive security reporting.",
                                                skills: ["Advanced Penetration Testing", "Exploitation", "Reporting"]
                                            },
                                            {
                                                icon: Shield,
                                                title: "Certified Information Systems Security Professional (CISSP)",
                                                issuer: "(ISC)²",
                                                status: "In Progress",
                                                statusColor: "#FFB800",
                                                description: "Advanced cybersecurity certification covering risk management, compliance, and comprehensive security architecture.",
                                                skills: ["Cybersecurity", "Risk Management", "Compliance"]
                                            }
                                        ].map((certification, index) => {
                                            const Icon = certification.icon;
                                            return (
                                                <article key={index} className="card-stack backdrop-blur-xl rounded-2xl p-6 border"
                                                    style={{
                                                        background: 'linear-gradient(135deg, rgba(18, 18, 18, 0.9) 0%, rgba(15, 15, 15, 0.9) 100%)',
                                                        borderColor: 'rgba(0, 255, 198, 0.12)',
                                                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                                                        animationDelay: `${index * 0.1}s`
                                                    }}>
                                                    <div className="flex items-start justify-between gap-4 mb-4">
                                                        <div className="p-3 rounded-xl"
                                                            style={{
                                                                background: 'linear-gradient(135deg, rgba(0, 255, 198, 0.15), rgba(0, 212, 170, 0.08))'
                                                            }}>
                                                            <Icon className="w-7 h-7" style={{ color: '#00FFC6' }} />
                                                        </div>
                                                        <span className="px-2 py-1 rounded-full text-xs font-bold"
                                                            style={{
                                                                background: certification.statusColor,
                                                                color: '#121212'
                                                            }}>
                                                            {certification.status}
                                                        </span>
                                                    </div>

                                                    <h4 className="text-lg font-bold mb-2" style={{ color: '#00FFC6' }}>
                                                        {certification.title}
                                                    </h4>
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <Award className="w-4 h-4" style={{ color: '#b0f5e6' }} />
                                                        <p className="text-sm font-semibold" style={{ color: '#b0f5e6' }}>
                                                            {certification.issuer}
                                                        </p>
                                                    </div>

                                                    <p className="text-sm leading-relaxed mb-4" style={{ color: '#E0E0E0' }}>
                                                        {certification.description}
                                                    </p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {certification.skills.map((skill, skillIndex) => (
                                                            <span key={skillIndex} className="px-2 py-1 rounded-full text-xs font-semibold"
                                                                style={{
                                                                    background: 'rgba(35, 35, 35, 0.6)',
                                                                    color: '#b0f5e6',
                                                                    border: '1px solid rgba(0, 255, 198, 0.2)'
                                                                }}>
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </article>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                        */}

                        {/* Research Section - COMMENTED OUT */}

                        {/* {activeSection === 'research' && (
                            <div className="slide-in-right space-y-6">
                                <div className="backdrop-blur-xl rounded-2xl p-6 border"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(24, 26, 27, 0.8) 0%, rgba(18, 18, 18, 0.8) 100%)',
                                        borderColor: 'rgba(0, 255, 198, 0.15)',
                                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
                                    }}>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-3 rounded-xl"
                                            style={{
                                                background: 'linear-gradient(135deg, rgba(0, 255, 198, 0.2), rgba(0, 212, 170, 0.1))'
                                            }}>
                                            <Brain className="w-8 h-8" style={{ color: '#00FFC6' }} />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black gradient-text">Research & Publications</h2>
                                            <div className="flex items-center gap-2 mt-1">
                                                <FileText className="w-3 h-3" style={{ color: '#b0f5e6' }} />
                                                <span className="text-xs font-medium" style={{ color: '#b0f5e6' }}>Academic Contributions</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-sm leading-relaxed" style={{ color: '#E0E0E0' }}>
                                        My research focuses on the intersection of cybersecurity, artificial intelligence, and privacy-preserving technologies. I explore cutting-edge approaches to defensive and offensive security, post-quantum cryptography, and ethical AI systems.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold mb-4 gradient-text">
                                        Research Areas
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                        {[
                                            {
                                                icon: Shield,
                                                title: "Cybersecurity Research",
                                                focus: [
                                                    "Advanced Persistent Threat Detection: Developing novel approaches for identifying and mitigating sophisticated cyber attacks using behavioral analysis and machine learning.",
                                                    "Zero-Day Vulnerability Research: Systematic analysis of software vulnerabilities and development of proof-of-concept exploits for responsible disclosure.",
                                                    "Network Security Architecture: Research into next-generation network defense mechanisms and secure communication protocols.",
                                                    "IoT Security: Investigating security vulnerabilities in Internet of Things devices and developing secure-by-design frameworks."
                                                ]
                                            },
                                            {
                                                icon: Key,
                                                title: "Post-Quantum Cryptography",
                                                focus: [
                                                    "NIST Algorithm Implementation: Practical implementation and performance analysis of NIST-approved post-quantum cryptographic algorithms.",
                                                    "Migration Strategies: Developing frameworks for transitioning legacy systems to quantum-resistant cryptographic standards.",
                                                    "Hybrid Cryptographic Systems: Research into combining classical and post-quantum algorithms for enhanced security during the transition period.",
                                                    "Side-Channel Analysis: Investigating potential vulnerabilities in post-quantum implementations against side-channel attacks."
                                                ]
                                            },
                                            {
                                                icon: Brain,
                                                title: "AI Security & Privacy",
                                                focus: [
                                                    "Adversarial AI: Studying adversarial attacks on machine learning models and developing robust defense mechanisms.",
                                                    "Privacy-Preserving AI: Research into federated learning, differential privacy, and homomorphic encryption for AI systems.",
                                                    "Local LLM Security: Investigating security implications and privacy benefits of locally deployed large language models.",
                                                    "AI Ethics & Bias: Developing frameworks for ethical AI development and bias detection in automated systems."
                                                ]
                                            },
                                            {
                                                icon: Search,
                                                title: "Threat Intelligence",
                                                focus: [
                                                    "Automated Threat Attribution: Developing machine learning models for automated threat actor identification and attribution.",
                                                    "OSINT Methodologies: Advanced open-source intelligence gathering techniques and automated analysis frameworks.",
                                                    "Threat Landscape Analysis: Comprehensive analysis of emerging threats and attack patterns in the cybersecurity landscape.",
                                                    "Predictive Threat Modeling: Research into predictive models for anticipating future cyber threats and attack vectors."
                                                ]
                                            }
                                        ].map((research, index) => {
                                            const Icon = research.icon;
                                            return (
                                                <article key={index} className="card-stack backdrop-blur-xl rounded-2xl p-6 border"
                                                    style={{
                                                        background: 'linear-gradient(135deg, rgba(18, 18, 18, 0.9) 0%, rgba(15, 15, 15, 0.9) 100%)',
                                                        borderColor: 'rgba(0, 255, 198, 0.12)',
                                                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                                                        animationDelay: `${index * 0.1}s`
                                                    }}>
                                                    <div className="flex items-start gap-3 mb-4">
                                                        <div className="p-2 rounded-lg flex-shrink-0"
                                                            style={{
                                                                background: 'linear-gradient(135deg, rgba(0, 255, 198, 0.15), rgba(0, 212, 170, 0.08))'
                                                            }}>
                                                            <Icon className="w-6 h-6" style={{ color: '#00FFC6' }} />
                                                        </div>
                                                        <h3 className="text-lg font-bold gradient-text flex-1">
                                                            {research.title}
                                                        </h3>
                                                    </div>

                                                    <h4 className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: '#00FFC6' }}>
                                                        <Sparkles className="w-3 h-3" />
                                                        Current Focus Areas:
                                                    </h4>
                                                    <ul className="text-xs space-y-2" style={{ color: '#b0f5e6' }}>
                                                        {research.focus.map((item, focusIndex) => (
                                                            <li key={focusIndex} className="flex items-start gap-2 leading-relaxed">
                                                                <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: '#00FFC6' }} />
                                                                <span className="flex-1">{item}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </article>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold mb-4 gradient-text">
                                        Publications & Papers
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {[
                                            {
                                                title: "Privacy-First AI: Implementing Local LLM Architectures",
                                                date: "2024",
                                                description: "Research paper on implementing privacy-preserving AI systems using locally deployed large language models, focusing on data sovereignty and reduced external dependencies.",
                                                tags: ["AI Privacy", "Local LLM", "Data Sovereignty"]
                                            },
                                            {
                                                title: "Post-Quantum Cryptography Migration Strategies",
                                                date: "2024",
                                                description: "Comprehensive analysis of practical approaches for migrating existing cryptographic infrastructure to post-quantum algorithms, including performance benchmarks and security considerations.",
                                                tags: ["Post-Quantum", "Cryptography", "Migration"]
                                            },
                                            {
                                                title: "Advanced Persistent Threat Detection Using Behavioral Analysis",
                                                date: "In Progress",
                                                description: "Ongoing research into novel approaches for detecting sophisticated cyber attacks through behavioral pattern analysis and machine learning techniques.",
                                                tags: ["APT Detection", "Behavioral Analysis", "Machine Learning"]
                                            }
                                        ].map((publication, index) => (
                                            <article key={index} className="card-stack backdrop-blur-xl rounded-2xl p-6 border"
                                                style={{
                                                    background: 'linear-gradient(135deg, rgba(18, 18, 18, 0.9) 0%, rgba(15, 15, 15, 0.9) 100%)',
                                                    borderColor: 'rgba(0, 255, 198, 0.12)',
                                                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                                                    animationDelay: `${index * 0.1}s`
                                                }}>
                                                <div className="flex justify-between items-start gap-4 mb-4">
                                                    <div className="p-3 rounded-xl"
                                                        style={{
                                                            background: 'linear-gradient(135deg, rgba(0, 255, 198, 0.15), rgba(0, 212, 170, 0.08))'
                                                        }}>
                                                        <FileText className="w-6 h-6" style={{ color: '#00FFC6' }} />
                                                    </div>
                                                    <span className="text-xs font-semibold px-2 py-1 rounded-full"
                                                        style={{
                                                            background: 'linear-gradient(135deg, rgba(0, 255, 198, 0.15), rgba(0, 212, 170, 0.08))',
                                                            color: '#00FFC6',
                                                            border: '1px solid rgba(0, 255, 198, 0.2)'
                                                        }}>
                                                        {publication.date}
                                                    </span>
                                                </div>

                                                <h4 className="text-base font-bold mb-3" style={{ color: '#00FFC6' }}>
                                                    {publication.title}
                                                </h4>
                                                <p className="text-sm leading-relaxed mb-4" style={{ color: '#E0E0E0' }}>
                                                    {publication.description}
                                                </p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {publication.tags.map((tag, tagIndex) => (
                                                        <span key={tagIndex} className="px-2 py-1 rounded-full text-xs font-semibold"
                                                            style={{
                                                                background: 'rgba(35, 35, 35, 0.6)',
                                                                color: '#b0f5e6',
                                                                border: '1px solid rgba(0, 255, 198, 0.2)'
                                                            }}>
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )} */}

                    </main>
                </div>
            </div>
        </div>
    );
}