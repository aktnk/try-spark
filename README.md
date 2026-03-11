# try-spark

A 3D Gaussian Splatting (3DGS) viewer built with [Tauri](https://tauri.app/), [Three.js](https://threejs.org/), and [Spark.js](https://sparkjs.dev/).

Runs as a native desktop app (Tauri) or in the browser. Load splat files and navigate the scene with keyboard, mouse, or touch controls.

## Features

- Load 3DGS files: `.ply`, `.splat`, `.spz`, `.ksplat`, `.sog`
- Native file open dialog (desktop) or browser file picker (web) — auto-detected
- Loading indicator — spinner during load, error message on failure
- Loaded file name displayed in the UI panel
- FPS-style camera controls (WASD + mouse)
- Model flip buttons (X/Y/Z axis) for correcting orientation
- Reset view button — restores camera position, orientation, and flip state
- Mobile touch joystick for movement
- Camera settings panel (FOV, Zoom, Move Speed)
- Render settings panel (tone mapping, exposure, premultiplied alpha, focal adjustment)
- HUD overlay — crosshair and guide lines; shown after first file load

## UI Buttons

| Button | Action |
|--------|--------|
| ファイルを開く | Open a splat file via native dialog (hover to see supported formats) |
| 表示リセット | Reset camera to initial position and clear all flip states |
| Flip X / Y / Z | Flip model along the selected axis |
| HUD | Toggle the HUD overlay (crosshair + guide lines) |
| Render | Toggle the render settings panel |
| Camera Settings | Toggle the camera settings panel |

### HUD Overlay

Helps align the camera's look direction with the intended movement direction, reducing drift into walls, floors, and ceilings.

| Element | Description |
|---------|-------------|
| Center dot | Marks the exact center of the view |
| Crosshair (short cross) | Bright short lines indicating the look direction |
| Horizontal guide line | Spans 20vh centered, helps keep the horizon level |
| Vertical guide line | Spans 20vh centered, helps avoid vertical drift |

### Camera Settings Panel

| Control | Description |
|---------|-------------|
| FOV | Field of view (degrees) — live preview as you type |
| Zoom | Camera zoom multiplier — live preview as you type |
| Speed | Move speed multiplier (1.0 = default) — applied on OK |
| Default | Reset all inputs to initial values and apply FOV/Zoom immediately |
| OK | Apply Speed and close panel (FOV/Zoom already applied) |
| Cancel / ✕ | Revert FOV/Zoom to values when panel was opened and close |

### Render Settings Panel

Adjusts the rendering appearance of loaded splats. Settings are saved to `localStorage` and restored on next launch.

| Control | Description |
|---------|-------------|
| Tone Map | Three.js tone mapping: None / Linear / Reinhard / Cineon / ACES Filmic |
| Exposure | Brightness multiplier (default: 1.0) |
| Pre-mult α | Premultiplied alpha blending for splats (default: ON) |
| Focal Adj | Splat scale factor — `2.0` matches Super Splat / PlayCanvas rendering (default: 1.0) |
| Default | Restore all render settings to defaults |
| Super Splat | Apply `Focal Adj: 2.0` to match Super Splat Viewer appearance |

## Controls

### PC

| Action | Input |
|--------|-------|
| Move forward/back/left/right | W / A / S / D |
| Move up | Space |
| Move down | Shift |
| Look around | Mouse drag (left button) |
| Slide | Mouse drag (right button) |
| Zoom | Scroll wheel |
| Roll | Q / E |

### Mobile

| Action | Input |
|--------|-------|
| Move | Virtual joystick (bottom-left) |
| Look around | Touch drag |

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Rust](https://www.rust-lang.org/tools/install) (via rustup)
- Linux: `libwebkit2gtk-4.1-dev`, `libgtk-3-dev`, `librsvg2-dev`

```bash
# Linux dependency install example (Ubuntu/Debian)
sudo apt install libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
```

## Getting Started

### Desktop (Tauri)

```bash
npm install

# Development
npx tauri dev

# Production build → generates installer in src-tauri/target/release/bundle/
npx tauri build
```

### Web (browser)

```bash
npm install
npm run dev      # development server
npm run build    # production build → dist/
npm run preview  # preview production build
```

The web build can be hosted on any static file server and accessed from PC or mobile browsers.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server (web / browser) |
| `npm run build` | TypeScript check + Vite production build |
| `npm run preview` | Preview production build in browser |
| `npx tauri dev` | Launch desktop app in development mode |
| `npx tauri build` | Build distributable desktop installer |

## Tech Stack

- [Tauri](https://tauri.app/) v2 - Desktop app framework (Rust)
- [Vite](https://vite.dev/) + TypeScript
- [Three.js](https://threejs.org/) (^0.183)
- [@sparkjsdev/spark](https://sparkjs.dev/) (^0.1.10) - 3DGS renderer for Three.js
- [nipplejs](https://yoannmoi.net/nipplejs/) - Virtual joystick for touch devices

## License

MIT
