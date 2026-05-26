import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

const GuessInput = ({ onSubmit, isLoading, hasError, currentWord }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSubmit(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      animate={hasError ? { x: [-8, 8, -8, 8, 0] } : {}}
      transition={{ duration: 0.35 }}
      className="w-full"
    >
      <div
        className={`flex items-center gap-3 pl-6 pr-2 py-2 rounded-full bg-white/[0.06] border transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl ${
          hasError
            ? 'border-rose-500/60 shadow-[0_0_20px_rgba(244,63,94,0.15)]'
            : 'border-white/10 focus-within:border-white/25 focus-within:shadow-[0_0_25px_rgba(255,255,255,0.05)]'
        }`}
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isLoading}
          placeholder={currentWord ? `Word related to "${currentWord}"…` : "What's the connection?"}
          className="flex-1 bg-transparent text-white outline-none text-base placeholder:text-white/20 disabled:opacity-40 font-sans min-h-[44px]"
          autoFocus
        />
        <button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          className={`flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 ${
            isLoading || !inputValue.trim()
              ? 'bg-white/5 text-white/20 cursor-not-allowed'
              : 'bg-white text-black hover:bg-white/90 shadow-[0_4px_12px_rgba(255,255,255,0.15)]'
          }`}
        >
          {isLoading ? (
            <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
          ) : (
            <ArrowUp size={18} strokeWidth={2.5} />
          )}
        </button>
      </div>
    </motion.form>
  );
};

export default GuessInput;
