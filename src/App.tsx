import React, { useState, useEffect } from 'react';
import { GameProvider } from './context/GameContext';
import { PetCompanionProvider } from './context/PetCompanionContext';
import { PetSlamTitleScreen } from './components/game/PetSlamTitleScreen';
import { MobileGameContainer } from './components/game/MobileGameContainer';
import { SystemRequiredDetailsPage } from './components/SystemRequiredDetailsPage';
import { AlphaQueueModal } from './components/game/AlphaQueueModal';

export default function App() {
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
        <div className="min-h-screen bg-[#0B0E14] text-neutral-100 flex flex-col selection:bg-[#CCFF00] selection:text-black">
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
          <MobileGameContainer onReturnToTitle={() => setHasEnteredGame(false)} />
        )}
        </div>
      </PetCompanionProvider>
    </GameProvider>
  );
}
