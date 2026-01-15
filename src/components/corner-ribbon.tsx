'use client';

import { motion } from 'framer-motion';

export function CornerRibbon() {
  return (
    <div className="fixed bottom-0 right-0 z-50 w-56 h-56 overflow-hidden pointer-events-none hidden lg:block">
      <div className="absolute bottom-[45px] right-[-65px] w-[320px] h-10 bg-black dark:bg-white text-white dark:text-black flex items-center shadow-lg -rotate-45 pointer-events-auto cursor-pointer hover:scale-105 transition-transform">
        <a href="mailto:hello@vex.systems" className="w-full h-full flex items-center overflow-hidden">
            <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
            className="flex gap-4 whitespace-nowrap text-xs font-bold uppercase tracking-widest px-4"
            >
                <span>hello@vex.systems</span>
                <span>•</span>
                <span>hello@vex.systems</span>
                <span>•</span>
                <span>hello@vex.systems</span>
                <span>•</span>
                <span>hello@vex.systems</span>
                <span>•</span>
            </motion.div>
        </a>
      </div>
    </div>
  );
}
