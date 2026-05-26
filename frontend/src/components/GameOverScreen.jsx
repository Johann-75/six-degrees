import React from 'react';
import { Skull, RefreshCcw, X, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const GameOverScreen = ({ jumps, targetWord, targetDef, chain, onRestart, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="relative w-full max-w-lg bg-[#111] border border-red-500/20 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.15)] overflow-hidden flex flex-col"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors z-10"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center pt-10 pb-6 border-b border-white/5">
          <div className="w-14 h-14 bg-red-500/20 rounded-full flex items-center justify-center mb-4 border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
            <Skull className="text-red-400" size={26} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white mb-1">
            STAMINA DEPLETED
          </h2>
          <p className="text-red-400 font-mono text-xs tracking-widest uppercase">
            Semantic energy exhausted at {jumps} jump{jumps !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Path Trail */}
        <div className="p-6 flex flex-col gap-4 bg-white/[0.01]">
          <div className="flex flex-col gap-2">
            <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40">
              <AlertTriangle size={12} className="text-red-400" />
              Your Path
            </span>
            <div className="flex flex-wrap items-center gap-2 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5 max-h-32 overflow-y-auto no-scrollbar">
              {chain.map((word, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <span className="text-white/20 text-xs">→</span>}
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-red-300/80 bg-red-500/10 px-2.5 py-0.5 rounded-full border border-red-500/10">
                    {word}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Target */}
          <div className="flex flex-col gap-1.5 p-4 bg-white/[0.02] rounded-xl border border-white/5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
              Target Was
            </span>
            <span className="text-lg font-black font-sans uppercase tracking-wide text-white">
              {targetWord}
            </span>
            <p className="text-white/40 text-xs leading-relaxed italic pl-3 border-l border-white/10">
              &ldquo;{targetDef}&rdquo;
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-2 flex justify-center w-full">
          <button
            onClick={onRestart}
            className="w-full sm:w-auto justify-center flex items-center gap-2 h-12 px-8 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold transition-all shadow-[0_0_20px_rgba(220,38,38,0.2)] hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] active:scale-95"
          >
            <RefreshCcw size={18} />
            Try Again
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default GameOverScreen;
