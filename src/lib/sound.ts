// A soft rising two-note chime for the moment the chosen player is revealed.
export function playReveal(): void {
  let context: AudioContext | undefined;
  try {
    context = new AudioContext();
    void context.resume().catch(() => undefined);
    const start = context.currentTime;
    [[660, 0], [990, 0.11]].forEach(([frequency, offset]) => {
      const oscillator = context!.createOscillator();
      const gain = context!.createGain();
      oscillator.type = 'sine'; oscillator.frequency.value = frequency!;
      gain.gain.setValueAtTime(0.0001, start + offset!);
      gain.gain.exponentialRampToValueAtTime(0.03, start + offset! + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + offset! + 0.35);
      oscillator.connect(gain); gain.connect(context!.destination);
      oscillator.start(start + offset!); oscillator.stop(start + offset! + 0.37);
    });
    const current = context;
    setTimeout(() => { void current.close().catch(() => undefined); }, 700);
  } catch { if (context) void context.close().catch(() => undefined); }
}

// One shared context for a run of short spinner ticks.
export function tickPlayer(): { play: () => void; close: () => void } {
  let context: AudioContext | undefined;
  try { context = new AudioContext(); void context.resume().catch(() => undefined); } catch { context = undefined; }
  return {
    play() {
      if (!context) return;
      try {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = 'triangle'; oscillator.frequency.value = 1800;
        gain.gain.setValueAtTime(0.012, context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.03);
        oscillator.connect(gain); gain.connect(context.destination);
        oscillator.start(); oscillator.stop(context.currentTime + 0.035);
      } catch { /* Ticks are decorative. */ }
    },
    close() { void context?.close().catch(() => undefined); },
  };
}
