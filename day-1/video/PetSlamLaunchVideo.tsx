import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from 'remotion';

/**
 * PET SLAM Official Launch Video Composition (Remotion)
 * 35 Seconds @ 60 FPS (2100 frames) | 1920x1080 Widescreen or 1080x1920 Vertical
 */

export const PetSlamLaunchVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: '#070A12', color: '#FFFFFF', fontFamily: 'sans-serif' }}>
      {/* Scene 1: The Couch Champion (0 - 7s | Frames 0 - 420) */}
      <Sequence from={0} durationInFrames={420}>
        <Scene1CouchChampion frame={frame} fps={fps} />
      </Sequence>

      {/* Scene 2: The Gemini AI Vision Scan (7 - 16s | Frames 420 - 960) */}
      <Sequence from={420} durationInFrames={540}>
        <Scene2VisionScan frame={frame - 420} fps={fps} />
      </Sequence>

      {/* Scene 3: The 60 FPS Arena Combat (16 - 27s | Frames 960 - 1620) */}
      <Sequence from={960} durationInFrames={660}>
        <Scene3ArenaCombat frame={frame - 960} fps={fps} />
      </Sequence>

      {/* Scene 4: Desktop Companion & Call to Action (27 - 35s | Frames 1620 - 2100) */}
      <Sequence from={1620} durationInFrames={480}>
        <Scene4DesktopCompanionAndCTA frame={frame - 1620} fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};

// Scene 1
const Scene1CouchChampion: React.FC<{ frame: number; fps: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [0, 30, 380, 420], [0, 1, 1, 0]);
  return (
    <AbsoluteFill style={{ opacity, justifyContent: 'center', alignItems: 'center', background: '#0F172A' }}>
      <h2 style={{ fontSize: 48, fontWeight: 900, color: '#94A3B8' }}>
        You think your pet is just sleeping on the couch...
      </h2>
      <p style={{ fontSize: 24, color: '#CCFF00', marginTop: 20 }}>
        [Candid Smartphone Clip of Pet Snoozing]
      </p>
    </AbsoluteFill>
  );
};

// Scene 2
const Scene2VisionScan: React.FC<{ frame: number; fps: number }> = ({ frame }) => {
  const laserY = (frame * 8) % 600;
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', background: '#070A12' }}>
      <h2 style={{ fontSize: 44, fontWeight: 900, color: '#00F0FF', marginBottom: 20 }}>
        Until Gemini scans their photo into an esports champion.
      </h2>
      <div style={{ width: 400, height: 400, border: '3px solid #00F0FF', position: 'relative' }}>
        <div style={{ position: 'absolute', top: laserY, left: 0, width: '100%', height: 4, background: '#CCFF00', boxShadow: '0 0 15px #CCFF00' }} />
      </div>
    </AbsoluteFill>
  );
};

// Scene 3
const Scene3ArenaCombat: React.FC<{ frame: number; fps: number }> = ({ frame }) => {
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', background: '#064E3B' }}>
      <h1 style={{ fontSize: 64, fontWeight: 900, color: '#CCFF00', textShadow: '0 0 20px rgba(204,255,0,0.5)' }}>
        60 FPS IN-BROWSER COMBAT
      </h1>
      <p style={{ fontSize: 32, color: '#FFFFFF', marginTop: 16 }}>
        Tag-in aerial pounces, sonic barks, and screen-shaking Overdrives.
      </p>
    </AbsoluteFill>
  );
};

// Scene 4
const Scene4DesktopCompanionAndCTA: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const scale = spring({ frame, fps, config: { damping: 12 } });
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', background: '#0B0F19' }}>
      <div style={{ transform: `scale(${scale})`, textAlign: 'center' }}>
        <h1 style={{ fontSize: 72, fontWeight: 900, color: '#00F0FF' }}>
          PLAY FREE AT PETSLAM.APP
        </h1>
        <p style={{ fontSize: 32, color: '#CCFF00', marginTop: 16 }}>
          Turn your real pet into an esports legend today.
        </p>
      </div>
    </AbsoluteFill>
  );
};
