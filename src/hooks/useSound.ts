'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useSoundStore } from '@/stores/sound-store';

// Mapeamento de sons
const SOUNDS = {
  ballDraw: '/sounds/ball-draw.mp3',
  numberMarked: '/sounds/number-marked.mp3',
  errorShake: '/sounds/error-shake.mp3',
  playerJoined: '/sounds/player-joined.mp3',
  lineComplete: '/sounds/line-complete.mp3',
  bingoWin: '/sounds/bingo-win.mp3',
  buttonClick: '/sounds/button-click.mp3',
} as const;

// Configurações de sons sintéticos (fallback quando MP3 não existe)
const SYNTH_SOUNDS: Record<keyof typeof SOUNDS, { freq: number; duration: number; type: OscillatorType }> = {
  ballDraw: { freq: 0, duration: 0, type: 'sine' }, // Tratado especialmente com som elaborado
  numberMarked: { freq: 659, duration: 0.1, type: 'sine' }, // E5 - beep
  errorShake: { freq: 220, duration: 0.2, type: 'square' }, // A3 - erro
  playerJoined: { freq: 440, duration: 0.15, type: 'triangle' }, // A4 - notificação
  lineComplete: { freq: 784, duration: 0.3, type: 'sine' }, // G5 - sucesso
  bingoWin: { freq: 880, duration: 0.5, type: 'sine' }, // A5 - vitória
  buttonClick: { freq: 1000, duration: 0.05, type: 'sine' }, // click curto
};

type SoundName = keyof typeof SOUNDS;

