import * as T from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

// The four miniature sets share a scale and a three-quarter studio camera so that
// changing projects feels like changing the object on the same photographic stand.
const ink = 0x243431,
  cream = 0xe6d8b6,
  brass = 0xd99c4f,
  sage = 0x67a48d,
  red = 0xb25545;
const materials = new Map();
function finish(color, metal = false) {
  const key = color + "-" + metal;
  if (!materials.has(key))
    materials.set(
      key,
      new T.MeshStandardMaterial({
        color,
        roughness: metal ? 0.32 : 0.53,
        metalness: metal ? 0.62 : 0.12,
      }),
    );
  return materials.get(key);
}
function part(parent, geo, color, x, y, z, metal = false) {
  const mesh = new T.Mesh(geo, finish(color, metal));
  mesh.position.set(x, y, z);
  mesh.castShadow = mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}
function block(g, x, y, z, w, h, d, c, r = 0.06, metal = false) {
  return part(
    g,
    new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2, h / 2, d / 2)),
    c,
    x,
    y,
    z,
    metal,
  );
}
function drum(g, x, y, z, r, h, c, metal = false) {
  return part(g, new T.CylinderGeometry(r, r, h, 36), c, x, y, z, metal);
}
function ball(g, x, y, z, r, c) {
  return part(g, new T.SphereGeometry(r, 20, 14), c, x, y, z);
}
function rod(g, a, b, r, c, metal = false) {
  const start = new T.Vector3(...a),
    end = new T.Vector3(...b),
    delta = end.clone().sub(start);
  const m = part(
    g,
    new T.CylinderGeometry(r, r, delta.length(), 14),
    c,
    0,
    0,
    0,
    metal,
  );
  m.position.copy(start).lerp(end, 0.5);
  m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), delta.normalize());
  return m;
}
function group(parent) {
  const g = new T.Group();
  parent.add(g);
  return g;
}
function foot(g, w, d, c) {
  block(g, 0, -0.13, 0, w * 0.88, 0.19, d * 0.86, ink);
  block(g, 0, 0.015, 0, w, 0.24, d, c, 0.11);
}
// Draw the project's name directly on its instrument, as a small enamel faceplate.
function badge(g, title, x, y, z, width) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 86;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#23342f";
  ctx.fillRect(0, 0, 512, 86);
  ctx.font = "600 53px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#f2dca7";
  ctx.fillText(title, 256, 45, 475);
  const tex = new T.CanvasTexture(canvas);
  tex.colorSpace = T.SRGBColorSpace;
  const m = new T.Mesh(
    new T.PlaneGeometry(width, (width * 86) / 512),
    new T.MeshBasicMaterial({ map: tex }),
  );
  m.position.set(x, y, z);
  g.add(m);
}
// UdhyogaPay dispatches a tiny service van between two brass location beacons.
function dispatch(g) {
  foot(g, 4, 2.65, 0x909b7d);
  block(g, 0, 0.16, 0.52, 3.88, 0.075, 0.82, 0x3d4f50);
  for (let i = 0; i < 10; i++)
    block(g, -1.76 + i * 0.39, 0.201, 0.55, 0.17, 0.01, 0.04, cream, 0.002);
  const buildings = [
    [-1.32, 0.72, 0.67, 0xe5b67d],
    [-0.53, 1.13, 0.75, 0xaa6350],
    [0.27, 0.69, 0.64, 0xcab692],
  ];
  for (const [x, h, w, c] of buildings) {
    block(g, x, 0.15 + h / 2, -0.68, w, h, 0.74, c);
    block(g, x, 0.17 + h, -0.68, w + 0.09, 0.11, 0.82, cream);
    for (let i = 0; i < 2; i++)
      for (let j = 0; j < (h > 0.9 ? 3 : 2); j++)
        block(
          g,
          x + (i - 0.5) * 0.28,
          0.34 + j * 0.28,
          -0.299,
          0.15,
          0.16,
          0.025,
          0x2d5758,
          0.018,
        );
  }
  for (const x of [-1.48, 1.45]) {
    drum(g, x, 0.24, 0.02, 0.18, 0.12, brass, true);
    rod(g, [x, 0.22, 0.02], [x, 0.94, 0.02], 0.038, brass, true);
    const pin = part(
      g,
      new T.TorusGeometry(0.15, 0.067, 14, 30),
      red,
      x,
      1,
      0.02,
    );
    pin.rotation.y = 0.2;
  }
  const van = group(g);
  van.position.z = 0.78;
  block(van, 0, 0.51, 0, 0.85, 0.43, 0.47, 0xe7ad4d, 0.085);
  block(van, 0.45, 0.46, 0, 0.32, 0.33, 0.45, 0xeab85b);
  block(van, 0.44, 0.54, 0.225, 0.19, 0.14, 0.018, 0x31545a);
  block(van, -0.08, 0.53, 0.24, 0.38, 0.13, 0.015, cream);
  for (const x of [-0.27, 0.36])
    for (const z of [-0.22, 0.22]) {
      const wheel = drum(van, x, 0.305, z, 0.121, 0.069, ink);
      wheel.rotation.x = Math.PI / 2;
    }
  badge(g, "UDHYOGAPAY", 0, 0.014, 1.331, 1.12);
  return (t) => {
    van.position.x = -1.13 + 2.14 * t;
  };
}
// VaakMitra's microphone tilts on a brass yoke while the meter tracks the waveform.
function speech(g) {
  foot(g, 3.55, 2.12, 0x916255);
  drum(g, -0.48, 0.23, -0.04, 0.55, 0.19, brass, true);
  drum(g, -0.48, 0.44, -0.04, 0.12, 0.43, ink, true);
  const head = group(g);
  head.position.set(-0.48, 1.56, -0.04);
  for (const x of [-0.66, 0.66]) {
    rod(
      g,
      [-0.48 + x, 0.58, -0.04],
      [-0.48 + x, 1.52, -0.04],
      0.064,
      brass,
      true,
    );
    ball(g, -0.48 + x, 1.52, -0.04, 0.102, brass);
  }
  rod(g, [-1.14, 0.58, -0.04], [0.18, 0.58, -0.04], 0.067, brass, true);
  block(head, 0, 0, 0, 1.08, 1.62, 0.73, cream, 0.29, true);
  block(head, 0, 0.08, 0.353, 0.85, 1.14, 0.052, ink, 0.12);
  for (let i = 0; i < 9; i++)
    block(
      head,
      0,
      -0.37 + i * 0.115,
      0.393,
      0.83 - Math.abs(4 - i) * 0.039,
      0.039,
      0.075,
      brass,
      0.017,
      true,
    );
  block(head, 0, 0.07, 0.448, 0.08, 1.07, 0.04, cream, 0.027, true);
  block(g, 1.02, 0.59, -0.12, 0.98, 0.94, 0.48, ink, 0.12);
  block(g, 1.02, 0.65, 0.128, 0.82, 0.58, 0.034, 0x173d36, 0.035);
  const bars = Array.from({ length: 9 }, (_, i) =>
    block(
      g,
      0.7 + i * 0.08,
      0.6,
      0.156,
      0.045,
      0.4,
      0.029,
      i > 6 ? brass : sage,
      0.009,
    ),
  );
  for (const x of [0.77, 1.09, 1.34]) ball(g, x, 0.255, 0.14, 0.044, brass);
  badge(g, "VAAKMITRA", 0, 0.015, 1.068, 1.1);
  return (t) => {
    head.rotation.x = -0.22 + t * 0.39;
    bars.forEach((b, i) => {
      b.scale.y = 0.18 + 0.82 * Math.abs(Math.sin(i * 0.59 + t * 7));
      b.position.y = 0.43 + 0.2 * b.scale.y;
    });
  };
}
// LIFE-OS separates the plan, approval and execution layers to expose their connectors.
function agent(g) {
  foot(g, 3.42, 2.6, 0x56675d);
  for (const x of [-1.28, 1.28])
    for (const z of [-0.87, 0.87]) {
      rod(g, [x, 0.15, z], [x, 1.71, z], 0.038, brass, true);
      ball(g, x, 1.72, z, 0.068, brass);
    }
  const decks = [];
  for (let level = 0; level < 3; level++) {
    const deck = group(g);
    decks.push(deck);
    block(
      deck,
      0,
      0,
      0,
      2.48,
      0.14,
      1.64,
      [0x577568, 0xb39a72, 0x7dada0][level],
    );
    block(deck, -0.27, 0.13, -0.05, 0.88, 0.17, 0.76, ink);
    for (let i = 0; i < 6; i++)
      for (const side of [-1, 1])
        block(
          deck,
          -0.58 + i * 0.126,
          0.112,
          side * 0.4 - 0.05,
          0.045,
          0.045,
          0.13,
          brass,
          0.01,
          true,
        );
    for (let k = 0; k < 3; k++)
      block(
        deck,
        0.67,
        0.13,
        -0.42 + k * 0.35,
        0.37,
        0.12,
        0.19,
        k === 2 ? red : cream,
      );
    for (const x of [-1, 1])
      for (const z of [-0.56, 0.56])
        drum(deck, x, 0.09, z, 0.061, 0.045, brass, true);
    badge(
      deck,
      ["PLAN", "APPROVE", "EXECUTE"][level],
      0.01,
      -0.005,
      0.827,
      0.67,
    );
  }
  badge(g, "LIFE-OS", 0, 0.015, 1.308, 0.95);
  return (t) =>
    decks.forEach((d, i) => {
      d.position.y = 0.36 + i * (0.28 + 0.48 * t);
      d.rotation.y = (i - 1) * t * 0.19;
    });
}
// Skylark Signal translates a query into a bar chart on a small desktop terminal.
function analytics(g) {
  foot(g, 3.46, 2.53, 0x988977);
  block(g, 0, 0.31, -0.36, 1.24, 0.36, 0.85, ink);
  block(g, 0, 1.18, -0.4, 2.32, 1.62, 1.09, 0xd4c7a9, 0.14);
  block(g, -0.14, 1.23, 0.156, 1.82, 1.29, 0.1, ink, 0.12);
  block(g, -0.14, 1.23, 0.222, 1.61, 1.07, 0.06, 0x193e3c, 0.09);
  for (let j = 0; j < 4; j++)
    block(g, -0.13, 0.84 + j * 0.21, 0.26, 1.45, 0.012, 0.012, 0x40605b, 0.003);
  const bars = Array.from({ length: 7 }, (_, i) =>
    block(
      g,
      -0.7 + i * 0.19,
      1,
      0.284,
      0.13,
      0.74,
      0.03,
      i === 6 ? brass : sage,
      0.014,
    ),
  );
  for (let i = 0; i < 5; i++)
    block(g, 0.93, 1.49 - i * 0.092, 0.16, 0.17, 0.029, 0.024, ink, 0.006);
  ball(g, 0.93, 0.91, 0.17, 0.071, brass);
  block(g, 0.91, 0.67, 0.16, 0.14, 0.05, 0.02, red);
  block(g, 0, 0.22, 0.76, 2.38, 0.15, 0.63, cream);
  for (let j = 0; j < 3; j++)
    for (let i = 0; i < 12; i++)
      block(
        g,
        -1.03 + i * 0.181,
        0.321,
        0.55 + j * 0.15,
        0.135,
        0.064,
        0.1,
        j === 2 && i > 9 ? brass : ink,
        0.018,
      );
  badge(g, "SKYLARK SIGNAL", 0, 0.015, 1.273, 1.26);
  return (t) =>
    bars.forEach((b, i) => {
      b.scale.y =
        0.18 + (0.76 * (i + 1)) / 7 + 0.18 * Math.sin(i * 0.94 + 5 * t);
      b.position.y = 0.8 + 0.37 * b.scale.y;
    });
}
const models = {
  udhyogapay: dispatch,
  vaakmitra: speech,
  "life-os": agent,
  skylark: analytics,
};
/** Render transparent turntable frames with matching lighting and a fixed canvas for all four models. */
export function miniatureStudio(canvas) {
  const renderer = new T.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    preserveDrawingBuffer: true,
  });
  renderer.setSize(480, 336, false);
  renderer.setClearColor(0, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.22;
  const scene = new T.Scene(),
    camera = new T.OrthographicCamera(-2.87, 2.87, 2.009, -2.009, 0.1, 50);
  camera.position.set(4.5, 3.35, 7.7);
  camera.lookAt(0, 0.78, 0);
  const env = new T.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  scene.environment = env.fromScene(room, 0.04).texture;
  scene.environmentIntensity = 0.55;
  scene.add(new T.HemisphereLight(0xfff2dc, 0x75877c, 1.32));
  const key = new T.DirectionalLight(0xffe5c5, 3.0);
  key.position.set(-3, 7, 5);
  key.castShadow = true;
  Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4 });
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.normalBias = 0.018;
  scene.add(key);
  const rim = new T.DirectionalLight(0xe4ffff, 1.7);
  rim.position.set(3, 3, -4);
  scene.add(rim);
  const floor = new T.Mesh(
    new T.PlaneGeometry(30, 30),
    new T.ShadowMaterial({ opacity: 0.18 }),
  );
  floor.receiveShadow = true;
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.24;
  scene.add(floor);
  const sets = Object.fromEntries(
    Object.entries(models).map(([name, build]) => {
      const model = group(scene);
      return [name, { model, pose: build(model) }];
    }),
  );
  return (name, t) => {
    for (const [k, v] of Object.entries(sets)) v.model.visible = name === k;
    const { model, pose } = sets[name];
    model.rotation.y = -0.69 + 1.15 * t;
    pose(t);
    renderer.render(scene, camera);
    return canvas.toDataURL("image/png").split(",")[1];
  };
}
