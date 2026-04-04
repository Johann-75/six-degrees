import React, { useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, RefreshCcw, X, Share2 } from 'lucide-react';
import confetti from 'canvas-confetti';

const WinScreen = ({ jumps, explanation, onRestart, onClose }) => {
  useEffect(() => {
    confetti({
      particleCount: 200,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#14b8a6', '#84cc16']
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative bg-zinc-900 border border-white/10 p-8 lg:p-12 rounded-[2rem] max-w-2xl w-full shadow-[0_0_100px_rgba(16,185,129,0.2)] overflow-hidden"
      >
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full transition-colors text-white/40">
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-3xl flex items-center justify-center text-emerald-500 mb-2">
            <Trophy size={40} />
          </div>

          <div className="space-y-2">
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Chain Complete</h2>
            <p className="font-mono text-sm uppercase tracking-[0.3em] text-emerald-500 font-bold">Bridge established in {jumps} jumps</p>
          </div>

          <div className="bg-white/5 p-6 rounded-2xl border border-white/5 w-full relative group">
            <p className="text-lg leading-[1.6] text-slate-300 italic">
              "{explanation}"
            </p>
          </div>

          <div className="flex justify-center w-full pt-4">
            <button 
              onClick={onRestart}
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-95"
            >
              <RefreshCcw size={18} /> New Session
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default WinScreen;