export function useSound() {
  const audioCache = useRef<Map<string, HTMLAudioElement>>(new Map());
  const audioContextRef = useRef<AudioContext | null>(null);
  const failedSounds = useRef<Set<string>>(new Set());
  const { isMuted, volume } = useSoundStore();

  // Inicializa AudioContext para sons sintéticos
  const getAudioContext = useCallback(() => {
    if (typeof window === 'undefined') return null;
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Som elaborado de sorteio de bola - estilo loteria com suspense + reveal
  const playBallDrawSynth = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Notas ascendentes rápidas (drum roll / roulette spin)
    const rollNotes = [262, 294, 330, 349, 392, 440, 494, 523]; // C4 a C5
    const rollDuration = 0.06; // cada nota
    const rollVolume = volume * 0.15;

    rollNotes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      const startTime = ctx.currentTime + index * rollDuration;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(rollVolume, startTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + rollDuration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + rollDuration);
    });

    // Som de "reveal" final - acorde satisfatório
    const revealTime = ctx.currentTime + rollNotes.length * rollDuration;
    const revealNotes = [523, 659, 784]; // C5, E5, G5 (acorde de Dó maior)
    const revealDuration = 0.4;
    const revealVolume = volume * 0.25;

    revealNotes.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0, revealTime);
      gain.gain.linearRampToValueAtTime(revealVolume, revealTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, revealTime + revealDuration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(revealTime);
      osc.stop(revealTime + revealDuration);
    });

    // "Ping" final brilhante
    const pingTime = revealTime + 0.1;
    const pingOsc = ctx.createOscillator();
    const pingGain = ctx.createGain();

    pingOsc.type = 'sine';
    pingOsc.frequency.setValueAtTime(1047, ctx.currentTime); // C6

    pingGain.gain.setValueAtTime(0, pingTime);
    pingGain.gain.linearRampToValueAtTime(volume * 0.3, pingTime + 0.01);
    pingGain.gain.exponentialRampToValueAtTime(0.01, pingTime + 0.3);

    pingOsc.connect(pingGain);
    pingGain.connect(ctx.destination);

    pingOsc.start(pingTime);
    pingOsc.stop(pingTime + 0.3);
  }, [getAudioContext, volume]);

  // Som empolgante ao marcar número corretamente - "pop" satisfatório
  const playNumberMarkedSynth = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Tom principal ascendente (pop satisfatório)
    const mainOsc = ctx.createOscillator();
    const mainGain = ctx.createGain();
    mainOsc.type = 'sine';
    mainOsc.frequency.setValueAtTime(523, ctx.currentTime); // C5
    mainOsc.frequency.exponentialRampToValueAtTime(784, ctx.currentTime + 0.08); // sobe para G5
    mainGain.gain.setValueAtTime(volume * 0.25, ctx.currentTime);
    mainGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    mainOsc.connect(mainGain);
    mainGain.connect(ctx.destination);
    mainOsc.start(ctx.currentTime);
    mainOsc.stop(ctx.currentTime + 0.15);

    // Harmônico (oitava acima para brilho)
    const harmOsc = ctx.createOscillator();
    const harmGain = ctx.createGain();
    harmOsc.type = 'sine';
    harmOsc.frequency.setValueAtTime(1047, ctx.currentTime); // C6
    harmOsc.frequency.exponentialRampToValueAtTime(1568, ctx.currentTime + 0.08); // sobe para G6
    harmGain.gain.setValueAtTime(volume * 0.12, ctx.currentTime);
    harmGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
    harmOsc.connect(harmGain);
    harmGain.connect(ctx.destination);
    harmOsc.start(ctx.currentTime);
    harmOsc.stop(ctx.currentTime + 0.12);

    // "Sparkle" final - nota aguda curta
    const sparkleOsc = ctx.createOscillator();
    const sparkleGain = ctx.createGain();
    sparkleOsc.type = 'sine';
    sparkleOsc.frequency.setValueAtTime(2093, ctx.currentTime + 0.05); // C7
    sparkleGain.gain.setValueAtTime(0, ctx.currentTime);
    sparkleGain.gain.setValueAtTime(volume * 0.15, ctx.currentTime + 0.05);
    sparkleGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
    sparkleOsc.connect(sparkleGain);
    sparkleGain.connect(ctx.destination);
    sparkleOsc.start(ctx.currentTime + 0.05);
    sparkleOsc.stop(ctx.currentTime + 0.18);
  }, [getAudioContext, volume]);

  // Toca som sintético usando Web Audio API
  const playSynth = useCallback(
    (soundName: SoundName) => {
      const ctx = getAudioContext();
      if (!ctx) return;

      // Som especial para ballDraw
      if (soundName === 'ballDraw') {
        playBallDrawSynth();
        return;
      }

      // Som especial para numberMarked
      if (soundName === 'numberMarked') {
        playNumberMarkedSynth();
        return;
      }

      const config = SYNTH_SOUNDS[soundName];
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = config.type;
      oscillator.frequency.setValueAtTime(config.freq, ctx.currentTime);

      gainNode.gain.setValueAtTime(volume * 0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + config.duration);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + config.duration);
    },
    [getAudioContext, volume, playBallDrawSynth, playNumberMarkedSynth]
  );

  // Pré-carrega os sons
  useEffect(() => {
    if (typeof window === 'undefined') return;

    Object.entries(SOUNDS).forEach(([name, path]) => {
      if (!audioCache.current.has(path)) {
        const audio = new Audio(path);
        audio.preload = 'auto';
        // Detecta se o arquivo não existe
        audio.addEventListener('error', () => {
          failedSounds.current.add(name);
        });
        audioCache.current.set(path, audio);
      }
    });
  }, []);

  const play = useCallback(
    (soundName: SoundName) => {
      if (isMuted || typeof window === 'undefined') return;

      // Se o arquivo MP3 falhou, usa som sintético
      if (failedSounds.current.has(soundName)) {
        playSynth(soundName);
        return;
      }

      const path = SOUNDS[soundName];
      let audio = audioCache.current.get(path);

      if (!audio) {
        audio = new Audio(path);
        audioCache.current.set(path, audio);
      }

      // Clona o áudio para permitir múltiplas reproduções simultâneas
      const clone = audio.cloneNode() as HTMLAudioElement;
      clone.volume = volume;
      clone.play().catch(() => {
        // Se falhar, tenta som sintético
        playSynth(soundName);
      });
    },
    [isMuted, volume, playSynth]
  );

  const playBallDraw = useCallback(() => play('ballDraw'), [play]);
  const playNumberMarked = useCallback(() => play('numberMarked'), [play]);
  const playErrorShake = useCallback(() => play('errorShake'), [play]);
  const playPlayerJoined = useCallback(() => play('playerJoined'), [play]);
  const playLineComplete = useCallback(() => play('lineComplete'), [play]);
  const playBingoWin = useCallback(() => play('bingoWin'), [play]);
  const playButtonClick = useCallback(() => play('buttonClick'), [play]);

  return {
    play,
    playBallDraw,
    playNumberMarked,
    playErrorShake,
    playPlayerJoined,
    playLineComplete,
    playBingoWin,
    playButtonClick,
  };
}
