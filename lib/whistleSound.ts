/**
 * A short two-tone whistle, synthesised so there is no audio file to load.
 * Played when a report is filed. Respects a per-browser on/off setting.
 */

const KEY = "shelterflex-sound-effects";

export function soundEffectsEnabled(): boolean {
  try {
    return localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
}

export function setSoundEffectsEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(KEY, enabled ? "on" : "off");
  } catch {
    // Storage unavailable: the choice just won't persist.
  }
}

export function playWhistle(): void {
  if (!soundEffectsEnabled()) return;
  try {
    const AudioCtx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const start = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    // A quick rising "fweet" then a held note.
    osc.frequency.setValueAtTime(1500, start);
    osc.frequency.exponentialRampToValueAtTime(2600, start + 0.14);
    osc.frequency.setValueAtTime(2400, start + 0.2);
    osc.frequency.exponentialRampToValueAtTime(2000, start + 0.5);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.15, start + 0.03);
    gain.gain.setValueAtTime(0.15, start + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.55);

    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.6);
    osc.onended = () => void ctx.close();
  } catch {
    // Audio is a flourish; never let it break the flow.
  }
}
