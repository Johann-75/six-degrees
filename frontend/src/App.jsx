import React, { useState, useEffect } from 'react';
import TopBar from './components/TopBar';
import Feed from './components/Feed';
import GuessInput from './components/GuessInput';
import WinScreen from './components/WinScreen';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { RefreshCcw } from 'lucide-react';

// This ensures we always have the /api suffix even if we forget it in the Vercel settings
const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_BASE = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`;

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
  });

  const [showWinModal, setShowWinModal] = useState(false);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [backendError, setBackendError] = useState('');
  const [hasError, setHasError] = useState(false);

  const startGame = async () => {
    setIsAppLoading(true);
    setBackendError('');
    try {
      const res = await fetch(`${API_BASE}/start`);
      if (!res.ok) throw new Error('Failed to fetch words from backend');
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
      });
      setShowWinModal(false);
      setHistory([]);
    } catch (err) {
      setBackendError(err.message + ". Make sure the backend is running on port 8000.");
    } finally {
      setIsAppLoading(false);
    }
  };

  useEffect(() => {
    startGame();
  }, []);

  const handleGuess = async (guess) => {
    if (!guess || isLoading) return;
    setIsLoading(true);
    setHasError(false);

    try {
      const res = await fetch(`${API_BASE}/judge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_word: gameState.currentWord,
          target_word: gameState.wordB,
          guess: guess,
          current_def: gameState.currentDef,
          target_def: gameState.wordBDef,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'API error');
      }

      const data = await res.json();

      setHistory((prev) => [
        ...prev,
        {
          guess: guess,
          valid: data.status !== 'fail',
          explanation: data.message || '',
        },
      ]);

      if (data.status === 'fail') {
        setHasError(true);
        setTimeout(() => setHasError(false), 800);
      } else {
        if (data.status === 'win') {
          setGameState(prev => ({
            ...prev,
            gameWon: true,
            winExplanation: data.message
          }));
          setShowWinModal(true);
        } else if (data.status === 'continue') {
          setGameState(prev => ({
            ...prev,
            currentWord: data.new_anchor,
            currentDef: data.new_anchor_def,
          }));
        }
      }
    } catch (err) {
      console.error(err);
      setHistory((prev) => [
        ...prev,
        { guess: guess, valid: false, explanation: `System Error: ${err.message}` }
      ]);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isAppLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-[#0D0D0D] text-slate-400">
        <RefreshCcw className="animate-spin w-8 h-8" />
        <p className="font-mono">Loading Data Corpus...</p>
      </div>
    );
  }

  if (backendError && !gameState.isInitialized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 max-w-md mx-auto text-center bg-[#0D0D0D]">
        <div className="bg-rose-900/20 text-rose-400 p-4 rounded-xl border border-rose-900/50">
          <p className="font-bold mb-2">Connection Error</p>
          <p className="text-sm">{backendError}</p>
        </div>
        <button onClick={startGame} className="bg-slate-800 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-slate-700">
          <RefreshCcw size={16} /> Retry
        </button>
      </div>
    );
  }

  const validJumps = history.filter(h => h.valid).length;
  const colorCycleLeft = ['bg-indigo-600', 'bg-purple-600', 'bg-blue-600', 'bg-fuchsia-600', 'bg-violet-600'];
  const colorCycleRight = ['bg-emerald-600', 'bg-teal-600', 'bg-cyan-600', 'bg-lime-600', 'bg-green-600'];
  const currentLeftColor = gameState.gameWon ? 'bg-emerald-500' : colorCycleLeft[validJumps % colorCycleLeft.length];
  const currentRightColor = gameState.gameWon ? 'bg-cyan-500' : colorCycleRight[validJumps % colorCycleRight.length];

  return (
    <div className="flex flex-col h-screen w-full relative overflow-hidden bg-[#0D0D0D] text-[#f1f5f9]">
      {/* Background Noise Texture */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 opacity-5 mix-blend-overlay"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      ></div>

      {/* Ambient Mesh Gradients */}
      <div className={`pointer-events-none fixed -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full blur-[140px] opacity-20 ${currentLeftColor}`}></div>
      <div className={`pointer-events-none fixed -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full blur-[140px] opacity-15 ${currentRightColor}`}></div>

      {/* Main Content Layer */}
      <div className="relative z-10 flex flex-col h-full w-full">
        <TopBar 
          wordA={gameState.currentWord} 
          wordADef={gameState.currentDef} 
          wordB={gameState.wordB} 
          wordBDef={gameState.wordBDef} 
          onRestart={startGame}
          gameWon={gameState.gameWon}
          showWinModal={showWinModal}
          setShowWinModal={setShowWinModal}
          lastGuessSuccess={history.length > 0 ? history[history.length - 1].valid : false}
          hasError={hasError}
        />
        
        <Feed history={history} isWaiting={isLoading} />
        
        {!gameState.gameWon && (
          <GuessInput 
            onSubmit={handleGuess} 
            isLoading={isLoading} 
            hasError={hasError} 
          />
        )}

        {gameState.gameWon && showWinModal && (
          <WinScreen 
            jumps={history.filter(h => h.valid).length} 
            explanation={gameState.winExplanation}
            onRestart={startGame}
            onClose={() => setShowWinModal(false)}
          />
        )}
      </div>
    </div>
  );
}

export default App;
