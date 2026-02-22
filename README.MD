# 🌌 StarShatter: WebGPU TypeScript Engine

![License](https://img.shields.io/badge/license-MIT-green)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![WebGPU](https://img.shields.io/badge/WebGPU-Next--Gen-blueviolet?style=flat)](https://gpuweb.github.io/gpuweb/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)

A high-performance **2D Space Shooting Game** and custom engine built from the ground up using the **WebGPU API**. This project explores modern GPU-accelerated rendering, featuring modular pipelines, WGSL shaders, and real-time game logic.

---

## ✨ Features

- **🎯 Combat System:** Fluid player movement, shooting mechanics, and multiple enemy types (including meteor hazards).
- **🎨 Advanced Rendering:** Custom sprite and shape rendering pipelines with high-efficiency texture management.
- **💥 Post-Processing:** Multi-pass **Bloom** and **Gaussian Blur** effects for high-fidelity visuals.
- **📐 Physics & Collisions:** Optimized Circle and Elliptical collider systems for pixel-perfect hit detection.
- **🔊 Audio Engine:** Integrated sound manager for background music (BGM) and spatial-feeling SFX.
- **📊 State Management:** Real-time high-score tracking and game-over logic.

---

## 🛠️ Tech Stack

| Layer            | Technology                                |
| :--------------- | :---------------------------------------- |
| **Language**     | TypeScript                                |
| **Graphics API** | WebGPU (WGSL Shaders)                     |
| **Mathematics**  | `gl-matrix`                               |
| **Bundler**      | Vite                                      |
| **Environment**  | WebGPU-enabled Browser (Chrome/Edge 113+) |

---

## 📂 Project Structure

The engine is architected to separate low-level GPU abstractions from high-level game entities.

```plaintext
src/
├── 🎮 game/             # High-level Gameplay Logic
│   ├── player.ts        # Player state & input
│   ├── enemy-manager.ts # AI & spawning
│   └── shield.ts        # Collision & power-ups
├── 🧱 shaders/          # WGSL Graphics Shaders
│   ├── bloom-effect.wgsl
│   └── post-process.wgsl
├── ⚙️ engine/           # Core Engine Components
│   ├── sprite-renderer.ts
│   ├── camera.ts
│   └── sound-manager.ts
└── 🛠️ utils/            # Helper Utilities
    └── buffer-util.ts   # GPU Buffer & Memory helpers
🚀 Getting Started
Prerequisites
Node.js (v18.0 or higher)

A WebGPU-supported browser (Chrome, Edge, or Firefox Nightly).

Ensure WebGPU is enabled in chrome://flags if using an older version.

Installation & Run
Clone the repository:

Bash
git clone [https://github.com/rakibul23n28/webgpu-shooting-game.git](https://github.com/rakibul23n28/webgpu-shooting-game.git)
cd webgpu-shooting-game
Install dependencies:

Bash
npm install
Start the development server:

Bash
npm run dev
Build for production:

Bash
npm run build
🧠 Learning Focus: WebGPU Internals
This project was built to master the transition from WebGL to WebGPU, specifically focusing on:

GPURenderPipeline: Creating modular pipelines for different material types.

Bind Groups: Managing data layouts for uniform buffers and textures.

Command Encoders: Recording drawing commands for efficient execution.

Post-Process Stack: Implementing multi-pass rendering by piping textures through blur and bloom shaders.

🔮 Future Roadmap
[ ] Instanced Rendering: Optimize bullet management for thousands of entities.

[ ] Compute Shaders: Move collision detection logic from CPU to GPU.

[ ] Mobile Support: Virtual joystick and touch-input integration.

[ ] Level System: Progressive difficulty and boss-fight encounters.

👨‍💻 Author
Rakibul Hasan
Student & Developer

📜 License
This project is open-source and available for learning and experimentation purposes.

⭐ If you find this project helpful, please give it a star!


---

**Would you like me to help you create a specific "How to Play" section with keyboard controls, or perhaps a section explaining how your Bloom shader works?**
```
