import * as THREE from 'three'

const MAX_PARTICLES = 50_000
const SPAWN_RADIUS = 2.5
const CONVERGENCE_DURATION = 1.5

const VERTEX_SHADER = /* glsl */ `
  attribute vec3 targetPosition;
  attribute vec3 spawnColor;
  attribute vec3 targetColor;
  attribute float seed;

  uniform float time;
  uniform float convergence;

  varying vec3 vColor;

  void main() {
    float floatAmp = 0.28 * (1.0 - convergence);
    vec3 floatOffset = vec3(
      sin(time * 0.7 + seed) * floatAmp,
      cos(time * 0.5 + seed * 1.3) * floatAmp * 1.4,
      sin(time * 0.9 + seed * 0.7) * floatAmp
    );

    vec3 worldPos = mix(position + floatOffset, targetPosition, convergence);
    vColor = mix(spawnColor, targetColor, convergence);

    vec4 mvPos = modelViewMatrix * vec4(worldPos, 1.0);
    gl_Position = projectionMatrix * mvPos;

    float dist = max(-mvPos.z, 0.1);
    gl_PointSize = clamp(110.0 / dist, 1.5, 10.0);
  }
`

const FRAGMENT_SHADER = /* glsl */ `
  varying vec3 vColor;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float r = length(uv);
    if (r > 0.5) discard;

    float glow = 1.0 - smoothstep(0.0, 0.5, r);
    glow = pow(glow, 1.4);

    gl_FragColor = vec4(vColor * (0.55 + 0.45 * glow), glow * 0.92);
  }
`

export interface ParticleSystem {
  readonly points: THREE.Points
  readonly geometry: THREE.BufferGeometry
  readonly material: THREE.ShaderMaterial
  readonly spawnedCount: number
  readonly phase: 'spawning' | 'converging' | 'done'
  readonly convergenceStart: number
}

function randomInSphere(): [number, number, number] {
  let x = 0, y = 0, z = 0
  do {
    x = Math.random() * 2 - 1
    y = Math.random() * 2 - 1
    z = Math.random() * 2 - 1
  } while (x * x + y * y + z * z > 1)
  return [x * SPAWN_RADIUS, y * SPAWN_RADIUS, z * SPAWN_RADIUS]
}

export function createParticleSystem(scene: THREE.Scene): ParticleSystem {
  const positions = new Float32Array(MAX_PARTICLES * 3)
  const targetPositions = new Float32Array(MAX_PARTICLES * 3)
  const spawnColors = new Float32Array(MAX_PARTICLES * 3)
  const targetColors = new Float32Array(MAX_PARTICLES * 3)
  const seeds = new Float32Array(MAX_PARTICLES)

  for (let i = 0; i < MAX_PARTICLES; i++) {
    const [x, y, z] = randomInSphere()
    positions[i * 3] = x
    positions[i * 3 + 1] = y
    positions[i * 3 + 2] = z

    targetPositions[i * 3] = x
    targetPositions[i * 3 + 1] = y
    targetPositions[i * 3 + 2] = z

    const t = Math.random()
    spawnColors[i * 3] = 0.25 + t * 0.55
    spawnColors[i * 3 + 1] = 0.55 + t * 0.38
    spawnColors[i * 3 + 2] = 0.88 + t * 0.12

    targetColors[i * 3] = spawnColors[i * 3]
    targetColors[i * 3 + 1] = spawnColors[i * 3 + 1]
    targetColors[i * 3 + 2] = spawnColors[i * 3 + 2]

    seeds[i] = Math.random() * Math.PI * 2
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('targetPosition', new THREE.BufferAttribute(targetPositions, 3))
  geometry.setAttribute('spawnColor', new THREE.BufferAttribute(spawnColors, 3))
  geometry.setAttribute('targetColor', new THREE.BufferAttribute(targetColors, 3))
  geometry.setAttribute('seed', new THREE.BufferAttribute(seeds, 1))
  geometry.setDrawRange(0, 0)

  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      convergence: { value: 0 },
    },
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })

  const points = new THREE.Points(geometry, material)
  scene.add(points)

  return { points, geometry, material, spawnedCount: 0, phase: 'spawning', convergenceStart: 0 }
}

export function spawnParticles(ps: ParticleSystem, count: number): ParticleSystem {
  if (ps.phase !== 'spawning') return ps
  const newCount = Math.min(count, MAX_PARTICLES)
  if (newCount === ps.spawnedCount) return ps
  ps.geometry.setDrawRange(0, newCount)
  return { ...ps, spawnedCount: newCount }
}

export function setConvergenceTargets(
  ps: ParticleSystem,
  positions: Float32Array,
  colors: Float32Array,
  currentTime: number,
): ParticleSystem {
  const targetPosAttr = ps.geometry.getAttribute('targetPosition') as THREE.BufferAttribute
  const targetColAttr = ps.geometry.getAttribute('targetColor') as THREE.BufferAttribute
  const srcCount = Math.floor(positions.length / 3)

  for (let i = 0; i < MAX_PARTICLES; i++) {
    const src = (i % srcCount) * 3
    const dst = i * 3
    ;(targetPosAttr.array as Float32Array)[dst] = positions[src]
    ;(targetPosAttr.array as Float32Array)[dst + 1] = positions[src + 1]
    ;(targetPosAttr.array as Float32Array)[dst + 2] = positions[src + 2]
    ;(targetColAttr.array as Float32Array)[dst] = colors[src]
    ;(targetColAttr.array as Float32Array)[dst + 1] = colors[src + 1]
    ;(targetColAttr.array as Float32Array)[dst + 2] = colors[src + 2]
  }

  targetPosAttr.needsUpdate = true
  targetColAttr.needsUpdate = true
  ps.geometry.setDrawRange(0, MAX_PARTICLES)

  return { ...ps, phase: 'converging', convergenceStart: currentTime, spawnedCount: MAX_PARTICLES }
}

export function updateParticleSystem(ps: ParticleSystem, time: number): ParticleSystem {
  ps.material.uniforms.time.value = time

  if (ps.phase === 'converging') {
    const elapsed = time - ps.convergenceStart
    const convergence = Math.min(elapsed / CONVERGENCE_DURATION, 1.0)
    ps.material.uniforms.convergence.value = convergence
    if (convergence >= 1.0) {
      return { ...ps, phase: 'done' }
    }
  }

  return ps
}

export function disposeParticleSystem(ps: ParticleSystem, scene: THREE.Scene): void {
  scene.remove(ps.points)
  ps.geometry.dispose()
  ps.material.dispose()
}
