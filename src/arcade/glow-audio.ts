import type { ShotEvent } from './glow-engine';

export function playTone(context: AudioContext, event: ShotEvent['kind'] | 'drop', chain = 1) {
  if (context.state !== 'running') return;
  const pitch = {
    drop: 225,
    bank: 270,
    spring: 420,
    portal: 340,
    chime: 784,
    catch: 936,
    beacon: [523.25, 659.25, 783.99][Math.min(2, Math.max(0, chain - 1))],
  }[event];
  const time = context.currentTime;
  const duration = event === 'bank' ? 0.07 : event === 'beacon' ? 0.37 : 0.18;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = event === 'spring' || event === 'drop' ? 'triangle' : 'sine';
  oscillator.frequency.setValueAtTime(pitch, time);
  oscillator.frequency.exponentialRampToValueAtTime(
    event === 'drop' ? 98 : event === 'spring' ? 610 : pitch * 0.99,
    time + duration,
  );
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(event === 'bank' ? 0.023 : 0.065, time + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.onended = () => {
    oscillator.disconnect();
    gain.disconnect();
  };
  oscillator.start(time);
  oscillator.stop(time + duration + 0.01);
}
