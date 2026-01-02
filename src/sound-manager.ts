export class SoundManager {
  private static sounds: Map<string, HTMLAudioElement[]> = new Map();
  private static POOL_SIZE = 5;

  /** Load a sound and create a small pool to prevent cut-offs */
  static load(name: string, src: string) {
    const pool: HTMLAudioElement[] = [];
    for (let i = 0; i < this.POOL_SIZE; i++) {
      const audio = new Audio(src);
      audio.preload = "auto";
      pool.push(audio);
    }
    this.sounds.set(name, pool);
  }

  /** Play a sound from the pool */
  static play(name: string, volume = 1.0) {
    const pool = this.sounds.get(name);
    if (!pool) return;

    const audio = pool.find((a) => a.paused || a.ended);
    if (!audio) return;

    audio.currentTime = 0;
    audio.volume = volume;
    audio.play().catch(() => {}); // ignore play errors (like autoplay blocked)
  }
  static playFor(name: string, durationSec: number, volume = 1.0) {
    const pool = this.sounds.get(name);
    if (!pool) return;

    const audio = pool.find((a) => a.paused || a.ended);
    if (!audio) return;

    audio.currentTime = 0;
    audio.volume = volume;
    audio.play().catch(() => {});

    // Stop after duration
    setTimeout(() => {
      audio.pause();
      audio.currentTime = 0;
    }, durationSec * 1000);
  }
}
