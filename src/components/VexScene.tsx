'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Stage } from '@react-three/drei';
import { useRef, Suspense, useLayoutEffect, useState, memo, useEffect } from 'react';
import * as THREE from 'three';
import { useTheme } from 'next-themes';
import { ModeToggle } from './mode-toggle';
import { motion, AnimatePresence } from 'framer-motion';
import { CornerRibbon } from './corner-ribbon';
import translations from '@/data/translations.json';
import twemoji from 'twemoji';

function Model(props: any) {
  const { scene } = useGLTF('/vex.glb');
  const ref = useRef<THREE.Group>(null);
  const { theme, resolvedTheme } = useTheme();

  const currentTheme = theme === 'system' ? resolvedTheme : theme;

  useLayoutEffect(() => {
    scene.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = false;
        child.receiveShadow = false;
        
        if (currentTheme === 'dark') {
            child.material.color.set('#e0e0e0');
            child.material.roughness = 0.2;
            child.material.metalness = 0.3;
            child.material.envMapIntensity = 0.8;
            child.material.emissive = new THREE.Color('#1a1a1a');
            child.material.emissiveIntensity = 0.2;
        } else {
            child.material.color.set('#000000');
            child.material.roughness = 0.05;
            child.material.metalness = 0.8;
            child.material.envMapIntensity = 2.0;
        }
        
        child.material.needsUpdate = true;
      }
    });
  }, [scene, currentTheme]);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group ref={ref} {...props}>
      <primitive object={scene} />
      {currentTheme === 'dark' && (
        <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
      )}
    </group>
  );
}

const Scene3D = memo(function Scene3D() {
  return (
    <Canvas shadows dpr={[1, 2]} camera={{ fov: 50 }} className="bg-transparent">
      <Suspense fallback={null}>
        <Stage environment="warehouse" intensity={1} adjustCamera shadows={false}>
          <Model />
        </Stage>
      </Suspense>
    </Canvas>
  );
});

type Section = 'intro' | 'who-are-we' | 'member-detail' | 'projects' | 'contact';

type Language = 'en' | 'pl' | 'ru' | 'uk' | 'zh' | 'fr' | 'es' | 'hi' | 'cs' | 'sk' | 'de';

const Twemoji = memo(({ emoji }: { emoji: string }) => {
  const html = twemoji.parse(emoji, {
    folder: 'svg',
    ext: '.svg'
  });
  return <span dangerouslySetInnerHTML={{ __html: html }} className="flex items-center justify-center [&>img]:w-5 [&>img]:h-5" />;
});

const LANGUAGES: { code: Language; flag: string; label: string }[] = [
  { code: 'en', flag: '🇬🇧', label: 'English' },
  { code: 'pl', flag: '🇵🇱', label: 'Polski' },
  { code: 'ru', flag: '🇷🇺', label: 'Русский' },
  { code: 'uk', flag: '🇺🇦', label: 'Українська' },
  { code: 'zh', flag: '🇨🇳', label: '中文' },
  { code: 'fr', flag: '🇫🇷', label: 'Français' },
  { code: 'es', flag: '🇪🇸', label: 'Español' },
  { code: 'hi', flag: '🇮🇳', label: 'हिन्दी' },
  { code: 'cs', flag: '🇨🇿', label: 'Čeština' },
  { code: 'sk', flag: '🇸🇰', label: 'Slovenčina' },
  { code: 'de', flag: '🇩🇪', label: 'Deutsch' },
];

interface Member {
  id: number;
  name: string;
  aka: string[];
  role: string;
  bio: string;
  avatarLink: string;
}

interface Socials {
  github: string;
  discord: string;
}

