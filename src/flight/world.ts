import * as T from "three";
import { MarchingCubes } from "three/addons/objects/MarchingCubes.js";

import { createCourse } from "./course";
import { createCloudFallback } from "./cloudFallback";

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
  surface.isolation = 0;
  const lobes = [
    [-0.5, -0.1, 0.03, 0.29],
    [-0.28, 0.05, -0.02, 0.35],
    [0.015, 0.17, 0.015, 0.4],
    [0.34, 0.045, -0.02, 0.32],
    [0.54, -0.11, 0.045, 0.245],
    [-0.15, -0.14, 0.16, 0.29],
    [0.18, -0.13, 0.12, 0.3],
  ];
  // A smooth union preserves the round crowns and avoids overlapping transparent shells.
  const cells = surface.resolution;
  for (let z = 0; z < cells; z++)
    for (let y = 0; y < cells; y++)
      for (let x = 0; x < cells; x++) {
        const px = (x * 2) / cells - 1,
          py = (y * 2) / cells - 1,
          pz = (z * 2) / cells - 1;
        let field = -5;
        for (const [cx, cy, cz, r] of lobes) {
          const sphere =
            r -
            Math.hypot(
              px - cx,
              py - cy - 0.075 * Math.sin(variant * 1.8 + cx * 6),
              pz - cz,
            );
          const blend = Math.max(0.105 - Math.abs(field - sphere), 0);
          field = Math.max(field, sphere) + (blend * blend) / 0.42;
        }
        surface.field[x + y * cells + z * cells * cells] = field;
      }
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
/** Scroll drives distance along a continuous flight path. Camera, contrail and cloud banks share its coordinates. */
export function flightWorld(
  canvas: HTMLCanvasElement,
  fallbackCanvas: HTMLCanvasElement,
  chapters: HTMLElement[],
  stops: number,
) {
  const route = createCourse(stops),
    camera = route.camera;
  let gl: T.WebGLRenderer | null = null;
  try {
    const context = canvas.getContext("webgl2", {
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
    if (context)
      gl = new T.WebGLRenderer({
        canvas,
        context,
        alpha: true,
        antialias: true,
      });
  } catch {
    /* The 2D renderer can use the same camera even when GPU initialization fails. */
  }
  gl?.setClearColor(0, 0);
  gl?.setPixelRatio(Math.min(devicePixelRatio, 1.55));
  const scene = new T.Scene(),
    plane = aircraft(),
    banks: T.Mesh[] = [];
  let fallback: ReturnType<typeof createCloudFallback> | undefined;
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
  const length = route.length;
  let seed = 731;
  const rand = () =>
    (seed = (Math.imul(1664525, seed) + 1013904223) >>> 0) / 4294967296;
  for (let i = 0; i < Math.ceil((length + 60) / 2.9); i++) {
    const d = i * 2.9 - 6,
      center = route.at(d, new T.Vector3()),
      m = new T.Mesh(clouds[i % 3], cloudMat);
    const side = i % 2 ? 1 : -1,
      scale = 1.8 + rand() * 4.4;
    const near = i % 4 < 2;
    const lateral = near ? 3.7 + rand() * 4.5 : 9 + rand() * 10;
    const vertical = near
      ? (i % 4 === 0 ? -1 : 1) * (1.5 + rand() * 2.0)
      : (rand() - 0.48) * 12;
    m.position.set(center.x + side * lateral, center.y + vertical, center.z);
    banks.push(m);
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
  const nose = new T.Vector3(),
    nextHeading = new T.Vector3(),
    heading = new T.Vector3(),
    cross = new T.Vector3();
  function draw(progress: number, time: number, reduced: boolean) {
    const w = canvas.clientWidth,
      h = canvas.clientHeight;
    if (!w || !h) return;
    if (w !== oldW || h !== oldH) {
      gl?.setSize(w, h, false);
      route.resize(w, h);
      oldW = w;
      oldH = h;
    }
    const d = progress * route.step,
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
    cloudMat.color.set(0xa1a9dc).lerp(horizon, 0.4);
    skyLight.groundColor.set(0x374bb5).lerp(zenith, 0.25);
    route.placeCamera(camera, progress);
    route.projectChapters(chapters, progress, reduced);
    // The pilot looks farther around the bend than the camera. Banking follows
    // the change in heading, so the fuselage leads the camera into and out of each turn.
    const lead = 8.1;
    route.at(d + lead, plane.position);
    route.at(d + lead + 5.8, nose);
    route.at(d + lead + 12, nextHeading);
    heading.subVectors(nose, plane.position).normalize();
    nextHeading.sub(nose).normalize();
    const yaw = Math.atan2(-heading.x, -heading.z);
    const bank = reduced
      ? 0
      : T.MathUtils.clamp(
          -heading.x * 0.76 - cross.crossVectors(heading, nextHeading).y * 0.95,
          -0.68,
          0.68,
        );
    plane.rotation.order = "YXZ";
    plane.rotation.set(Math.asin(heading.y), yaw, bank);
    plane.position.y += reduced ? 0 : Math.sin(time * 0.00069) * 0.047;
    plane.scale.setScalar(w / h < 0.86 ? 0.38 : 0.48);
    for (let j = 0; j < n; j++) {
      const t = j / (n - 1);
      route.at(d + lead - 0.84 - t * 17, v);
      v.y -= 0.015 + t * 0.41;
      const half = 0.013 + 0.34 * t * t;
      buffer.set([v.x - half, v.y, v.z, v.x + half, v.y, v.z], j * 6);
    }
    trailGeo.attributes.position.needsUpdate = true;
    if (gl) gl.render(scene, camera);
    else {
      fallback ??= createCloudFallback(fallbackCanvas);
      fallback.draw(camera, banks, plane, buffer, w, h);
    }
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
    gl?.dispose();
  }
  function loseContext() {
    gl?.dispose();
    gl = null;
  }
  return { draw, dispose, loseContext, hardware: !!gl };
}
