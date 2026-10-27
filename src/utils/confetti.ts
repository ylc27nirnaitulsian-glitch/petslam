import confetti from 'canvas-confetti';

export function triggerConfetti(options?: {
  particleCount?: number;
  spread?: number;
  origin?: { x: number; y: number };
}) {
  try {
    confetti({
      particleCount: options?.particleCount ?? 80,
      spread: options?.spread ?? 70,
      origin: options?.origin ?? { y: 0.6 },
      colors: ['#CCFF00', '#00E5FF', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6'],
      disableForReducedMotion: true,
    });
  } catch {
    // Graceful fallback if canvas is restricted
  }
}

export function triggerVictoryExplosion() {
  try {
    const end = Date.now() + 1.2 * 1000;
    const colors = ['#CCFF00', '#00E5FF', '#FFD700', '#FF3B30'];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  } catch {
    // Fallback
  }
}
