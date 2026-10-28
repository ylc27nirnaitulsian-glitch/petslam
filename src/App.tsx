import React, { useState, useEffect } from 'react';
import { GameProvider } from './context/GameContext';
import { PetCompanionProvider } from './context/PetCompanionContext';
import { PetSlamTitleScreen } from './components/game/PetSlamTitleScreen';
import { DualOrientationShell } from './components/layout/DualOrientationShell';
import { SystemRequiredDetailsPage } from './components/SystemRequiredDetailsPage';
import { AlphaQueueModal } from './components/game/AlphaQueueModal';
import { PetSlamIntroSplash } from './components/game/PetSlamIntroSplash';

export default function App() {
  const [showIntro, setShowIntro] = useState<boolean>(true);
  const [hasEnteredGame, setHasEnteredGame] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#game' || hash === '#arena') return true;
    }
    return false;
  });

  const [showSystemDetailsDirect, setShowSystemDetailsDirect] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      return (
        hash === '#system-details' ||
        hash === '#system-required-details' ||
        hash.startsWith('#system-')
      );
    }
    return false;
  });

  const [showAlphaDirect, setShowAlphaDirect] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (
        hash === '#system-details' ||
        hash === '#system-required-details' ||
        hash.startsWith('#system-')
      ) {
        setShowSystemDetailsDirect(true);
      } else {
        setShowSystemDetailsDirect(false);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleReturnToGame = () => {
    setShowSystemDetailsDirect(false);
    window.location.hash = '';
  };

  return (
    <GameProvider>
      <PetCompanionProvider>
        <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 text-slate-900 dark:bg-[#0B0E14] dark:text-slate-50 font-medium flex flex-col selection:bg-[#CCFF00] selection:text-black transition-colors duration-300">
        {showIntro && <PetSlamIntroSplash onComplete={() => setShowIntro(false)} />}
        {showSystemDetailsDirect ? (
          <>
            <SystemRequiredDetailsPage
              onBackToLanding={handleReturnToGame}
              onJoinWaitlist={() => setShowAlphaDirect(true)}
            />
            <AlphaQueueModal
              isOpen={showAlphaDirect}
              onClose={() => setShowAlphaDirect(false)}
            />
          </>
        ) : !hasEnteredGame ? (
          <PetSlamTitleScreen
            onEnterGame={() => setHasEnteredGame(true)}
            onOpenSystemDetails={() => setShowSystemDetailsDirect(true)}
          />
        ) : (
          <DualOrientationShell
            onReturnToTitle={() => setHasEnteredGame(false)}
            onOpenSystemDetails={() => setShowSystemDetailsDirect(true)}
          />
        )}
        </div>
      </PetCompanionProvider>
    </GameProvider>
  );
}
