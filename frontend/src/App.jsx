import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ArrowDown } from 'lucide-react';
import TopBar from './components/TopBar';
import Feed from './components/Feed';
import GuessInput from './components/GuessInput';
import WinScreen from './components/WinScreen';
import GameOverScreen from './components/GameOverScreen';

const hostname = window.location.hostname;
const API_BASE = 'https://johann75-six-degrees.hf.space/api';

function App() {
  const [gameState, setGameState] = useState({
    wordA: '',
    wordADef: '',
    wordB: '',
    wordBDef: '',
    currentWord: '',
    currentDef: '',
    isInitialized: false,
    gameWon: false,
    winExplanation: '',
    winReason: '',
    stamina: 10,
    gameOver: false,
  });

  const isStartingRef = useRef(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [showDefs, setShowDefs] = useState(true);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showTopHpLine, setShowTopHpLine] = useState(false);

  const scrollContainerRef = useRef(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  const startGame = async () => {
    if (isStartingRef.current) return;
    isStartingRef.current = true;

    const isFirstLaunch = !gameState.isInitialized;
    if (isFirstLaunch) {
      setIsAppLoading(true);
    } else {
      setIsRestarting(true);
    }
    setHistory([]);
    try {
      const res = await fetch(`${API_BASE}/start`);
      const data = await res.json();

      setGameState({
        wordA: data.word_a,
        wordADef: data.word_a_def,
        wordB: data.word_b,
        wordBDef: data.word_b_def,
        currentWord: data.word_a,
        currentDef: data.word_a_def,
        isInitialized: true,
        gameWon: false,
        winExplanation: '',
        winReason: '',
        stamina: 10,
        gameOver: false,
      });

      setShowWinModal(false);
    } catch (err) {
      console.error('Engine Error:', err);
    } finally {
      setIsAppLoading(false);
      setIsRestarting(false);
      isStartingRef.current = false;
    }
  };


  useEffect(() => {
    startGame();
  }, []);

  const handleGuess = async (guess) => {
    if (!guess || isLoading || gameState.gameOver || gameState.gameWon) return;

    setIsLoading(true);
    setHasError(false);

    try {
      const res = await fetch(`${API_BASE}/judge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_word: gameState.currentWord,
          current_def: gameState.currentDef,
          target_word: gameState.wordB,
          target_def: gameState.wordBDef,
          guess,
          chain: [gameState.wordA, ...history.filter((h) => h.valid).map((h) => h.guess)],
        }),
      });

      const data = await res.json();

      setHistory((prev) => [
        ...prev,
        {
          guess,
          valid: data.status !== 'fail',
          explanation: data.message || '',
        },
      ]);

      if (data.status === 'fail') {
        setHasError(true);
        setTimeout(() => setHasError(false), 300);
        
        setGameState((prev) => {
          const nextStamina = Math.max(0, prev.stamina - 2);
          return {
            ...prev,
            stamina: nextStamina,
            gameOver: nextStamina <= 0,
          };
        });
      } else if (data.status === 'win') {
        setGameState((prev) => ({
          ...prev,
          gameWon: true,
          winExplanation: data.message,
          winReason: data.win_reason || '',
        }));
        setShowWinModal(true);
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
      } else {
        const creativity = data.creativity_score || 5;
        setGameState((prev) => {
          const staminaDiff = creativity >= 8 ? 1 : -1;
          const nextStamina = Math.max(0, Math.min(10, prev.stamina + staminaDiff));
          return {
            ...prev,
            currentWord: data.new_anchor,
            currentDef: data.new_anchor_def,
            stamina: nextStamina,
            gameOver: nextStamina <= 0,
          };
        });
      }
    } catch (err) {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };


  if (isAppLoading)
    return (
      <div className="h-screen w-full bg-[#0D0D0D] flex items-center justify-center text-slate-400 font-mono uppercase tracking-[0.3em] text-xs">
        Initializing universe...
      </div>
    );

  const activeChain = gameState.isInitialized
    ? [gameState.wordA, ...history.filter((h) => h.valid).map((h) => h.guess)]
    : [];

  const validJumps = history.filter((h) => h.valid).length;

  const leftColor = gameState.gameWon
    ? 'bg-emerald-500'
    : ['bg-indigo-600', 'bg-purple-600', 'bg-blue-600'][validJumps % 3];

  const rightColor = gameState.gameWon
    ? 'bg-cyan-500'
    : ['bg-emerald-600', 'bg-teal-600', 'bg-green-600'][validJumps % 3];

  return (
    <div className="flex flex-col h-screen min-h-svh w-full relative overflow-hidden bg-[#0D0D0D] text-slate-100 selection:bg-indigo-500/30">

      {/* FIXED TOP HP LINE (on scroll) */}
      {gameState.isInitialized && showTopHpLine && (
        <div className="fixed top-0 left-0 right-0 h-[3px] z-50 overflow-hidden bg-white/5 pointer-events-none">
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: `${(gameState.stamina / 10) * 100}%` }}
            className={`h-full transition-all duration-300 ${
              gameState.stamina <= 3
                ? 'bg-gradient-to-r from-rose-600 to-rose-400 shadow-[0_1px_8px_rgba(244,63,94,0.8)]'
                : gameState.stamina <= 6
                ? 'bg-gradient-to-r from-amber-500 to-amber-300 shadow-[0_1px_8px_rgba(245,158,11,0.5)]'
                : 'bg-gradient-to-r from-indigo-500 to-cyan-400 shadow-[0_1px_8px_rgba(99,102,241,0.5)]'
            }`}
          />
        </div>
      )}

      {/* AMBIENT GLOWS */}
      <div
        className={`pointer-events-none fixed -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full blur-[140px] transition-colors duration-1000 ${leftColor}`}
        style={{ opacity: gameState.gameWon ? 0.25 : 0.12 + validJumps * 0.025 }}
      />
      <div
        className={`pointer-events-none fixed -bottom-[20%] -right-[10%] w-[70%] h-[70%] rounded-full blur-[140px] transition-colors duration-1000 ${rightColor}`}
        style={{ opacity: gameState.gameWon ? 0.22 : 0.1 + validJumps * 0.025 }}
      />

      <div 
        ref={scrollContainerRef}
        onScroll={(e) => {
          const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
          setShowTopHpLine(scrollTop > 50);
          const nearBottom = scrollHeight - scrollTop - clientHeight < 150;
          setShowScrollBottom(!nearBottom && history.length > 0);
        }}
        className="relative z-10 flex flex-col h-full w-full overflow-y-auto"
      >

        <TopBar
          onRestart={startGame}
          gameWon={gameState.gameWon}
          showDefs={showDefs}
          setShowDefs={setShowDefs}
          stamina={gameState.stamina}
          isInitialized={gameState.isInitialized}
          isRestarting={isRestarting}
        />

        {/* HERO — FROM / TARGET cards */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 pt-6 sm:pt-14 pb-12 sm:pb-16 flex flex-col items-center flex-shrink-0">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 w-full">

            {/* FROM */}
            <div
              className="w-full md:flex-1 bg-white/[0.03] border border-white/10 rounded-[2rem] sm:rounded-[2.5rem] md:rounded-[3rem] p-6 sm:p-10 md:p-16 flex flex-col items-end text-right shadow-2xl backdrop-blur-md overflow-hidden relative min-h-[220px] sm:min-h-[250px] justify-between"
            >
              {isRestarting && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center z-20 animate-fadeIn">
                  <span className="w-6 h-6 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin mb-2" />
                  <span className="text-[9px] font-mono tracking-[0.2em] uppercase text-white/50">
                    Reshaping...
                  </span>
                </div>
              )}
              <span className="text-[10px] uppercase tracking-[0.4em] opacity-30 mb-4 flex-shrink-0">
                From
              </span>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={gameState.currentWord}
                  initial={history.length === 0 ? false : { opacity: 0, x: 40 }}
                  animate={history.length === 0 ? {} : { opacity: 1, x: 0 }}
                  exit={history.length === 0 ? false : { opacity: 0, x: -40 }}
                  transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                  className="w-full flex flex-col items-end text-right"
                >
                  <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black capitalize leading-none tracking-tighter">
                    {gameState.currentWord}
                  </h2>
                  {showDefs && (
                    <p className="text-sm mt-6 italic opacity-40 max-w-sm">
                      &ldquo;{gameState.currentDef}&rdquo;
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>


            {/* CONNECTING ARROWS */}
            <motion.div
              animate={{ x: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.6 }}
              className="text-white/30 text-xl hidden md:block"
            >
              →
            </motion.div>
            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.6 }}
              className="text-white/30 text-xl block md:hidden my-4"
            >
              ↓
            </motion.div>

            {/* TARGET */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full md:flex-1 bg-white/[0.03] border border-white/10 rounded-[2rem] sm:rounded-[2.5rem] md:rounded-[3rem] p-6 sm:p-10 md:p-16 flex flex-col items-start text-left shadow-2xl backdrop-blur-md overflow-hidden relative"
            >
              {isRestarting && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center z-20 animate-fadeIn">
                  <span className="w-6 h-6 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin mb-2" />
                  <span className="text-[9px] font-mono tracking-[0.2em] uppercase text-white/50">
                    Reshaping...
                  </span>
                </div>
              )}
              <span className="text-[10px] uppercase tracking-[0.4em] opacity-30 mb-4">
                Target
              </span>
              <motion.h2
                key={gameState.wordB}
                initial={history.length === 0 ? false : { opacity: 0, y: 10 }}
                animate={history.length === 0 ? {} : { opacity: 1, y: 0 }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black capitalize leading-none tracking-tighter text-white/90"
              >
                {gameState.wordB}
              </motion.h2>
              {showDefs && (
                <p className="text-sm mt-6 italic opacity-40 max-w-sm">
                  &ldquo;{gameState.wordBDef}&rdquo;
                </p>
              )}
            </motion.div>
          </div>

          <p className="mt-12 text-[10px] uppercase tracking-[0.5em] opacity-20 font-bold text-center">
            Find a semantic bridge between the two words above
          </p>
        </div>

        {/* CHAIN TRAIL */}
        {activeChain.length > 1 && (
          <div className="w-full max-w-4xl mx-auto px-6 mb-8 flex-shrink-0">
            <div className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/[0.02] border border-white/5 backdrop-blur-md overflow-x-auto no-scrollbar scroll-smooth">
              <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-indigo-400 font-bold flex-shrink-0 flex items-center gap-1.5 mr-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                Path:
              </span>
              {activeChain.map((word, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <span className="text-white/20 text-xs flex-shrink-0">→</span>}
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-white/70 bg-white/5 px-3 py-1 rounded-full border border-white/5 flex-shrink-0 animate-fadeIn">
                    {word}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* FEED */}
        <div className="w-full max-w-4xl mx-auto pb-40 opacity-80">
          <Feed history={history} isWaiting={isLoading} />
        </div>

        {/* INPUT */}
        {!gameState.gameWon && (
          <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/85 to-transparent backdrop-blur-md z-20">
            <div className="max-w-2xl mx-auto">
              <GuessInput
                onSubmit={handleGuess}
                isLoading={isLoading || isRestarting}
                hasError={hasError}
                currentWord={gameState.currentWord}
              />
            </div>
          </div>
        )}

        {/* WIN MODAL */}
        {gameState.gameWon && showWinModal && (
          <WinScreen
            jumps={history.filter((h) => h.valid).length}
            explanation={gameState.winExplanation}
            winReason={gameState.winReason}
            onRestart={startGame}
            onClose={() => setShowWinModal(false)}
          />
        )}

        {/* LOSS MODAL */}
        {gameState.gameOver && (
          <GameOverScreen
            jumps={history.filter((h) => h.valid).length}
            targetWord={gameState.wordB}
            targetDef={gameState.wordBDef}
            chain={activeChain}
            onRestart={startGame}
            onClose={() => setGameState((prev) => ({ ...prev, gameOver: false }))}
          />
        )}

      </div>

      {/* SCROLL TO BOTTOM BUTTON */}
      <AnimatePresence>
        {showScrollBottom && (
          <motion.button
            key="scroll-bottom-btn"
            initial={{ opacity: 0, y: 15, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 15, x: '-50%' }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToBottom}
            className="fixed bottom-28 left-1/2 z-30 w-9 h-9 rounded-full bg-[#161616]/90 border border-white/10 backdrop-blur-md flex items-center justify-center text-white/70 shadow-2xl hover:text-white hover:border-white/20 active:scale-95 transition-colors"
          >
            <motion.div
              animate={{ y: [0, 3, 0] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
              className="flex items-center justify-center"
            >
              <ArrowDown size={14} strokeWidth={3} />
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>

    </div>
  );

}

export default App;
