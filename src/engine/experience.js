import {
  AdditiveBlending,
  AmbientLight,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  CircleGeometry,
  Color,
  ColorManagement,
  ConeGeometry,
  CylinderGeometry,
  DoubleSide,
  EdgesGeometry,
  Group,
  HemisphereLight,
  IcosahedronGeometry,
  LatheGeometry,
  LineBasicMaterial,
  LineSegments,
  LinearFilter,
  Mesh,
  Quaternion,
  MeshBasicMaterial,
  MeshStandardMaterial,
  NormalBlending,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  Points,
  RepeatWrapping,
  SRGBColorSpace,
  Scene,
  ShaderMaterial,
  Sphere,
  TorusGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';

const MOBILE_QUERY = '(max-width: 820px)';

const FW = {
  playful: { count: 52, speed: 2.7, life: 1.25, gravity: 1.55, rings: 2 },
  elegant: { count: 30, speed: 1.55, life: 1.85, gravity: 0.62, rings: 1 },
  soft: { count: 22, speed: 1.25, life: 2.05, gravity: 0.4, rings: 1 },
  powerful: { count: 64, speed: 3.35, life: 1.35, gravity: 1.7, rings: 2 },
  romantic: { count: 28, speed: 1.2, life: 2.2, gravity: 0.32, rings: 1 },
};

ColorManagement.enabled = false;

function prefersMobile() {
  const narrow = window.matchMedia(MOBILE_QUERY).matches;
  const cores = navigator.hardwareConcurrency || 8;
  return narrow || cores <= 4;
}

function makeAtlas() {
  const cell = 64;
  const canvas = document.createElement('canvas');
  canvas.width = cell * 4;
  canvas.height = cell;
  const ctx = canvas.getContext('2d');

  function cellStart(index) {
    ctx.save();
    ctx.translate(index * cell, 0);
    ctx.clearRect(0, 0, cell, cell);
  }

  cellStart(0);
  const spark = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
  spark.addColorStop(0, 'rgba(255,255,255,1)');
  spark.addColorStop(0.35, 'rgba(255,255,255,0.85)');
  spark.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = spark;
  ctx.fillRect(0, 0, cell, cell);
  ctx.restore();

  cellStart(1);
  ctx.translate(32, 32);
  ctx.fillStyle = '#fff';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(-7, -16, 14, 32, 3);
    else ctx.rect(-7, -16, 14, 32);
    ctx.fill();
  ctx.restore();

  cellStart(2);
  ctx.translate(32, 34);
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.ellipse(0, 0, 11, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'destination-in';
  const petalFade = ctx.createLinearGradient(0, -22, 0, 22);
  petalFade.addColorStop(0, 'rgba(255,255,255,0.15)');
  petalFade.addColorStop(0.35, 'rgba(255,255,255,1)');
  petalFade.addColorStop(1, 'rgba(255,255,255,0.2)');
  ctx.fillStyle = petalFade;
  ctx.fillRect(-32, -32, 64, 64);
  ctx.restore();

  cellStart(3);
  ctx.translate(32, 34);
  ctx.scale(1.15, 1.15);
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.moveTo(0, 12);
  ctx.bezierCurveTo(-16, 2, -14, -12, 0, -4);
  ctx.bezierCurveTo(14, -12, 16, 2, 0, 12);
  ctx.fill();
  ctx.restore();

  const texture = new CanvasTexture(canvas);
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
}

function makeRadialTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 8, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,210,140,0.55)');
  g.addColorStop(0.45, 'rgba(255,160,70,0.16)');
  g.addColorStop(1, 'rgba(255,160,70,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

const pointVertex = /* glsl */ `
  attribute float aSize;
  attribute float aShape;
  attribute float aSpin;
  attribute float aAlpha;
  attribute vec3 aColor;
  uniform float uHeight;
  varying float vShape;
  varying float vSpin;
  varying float vAlpha;
  varying vec3 vColor;
  void main() {
    vShape = aShape;
    vSpin = aSpin;
    vAlpha = aAlpha;
    vColor = aColor;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = clamp(aSize * uHeight / max(1.0, -mv.z), 1.0, 72.0);
    gl_Position = projectionMatrix * mv;
  }
`;

const pointFragment = /* glsl */ `
  precision highp float;
  uniform sampler2D uAtlas;
  uniform float uTime;
  uniform float uTwinkle;
  uniform float uPremul;
  varying float vShape;
  varying float vSpin;
  varying float vAlpha;
  varying vec3 vColor;
  void main() {
    vec2 p = gl_PointCoord - 0.5;
    float s = sin(vSpin);
    float c = cos(vSpin);
    p = mat2(c, -s, s, c) * p;
    vec2 uv = p + 0.5;
    if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) discard;
    float cell = floor(vShape + 0.5);
    vec4 tex = texture2D(uAtlas, vec2((uv.x + cell) / 4.0, uv.y));
    float tw = mix(1.0, 0.4 + 0.6 * sin(uTime * 1.8 + vSpin * 10.0), uTwinkle);
    float a = tex.a * vAlpha * tw;
    if (a < 0.03) discard;
    gl_FragColor = uPremul > 0.5 ? vec4(vColor * a, a) : vec4(vColor, a);
  }
`;

const flameVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const flameFragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uMotion;
  void main() {
    vec2 uv = vUv;
    float t = uTime * uMotion;
    float wobble = sin(uv.y * 11.0 - t * 7.5) * 0.055 + sin(uv.y * 24.0 - t * 13.0) * 0.02;
    wobble *= smoothstep(0.0, 0.45, uv.y);
    float x = abs(uv.x - 0.5 + wobble);
    float width = mix(0.07, 0.26, pow(uv.y, 0.8));
    float side = smoothstep(width, width * 0.28, x);
    float tip = smoothstep(1.0, 0.12, uv.y);
    float base = smoothstep(0.0, 0.07, uv.y);
    float mask = side * tip * base;
    float core = smoothstep(0.2, 0.0, length(vec2((uv.x - 0.5) * 1.7, (uv.y - 0.16) * 1.05)));
    vec3 mid = vec3(1.0, 0.68, 0.24);
    vec3 hot = vec3(1.0, 0.96, 0.82);
    vec3 col = mix(uColor, mid, smoothstep(0.0, 0.5, uv.y));
    col = mix(col, hot, core);
    float alpha = clamp(mask * 0.95 + core * 0.4, 0.0, 1.0);
    gl_FragColor = vec4(col, alpha);
  }
`;

function posesFor(wide) {
  if (wide) {
    return {
      landing: { x: 0, y: 0.35, z: 0, scale: 1.05, camZ: 6.15, lookY: 0.45 },
      form: { x: 1.35, y: 0.15, z: 0, scale: 0.92, camZ: 6.5, lookY: 0.25 },
      reveal: { x: 0.15, y: 0.85, z: -0.2, scale: 0.78, camZ: 7.1, lookY: 0.15 },
    };
  }
  return {
    landing: { x: 0, y: 0.72, z: 0, scale: 0.92, camZ: 6.4, lookY: 0.55 },
    form: { x: 0, y: 1.85, z: 0, scale: 0.72, camZ: 6.8, lookY: 1.15 },
    reveal: { x: 0, y: 1.7, z: 0, scale: 0.62, camZ: 7.2, lookY: 0.35 },
  };
}

function createDiya() {
  const points = [
    new Vector2(0.02, 0.2),
    new Vector2(0.16, 0.16),
    new Vector2(0.46, 0.12),
    new Vector2(0.72, 0.2),
    new Vector2(0.8, 0.12),
    new Vector2(0.58, -0.02),
    new Vector2(0.26, -0.18),
    new Vector2(0.06, -0.22),
  ];
  const clay = new MeshStandardMaterial({
    color: 0x6d2c16,
    roughness: 0.62,
    metalness: 0.12,
  });
  const bowl = new Mesh(new LatheGeometry(points, 40), clay);
  const rim = new Mesh(
    new TorusGeometry(0.74, 0.035, 12, 48),
    new MeshStandardMaterial({ color: 0xe6c36a, roughness: 0.28, metalness: 0.82 }),
  );
  rim.position.y = 0.16;
  rim.rotation.x = Math.PI / 2;
  const oil = new Mesh(
    new CircleGeometry(0.42, 24),
    new MeshStandardMaterial({
      color: 0x2a1408,
      emissive: 0xff8a2a,
      emissiveIntensity: 0.35,
      roughness: 0.4,
    }),
  );
  oil.rotation.x = -Math.PI / 2;
  oil.position.y = 0.1;
  const wick = new Mesh(
    new CylinderGeometry(0.015, 0.02, 0.16, 6),
    new MeshStandardMaterial({ color: 0x1a120c, roughness: 0.8 }),
  );
  wick.position.y = 0.2;
  const group = new Group();
  group.add(bowl, rim, oil, wick);
  return group;
}

function createLantern() {
  const group = new Group();
  const body = new Mesh(
    new CylinderGeometry(0.1, 0.14, 0.36, 7),
    new MeshStandardMaterial({
      color: 0x3a2414,
      emissive: 0xff9a3c,
      emissiveIntensity: 0.55,
      roughness: 0.45,
      metalness: 0.2,
    }),
  );
  const cap = new Mesh(
    new ConeGeometry(0.15, 0.12, 7),
    new MeshStandardMaterial({ color: 0xd7b15a, metalness: 0.7, roughness: 0.3 }),
  );
  cap.position.y = 0.24;
  const tassel = new Mesh(
    new CylinderGeometry(0.008, 0.008, 0.16, 4),
    new MeshStandardMaterial({ color: 0xe6c36a, metalness: 0.4, roughness: 0.4 }),
  );
  tassel.position.y = -0.26;
  group.add(body, cap, tassel);
  group.userData.body = body;
  return group;
}

function makePointPool(count, atlas, { twinkle = 0, blending = AdditiveBlending } = {}) {
  const geometry = new BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const shapes = new Float32Array(count);
  const spins = new Float32Array(count);
  const alphas = new Float32Array(count);
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setAttribute('aColor', new BufferAttribute(colors, 3));
  geometry.setAttribute('aSize', new BufferAttribute(sizes, 1));
  geometry.setAttribute('aShape', new BufferAttribute(shapes, 1));
  geometry.setAttribute('aSpin', new BufferAttribute(spins, 1));
  geometry.setAttribute('aAlpha', new BufferAttribute(alphas, 1));
  geometry.boundingSphere = new Sphere(new Vector3(), 50);
  const material = new ShaderMaterial({
    uniforms: {
      uAtlas: { value: atlas },
      uTime: { value: 0 },
      uHeight: { value: 700 },
      uTwinkle: { value: twinkle },
      uPremul: { value: blending === AdditiveBlending ? 1 : 0 },
    },
    vertexShader: pointVertex,
    fragmentShader: pointFragment,
    transparent: true,
    depthWrite: false,
    blending,
    toneMapped: false,
  });
  const points = new Points(geometry, material);
  points.frustumCulled = false;
  return { points, positions, colors, sizes, shapes, spins, alphas, material, count };
}

export function createExperience(canvas, options) {
  const mobile = prefersMobile();
  const listeners = [];
  const timeouts = [];
  let disposed = false;
  let raf = 0;
  let announced = false;

  let renderer;
  try {
    renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: !mobile,
      powerPreference: mobile ? 'low-power' : 'high-performance',
      failIfMajorPerformanceCaveat: false,
    });
  } catch (error) {
    options.onFallback?.();
    options.onReady?.();
    return { setTheme() {}, setPhase() {}, setReduced() {}, celebrate() {}, poke() {}, dispose() {} };
  }

  const scene = new Scene();
  const camera = new PerspectiveCamera(32, 1, 0.1, 50);
  camera.position.set(0, 0.4, 6.2);

  const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.3 : 1.6);
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = SRGBColorSpace;

  const root = new Group();
  scene.add(root);

  const hemi = new HemisphereLight(0xffc56d, 0x1a1030, 0.72);
  const ambient = new AmbientLight(0xfff1dc, 0.28);
  const key = new PointLight(0xffb15a, 6.5, 9, 2);
  key.position.set(0, 0.7, 0.45);
  scene.add(hemi, ambient, key);

  const diyas = [createDiya(), createDiya(), createDiya()];
  diyas[1].scale.setScalar(0.62);
  diyas[1].position.set(-1.05, -0.2, 0.2);
  diyas[1].rotation.y = 0.4;
  diyas[2].scale.setScalar(0.55);
  diyas[2].position.set(1.08, -0.14, 0.12);
  diyas[2].rotation.y = -0.35;
  diyas.forEach((diya, index) => {
    diya.visible = index === 0;
    root.add(diya);
  });

  const atlas = makeAtlas();
  const flameMat = new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new Color('#ff8a2a') },
      uMotion: { value: 1 },
    },
    vertexShader: flameVertex,
    fragmentShader: flameFragment,
    transparent: true,
    depthWrite: false,
    side: DoubleSide,
    blending: AdditiveBlending,
    toneMapped: false,
  });
  const flames = diyas.map((diya) => {
    const flame = new Mesh(new PlaneGeometry(0.42, 0.78), flameMat);
    flame.position.set(0, 0.62, 0);
    flame.renderOrder = 3;
    diya.add(flame);
    return flame;
  });

  const glowTex = makeRadialTexture();
  const floor = new Mesh(
    new CircleGeometry(1.35, 32),
    new MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: AdditiveBlending, toneMapped: false }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.28;
  root.add(floor);

  const glowCount = mobile ? 240 : 620;
  const motifCount = mobile ? 70 : 160;
  const starCount = mobile ? 70 : 160;
  const smokeCount = mobile ? 16 : 32;
  const fwCapacity = mobile ? 200 : 460;

  const glow = makePointPool(glowCount, atlas);
  const motif = makePointPool(motifCount, atlas, { blending: NormalBlending });
  const stars = makePointPool(starCount, atlas, { twinkle: 1 });
  const smoke = makePointPool(smokeCount, atlas, { blending: NormalBlending });
  const fireworks = makePointPool(fwCapacity, atlas);
  scene.add(glow.points, motif.points, stars.points, smoke.points, fireworks.points);

  const starSeeds = new Float32Array(starCount);
  for (let i = 0; i < starCount; i += 1) {
    starSeeds[i] = Math.random() * Math.PI * 2;
    stars.positions[i * 3] = (Math.random() - 0.5) * 18;
    stars.positions[i * 3 + 1] = Math.random() * 9 - 1.5;
    stars.positions[i * 3 + 2] = -2.5 - Math.random() * 8;
    stars.sizes[i] = 1.6 + Math.random() * 2.4;
    stars.shapes[i] = 0;
    stars.spins[i] = starSeeds[i];
    stars.alphas[i] = 0.35 + Math.random() * 0.65;
    const c = new Color('#fff4d2');
    stars.colors[i * 3] = c.r;
    stars.colors[i * 3 + 1] = c.g;
    stars.colors[i * 3 + 2] = c.b;
  }
  stars.points.geometry.attributes.position.needsUpdate = true;
  stars.points.geometry.attributes.aSize.needsUpdate = true;
  stars.points.geometry.attributes.aShape.needsUpdate = true;
  stars.points.geometry.attributes.aSpin.needsUpdate = true;
  stars.points.geometry.attributes.aAlpha.needsUpdate = true;
  stars.points.geometry.attributes.aColor.needsUpdate = true;

  const smokeLife = new Float32Array(smokeCount);
  const glowLife = new Float32Array(glowCount);
  const glowVel = new Float32Array(glowCount * 3);
  const motifLife = new Float32Array(motifCount);
  const motifVel = new Float32Array(motifCount * 3);
  const fwLife = new Float32Array(fwCapacity);
  const fwVel = new Float32Array(fwCapacity * 3);
  const fwAge = new Float32Array(fwCapacity);
  const fwMax = new Float32Array(fwCapacity);

  const lanterns = [0, 1, 2, 3].map((index) => {
    const lantern = createLantern();
    const spots = [
      [-2.35, 0.9, -1.4],
      [2.45, 1.15, -1.6],
      [-1.45, 1.85, -2.1],
      [1.7, 1.7, -2.2],
    ];
    lantern.position.set(spots[index][0], spots[index][1], spots[index][2]);
    lantern.userData.baseY = spots[index][1];
    lantern.userData.phase = index * 1.3;
    lantern.visible = index < 3;
    scene.add(lantern);
    return lantern;
  });

  const rayMat = new ShaderMaterial({
    uniforms: {
      uOpacity: { value: 0 },
      uColor: { value: new Color('#ffd78a') },
    },
    vertexShader: flameVertex,
    fragmentShader: /* glsl */ `
      precision highp float;
      varying vec2 vUv;
      uniform float uOpacity;
      uniform vec3 uColor;
      void main() {
        float x = smoothstep(0.5, 0.0, abs(vUv.x - 0.5));
        float y = smoothstep(0.0, 0.18, vUv.y) * smoothstep(1.0, 0.15, vUv.y);
        float a = x * y * uOpacity;
        if (a < 0.02) discard;
        gl_FragColor = vec4(uColor, a);
      }
    `,
    transparent: true,
    depthWrite: false,
    side: DoubleSide,
    blending: AdditiveBlending,
    toneMapped: false,
  });
  const rays = new Group();
  for (let i = 0; i < 7; i += 1) {
    const ray = new Mesh(new PlaneGeometry(0.28, 2.6), rayMat);
    ray.position.y = 1.1;
    ray.rotation.z = (i / 7) * Math.PI;
    rays.add(ray);
  }
  rays.position.set(0, 0.2, -0.6);
  scene.add(rays);

  const geoMat = new LineBasicMaterial({ color: 0xe8c872, transparent: true, opacity: 0 });
  const solids = [1.3, 0.72].map((radius, index) => {
    const lines = new LineSegments(new EdgesGeometry(new IcosahedronGeometry(radius, 0)), geoMat);
    lines.position.set(index === 0 ? -1.8 : 2, 0.6, -1.6);
    lines.visible = false;
    scene.add(lines);
    return lines;
  });

  let theme = options.theme;
  let phase = options.phase || 'landing';
  let reduced = Boolean(options.reduced);
  let activeId = theme?.id || 'landing';
  let motifKind = theme?.motif || 'spark';
  let energy = theme?.energy || 1;
  let wide = window.innerWidth >= 960;
  let pose = { ...posesFor(wide)[phase] || posesFor(wide).landing };
  const poseTarget = { ...pose };
  const pointer = { x: 0, y: 0, weight: 0 };
  const colorA = new Color(theme?.light || '#ffc56d');
  const colorB = new Color(theme?.fill || '#6d28d9');
  const scratch = new Color();
  let clock = performance.now();
  let celebrateUntil = 0;
  let lastCelebrate = 0;
  const aim = new Quaternion();
  const parentSpin = new Quaternion();
  let fwCursor = 0;
  let palette = theme?.particle || ['#f2c56a', '#ffb15a', '#e4c8ff', '#fff4d4'];

  function paint(pool, index, hex, alpha, size, shape) {
    scratch.set(hex);
    pool.colors[index * 3] = scratch.r;
    pool.colors[index * 3 + 1] = scratch.g;
    pool.colors[index * 3 + 2] = scratch.b;
    pool.alphas[index] = alpha;
    pool.sizes[index] = size;
    pool.shapes[index] = shape;
  }

  function resetGlow(i, scatter) {
    const spread = 1.4 + energy * 1.6;
    glow.positions[i * 3] = (Math.random() - 0.5) * spread;
    glow.positions[i * 3 + 1] = scatter ? Math.random() * 3.2 - 0.4 : 0.15 + Math.random() * 0.2;
    glow.positions[i * 3 + 2] = (Math.random() - 0.5) * spread * 0.7;
    glowVel[i * 3] = (Math.random() - 0.5) * 0.15 * energy;
    glowVel[i * 3 + 1] = (0.15 + Math.random() * 0.45) * energy;
    glowVel[i * 3 + 2] = (Math.random() - 0.5) * 0.12;
    glowLife[i] = 1.6 + Math.random() * 3.2;
    glow.spins[i] = Math.random() * Math.PI;
    paint(glow, i, palette[i % palette.length], 0.35 + Math.random() * 0.65, 5 + Math.random() * 10, 0);
  }

  function resetSmoke(i, scatter) {
    smoke.positions[i * 3] = (Math.random() - 0.5) * 0.18;
    smoke.positions[i * 3 + 1] = scatter ? 0.4 + Math.random() * 1.4 : 0.45;
    smoke.positions[i * 3 + 2] = (Math.random() - 0.5) * 0.18;
    smokeLife[i] = 1.2 + Math.random() * 2.4;
    smoke.spins[i] = Math.random() * 6;
    paint(smoke, i, '#d9cbb8', 0.08 + Math.random() * 0.08, 18 + Math.random() * 16, 0);
  }

  function shapeForMotif() {
    if (motifKind === 'confetti') return 1;
    if (motifKind === 'petal') return 2;
    if (motifKind === 'heart') return 3;
    return 0;
  }

  function resetMotif(i, scatter) {
    const shape = shapeForMotif();
    const falling = motifKind === 'confetti' || motifKind === 'petal';
    motif.positions[i * 3] = (Math.random() - 0.5) * (wide ? 8 : 5.2);
    motif.positions[i * 3 + 1] = scatter
      ? Math.random() * 4 - 0.5
      : falling
        ? 2.6 + Math.random()
        : -1.2 - Math.random();
    motif.positions[i * 3 + 2] = (Math.random() - 0.5) * 2.4;
    motifVel[i * 3] = (Math.random() - 0.5) * 0.25;
    motifVel[i * 3 + 1] = falling ? -(0.25 + Math.random() * 0.45) * Math.max(0.6, energy) : 0.18 + Math.random() * 0.28;
    motifVel[i * 3 + 2] = (Math.random() - 0.5) * 0.08;
    motifLife[i] = 3 + Math.random() * 4;
    motif.spins[i] = Math.random() * Math.PI * 2;
    const size = motifKind === 'petal' ? 16 + Math.random() * 10 : motifKind === 'heart' ? 12 + Math.random() * 8 : 9 + Math.random() * 8;
    const alpha = motifKind === 'spark' ? 0 : 0.75 + Math.random() * 0.25;
    paint(motif, i, palette[i % palette.length], alpha, size, shape);
  }

  function markPool(pool) {
    pool.points.geometry.attributes.position.needsUpdate = true;
    pool.points.geometry.attributes.aColor.needsUpdate = true;
    pool.points.geometry.attributes.aAlpha.needsUpdate = true;
    pool.points.geometry.attributes.aSize.needsUpdate = true;
    pool.points.geometry.attributes.aShape.needsUpdate = true;
    pool.points.geometry.attributes.aSpin.needsUpdate = true;
  }

  function applyTheme(next, immediate) {
    if (!next) return;
    theme = next;
    palette = next.particle || palette;
    motifKind = next.motif || 'spark';
    energy = next.energy ?? 1;
    const motifBlend = motifKind === 'heart' ? AdditiveBlending : NormalBlending;
    if (motif.material.blending !== motifBlend) {
      motif.material.blending = motifBlend;
      motif.material.uniforms.uPremul.value = motifKind === 'heart' ? 1 : 0;
      motif.material.needsUpdate = true;
    }
    lanterns.forEach((lantern, index) => {
      lantern.visible = index < (next.lanterns || 0);
    });
    diyas.forEach((diya, index) => {
      diya.visible = index < (next.diyas || 1);
    });
    solids.forEach((solid) => {
      solid.visible = Boolean(next.geometry);
    });
    if (immediate) {
      colorA.set(next.light);
      colorB.set(next.fill);
      key.color.copy(colorA);
      hemi.color.copy(colorA);
      hemi.groundColor.copy(colorB);
      flameMat.uniforms.uColor.value.set(next.light);
      rayMat.uniforms.uColor.value.set(next.light);
      geoMat.color.set(next.light);
      rayMat.uniforms.uOpacity.value = next.rays || 0;
      geoMat.opacity = next.geometry ? 0.45 : 0;
    }
    for (let i = 0; i < glowCount; i += 1) {
      paint(glow, i, palette[i % palette.length], glow.alphas[i] || 0.5, glow.sizes[i] || 8, 0);
    }
    for (let i = 0; i < motifCount; i += 1) resetMotif(i, true);
    markPool(glow);
    markPool(motif);
  }

  for (let i = 0; i < smokeCount; i += 1) resetSmoke(i, true);
  for (let i = 0; i < glowCount; i += 1) resetGlow(i, true);
  for (let i = 0; i < motifCount; i += 1) resetMotif(i, true);

  applyTheme(theme, true);

  function listen(target, type, handler, extra) {
    target.addEventListener(type, handler, extra);
    listeners.push(() => target.removeEventListener(type, handler, extra));
  }

  function resize() {
    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;
    wide = width >= 960;
    camera.aspect = width / Math.max(1, height);
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    const heightUniform = Math.min(height, 1100);
    glow.material.uniforms.uHeight.value = heightUniform;
    motif.material.uniforms.uHeight.value = heightUniform;
    stars.material.uniforms.uHeight.value = heightUniform;
    smoke.material.uniforms.uHeight.value = heightUniform;
    fireworks.material.uniforms.uHeight.value = heightUniform;
    setPhase(phase);
  }

  function onPointer(event) {
    if (event.pointerType === 'touch') {
      pointer.weight = Math.min(1, pointer.weight + 0.08);
    } else {
      pointer.weight = 1;
    }
    const w = window.innerWidth || 1;
    const h = window.innerHeight || 1;
    pointer.x = (event.clientX / w) * 2 - 1;
    pointer.y = (event.clientY / h) * 2 - 1;
  }



  function spawnBurst(origin, styleName, scale = 1) {
    const style = FW[styleName] || FW.elegant;
    const budget = Math.round(style.count * (mobile ? 0.55 : 1) * scale);
    for (let ring = 0; ring < style.rings; ring += 1) {
      const n = ring === 0 ? budget : Math.round(budget * 0.55);
      for (let i = 0; i < n; i += 1) {
        const slot = fwCursor % fwCapacity;
        fwCursor += 1;
        const angle = (i / n) * Math.PI * 2 + Math.random() * 0.15;
        const speed = style.speed * (0.55 + Math.random() * 0.7) * (ring === 0 ? 1 : 0.62);
        fwVel[slot * 3] = Math.cos(angle) * speed;
        fwVel[slot * 3 + 1] = Math.sin(angle) * speed * 0.72 + 0.35;
        fwVel[slot * 3 + 2] = (Math.random() - 0.5) * speed * 0.55;
        fireworks.positions[slot * 3] = origin.x;
        fireworks.positions[slot * 3 + 1] = origin.y;
        fireworks.positions[slot * 3 + 2] = origin.z;
        fwLife[slot] = style.life * (0.75 + Math.random() * 0.4);
        fwMax[slot] = fwLife[slot];
        fwAge[slot] = 0;
        const shape = motifKind === 'heart' && Math.random() > 0.55 ? 3 : 0;
        paint(
          fireworks,
          slot,
          palette[Math.floor(Math.random() * palette.length)],
          1,
          (shape === 3 ? 14 : 7) + Math.random() * 6,
          shape,
        );
        fireworks.spins[slot] = Math.random() * Math.PI;
      }
    }
  }

  function previewBurst() {
    if (reduced) return;
    spawnBurst(new Vector3(pose.x, pose.y + 0.8, 0), theme.firework || 'elegant', 0.45);
  }

  function celebrate() {
    const stamp = performance.now();
    if (stamp - lastCelebrate < 500) return;
    lastCelebrate = stamp;
    if (reduced) {
      spawnBurst(new Vector3(pose.x, pose.y + 1.1, 0), 'soft', 0.5);
      return;
    }
    const style = theme.firework || 'elegant';
    const gaps = mobile ? [0, 420, 980] : [0, 260, 640, 1080, 1600];
    gaps.forEach((delay, index) => {
      const id = window.setTimeout(() => {
        if (disposed) return;
        const origin = new Vector3(
          pose.x + (Math.random() - 0.5) * (wide ? 3.2 : 1.6),
          pose.y + 0.8 + Math.random() * 1.3,
          (Math.random() - 0.5) * 0.6,
        );
        spawnBurst(origin, index % 2 && style === 'powerful' ? 'powerful' : style, 1);
      }, delay);
      timeouts.push(id);
    });
    celebrateUntil = performance.now() + (mobile ? 2800 : 4200);
  }

  function setTheme(next) {
    if (!next || next.id === activeId) return;
    activeId = next.id;
    applyTheme(next, false);
    previewBurst();
  }

  function setPhase(next) {
    phase = next || 'landing';
    const table = posesFor(wide);
    const chosen = table[phase] || table.landing;
    Object.assign(poseTarget, chosen);
  }

  function setReduced(next) {
    reduced = Boolean(next);
  }

  function poke() {
    key.intensity = Math.min(key.intensity + 3.5, 14);
    if (!reduced) spawnBurst(new Vector3(pose.x, pose.y + 0.7, 0.2), 'soft', 0.35);
  }

  function damp(current, target, rate) {
    return current + (target - current) * Math.min(1, rate);
  }

  function tick(now) {
    if (disposed) return;
    raf = requestAnimationFrame(tick);
    const dt = Math.min(0.033, (now - clock) / 1000 || 0.016);
    clock = now;
    const motion = reduced ? 0.04 : 1;
    const t = now / 1000;

    flameMat.uniforms.uTime.value = t;
    flameMat.uniforms.uMotion.value = reduced ? 0.15 : 1;
    glow.material.uniforms.uTime.value = t;
    stars.material.uniforms.uTime.value = t;
    fireworks.material.uniforms.uTime.value = t;
    motif.material.uniforms.uTime.value = t;

    if (theme) {
      scratch.set(theme.light);
      colorA.lerp(scratch, 0.06);
      scratch.set(theme.fill);
      colorB.lerp(scratch, 0.06);
      key.color.copy(colorA);
      hemi.color.copy(colorA);
      hemi.groundColor.copy(colorB);
      flameMat.uniforms.uColor.value.copy(colorA);
      rayMat.uniforms.uColor.value.copy(colorA);
      geoMat.color.copy(colorA);
      const rayTarget = theme.rays || 0;
      rayMat.uniforms.uOpacity.value = damp(rayMat.uniforms.uOpacity.value, rayTarget, 0.08);
      const geoTarget = theme.geometry ? 0.42 : 0;
      geoMat.opacity = damp(geoMat.opacity, geoTarget, 0.08);
      lanterns.forEach((lantern) => {
        lantern.userData.body.material.emissive.copy(colorA);
      });
    }

    key.intensity = damp(key.intensity, (5.4 + Math.sin(t * 17) * 0.45 + Math.sin(t * 29) * 0.25) * (theme?.glow || 1), 0.15);

    pose.x = damp(pose.x, poseTarget.x, 0.045);
    pose.y = damp(pose.y, poseTarget.y, 0.045);
    pose.z = damp(pose.z, poseTarget.z, 0.045);
    pose.scale = damp(pose.scale, poseTarget.scale, 0.045);
    pose.camZ = damp(pose.camZ, poseTarget.camZ, 0.04);
    pose.lookY = damp(pose.lookY, poseTarget.lookY, 0.04);
    root.position.set(pose.x, pose.y, pose.z);
    root.scale.setScalar(pose.scale);

    pointer.weight = damp(pointer.weight, 0, reduced ? 0.2 : 0.01);
    const auto = reduced ? 0 : Math.sin(t * 0.35) * 0.12;
    const rotY = auto * (1 - pointer.weight) + pointer.x * 0.28 * pointer.weight;
    const rotX = pointer.y * -0.08 * pointer.weight;
    root.rotation.y = damp(root.rotation.y, rotY, 0.06);
    root.rotation.x = damp(root.rotation.x, rotX, 0.06);

    camera.position.z = pose.camZ;
    camera.position.x = damp(camera.position.x, wide && phase === 'form' ? -0.35 : 0, 0.04);
    camera.lookAt(0, pose.lookY, 0);

    flames.forEach((flame) => {
      flame.parent.getWorldQuaternion(parentSpin);
      aim.copy(parentSpin).invert().multiply(camera.quaternion);
      flame.quaternion.copy(aim);
    });

    if (!reduced) {
      const boost = now < celebrateUntil ? 1.7 : 1;
      for (let i = 0; i < glowCount; i += 1) {
        glowLife[i] -= dt;
        if (glowLife[i] <= 0) resetGlow(i, false);
        glow.positions[i * 3] += glowVel[i * 3] * dt * boost;
        glow.positions[i * 3 + 1] += glowVel[i * 3 + 1] * dt * boost;
        glow.positions[i * 3 + 2] += glowVel[i * 3 + 2] * dt;
        glow.positions[i * 3] += Math.sin(t * 1.4 + i) * 0.002 * energy;
        const fade = Math.min(1, glowLife[i]);
        glow.alphas[i] = Math.min(glow.alphas[i], 0.15 + fade * 0.7);
      }
      for (let i = 0; i < motifCount; i += 1) {
        if (motifKind === 'spark') {
          motif.alphas[i] = 0;
          continue;
        }
        motifLife[i] -= dt;
        if (motifLife[i] <= 0) resetMotif(i, false);
        motif.positions[i * 3] += motifVel[i * 3] * dt + Math.sin(t + i) * dt * 0.15;
        motif.positions[i * 3 + 1] += motifVel[i * 3 + 1] * dt * boost;
        motif.positions[i * 3 + 2] += motifVel[i * 3 + 2] * dt;
        motif.spins[i] += dt * (motifKind === 'confetti' ? 2.4 : 0.6);
      }
      for (let i = 0; i < smokeCount; i += 1) {
        smokeLife[i] -= dt;
        if (smokeLife[i] <= 0) resetSmoke(i, false);
        smoke.positions[i * 3] += Math.sin(t * 0.8 + i) * dt * 0.05;
        smoke.positions[i * 3 + 1] += dt * 0.22;
        smoke.alphas[i] = Math.max(0, smokeLife[i] * 0.045);
        smoke.positions[i * 3] += pose.x * 0;
      }
    }

    let gravity = FW[theme?.firework || 'elegant'].gravity;
    for (let i = 0; i < fwCapacity; i += 1) {
      if (fwLife[i] <= 0) {
        fireworks.alphas[i] = 0;
        continue;
      }
      fwLife[i] -= dt;
      fwAge[i] += dt;
      fwVel[i * 3 + 1] -= gravity * dt;
      fireworks.positions[i * 3] += fwVel[i * 3] * dt;
      fireworks.positions[i * 3 + 1] += fwVel[i * 3 + 1] * dt;
      fireworks.positions[i * 3 + 2] += fwVel[i * 3 + 2] * dt;
      fireworks.alphas[i] = Math.max(0, fwLife[i] / fwMax[i]);
      fireworks.spins[i] += dt * 2;
    }

    lanterns.forEach((lantern) => {
      if (!lantern.visible || reduced) return;
      lantern.position.y = lantern.userData.baseY + Math.sin(t * 0.7 + lantern.userData.phase) * 0.12;
      lantern.rotation.y = Math.sin(t * 0.4 + lantern.userData.phase) * 0.2;
      lantern.position.x += 0;
    });
    if (!reduced && (theme?.rays || 0) > 0.05) rays.rotation.z += dt * 0.08;
    if (!reduced && theme?.geometry) {
      solids.forEach((solid, index) => {
        solid.rotation.y += dt * (index ? -0.18 : 0.14);
        solid.rotation.x += dt * 0.05;
      });
    }

    // Keep smoke and sparks attached to the diya's drift.
    smoke.points.position.set(root.position.x, root.position.y + 0.42 * pose.scale, root.position.z);
    glow.points.position.copy(root.position);

    markPool(glow);
    markPool(motif);
    markPool(smoke);
    markPool(fireworks);

    renderer.render(scene, camera);
    if (!announced) {
      announced = true;
      options.onReady?.();
    }
  }

  listen(window, 'resize', resize);
  listen(window, 'pointermove', onPointer, { passive: true });
  listen(document, 'visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = 0;
    } else if (!raf && !disposed) {
      clock = performance.now();
      raf = requestAnimationFrame(tick);
    }
  });

  resize();
  raf = requestAnimationFrame(tick);

  function dispose() {
    disposed = true;
    cancelAnimationFrame(raf);
    timeouts.forEach((id) => window.clearTimeout(id));
    listeners.forEach((off) => off());
    scene.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      const mats = obj.material ? [].concat(obj.material) : [];
      mats.forEach((mat) => {
        if (mat.map) mat.map.dispose();
        mat.dispose?.();
      });
    });
    atlas.dispose();
    glowTex.dispose();
    renderer.dispose();
  }

  return { setTheme, setPhase, setReduced, celebrate, poke, dispose };
}
