import { DiscordSDK } from '@discord/embedded-app-sdk';

const DISCORD_CLIENT_ID = '1571901968270499870';

let discordSdkInstance: DiscordSDK | null = null;
let isReady = false;

/**
 * Checks if the current window is executing inside a Discord Activity iframe.
 */
export function isDiscordActivity(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const isIframe = window.self !== window.top;
    const hasFrameParam =
      window.location.search.includes('frame_id') ||
      window.location.hostname.includes('discordsays.com');
    return isIframe || hasFrameParam;
  } catch {
    // Cross-origin access to window.top throws if framed on another domain (like Discord)
    return true;
  }
}

/**
 * Initializes the Discord Embedded App SDK and signals ready to the Discord client.
 */
export async function initDiscordSdk(): Promise<DiscordSDK | null> {
  if (!isDiscordActivity()) {
    return null;
  }

  if (discordSdkInstance && isReady) {
    return discordSdkInstance;
  }

  try {
    console.log('[PET SLAM] Discord Activity environment detected. Initializing Embedded App SDK...');
    discordSdkInstance = new DiscordSDK(DISCORD_CLIENT_ID);
    await discordSdkInstance.ready();
    isReady = true;
    console.log('[PET SLAM] Discord Embedded App SDK ready!');
    return discordSdkInstance;
  } catch (err) {
    console.warn('[PET SLAM] Discord SDK initialization notice:', err);
    return null;
  }
}

export function getDiscordSdk(): DiscordSDK | null {
  return discordSdkInstance;
}
