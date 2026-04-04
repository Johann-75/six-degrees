import React, { useState } from 'react';
import { BookOpen, HelpCircle, RefreshCw, Trophy } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

const TopBar = ({ wordA, wordADef, wordB, wordBDef, onRestart, gameWon, showWinModal, setShowWinModal, lastGuessSuccess, hasError }) => {
  const [showDefs, setShowDefs] = useState(true);

  return (
    <div className="pt-6 px-4 md:px-8 z-10 w-full flex-shrink-0">
      <div className="max-w-7xl mx-auto flex flex-col gap-6 lg:gap-12">
        
        {/* Header Controls */}
        <div className="flex justify-between items-center relative">
          <h1 className="text-lg uppercase tracking-widest font-bold opacity-50 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            Six Degrees
          </h1>

          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
            <button 
              onClick={onRestart}
              className="flex items-center gap-2 text-xs font-bold transition-all px-4 py-2 rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg active:scale-95 text-white"
            >
              <RefreshCw size={14} />
              <span>Restart</span>
            </button>

            <AnimatePresence>
              {gameWon && !showWinModal && (
                <motion.button 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  onClick={() => setShowWinModal(true)}
                  className="p-2 bg-emerald-500/20 text-emerald-500 rounded-xl border border-emerald-500/30 hover:bg-emerald-500/30 transition-all animate-bounce"
                  title="View Result"
                >
                  <Trophy size={16} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={() => setShowDefs(!showDefs)}
            className="flex items-center gap-2 text-xs transition-colors px-4 py-2 rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl text-white hover:bg-white/10"
          >
            {showDefs ? <BookOpen size={14} /> : <HelpCircle size={14} />}
            <span className="hidden sm:inline tracking-wider uppercase font-bold">{showDefs ? 'Hide' : 'Info'}</span>
          </button>
        </div>

        {/* Word Showcase */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-2 lg:gap-6 w-full pb-4">
          
          {/* Current Focus */}
          <div className="flex-1 flex flex-col items-center lg:items-end w-full">
            <p className="text-[0.6rem] text-white/30 mb-2 uppercase tracking-[0.2em] font-semibold">From</p>
            <div className="relative w-full">
              {/* Animated Ring on success */}
              <AnimatePresence>
                {lastGuessSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1.1 }}
                    exit={{ opacity: 0, scale: 1.5 }}
                    className="absolute inset-0 rounded-3xl border-4 border-indigo-500/30 blur-xl pointer-events-none"
                  />
                )}
              </AnimatePresence>

              <motion.div 
                layout
                animate={hasError ? { x: [-4, 4, -4, 4, 0], filter: ['hue-rotate(0deg)', 'hue-rotate(90deg)', 'hue-rotate(0deg)'] } : {}}
                transition={{ duration: 0.3 }}
                className={`bg-white/[0.04] border border-white/[0.07] rounded-3xl p-6 lg:p-12 w-full flex flex-col items-center lg:items-end text-center lg:text-right relative overflow-hidden word-card bg-clip-padding ${hasError ? 'ring-1 ring-rose-500/50 glitch-text' : 'shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_20px_40px_-20px_rgba(0,0,0,0.5)]'}`}
              >
                <AnimatePresence mode="popLayout">
                  <motion.p 
                    key={wordA || 'loading'}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-[clamp(3.5rem,7vw,7rem)] font-black capitalize leading-none tracking-tight text-white"
                  >
                    {wordA || '...'}
                  </motion.p>
                </AnimatePresence>
                {showDefs && wordADef && (
                  <motion.p className="text-sm mt-6 italic max-w-sm opacity-60 text-slate-400">"{wordADef}"</motion.p>
                )}
              </motion.div>
            </div>
          </div>
          
          {/* Acid SVG Path */}
          <div className="flex items-center justify-center py-4 lg:py-0 w-16 lg:w-48 h-24 lg:h-32 flex-shrink-0">
            <svg width="100%" height="100%" className="overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="acidGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="50%" stopColor="#14b8a6" />
                  <stop offset="100%" stopColor="#84cc16" />
                </linearGradient>
                <linearGradient id="acidGradVert" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="50%" stopColor="#14b8a6" />
                  <stop offset="100%" stopColor="#84cc16" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              {/* Desktop Path (Horizontal) */}
              <g className="hidden lg:block">
                <path d="M0,50 L95,50" stroke="url(#acidGrad)" strokeWidth="6" strokeLinecap="round" fill="none" className="animate-flowing" strokeDasharray="15 20" filter="url(#glow)" />
                <polygon points="90,40 105,50 90,60" fill="#84cc16" />
              </g>

              {/* Mobile Path (Vertical) */}
              <g className="lg:hidden">
                <path d="M50,0 L50,95" stroke="url(#acidGradVert)" strokeWidth="6" strokeLinecap="round" fill="none" className="animate-flowing" strokeDasharray="15 20" filter="url(#glow)" />
                <polygon points="40,90 50,105 60,90" fill="#84cc16" />
              </g>
            </svg>
          </div>

          {/* Target */}
          <div className="flex-1 flex flex-col items-center lg:items-start w-full">
            <p className="text-[0.6rem] text-white/30 mb-2 uppercase tracking-[0.2em] font-semibold">To</p>
            <motion.div 
               layout
               className="bg-white/[0.04] border border-white/[0.07] rounded-3xl p-6 lg:p-12 w-full flex flex-col items-center lg:items-start text-center lg:text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_20px_40px_-20px_rgba(0,0,0,0.5)] overflow-hidden word-card bg-clip-padding"
            >
              <p className="text-[clamp(3.5rem,7vw,7rem)] font-black capitalize leading-none tracking-tight text-white">
                {wordB || '...'}
              </p>
              {showDefs && wordBDef && (
                <motion.p layout className="text-sm mt-6 italic max-w-sm opacity-60 text-slate-400">"{wordBDef}"</motion.p>
              )}
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TopBar;
