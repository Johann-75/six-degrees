import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, RefreshCw, HelpCircle } from 'lucide-react';

const TopBar = ({ onRestart, showDefs, setShowDefs, stamina, isInitialized, isRestarting }) => {
  return (
    <header className="w-full pt-6 sm:pt-8 px-6 sm:px-12 flex flex-col md:flex-row justify-between items-center gap-4 z-20 flex-shrink-0">
      
      {/* Column 1: Logo */}
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
        <h1 className="font-mono text-xs sm:text-sm font-bold tracking-[0.3em] uppercase opacity-50">
          Six Degrees
        </h1>
      </div>

      {/* Column 2: Stamina Bar (grows and centers on desktop, stacks below logo on mobile) */}
      {isInitialized && (
        <div className="w-full max-w-xs md:max-w-md flex flex-col gap-1.5 px-5 py-3 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md">
          <div className="flex justify-between items-center text-[9px] sm:text-[10px] font-mono tracking-widest uppercase text-white/40">
            <span>Stamina</span>
            <span className={`${stamina <= 3 ? 'text-rose-400 font-bold animate-pulse' : 'text-indigo-400'}`}>
              {stamina} / 10 HP
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden border border-white/5">
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: `${(stamina / 10) * 100}%` }}
              transition={{ type: 'spring', stiffness: 80, damping: 15 }}
              className={`h-full rounded-full transition-colors duration-500 ${
                stamina <= 3
                  ? 'bg-gradient-to-r from-rose-600 to-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.4)]'
                  : stamina <= 6
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                  : 'bg-gradient-to-r from-indigo-500 to-cyan-400 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
              }`}
            />
          </div>
        </div>
      )}

      {/* Column 3: Control Buttons */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-center">
        <button
          onClick={onRestart}
          disabled={isRestarting}
          className="flex-1 md:flex-initial flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-[10px] font-bold uppercase tracking-widest text-white min-w-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw size={14} className={isRestarting ? "animate-spin" : ""} />
          {isRestarting ? 'Loading...' : 'Restart'}
        </button>

        <button
          onClick={() => setShowDefs(!showDefs)}
          className="flex-1 md:flex-initial flex items-center justify-center gap-2 h-11 px-5 rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-all min-w-[44px]"
        >
          {showDefs ? <BookOpen size={16} /> : <HelpCircle size={16} />}
          <span className="text-[10px] font-bold uppercase tracking-widest">
            {showDefs ? 'Hide Defs' : 'Show Defs'}
          </span>
        </button>
      </div>
    </header>
  );
};

export default TopBar;