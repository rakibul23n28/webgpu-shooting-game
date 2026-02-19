import { SoundManager } from "./sound-manager";

export class MusicContent {
  private static initialized = false;

  /** Load all game sounds here (call once) */
  public static async initialize() {
    if (this.initialized) return;

    // 🔊 SFX
    SoundManager.load("explosion", "Bonus/sfx_shieldDown.ogg");
    SoundManager.load("laser", "Bonus/sfx_laser2.ogg");
    SoundManager.load("hit", "Bonus/sfx_hit.ogg");
    SoundManager.load("lose", "Bonus/sfx_lose.ogg");
    // powerup
    SoundManager.load("powerup", "Bonus/sfx_shieldUp.ogg");

    // 🎵 Music
    SoundManager.load("bgm", "Music/background.ogg");
    SoundManager.load("shield_hit", "Bonus/sfx_shieldDown.ogg");

    this.initialized = true;
  }
}
