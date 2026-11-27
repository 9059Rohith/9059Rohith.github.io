/** Build a quiet original sound bed. The flight position moves the filter and harmonic balance. */
export function createAmbience() {
  const ctx = new AudioContext(),
    volume = ctx.createGain(),
    filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 420;
  volume.gain.value = 0;
  filter.connect(volume);
  volume.connect(ctx.destination);
  const voices = [110, 164.81, 220, 277.18].map((hz, i) => {
    const oscillator = ctx.createOscillator(),
      level = ctx.createGain();
    oscillator.type = i % 2 ? "triangle" : "sine";
    oscillator.frequency.value = hz;
    oscillator.detune.value = i * 1.2;
    level.gain.value = 0.17 / (1 + i);
    oscillator.connect(level).connect(filter);
    oscillator.start();
    return oscillator;
  });
  const samples = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate),
    data = samples.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i++) {
    last = (last + (Math.random() - 0.5) * 0.07) / 1.025;
    data[i] = last * 0.65;
  }
  const wind = ctx.createBufferSource();
  wind.buffer = samples;
  wind.loop = true;
  wind.connect(filter);
  wind.start();
  return {
    async play() {
      await ctx.resume();
      volume.gain.setTargetAtTime(0.19, ctx.currentTime, 0.42);
    },
    mute() {
      volume.gain.setTargetAtTime(0, ctx.currentTime, 0.12);
    },
    travel(t: number) {
      filter.frequency.setTargetAtTime(
        440 + 180 * Math.sin(t * 0.72),
        ctx.currentTime,
        0.24,
      );
    },
    dispose() {
      voices.forEach((v) => v.stop());
      wind.stop();
      void ctx.close();
    },
  };
}
