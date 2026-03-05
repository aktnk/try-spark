# try-spark

A browser-based 3D Gaussian Splatting (3DGS) viewer built with [Three.js](https://threejs.org/) and [Spark.js](https://sparkjs.dev/).

Load splat files and navigate the scene with keyboard, mouse, or touch controls.

## Features

- Load 3DGS files: `.ply`, `.splat`, `.spz`, `.ksplat`, `.sog`
- FPS-style camera controls (WASD + mouse)
- Model flip buttons (X/Y/Z axis) for correcting orientation
- Mobile touch joystick for movement
- Camera settings panel (FOV, Near, Far, Zoom) with Reset and Set Default

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

## Getting Started

```bash
npm install
npm run dev
```

Open the browser, click the file input to load a `.ply` or other supported splat file.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | TypeScript check + production build |
| `npm run preview` | Preview production build |

## Tech Stack

- [Vite](https://vite.dev/) + TypeScript
- [Three.js](https://threejs.org/) (^0.183)
- [@sparkjsdev/spark](https://sparkjs.dev/) (^0.1.10) - 3DGS renderer for Three.js
- [nipplejs](https://yoannmoi.net/nipplejs/) - Virtual joystick for touch devices

## License

MIT
