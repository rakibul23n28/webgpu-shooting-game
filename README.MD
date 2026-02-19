# WebGPU TypeScript Shooting Game 🎮🚀

A **2D shooting game built with WebGPU and TypeScript**, featuring custom rendering pipelines, sprite-based animations, sound effects, enemy management, collision detection, and real-time gameplay logic. This project is focused on **low-level graphics programming** using the modern WebGPU API.

---

## ✨ Features

- 🎯 Player-controlled shooting mechanics
- 👾 Multiple enemy types (including meteor enemies)
- 💥 Bullet, explosion & particle effects
- 🎨 Sprite rendering & texture management
- 🎮 Keyboard input handling
- 🔊 Sound & background music system
- 📊 High score tracking
- 📐 Camera & geometry utilities
- ⚡ GPU-accelerated rendering via WebGPU

---

## 🛠️ Tech Stack

- **Language:** TypeScript
- **Graphics API:** WebGPU
- **Math Library:** gl-matrix
- **Bundler:** Vite
- **Runtime:** Browser (WebGPU-enabled)

---

## 📂 Project Structure

```plaintext
src/
│   bloom-blur-effect.ts
│   bloom-effect.ts
│   blur-effect.ts
│   buffer-util.ts
│   bullet-manager.ts
│   bullet.ts
│   camera.ts
│   circle-colider.ts
│   Color.ts
│   content.ts
│   effects-factory.ts
│   elliptical-collider.ts
│   engine.ts
│   explosion-manager.ts
│   explosion.ts
│   input-manager.ts
│   main.ts
│   music-content.ts
│   post-process-effect.ts
│   quad.ts
│   rect.ts
│   sound-manager.ts
│   spite-pipeline.ts
│   sprite-font.ts
│   sprite-renderer.ts
│   Sprite.ts
│   texture-effect.ts
│   texture.ts
│
├───game
│       background.ts
│       ememy-manager.ts
│       enemy.ts
│       game-over.ts
│       high-score.ts
│       meteor-enemy.ts
│       player.ts
│       power-bolt-manager.ts
│       power-bolt.ts
│       power-up-manager.ts
│       power-up-shield.ts
│       shield.ts
│
└───shaders
        bloom-effect.wgsl
        blur-effect.wgsl
        post-process.wgsl
        shader.wgsl
        texture-effect.wgsl
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher recommended)
- A **WebGPU-supported browser** (Chrome / Edge Canary)
- Enable WebGPU flag if required:

  ```
  chrome://flags → Enable WebGPU
  ```

---

### Installation

```bash
# Clone the repository
git clone https://github.com/rakibul23n28/webgpu-shooting-game.git

# Navigate to project directory
cd webgpu-shooting-game

# Install dependencies
npm install
```

---

### Run in Development Mode

```bash
npm run dev
```

Then open:

```
http://localhost:5173
```

---

### Build for Production

```bash
npm run build
npm run preview
```

---

## 🎮 Gameplay Overview

- Use keyboard controls to move the player
- Shoot bullets to destroy enemies
- Avoid enemy collisions
- Score increases by destroying enemies
- Explosions and sound effects enhance feedback

---

## 🧠 Learning Focus

This project was built to explore:

- WebGPU rendering pipelines
- GPU buffers & shader management
- Real-time game loops
- Entity-component-like architecture
- Collision detection & game physics

---

## 🔮 Future Improvements

- Power-ups & weapon upgrades
- Mobile / gamepad support
- Advanced particle effects
- Boss enemies
- UI overlays (health, ammo, pause menu)

---

## 👨‍💻 Author

**Rakibul Hasan**
Student & Developer

---

## 📜 License

This project is for **learning and experimentation purposes**. You are free to modify and extend it.

---

⭐ If you’re interested in WebGPU or game engine internals, feel free to explore and star the project!