export default function VexScene() {
  const [activeSection, setActiveSection] = useState<Section>('intro');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [lang, setLang] = useState<Language>('en');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [teamMembers, setTeamMembers] = useState<Member[]>([]);
  const [socials, setSocials] = useState<Socials>({ github: '', discord: '' });

  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem('vex-lang') as Language;
    if (savedLang && LANGUAGES.some(l => l.code === savedLang)) {
      setLang(savedLang);
    }

    fetch('https://sc.vex.systems/other/manifest.json')
      .then(res => res.json())
      .then(data => {
        setTeamMembers(data.members);
        setSocials(data.socials);
      })
      .catch(err => console.error(err));
  }, []);

  const handleLangChange = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('vex-lang', newLang);
    setShowLangMenu(false);
  };

  const t = translations[lang];

  if (!mounted) return null;

  return (
    <div className="w-full h-screen bg-white dark:bg-black text-black dark:text-white flex items-center justify-center gap-16 font-sans transition-colors duration-300 overflow-hidden relative">
      <ModeToggle />
      
      <div className="fixed top-4 left-4 z-50">
        <button 
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-2 p-2 rounded-lg bg-gray-100 dark:bg-neutral-900 hover:bg-gray-200 dark:hover:bg-neutral-800 transition-colors border border-transparent dark:border-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 dark:focus-visible:ring-gray-400"
        >
            <span className="text-xl">
                <Twemoji emoji={LANGUAGES.find(l => l.code === lang)?.flag || '🏳️'} />
            </span>
            <span className="text-sm font-medium uppercase">{lang}</span>
        </button>
        
        <AnimatePresence>
            {showLangMenu && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 mt-2 bg-white dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-lg shadow-xl overflow-hidden min-w-[140px]"
                >
                    {LANGUAGES.map((l) => (
                        <button
                            key={l.code}
                            onClick={() => handleLangChange(l.code)}
                            className="flex items-center gap-3 w-full p-2 hover:bg-gray-100 dark:hover:bg-neutral-900 transition-colors text-left"
                        >
                            <span className="text-xl"><Twemoji emoji={l.flag} /></span>
                            <span className="text-sm font-medium">{l.label}</span>
                        </button>
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      <CornerRibbon />
      <div className="flex flex-col items-center gap-6">
        <div className="w-[400px] h-[400px]">
            <Scene3D />
        </div>
        <div className="flex gap-4">
             {socials.github && (
                 <div className="relative group">
                     <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black dark:bg-white text-white dark:text-black text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap mb-2 shadow-lg z-10">
                         GitHub
                         <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black dark:border-t-white"></div>
                     </div>
                     <a 
                         href={socials.github} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="text-gray-500 hover:text-black dark:hover:text-white transition-colors block focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 dark:focus-visible:ring-gray-400 rounded"
                         aria-label="GitHub"
                     >
                         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
                     </a>
                 </div>
             )}
             
             {socials.discord && (
                 <div className="relative group">
                     <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black dark:bg-white text-white dark:text-black text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap mb-2 shadow-lg z-10">
                         Discord
                         <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black dark:border-t-white"></div>
                     </div>
                     <a 
                         href={socials.discord} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="text-gray-500 hover:text-black dark:hover:text-white transition-colors block focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 dark:focus-visible:ring-gray-400 rounded"
                         aria-label="Discord"
                     >
                         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                     </a>
                 </div>
             )}
         </div>
      </div>
      
      <div className="flex flex-col text-black dark:text-white relative w-[400px] h-[300px]">
        <AnimatePresence mode="wait">
          {activeSection === 'intro' && (
            <motion.div
              key="intro"
              initial={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute top-0 left-0 w-full"
            >
              <h1 className="text-6xl font-bold tracking-tighter mb-2">VEX Systems</h1>
              <div className="mb-8 relative w-fit">
                <p className="text-xl text-gray-500 dark:text-gray-400 font-light tracking-wide whitespace-nowrap">
                    {t.title1} <span className="relative inline-block mx-1 text-black dark:text-white">
                        {t.title2}
                        <svg className="absolute left-1/2 -translate-x-1/2 top-[85%] w-[120%] h-6 text-black dark:text-white pointer-events-none opacity-80" viewBox="0 0 120 20" preserveAspectRatio="none">
                             <path d="M10 12 Q 40 15 50 10 L 60 5 L 55 15 L 70 8 Q 90 12 110 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </span>
                </p>
              </div>
              
              <div className="flex flex-col gap-6">
                <button 
                  onClick={() => setActiveSection('who-are-we')}
                  className="group flex items-center gap-2 text-lg font-medium w-fit cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 dark:focus-visible:ring-gray-400 rounded px-1"
                >
                  <span className="relative">
                    {t.whoAreWe}
                    <span className="absolute left-0 bottom-0 w-full h-[1px] bg-black dark:bg-white scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                  </span>
                </button>

                <button 
                  onClick={() => setActiveSection('projects')}
                  className="group flex items-center gap-2 text-lg font-medium w-fit cursor-pointer -mt-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 dark:focus-visible:ring-gray-400 rounded px-1"
                >
                  <span className="relative">
                    {t.projects}
                    <span className="absolute left-0 bottom-0 w-full h-[1px] bg-black dark:bg-white scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                  </span>
                </button>

                <a 
                  href="https://status.vex.systems" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 text-lg font-medium w-fit cursor-pointer -mt-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 dark:focus-visible:ring-gray-400 rounded px-1"
                >
                  <span className="relative">
                    {t.status}
                    <span className="absolute left-0 bottom-0 w-full h-[1px] bg-black dark:bg-white scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                  </span>
                </a>

                <button 
                  onClick={() => setActiveSection('contact')}
                  className="group flex items-center gap-2 text-lg font-medium w-fit cursor-pointer -mt-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 dark:focus-visible:ring-gray-400 rounded px-1"
                >
                  <span className="relative">
                    {t.contact}
                    <span className="absolute left-0 bottom-0 w-full h-[1px] bg-black dark:bg-white scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                  </span>
                </button>

                <div className="flex flex-col gap-3 -mt-4 pl-1">
                    <span className="text-lg font-medium cursor-default">
                        {t.ourTeam}
                    </span>
                    <div className="flex gap-4">
                        {teamMembers.map((member) => (
                            <div key={member.id} className="relative group">
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black dark:bg-white text-white dark:text-black text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap mb-2 shadow-lg z-10">
                                    {member.name}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black dark:border-t-white"></div>
                                </div>
                                
                                <button
                                    onClick={() => {
                                        setSelectedMember(member);
                                        setActiveSection('member-detail');
                                    }}
                                    className="w-12 h-12 rounded-full bg-gray-200 dark:bg-neutral-800 flex items-center justify-center text-xs font-bold border-2 border-transparent hover:border-black dark:hover:border-neutral-500 transition-all cursor-pointer overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 dark:focus-visible:ring-gray-400"
                                >
                                    <img src={member.avatarLink} alt={member.name} className="w-full h-full object-cover" draggable={false} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === 'who-are-we' && (
            <motion.div
              key="who-are-we"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute top-0 left-0 w-full"
            >
              <h2 className="text-3xl font-bold tracking-tight mb-4">{t.aboutUsTitle}</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                {t.aboutUsDesc}
              </p>
              
              <button 
                onClick={() => setActiveSection('intro')}
                className="text-sm font-medium text-gray-500 hover:text-black dark:hover:text-white transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                {t.back}
              </button>
            </motion.div>
          )}

          {activeSection === 'projects' && (
            <motion.div
              key="projects"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute top-0 left-0 w-full"
            >
              <h2 className="text-3xl font-bold tracking-tight mb-4">{t.projectsTitle}</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                {t.projectsDesc}
              </p>
              
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-8 italic border-l-2 border-gray-300 dark:border-gray-700 pl-4">
                {t.projectsOther}
              </p>
              
              <a 
                href="https://vexhost.pl" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-neutral-900 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors border border-transparent dark:border-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 dark:focus-visible:ring-gray-400"
              >
                <div className="w-12 h-12 flex-shrink-0 bg-black dark:bg-white rounded-lg flex items-center justify-center p-2 transition-colors">
                   <img 
                     src="https://sc.vex.systems/branding/vexhost_symbol.png" 
                     alt="vexHost" 
                     className="w-full h-full object-contain dark:invert"
                   />
                </div>
                <div>
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        vexHost.pl
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 group-hover:opacity-100 transition-opacity"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-snug">
                        Game hosting, with advanced DDoS protection measures, for games such as Minecraft.
                    </p>
                </div>
              </a>

              <button 
                onClick={() => setActiveSection('intro')}
                className="text-sm font-medium text-gray-500 hover:text-black dark:hover:text-white transition-colors flex items-center gap-2 mt-8"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                {t.back}
              </button>
            </motion.div>
          )}

          {activeSection === 'contact' && (
            <motion.div
              key="contact"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute top-0 left-0 w-full"
            >
              <h2 className="text-3xl font-bold tracking-tight mb-8">{t.contact}</h2>
              
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-1">
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">{t.email}</span>
                    <a href="mailto:hello@vex.systems" className="text-xl font-semibold hover:underline flex items-center gap-2 w-fit">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                        hello@vex.systems
                    </a>
                </div>

                <div className="flex flex-col gap-1">
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">{t.phone}</span>
                    <a href="tel:+447520640645" className="text-xl font-semibold hover:underline flex items-center gap-2 w-fit">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                        +44 75 2064 0645
                    </a>
                    <span className="text-sm text-gray-400 dark:text-gray-500 italic">({t.languages})</span>
                </div>
              </div>

              <button 
                onClick={() => setActiveSection('intro')}
                className="text-sm font-medium text-gray-500 hover:text-black dark:hover:text-white transition-colors flex items-center gap-2 mt-8"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                {t.back}
              </button>
            </motion.div>
          )}

          {activeSection === 'member-detail' && selectedMember && (
            <motion.div
              key="member-detail"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute top-0 left-0 w-full"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-neutral-800 flex items-center justify-center text-xl font-bold overflow-hidden border-2 border-black dark:border-neutral-500">
                    <img src={selectedMember.avatarLink} alt={selectedMember.name} className="w-full h-full object-cover" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">{selectedMember.name}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">{selectedMember.role}</p>
                    {selectedMember.aka && selectedMember.aka.length > 0 && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">aka {selectedMember.aka.join(', ')}</p>
                    )}
                </div>
              </div>
              
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                {selectedMember.bio}
              </p>
              
              <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium italic mb-6 flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {t.translationWip}
              </p>

              <button 
                onClick={() => setActiveSection('intro')}
                className="text-sm font-medium text-gray-500 hover:text-black dark:hover:text-white transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                {t.backToTeam}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-gray-400 dark:text-gray-600 font-mono tracking-tight flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
        {t.madeWith} <span className="text-pink-500">♥</span> {t.by} - VEX Systems (2025-{new Date().getFullYear()})
      </div>
    </div>
  );
}

useGLTF.preload('/vex.glb');
