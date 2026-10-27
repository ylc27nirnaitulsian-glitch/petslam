/**
 * Dynamic API & Socket Endpoint Resolver for PET SLAM
 * Automatically detects web vs native Capacitor / Tauri runtime
 * and forces absolute production URLs on native apps.
 */

export function isNativePlatform(): boolean {
  if (typeof window === 'undefined') return false;
  const isCapacitor = !!(window as any).Capacitor?.isNativePlatform?.();
  const isTauri = !!(window as any).__TAURI__;
  return isCapacitor || isTauri;
}

export function getApiBaseUrl(): string {
  if (isNativePlatform()) {
    return 'https://petslam.app/api';
  }
  // In web environment, use relative path so it routes through reverse proxy / Vite
  return '/api';
}

export function getSocketUrl(): string {
  if (isNativePlatform()) {
    return 'wss://petslam.app/socket';
  }
  if (typeof window === 'undefined') return 'ws://localhost:3000/socket';
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/socket`;
}

/**
 * Native-aware fetch wrapper that resolves endpoints automatically
 */
export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const base = getApiBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const fullUrl = cleanPath.startsWith('/api')
    ? (isNativePlatform() ? `https://petslam.app${cleanPath}` : cleanPath)
    : `${base}${cleanPath}`;

  return fetch(fullUrl, init);
}
