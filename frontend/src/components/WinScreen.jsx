import React from 'react';
import { Trophy, RefreshCcw, X, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const WinScreen = ({ jumps, explanation, winReason, onRestart, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="relative w-full max-w-lg bg-[#111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
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
          <div className="w-14 h-14 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4 border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <Trophy className="text-emerald-400" size={26} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white mb-1">
            CHAIN COMPLETE
          </h2>
          <p className="text-emerald-400 font-mono text-xs tracking-widest uppercase">
            Bridge established in {jumps} jump{jumps !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Explanations */}
        <div className="p-6 flex flex-col gap-4 bg-white/[0.02]">

          {/* Last jump — how the guess connects to the anchor */}
          {explanation && (
            <div className="flex flex-col gap-1.5">
              <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40">
                <Zap size={12} />
                The Winning Move
              </span>
              <p className="text-white/60 text-sm leading-relaxed pl-5 border-l border-white/10">
                {explanation}
              </p>
            </div>
          )}

          {/* Why it also connects to the target */}
          {winReason && (
            <div className="flex flex-col gap-1.5 p-4 bg-emerald-950/40 rounded-xl border border-emerald-900/50">
              <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                <Trophy size={12} />
                Connected to Target
              </span>
              <p className="text-emerald-100 text-sm leading-relaxed pl-5 border-l border-emerald-900">
                {winReason}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 pt-2 flex justify-center w-full">
          <button
            onClick={onRestart}
            className="w-full sm:w-auto justify-center flex items-center gap-2 h-12 px-8 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold transition-all shadow-[0_0_20px_rgba(5,150,105,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] active:scale-95"
          >
            <RefreshCcw size={18} />
            New Game
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default WinScreen;