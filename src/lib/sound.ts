export async function playChime(): Promise<void> {
  let context: AudioContext | undefined;
  try {
    context = new AudioContext();
    // Do not await an indefinitely suspended context. Sound is purely decorative.
    void context.resume().catch(() => undefined);
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine'; oscillator.frequency.value = 620;
    gain.gain.setValueAtTime(0.025, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.12);
    oscillator.connect(gain); gain.connect(context.destination);
    oscillator.start(); oscillator.stop(context.currentTime + 0.14);
    const current = context;
    setTimeout(() => { void current.close().catch(() => undefined); }, 300);
  } catch { if (context) void context.close().catch(() => undefined); }
}
