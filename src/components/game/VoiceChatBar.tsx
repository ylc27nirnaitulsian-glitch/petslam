import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Radio, Sparkles, Send } from 'lucide-react';
import { voiceChat, VoiceChatState } from '../../utils/voiceChat';
import { sound } from '../../utils/audio';

interface VoiceChatBarProps {
  onTacticalCallout?: (callout: string, reply: string) => void;
}

export const VoiceChatBar: React.FC<VoiceChatBarProps> = ({ onTacticalCallout }) => {
  const [vcState, setVcState] = useState<VoiceChatState>({
    isMicActive: false,
    isMuted: false,
    volumeLevel: 0,
    isSpeaking: false,
    isTeammateSpeaking: false,
    lastTeammateMessage: 'Radio connected. Awaiting tactical orders.',
    teammateVolume: 0.85,
    error: null,
  });

  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const unsub = voiceChat.subscribe((s) => setVcState(s));
    return () => unsub();
  }, []);

  const handleToggleMic = async () => {
    sound.playClick();
    if (!vcState.isMicActive) {
      await voiceChat.enableMicrophone();
    } else {
      voiceChat.toggleMute();
    }
  };

  const handleQuickRadio = (callout: string, reply: string) => {
    sound.playClick();
    voiceChat.speakTeammate(reply);
    if (onTacticalCallout) {
      onTacticalCallout(callout, reply);
    }
  };

  return (
    <div className="w-full bg-[#0F1420]/95 backdrop-blur-md border-b border-cyan-500/30 px-3 py-2 flex flex-col gap-1.5 z-30 select-none shadow-lg">
      <div className="flex items-center justify-between gap-2">
        {/* Left: Real Mic Toggle & Equalizer Waveform */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleMic}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer shadow-sm ${
              !vcState.isMicActive
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 hover:bg-cyan-500/30'
                : vcState.isMuted
                ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                : 'bg-emerald-500 text-black border border-emerald-300 shadow-[0_0_12px_#10B981]'
            }`}
            title="Toggle Live Microphone"
          >
            {vcState.isMuted || !vcState.isMicActive ? (
              <MicOff className="w-3.5 h-3.5" />
            ) : (
              <Mic className="w-3.5 h-3.5 animate-pulse" />
            )}
            <span>
              {!vcState.isMicActive
                ? 'JOIN VOICE'
                : vcState.isMuted
                ? 'MUTED'
                : 'MIC ACTIVE'}
            </span>
          </button>

          {/* Real Audio Meter (Bounces according to actual mic volume) */}
          {vcState.isMicActive && !vcState.isMuted && (
            <div className="flex items-center gap-0.5 h-3.5 px-1 bg-black/40 rounded-md border border-emerald-500/30">
              {[15, 30, 45, 60, 75, 90].map((threshold, idx) => (
                <span
                  key={idx}
                  className={`w-1 rounded-full transition-all duration-75 ${
                    vcState.volumeLevel >= threshold
                      ? 'h-3 bg-emerald-400 shadow-[0_0_4px_#10B981]'
                      : 'h-1 bg-neutral-700'
                  }`}
                />
              ))}
              <span className="text-[9px] font-mono font-bold text-emerald-400 ml-1">
                {vcState.isSpeaking ? 'SPEAKING' : 'IDLE'}
              </span>
            </div>
          )}
        </div>

        {/* Center/Right: Teammate Status & Audio Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${vcState.isTeammateSpeaking ? 'bg-cyan-400 animate-ping' : 'bg-emerald-500'}`} />
            <span className="text-[11px] font-display font-bold uppercase text-neutral-300 hidden sm:inline">
              Devon (Teammate)
            </span>
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-mono text-cyan-300 font-bold cursor-pointer"
          >
            {expanded ? 'HIDE RADIO' : 'RADIO TACTICS'}
          </button>
        </div>
      </div>

      {/* Teammate Audible Transmission Bubble */}
      {vcState.lastTeammateMessage && (
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-black/50 border border-cyan-500/20 text-[11px] font-mono">
          <Radio className={`w-3.5 h-3.5 text-cyan-400 shrink-0 ${vcState.isTeammateSpeaking ? 'animate-bounce' : ''}`} />
          <span className="text-cyan-400 font-bold shrink-0">Devon:</span>
          <span className="text-neutral-200 truncate">{vcState.lastTeammateMessage}</span>
        </div>
      )}

      {/* Expanded Tactical Radio Callouts */}
      {expanded && (
        <div className="pt-1 flex flex-wrap gap-1.5 border-t border-white/5 mt-0.5 animate-fadeIn">
          <button
            onClick={() => handleQuickRadio('Focus Leader!', 'Roger! Focusing Leader now with high-impact attacks!')}
            className="px-2 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-[10px] font-mono font-bold text-cyan-300 cursor-pointer"
          >
            🎯 Focus Leader
          </button>

          <button
            onClick={() => handleQuickRadio('Focus Partner!', 'Switching to Partner beast! Lock them down!')}
            className="px-2 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-[10px] font-mono font-bold text-cyan-300 cursor-pointer"
          >
            🎯 Focus Partner
          </button>

          <button
            onClick={() => handleQuickRadio('Shield Up, Guarding!', 'Shielding you! Hold position while I strike!')}
            className="px-2 py-1 rounded-lg bg-amber-950/80 hover:bg-amber-900 border border-amber-500/40 text-[10px] font-mono font-bold text-amber-300 cursor-pointer"
          >
            🛡️ Guard & Counter
          </button>

          <button
            onClick={() => handleQuickRadio('Push Together!', 'All in! Launching our beast combo right now!')}
            className="px-2 py-1 rounded-lg bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-[10px] font-mono font-bold text-purple-300 cursor-pointer"
          >
            💥 Push Together
          </button>
        </div>
      )}
    </div>
  );
};
