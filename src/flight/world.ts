import * as T from "three";
import { MarchingCubes } from "three/addons/objects/MarchingCubes.js";

type Stop = [number, number, number];
const paint = [
  "#102bca",
  "#3843be",
  "#5c45a0",
  "#77568e",
  "#aa799f",
  "#be8197",
  "#c38c78",
  "#9a7998",
  "#364f83",
  "#485186",
  "#252b68",
  "#173e8e",
];
const haze = [
  "#d9d6ff",
  "#dccff3",
  "#f0c7cc",
  "#f4b7a8",
  "#e2c7e9",
  "#efd8dd",
  "#dce5ff",
  "#f4d8bb",
  "#cadffa",
  "#e4bdc8",
  "#c4bef0",
  "#d0d4ff",
];

/** Smoothly blend the stops of a curved fuselage or aerofoil and close both ends. */
function loft(stations: Stop[], wing = false) {
  const v: number[] = [],
    indices: number[] = [];
  const rings = 18,
    sides = 24;
  const curve = new T.CatmullRomCurve3(
    stations.map((p) => new T.Vector3(...p)),
    false,
    "catmullrom",
    0.38,
  );
  for (let r = 0; r <= rings; r++) {
    const point = curve.getPoint(r / rings);
    for (let j = 0; j < sides; j++) {
      const a = (2 * Math.PI * j) / sides,
        c = Math.cos(a),
        s = Math.sin(a);
      if (wing)
        v.push(
          point.x,
          Math.max(0.001, point.y * 0.105) * s + 0.065 * Math.abs(point.x),
          point.z + point.y * c,
        );
      else v.push(point.y * c, point.z * s, point.x);
    }
  }
  for (let r = 0; r < rings; r++)
    for (let j = 0; j < sides; j++) {
      const a = r * sides + j,
        b = r * sides + ((j + 1) % sides),
        c = a + sides,
        d = b + sides;
      indices.push(a, b, c, b, d, c);
    }
  const geo = new T.BufferGeometry();
  geo.setAttribute("position", new T.Float32BufferAttribute(v, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}
/** Model a glider with swept wings, a slim cockpit and a single raised tail fin. */
function aircraft() {
  const glider = new T.Group(),
    white = new T.MeshStandardMaterial({
      color: 0xf5f3ff,
      metalness: 0.19,
      roughness: 0.32,
      side: T.DoubleSide,
    });
  function piece(geometry: T.BufferGeometry) {
    const m = new T.Mesh(geometry, white);
    glider.add(m);
    return m;
  }
  piece(
    loft([
      [-1.75, 0.012, 0.012],
      [-1.23, 0.17, 0.16],
      [-0.66, 0.27, 0.25],
      [0.03, 0.31, 0.33],
      [0.62, 0.23, 0.2],
      [1.4, 0.09, 0.085],
      [1.83, 0.008, 0.01],
    ]),
  );
  piece(
    loft(
      [
        [-2.96, 0.005, 0.7],
        [-2.65, 0.09, 0.58],
        [-1.47, 0.3, 0.32],
        [-0.52, 0.49, 0.1],
        [0, 0.51, 0.08],
        [0.52, 0.49, 0.1],
        [1.47, 0.3, 0.32],
        [2.65, 0.09, 0.58],
        [2.96, 0.005, 0.7],
      ],
      true,
    ),
  );
  const tail = piece(
    loft(
      [
        [-1.05, 0.006, 0.27],
        [-0.48, 0.18, 0.04],
        [0, 0.24, 0],
        [0.48, 0.18, 0.04],
        [1.05, 0.006, 0.27],
      ],
      true,
    ),
  );
  tail.position.set(0, 0.14, 1.26);
  const fin = piece(
    loft(
      [
        [0, 0.36, 0],
        [0.23, 0.31, 0.05],
        [0.51, 0.16, 0.18],
        [0.81, 0.004, 0.36],
      ],
      true,
    ),
  );
  fin.rotation.z = Math.PI / 2;
  fin.position.set(0, 0.075, 1.07);
  const canopy = new T.Mesh(
    new T.SphereGeometry(1, 24, 14),
    new T.MeshStandardMaterial({
      color: 0x6575be,
      metalness: 0.55,
      roughness: 0.24,
    }),
  );
  canopy.scale.set(0.16, 0.1, 0.43);
  canopy.position.set(0, 0.206, -0.56);
  glider.add(canopy);
  return glider;
}
/** Fuse overlapping volumes into single cloud meshes with continuous, soft normals. */
function cloudShape(variant: number) {
  const material = new T.MeshBasicMaterial(),
    surface = new MarchingCubes(27, material, false, false, 6500);
  surface.isolation = 44;
  const lobes = [
    [-0.27, -0.04, 0.01, 0.62],
    [-0.1, 0.066, 0, 0.68],
    [0.065, 0.135, 0, 0.98],
    [0.25, -0.01, 0, 0.65],
    [-0.06, -0.09, 0.075, 0.61],
    [0.12, -0.06, -0.09, 0.53],
  ];
  for (const [x, y, z, power] of lobes)
    surface.addBall(
      0.5 + x,
      0.49 + y + Math.sin(x * 14 + variant) * 0.027,
      0.5 + z,
      power,
      10,
    );
  surface.update();
  const geometry = new T.BufferGeometry();
  for (const key of ["position", "normal"]) {
    const a = surface.geometry.getAttribute(key);
    geometry.setAttribute(
      key,
      new T.Float32BufferAttribute(a.array.slice(0, surface.count * 3), 3),
    );
  }
  surface.geometry.dispose();
  material.dispose();
  return geometry;
}
function pathPoint(z: number, out = new T.Vector3()) {
  return out.set(
    6.8 * Math.sin(z * 0.026) + 3.1 * Math.sin(z * 0.058),
    0.73 * Math.sin(z * 0.036),
    -z,
  );
}

/** Scroll drives distance along a continuous flight path. Camera, contrail and cloud banks share its coordinates. */
export function flightWorld(canvas: HTMLCanvasElement, stops: number) {
  const gl = new T.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  gl.setClearColor(0, 0);
  gl.setPixelRatio(Math.min(devicePixelRatio, 1.55));
  const scene = new T.Scene(),
    camera = new T.PerspectiveCamera(41, 1, 0.13, 88),
    plane = aircraft();
  const fog = new T.FogExp2(0xa7acf0, 0.041);
  scene.fog = fog;
  const skyLight = new T.HemisphereLight(0xe1dcff, 0x374bb5, 1.6);
  scene.add(skyLight, plane);
  plane.scale.setScalar(0.48);
  const sun = new T.DirectionalLight(0xfff0f0, 2.05);
  sun.position.set(-5, 8, -1);
  scene.add(sun);
  const clouds = [0, 1, 2].map(cloudShape);
  const cloudMat = new T.MeshStandardMaterial({
    color: 0xa1a9dc,
    roughness: 1,
  });
  // Fade the far clouds into the local sky at their actual screen height.
  // A single fog color would paint opaque silhouettes above the horizon.
  cloudMat.transparent = true;
  cloudMat.depthWrite = false;
  cloudMat.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <fog_fragment>",
      `
      #ifdef USE_FOG
        gl_FragColor.a *= .90 * (1.0-smoothstep(9.0,54.0,vFogDepth));
      #endif
    `,
    );
  };
  const course = (stops - 1) * 26;
  let seed = 731;
  const rand = () =>
    (seed = (Math.imul(1664525, seed) + 1013904223) >>> 0) / 4294967296;
  for (let i = 0; i < Math.ceil((course + 110) / 5.6); i++) {
    const d = i * 5.6 - 8,
      center = pathPoint(d),
      m = new T.Mesh(clouds[i % 3], cloudMat);
    const side = i % 2 ? 1 : -1,
      scale = 3.4 + rand() * 4.6;
    m.position.set(
      center.x + side * (6.9 + rand() * 10.2),
      center.y + (rand() - 0.57) * 12,
      -d,
    );
    m.scale.set(
      scale * (1 + rand() * 0.52),
      scale * (0.65 + rand() * 0.3),
      scale,
    );
    m.rotation.y = rand() * Math.PI;
    scene.add(m);
  }
  const n = 66,
    trailGeo = new T.BufferGeometry(),
    buffer = new Float32Array(n * 6),
    indices: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    const a = i * 2;
    indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  trailGeo.setAttribute(
    "position",
    new T.BufferAttribute(buffer, 3).setUsage(T.DynamicDrawUsage),
  );
  trailGeo.setIndex(indices);
  const trailMat = new T.MeshBasicMaterial({
    color: 0xf4eafe,
    transparent: true,
    opacity: 0.58,
    depthWrite: false,
    side: T.DoubleSide,
  });
  const trail = new T.Mesh(trailGeo, trailMat);
  trail.frustumCulled = false;
  scene.add(trail);
  const from = new T.Color(),
    to = new T.Color(),
    horizon = new T.Color(),
    zenith = new T.Color(),
    v = new T.Vector3(),
    target = new T.Vector3();
  let oldW = 0,
    oldH = 0;
  function draw(progress: number, time: number, reduced: boolean) {
    const w = canvas.clientWidth,
      h = canvas.clientHeight;
    if (!w || !h) return;
    if (w !== oldW || h !== oldH) {
      gl.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      oldW = w;
      oldH = h;
    }
    const d = progress * 26,
      base = Math.floor(progress),
      fraction = progress - base,
      next = Math.min(base + 1, stops - 1);
    horizon
      .copy(from.set(haze[base % haze.length]))
      .lerp(to.set(haze[next % haze.length]), fraction);
    zenith
      .copy(from.set(paint[base % paint.length]))
      .lerp(to.set(paint[next % paint.length]), fraction);
    canvas.parentElement!.style.setProperty(
      "--zenith",
      "#" + zenith.getHexString(),
    );
    canvas.parentElement!.style.setProperty(
      "--haze",
      "#" + horizon.getHexString(),
    );
    fog.color.copy(horizon);
    pathPoint(d, plane.position);
    const drift = reduced ? 0 : Math.sin(time * 0.00055) * 0.032;
    plane.position.y += drift;
    plane.rotation.set(
      -0.04 * Math.cos(d * 0.036),
      -Math.atan(0.177 * Math.cos(d * 0.026) + 0.18 * Math.cos(d * 0.058)),
      reduced ? 0 : 0.27 * Math.sin(d * 0.045) + drift,
    );
    pathPoint(d - 9.8, camera.position);
    camera.position.y += 1.55;
    camera.position.x += 0.22 * Math.sin(d * 0.053);
    pathPoint(d + 0.5, target);
    target.y += w / h < 0.83 ? -0.95 : 0.02;
    if (w / h >= 0.83) {
      target.x -=
        1.2 *
        Math.cos(progress * Math.PI) *
        Math.min(1, progress, stops - 1 - progress);
    }
    camera.lookAt(target);
    camera.rotateZ(reduced ? 0 : 0.038 * Math.sin(d * 0.044));
    if (w / h < 0.83) {
      camera.fov = 55;
      camera.updateProjectionMatrix();
    } else if (camera.fov !== 41) {
      camera.fov = 41;
      camera.updateProjectionMatrix();
    }
    for (let j = 0; j < n; j++) {
      const t = j / (n - 1);
      pathPoint(d - 0.83 - t * 21, v);
      v.y -= 0.015 + t * 0.41;
      const half = 0.013 + 0.34 * t * t;
      buffer.set([v.x - half, v.y, v.z, v.x + half, v.y, v.z], j * 6);
    }
    trailGeo.attributes.position.needsUpdate = true;
    gl.render(scene, camera);
  }
  function dispose() {
    const geometry = new Set<T.BufferGeometry>(),
      materials = new Set<T.Material>();
    scene.traverse((obj) => {
      if (obj instanceof T.Mesh) {
        geometry.add(obj.geometry);
        for (const m of Array.isArray(obj.material)
          ? obj.material
          : [obj.material])
          materials.add(m);
      }
    });
    geometry.forEach((g) => g.dispose());
    materials.forEach((m) => m.dispose());
    gl.dispose();
  }
  return { draw, dispose };
}
