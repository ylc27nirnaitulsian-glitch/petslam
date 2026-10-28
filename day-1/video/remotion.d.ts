declare module 'remotion' {
  export const AbsoluteFill: React.FC<{ style?: React.CSSProperties; children?: React.ReactNode }>;
  export const Sequence: React.FC<{ from: number; durationInFrames: number; children?: React.ReactNode }>;
  export function useCurrentFrame(): number;
  export function useVideoConfig(): { fps: number; width: number; height: number; durationInFrames: number };
  export function interpolate(input: number, inputRange: number[], outputRange: number[], options?: any): number;
  export function spring(options: any): number;
}
