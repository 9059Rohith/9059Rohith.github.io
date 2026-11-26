import { makeCoffee } from "./coffeeModel";
import * as T from "three";

type Pose = { progress: number; x: number; y: number; spin: number };
const clamp = T.MathUtils.clamp;
const ease = (x: number) => {
  const t = clamp(x, 0, 1);
  return t * t * (3 - 2 * t);
};

/** Build a desk-scale scene. Scroll lifts the circuit board from the mat and separates its layers. */
export async function mountWorkbench(
  canvas: HTMLCanvasElement,
  signal: AbortSignal,
) {
  const context = canvas.getContext("webgl2", {
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  if (!context) return;
  const renderer = new T.WebGLRenderer({
    context,
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  renderer.outputColorSpace = T.SRGBColorSpace;
  const scene = new T.Scene();
  const camera = new T.OrthographicCamera(-6, 6, 3.75, -3.75, 0.1, 60);
  camera.position.set(0, 0, 15);
  const textures: T.Texture[] = [];
  const mug = makeCoffee();
  function dispose() {
    scene.remove(mug.cup);
    mug.dispose();
    scene.traverse((obj) => {
      if (obj instanceof T.Mesh) {
        obj.geometry.dispose();
        for (const m of Array.isArray(obj.material)
          ? obj.material
          : [obj.material])
          m.dispose();
      }
    });
    textures.forEach((t) => t.dispose());
    renderer.dispose();
  }
  const light = new T.DirectionalLight(0xffedcf, 2.1);
  light.position.set(-4, 6, 8);
  light.castShadow = true;
  light.shadow.mapSize.set(1024, 1024);
  Object.assign(light.shadow.camera, {
    left: -9,
    right: 9,
    top: 8,
    bottom: -8,
  });
  light.shadow.bias = -0.0006;
  light.shadow.normalBias = 0.015;
  light.shadow.radius = 3;
  scene.add(light, new T.AmbientLight(0xffe3bf, 1.2));
  const rimLight = new T.DirectionalLight(0xffbc81, 1.2);
  rimLight.position.set(6, -2, 4);
  scene.add(rimLight);
  const loader = new T.TextureLoader();
  let wood: T.Texture, mat: T.Texture, face: T.Texture;
  try {
    [wood, mat, face] = await Promise.all(
      ["walnut", "cutting-mat", "processor"].map(async (name) => {
        const t = await loader.loadAsync("/studio/" + name + ".webp");
        textures.push(t);
        t.colorSpace = T.SRGBColorSpace;
        t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
        return t;
      }),
    );
  } catch (err) {
    dispose();
    throw err;
  }
  if (signal.aborted) {
    dispose();
    return;
  }
  const desk = new T.Group(),
    board = new T.Group();
  scene.add(desk, board, mug.cup);
  const metal = (color: T.ColorRepresentation, metalness = 0.12) =>
    new T.MeshStandardMaterial({ color, roughness: 0.52, metalness });
  function mesh(
    parent: T.Object3D,
    geo: T.BufferGeometry,
    material: T.Material,
    x = 0,
    y = 0,
    z = 0,
  ) {
    const m = new T.Mesh(geo, material);
    m.position.set(x, y, z);
    m.castShadow = m.receiveShadow = true;
    parent.add(m);
    return m;
  }
  function box(
    parent: T.Object3D,
    w: number,
    h: number,
    d: number,
    material: T.Material,
    x: number,
    y: number,
    z: number,
  ) {
    return mesh(parent, new T.BoxGeometry(w, h, d), material, x, y, z);
  }
  function disc(
    parent: T.Object3D,
    r: number,
    h: number,
    material: T.Material,
    z: number,
  ) {
    const m = mesh(
      parent,
      new T.CylinderGeometry(r, r, h, 112),
      material,
      0,
      0,
      z,
    );
    m.rotation.x = Math.PI / 2;
    return m;
  }
  wood.wrapS = wood.wrapT = T.RepeatWrapping;
  wood.repeat.set(2.25, 1.5);
  box(
    desk,
    31,
    18,
    0.15,
    new T.MeshStandardMaterial({ map: wood, color: 0xc49d79, roughness: 0.78 }),
    0,
    0,
    -0.3,
  );
  const cutting = new T.Group();
  cutting.rotation.z = 0.074;
  cutting.position.set(1.72, 0.98, -0.16);
  desk.add(cutting);
  box(cutting, 9.55, 6.35, 0.07, metal(0x3e4735), 0, 0, 0);
  mesh(
    cutting,
    new T.PlaneGeometry(9.54, 6.34),
    new T.MeshStandardMaterial({ map: mat, roughness: 0.88 }),
    0,
    0,
    0.039,
  );
  // A lacquered drafting pencil uses hexagonal stock, a wooden cone and an exposed graphite tip.
  function pencil(x: number, y: number, angle: number, color: number) {
    const g = new T.Group();
    desk.add(g);
    g.position.set(x, y, 0.001);
    g.rotation.z = angle;
    mesh(
      g,
      new T.CylinderGeometry(0.058, 0.058, 2.7, 6),
      metal(color),
      0,
      0,
      0.058,
    );
    const tip = mesh(
      g,
      new T.ConeGeometry(0.059, 0.3, 8),
      metal(0xc59b71),
      0,
      -1.5,
      0.058,
    );
    tip.rotation.z = Math.PI;
    const lead = mesh(
      g,
      new T.ConeGeometry(0.016, 0.092, 8),
      metal(0x302b23),
      0,
      -1.65,
      0.058,
    );
    lead.rotation.z = Math.PI;
    mesh(
      g,
      new T.CylinderGeometry(0.061, 0.061, 0.16, 16),
      metal(0xa5a292, 0.4),
      0,
      1.28,
      0.058,
    );
  }
  pencil(3.55, 2.08, 0.61, 0xcea560);
  pencil(-4.7, -1.04, -0.8, 0x363932);
  const ruler = new T.Group();
  desk.add(ruler);
  ruler.position.set(4.28, -2.46, -0.005);
  ruler.rotation.z = -0.58;
  box(ruler, 3.7, 0.33, 0.045, metal(0xb0ab91, 0.23), 0, 0, 0);
  const ink = metal(0x4a453a);
  for (let i = 0; i < 72; i++)
    box(
      ruler,
      0.009,
      i % 5 === 0 ? 0.14 : 0.07,
      0.003,
      ink,
      i * 0.05 - 1.76,
      0.106,
      0.025,
    );
  function paperclip(x: number, y: number, scale: number) {
    const path = new T.CatmullRomCurve3(
      [
        [-0.11, 0.2],
        [-0.11, -0.25],
        [0, -0.34],
        [0.11, -0.25],
        [0.11, 0.26],
        [0, 0.35],
        [-0.045, 0.26],
        [-0.045, -0.16],
      ].map(([a, b]) => new T.Vector3(a, b, 0)),
    );
    const clip = mesh(
      desk,
      new T.TubeGeometry(path, 48, 0.012, 8, false),
      metal(0xb9ada1, 0.45),
      x,
      y,
      -0.095,
    );
    clip.rotation.z = 0.48;
    clip.scale.setScalar(scale);
  }
  paperclip(-4.6, 1.6, 1.3);
  paperclip(4.0, -1.8, 0.8);
  const copper = metal(0xb7784c, 0.22),
    gold = metal(0xd8a966, 0.26),
    graphite = metal(0x34352a);
  const base = disc(board, 1.4, 0.12, copper, 0.0);
  const middle = disc(board, 1.35, 0.07, graphite, 0.1);
  const lid = new T.Group();
  board.add(lid);
  disc(lid, 1.4, 0.1, copper, 0);
  mesh(
    lid,
    new T.CircleGeometry(1.388, 128),
    new T.MeshStandardMaterial({ map: face, roughness: 0.64, metalness: 0.09 }),
    0,
    0,
    0.052,
  );
  const ring = mesh(
    lid,
    new T.TorusGeometry(1.388, 0.015, 8, 144),
    gold,
    0,
    0,
    0.049,
  );
  ring.receiveShadow = false;
  const pins = new T.Group();
  board.add(pins);
  for (let i = 0; i < 36; i++) {
    const a = (i * Math.PI) / 18;
    const pin = box(
      pins,
      0.07,
      0.105,
      0.045,
      gold,
      Math.cos(a) * 1.31,
      Math.sin(a) * 1.31,
      0,
    );
    pin.rotation.z = a;
  }
  let width = 0,
    height = 0;
  function render({ progress, x, y, spin }: Pose) {
    const w = canvas.clientWidth,
      h = canvas.clientHeight;
    if (!w || !h) return;
    if (w !== width || h !== height) {
      width = w;
      height = h;
      renderer.setSize(w, h, false);
      const vh = Math.max(6.05, (4.5 * h) / w);
      camera.left = (-vh * w) / h / 2;
      camera.right = -camera.left;
      camera.top = vh / 2;
      camera.bottom = -vh / 2;
      camera.updateProjectionMatrix();
    }
    const land = ease((progress - 0.06) / 0.17),
      depart = ease((progress - 0.31) / 0.22);
    const lift = ease((progress - 0.38) / 0.29),
      explode = ease((progress - 0.52) / 0.46);
    const side = Math.min(3.5, -camera.left * 0.75);
    mug.cup.scale.setScalar(w < h ? 0.8 : 0.96);
    mug.cup.rotation.set(
      Math.PI / 2 - 0.12 + 0.34 * depart,
      0.05,
      -0.32 + 0.28 * land,
      "ZXY",
    );
    mug.cup.position.set(
      0.2 + side * (1 - land) + 4.1 * depart,
      1.83 * (1 - land) + 2.2 * depart,
      0.28 + 0.23 * (1 - land) + 2.8 * depart,
    );
    mug.cup.visible = depart < 0.999;

    desk.position.set(-1.15 * lift, -10 * lift, -3.6 * lift);
    desk.rotation.z = -0.19 * lift;
    desk.visible = lift < 0.997;
    const aspect = w / h;
    board.position.set(
      (aspect > 1 ? 0.22 : 0) + x * 0.045,
      aspect < 0.8 ? 0.18 : 0,
      0.03 + lift * 1.6,
    );
    board.rotation.set(
      -0.045 + 0.74 * lift + y * 0.052,
      -0.045 - 0.48 * lift + x * 0.065,
      0.08 + lift * 0.84 + spin,
    );
    board.scale.setScalar((aspect < 0.8 ? 0.98 : 1.04) * (1 + lift * 0.08));
    base.position.z = -explode * 0.48;
    middle.position.z = 0.1 + explode * 0.05;
    pins.position.z = 0.14 + explode * 0.42;
    lid.position.z = 0.185 + explode * 0.88;
    camera.position.x = x * 0.095;
    camera.position.y = y * 0.09;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  }
  signal.addEventListener("abort", dispose, { once: true });
  return render;
}
