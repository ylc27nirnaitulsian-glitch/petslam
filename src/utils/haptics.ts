/**
 * Cross-platform Haptics Controller for PET SLAM
 * Integrates Capacitor Native Haptics on iOS / Android with Web Vibration API fallback.
 */

import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export async function triggerLightImpactHaptic() {
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(15);
    }
  }
}

export async function triggerMediumImpactHaptic() {
  try {
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(35);
    }
  }
}

export async function triggerHeavyImpactHaptic() {
  try {
    await Haptics.impact({ style: ImpactStyle.Heavy });
  } catch {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([60, 40, 80]);
    }
  }
}

export async function triggerSuccessHaptic() {
  try {
    await Haptics.notification({ type: NotificationType.Success });
  } catch {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([30, 30, 50]);
    }
  }
}

export async function triggerWarningHaptic() {
  try {
    await Haptics.notification({ type: NotificationType.Warning });
  } catch {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([50, 50, 50]);
    }
  }
}
