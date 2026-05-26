import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Feed = ({ history, isWaiting }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    // --- THE FIX ---
    // Only auto-scroll if there is actually something to look at!
    if (history.length > 0 || isWaiting) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, isWaiting]);

  return (
    <div className="w-full flex flex-col gap-6 px-4">
      {/* Empty State: Only shows when no guesses have been made */}
      {history.length === 0 && !isWaiting && (
        <div className="py-20 text-center">
          <p className="text-white/10 text-xs font-mono tracking-[0.5em] uppercase">
            Waiting for first connection...
          </p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <AnimatePresence initial={false}>
          {history.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col gap-3 p-8 rounded-[2.5rem] border backdrop-blur-sm transition-all ${
                item.valid 
                  ? 'bg-white/[0.02] border-white/5' 
                  : 'bg-rose-500/5 border-rose-500/10'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className={`w-2.5 h-2.5 rounded-full ${item.valid ? 'bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]' : 'bg-rose-500'}`} />
                <span className={`font-black capitalize text-2xl tracking-tight ${item.valid ? 'text-white' : 'text-rose-400'}`}>
                  {item.guess}
                </span>
              </div>
              {item.explanation && (
                <p className="text-base leading-relaxed text-white/40 font-sans pl-6 border-l border-white/5">
                  {item.explanation}
                </p>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {isWaiting && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4 p-8">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
          <span className="text-xs tracking-[0.3em] uppercase text-white/20">Analyzing Semantics...</span>
        </motion.div>
      )}
      
      {/* This is the anchor the scroll jumps to */}
      <div ref={bottomRef} className="h-20" />
    </div>
  );
};

export default Feed;