import React, { useEffect, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

const Feed = ({ history, isWaiting }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isWaiting]);

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-8 pt-4 w-full max-w-3xl mx-auto flex flex-col mb-32 z-10">
      {history.length === 0 && !isWaiting ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center pt-12">
          <p className="text-white/20 text-sm font-sans">Find a link between the words above ↑</p>
        </div>
      ) : null}

      <div className="flex flex-col gap-1">
        <AnimatePresence initial={false}>
          {history.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex items-start gap-4 py-3 px-4 rounded-2xl transition-colors duration-200 ${
                item.valid
                  ? 'hover:bg-white/[0.03]'
                  : 'opacity-50'
              }`}
            >
              {/* Dot indicator */}
              <div className="pt-1.5 flex-shrink-0">
                <span className={`block w-2 h-2 rounded-full ${
                  item.valid ? 'bg-emerald-400' : 'bg-rose-400'
                }`} />
              </div>

              <div className="flex-1 flex flex-col gap-1">
                <span className={`font-semibold capitalize text-base tracking-tight ${item.valid ? 'text-white' : 'text-rose-400'}`}>
                  {item.guess}
                </span>
                {item.explanation && (
                  <p className="text-sm leading-relaxed text-white/40 font-sans">
                    {item.explanation}
                  </p>
                )}
              </div>
            </motion.div>
          ))}

          {isWaiting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-4 py-3 px-4"
            >
              <div className="pt-0.5 flex-shrink-0">
                <span className="block w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              </div>
              <span className="text-sm text-white/30 font-sans">Thinking...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div ref={bottomRef} className="h-24" />
    </div>
  );
};

export default Feed;
