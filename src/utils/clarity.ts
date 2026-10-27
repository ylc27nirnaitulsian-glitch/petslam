/**
 * Microsoft Clarity Behavior Analytics Integration for PET SLAM
 * Enables heatmaps, session recordings, and click/scroll telemetry.
 */

declare global {
  interface Window {
    clarity?: (command: string, ...args: unknown[]) => void;
    CLARITY_INITIALIZED?: boolean;
  }
}

export interface ClarityConfig {
  projectId?: string;
  enableDebug?: boolean;
}

/**
 * Initialize Microsoft Clarity tracking script
 */
export function initClarity(config?: ClarityConfig): boolean {
  if (typeof window === 'undefined') return false;

  // Prevent double-initialization
  if (window.CLARITY_INITIALIZED) {
    return true;
  }

  const projectId =
    config?.projectId ||
    (import.meta.env.VITE_CLARITY_PROJECT_ID as string) ||
    '';

  if (!projectId || projectId === 'YOUR_CLARITY_PROJECT_ID') {
    if (config?.enableDebug || import.meta.env.DEV) {
      console.info(
        '[Clarity] Project ID not configured. Set VITE_CLARITY_PROJECT_ID in .env to enable session replays.'
      );
    }
    return false;
  }

  try {
    // Official Microsoft Clarity loader snippet
    (function (c: any, l: Document, a: string, r: string, i: string) {
      c[a] =
        c[a] ||
        function (...args: unknown[]) {
          (c[a].q = c[a].q || []).push(args);
        };
      const t = l.createElement(r) as HTMLScriptElement;
      t.async = true;
      t.src = 'https://www.clarity.ms/tag/' + i;
      const y = l.getElementsByTagName(r)[0];
      if (y && y.parentNode) {
        y.parentNode.insertBefore(t, y);
      } else {
        l.head.appendChild(t);
      }
    })(window as any, document, 'clarity', 'script', projectId);

    window.CLARITY_INITIALIZED = true;
    console.info(`[Clarity] Initialized successfully with project ID: ${projectId}`);
    return true;
  } catch (err) {
    console.warn('[Clarity] Initialization failed:', err);
    return false;
  }
}

/**
 * Track custom business and engagement events in Microsoft Clarity
 */
export function trackClarityEvent(eventName: string): void {
  if (typeof window !== 'undefined') {
    (window as any).__CLARITY_EVENT_LOG = (window as any).__CLARITY_EVENT_LOG || [];
    (window as any).__CLARITY_EVENT_LOG.unshift({ event: eventName, time: new Date().toLocaleTimeString() });
    if ((window as any).__CLARITY_EVENT_LOG.length > 20) {
      (window as any).__CLARITY_EVENT_LOG.pop();
    }

    if (typeof window.clarity === 'function') {
      try {
        window.clarity('event', eventName);
      } catch {
        // Ignore if clarity blocked by adblockers
      }
    }
  }
}

/**
 * Set custom metadata tags for filtering sessions in Clarity Dashboard
 */
export function setClarityTag(key: string, value: string): void {
  if (typeof window !== 'undefined' && typeof window.clarity === 'function') {
    try {
      window.clarity('set', key, value);
    } catch {
      // Ignore if clarity blocked
    }
  }
}

/**
 * Identify authenticated or active player in Clarity
 */
export function identifyClarityUser(
  customId: string,
  sessionProps?: Record<string, string>
): void {
  if (typeof window !== 'undefined' && typeof window.clarity === 'function') {
    try {
      window.clarity('identify', customId, sessionProps);
    } catch {
      // Ignore
    }
  }
}
