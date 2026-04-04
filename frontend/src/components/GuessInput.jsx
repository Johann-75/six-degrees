import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

const GuessInput = ({ onSubmit, isLoading, hasError }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSubmit(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-6 pb-10 z-20">
      <motion.form
        onSubmit={handleSubmit}
        animate={hasError ? { x: [-8, 8, -8, 8, 0] } : {}}
        transition={{ duration: 0.35 }}
        className="max-w-xl mx-auto"
      >
        <div className={`flex items-center gap-3 px-6 py-4 rounded-full bg-white/[0.06] border transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl ${
          hasError
            ? 'border-rose-500/60'
            : 'border-white/10 focus-within:border-white/25'
        }`}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            placeholder="What's the connection?"
            className="flex-1 bg-transparent text-white outline-none text-base placeholder:text-white/20 disabled:opacity-40 font-sans"
            autoFocus
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 ${
              isLoading || !inputValue.trim()
                ? 'bg-white/5 text-white/20 cursor-not-allowed'
                : 'bg-white text-black hover:bg-white/90'
            }`}
          >
            {isLoading
              ? <span className="w-3 h-3 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
              : <ArrowUp size={16} strokeWidth={2.5} />
            }
          </button>
        </div>
      </motion.form>
    </div>
  );
};

export default GuessInput;
