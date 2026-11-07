import * as THREE from 'three';

// Pooled visual effects: GPU point particles (additive sparks + soft dust),
// expanding ground rings, flash sprites and streaks. All CPU-simulated, one
// draw call per particle pool.

const PARTICLE_VERT = /* glsl */ `
attribute float aSize;
attribute float aAlpha;
attribute vec3 aColor;
uniform float uScale;
varying vec3 vColor;
varying float vAlpha;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = clamp(aSize * uScale / max(-mv.z, 0.1), 0.0, 72.0);
  vColor = aColor;
  vAlpha = aAlpha;
}
`;

const PARTICLE_FRAG = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c) * 2.0;
  float a = clamp(1.0 - d, 0.0, 1.0);
  a *= a;
  gl_FragColor = vec4(vColor, a * vAlpha);
}
`;

export class Particles {
  readonly points: THREE.Points;
  readonly uniforms = { uScale: { value: 500 } };
  private readonly max: number;
  private count = 0;
  private warned = false;
  private readonly pos: Float32Array;
  private readonly vel: Float32Array;
  private readonly col: Float32Array;
  private readonly age: Float32Array;
  private readonly life: Float32Array;
  private readonly size0: Float32Array;
  private readonly size1: Float32Array;
  private readonly grav: Float32Array;
  private readonly drag: Float32Array;
  private readonly aPos: THREE.BufferAttribute;
  private readonly aCol: THREE.BufferAttribute;
  private readonly aSize: THREE.BufferAttribute;
  private readonly aAlpha: THREE.BufferAttribute;

  constructor(max: number, blending: THREE.Blending, name: string) {
    this.max = max;
    this.pos = new Float32Array(max * 3);
    this.vel = new Float32Array(max * 3);
    this.col = new Float32Array(max * 3);
    this.age = new Float32Array(max);
    this.life = new Float32Array(max);
    this.size0 = new Float32Array(max);
    this.size1 = new Float32Array(max);
    this.grav = new Float32Array(max);
    this.drag = new Float32Array(max);
    const geo = new THREE.BufferGeometry();
    this.aPos = new THREE.BufferAttribute(new Float32Array(max * 3), 3).setUsage(THREE.DynamicDrawUsage);
    this.aCol = new THREE.BufferAttribute(new Float32Array(max * 3), 3).setUsage(THREE.DynamicDrawUsage);
    this.aSize = new THREE.BufferAttribute(new Float32Array(max), 1).setUsage(THREE.DynamicDrawUsage);
    this.aAlpha = new THREE.BufferAttribute(new Float32Array(max), 1).setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute('position', this.aPos);
    geo.setAttribute('aColor', this.aCol);
    geo.setAttribute('aSize', this.aSize);
    geo.setAttribute('aAlpha', this.aAlpha);
    geo.setDrawRange(0, 0);
    const mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: PARTICLE_VERT,
      fragmentShader: PARTICLE_FRAG,
      transparent: true,
      depthWrite: false,
      blending,
    });
    this.points = new THREE.Points(geo, mat);
    this.points.frustumCulled = false;
    this.points.renderOrder = 10;
    this.points.name = name;
  }

  emit(
    x: number,
    y: number,
    z: number,
    vx: number,
    vy: number,
    vz: number,
    color: THREE.Color,
    size0: number,
    size1: number,
    life: number,
    gravity = 0,
    drag = 0,
  ): void {
    if (this.count >= this.max) {
      if (!this.warned) {
        console.warn(`[fx] ${this.points.name} pool full (${this.max}); dropping particles`);
        this.warned = true;
      }
      return;
    }
    const i = this.count++;
    this.pos[i * 3] = x;
    this.pos[i * 3 + 1] = y;
    this.pos[i * 3 + 2] = z;
    this.vel[i * 3] = vx;
    this.vel[i * 3 + 1] = vy;
    this.vel[i * 3 + 2] = vz;
    this.col[i * 3] = color.r;
    this.col[i * 3 + 1] = color.g;
    this.col[i * 3 + 2] = color.b;
    this.age[i] = 0;
    this.life[i] = life;
    this.size0[i] = size0;
    this.size1[i] = size1;
    this.grav[i] = gravity;
    this.drag[i] = drag;
  }

  private kill(i: number): void {
    const last = --this.count;
    if (i === last) return;
    for (let k = 0; k < 3; k++) {
      this.pos[i * 3 + k] = this.pos[last * 3 + k];
      this.vel[i * 3 + k] = this.vel[last * 3 + k];
      this.col[i * 3 + k] = this.col[last * 3 + k];
    }
    this.age[i] = this.age[last];
    this.life[i] = this.life[last];
    this.size0[i] = this.size0[last];
    this.size1[i] = this.size1[last];
    this.grav[i] = this.grav[last];
    this.drag[i] = this.drag[last];
  }

  update(dt: number): void {
    let i = 0;
    while (i < this.count) {
      this.age[i] += dt;
      if (this.age[i] >= this.life[i]) {
        this.kill(i);
        continue;
      }
      const damping = Math.exp(-this.drag[i] * dt);
      this.vel[i * 3] *= damping;
      this.vel[i * 3 + 1] = this.vel[i * 3 + 1] * damping - this.grav[i] * dt;
      this.vel[i * 3 + 2] *= damping;
      this.pos[i * 3] += this.vel[i * 3] * dt;
      this.pos[i * 3 + 1] += this.vel[i * 3 + 1] * dt;
      this.pos[i * 3 + 2] += this.vel[i * 3 + 2] * dt;
      i++;
    }
    const p = this.aPos.array as Float32Array;
    const c = this.aCol.array as Float32Array;
    const s = this.aSize.array as Float32Array;
    const a = this.aAlpha.array as Float32Array;
    for (let k = 0; k < this.count; k++) {
      const t = this.age[k] / this.life[k];
      p[k * 3] = this.pos[k * 3];
      p[k * 3 + 1] = this.pos[k * 3 + 1];
      p[k * 3 + 2] = this.pos[k * 3 + 2];
      c[k * 3] = this.col[k * 3];
      c[k * 3 + 1] = this.col[k * 3 + 1];
      c[k * 3 + 2] = this.col[k * 3 + 2];
      s[k] = this.size0[k] + (this.size1[k] - this.size0[k]) * t;
      a[k] = Math.min(1, t * 10) * (1 - t * t);
    }
    for (const attr of [this.aPos, this.aCol]) {
      attr.clearUpdateRanges();
      attr.addUpdateRange(0, this.count * 3);
      attr.needsUpdate = true;
    }
    for (const attr of [this.aSize, this.aAlpha]) {
      attr.clearUpdateRanges();
      attr.addUpdateRange(0, this.count);
      attr.needsUpdate = true;
    }
    this.points.geometry.setDrawRange(0, this.count);
  }

  get alive(): number {
    return this.count;
  }
}

let radial: THREE.CanvasTexture | null = null;
/** Soft white radial gradient, shared by glow sprites everywhere. */
export function radialTexture(): THREE.CanvasTexture {
  if (radial) return radial;
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('[fx] 2d context unavailable');
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.18, 'rgba(255,255,255,0.6)');
  g.addColorStop(0.45, 'rgba(255,255,255,0.18)');
  g.addColorStop(0.75, 'rgba(255,255,255,0.04)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  radial = new THREE.CanvasTexture(c);
  return radial;
}

type Timed = { obj: THREE.Object3D; mat: THREE.MeshBasicMaterial | THREE.SpriteMaterial; age: number; life: number; kind: 'ring' | 'flash' | 'streak'; r0: number; r1: number; opacity: number; active: boolean };

const ringGeometry = new THREE.RingGeometry(0.86, 1, 72).rotateX(-Math.PI / 2);
const streakGeometry = new THREE.CylinderGeometry(1, 1, 1, 10, 1, true).translate(0, 0.5, 0);

export class Fx {
  readonly group = new THREE.Group();
  readonly sparks = new Particles(5000, THREE.AdditiveBlending, 'sparks');
  readonly dust = new Particles(1200, THREE.NormalBlending, 'dust');
  private readonly timed: Timed[] = [];
  private readonly tmp = new THREE.Color();
  private readonly up = new THREE.Vector3(0, 1, 0);
  shakeRequest = 0;

  constructor(scene: THREE.Scene) {
    this.group.name = 'fx';
    this.group.add(this.sparks.points, this.dust.points);
    scene.add(this.group);
  }

  setViewport(heightPx: number, fovDeg: number): void {
    const scale = heightPx / (2 * Math.tan((fovDeg * Math.PI) / 360));
    this.sparks.uniforms.uScale.value = scale;
    this.dust.uniforms.uScale.value = scale;
  }

  private take(kind: Timed['kind']): Timed {
    for (const t of this.timed) {
      if (!t.active && t.kind === kind) return t;
    }
    let obj: THREE.Object3D;
    let mat: THREE.MeshBasicMaterial | THREE.SpriteMaterial;
    if (kind === 'flash') {
      mat = new THREE.SpriteMaterial({ map: radialTexture(), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true });
      obj = new THREE.Sprite(mat);
    } else {
      mat = new THREE.MeshBasicMaterial({ transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
      obj = new THREE.Mesh(kind === 'ring' ? ringGeometry : streakGeometry, mat);
    }
    obj.renderOrder = 11;
    obj.frustumCulled = false;
    this.group.add(obj);
    const t: Timed = { obj, mat, age: 0, life: 1, kind, r0: 1, r1: 1, opacity: 1, active: false };
    this.timed.push(t);
    return t;
  }

  /** Sparks flying out of a point. */
  burst(pos: THREE.Vector3, color: string | THREE.Color, count: number, speed: number, size = 0.35, life = 0.6, gravity = 4, intensity = 3): void {
    this.tmp.set(color).multiplyScalar(intensity);
    for (let i = 0; i < count; i++) {
      const u = Math.random() * 2 - 1;
      const a = Math.random() * Math.PI * 2;
      const r = Math.sqrt(1 - u * u);
      const s = speed * (0.35 + Math.random() * 0.65);
      this.sparks.emit(pos.x, pos.y, pos.z, Math.cos(a) * r * s, u * s, Math.sin(a) * r * s, this.tmp, size, size * 0.2, life * (0.6 + Math.random() * 0.6), gravity, 2.2);
    }
  }

  /** One drifting spark (trails). */
  mote(pos: THREE.Vector3, color: string | THREE.Color, size: number, life: number, jitter = 0.6, rise = 0.6, intensity = 3): void {
    this.tmp.set(color).multiplyScalar(intensity);
    this.sparks.emit(
      pos.x + (Math.random() - 0.5) * jitter * 0.4,
      pos.y + (Math.random() - 0.5) * jitter * 0.4,
      pos.z + (Math.random() - 0.5) * jitter * 0.4,
      (Math.random() - 0.5) * jitter,
      rise + (Math.random() - 0.5) * jitter,
      (Math.random() - 0.5) * jitter,
      this.tmp,
      size,
      size * 0.1,
      life,
      0,
      1.5,
    );
  }

  /** Soft dust puffs hugging the ground. */
  /** Ground color for footstep and landing dust; set per land (sand, snow, mud...). */
  dustColor = '#d9cdb4';

  dustPuff(pos: THREE.Vector3, count: number, speed: number, size = 0.9): void {
    this.tmp.set(this.dustColor);
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + Math.random() * 0.4;
      const s = speed * (0.6 + Math.random() * 0.5);
      this.dust.emit(pos.x, pos.y + 0.15, pos.z, Math.cos(a) * s, 0.6 + Math.random() * 1.2, Math.sin(a) * s, this.tmp, size * 0.6, size * 1.8, 0.7 + Math.random() * 0.4, -0.4, 3.2);
    }
  }

  ring(pos: THREE.Vector3, color: string, r0: number, r1: number, life: number, intensity = 2.5, opacity = 1): void {
    const t = this.take('ring');
    (t.mat as THREE.MeshBasicMaterial).color.set(color).multiplyScalar(intensity);
    t.obj.position.copy(pos);
    t.age = 0;
    t.life = life;
    t.r0 = r0;
    t.r1 = r1;
    t.opacity = opacity;
    t.active = true;
    t.obj.visible = true;
  }

  flash(pos: THREE.Vector3, color: string, size: number, life: number, intensity = 3): void {
    const t = this.take('flash');
    (t.mat as THREE.SpriteMaterial).color.set(color).multiplyScalar(intensity);
    t.obj.position.copy(pos);
    t.age = 0;
    t.life = life;
    t.r0 = size * 0.5;
    t.r1 = size;
    t.opacity = 1;
    t.active = true;
    t.obj.visible = true;
  }

  streak(a: THREE.Vector3, b: THREE.Vector3, color: string, life: number, radius = 0.25, intensity = 2.5): void {
    const t = this.take('streak');
    (t.mat as THREE.MeshBasicMaterial).color.set(color).multiplyScalar(intensity);
    const dir = new THREE.Vector3().subVectors(b, a);
    const len = dir.length();
    t.obj.position.copy(a);
    t.obj.quaternion.setFromUnitVectors(this.up, dir.normalize());
    t.obj.scale.set(radius, len, radius);
    t.age = 0;
    t.life = life;
    t.r0 = radius;
    t.r1 = 0;
    t.opacity = 1;
    t.active = true;
    t.obj.visible = true;
  }

  shake(amount: number): void {
    this.shakeRequest += amount;
  }

  update(dt: number): void {
    this.sparks.update(dt);
    this.dust.update(dt);
    for (const t of this.timed) {
      if (!t.active) continue;
      t.age += dt;
      const k = t.age / t.life;
      if (k >= 1) {
        t.active = false;
        t.obj.visible = false;
        continue;
      }
      const ease = 1 - (1 - k) * (1 - k);
      if (t.kind === 'ring') {
        const r = t.r0 + (t.r1 - t.r0) * ease;
        t.obj.scale.set(r, 1, r);
        t.mat.opacity = t.opacity * (1 - k);
      } else if (t.kind === 'flash') {
        const r = t.r0 + (t.r1 - t.r0) * ease;
        t.obj.scale.set(r, r, r);
        t.mat.opacity = (1 - k) * (1 - k);
      } else {
        const r = t.r0 * (1 - k);
        t.obj.scale.x = r;
        t.obj.scale.z = r;
        t.mat.opacity = 1 - k;
      }
    }
  }
}
