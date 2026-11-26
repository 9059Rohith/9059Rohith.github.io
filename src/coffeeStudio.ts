import * as T from "three";
import { makeCoffee } from "./coffeeModel";

/** Render the closing workbench with the same cup as the introduction, a copper coaster and drifting steam. */
export function createCoffeeStudio(canvas: HTMLCanvasElement) {
  const context = canvas.getContext("webgl2", {
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  if (!context) return;
  const renderer = new T.WebGLRenderer({
    canvas,
    context,
    alpha: true,
    antialias: true,
  });
  renderer.setPixelRatio(Math.min(1.6, devicePixelRatio));
  renderer.setClearColor(0, 0);
  const scene = new T.Scene(),
    camera = new T.PerspectiveCamera(30, 1, 0.1, 45);
  camera.position.set(3.5, 3.95, 6.8);
  camera.lookAt(0, 1.02, 0);
  const model = makeCoffee(),
    stand = new T.Group();
  scene.add(stand, model.cup);
  const hemi = new T.HemisphereLight(0xfff1d4, 0xa77156, 2.15);
  scene.add(hemi);
  const key = new T.DirectionalLight(0xffefd3, 3);
  key.position.set(-4, 6, 4);
  scene.add(key);
  const fill = new T.DirectionalLight(0xffa966, 2.3);
  fill.position.set(4, 2, -4);
  scene.add(fill);
  const boardMat = new T.MeshStandardMaterial({
    color: 0xa96032,
    roughness: 0.54,
    metalness: 0.16,
  });
  const board = new T.Mesh(
    new T.CylinderGeometry(1.16, 1.14, 0.12, 96),
    boardMat,
  );
  stand.add(board);
  board.position.y = 0.03;
  const ringMat = new T.MeshStandardMaterial({
    color: 0xc99653,
    roughness: 0.46,
  });
  for (const r of [1.04, 1.11]) {
    const ring = new T.Mesh(new T.TorusGeometry(r, 0.012, 6, 96), ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.097;
    stand.add(ring);
  }
  const shadowCanvas = document.createElement("canvas");
  shadowCanvas.width = shadowCanvas.height = 128;
  const ctx = shadowCanvas.getContext("2d")!,
    g = ctx.createRadialGradient(64, 64, 8, 64, 64, 64);
  g.addColorStop(0, "rgba(12,6,4,.77)");
  g.addColorStop(0.48, "rgba(12,6,4,.42)");
  g.addColorStop(1, "rgba(12,6,4,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const shadowTex = new T.CanvasTexture(shadowCanvas),
    shadowMat = new T.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    });
  const shadow = new T.Mesh(new T.PlaneGeometry(3.9, 3.15), shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(0.12, -0.045, 0.1);
  scene.add(shadow);
  const steamCanvas = document.createElement("canvas");
  steamCanvas.width = steamCanvas.height = 96;
  const sc = steamCanvas.getContext("2d")!,
    sw = sc.createRadialGradient(48, 48, 0, 48, 48, 46);
  sw.addColorStop(0, "rgba(255,247,218,.66)");
  sw.addColorStop(0.47, "rgba(255,247,218,.28)");
  sw.addColorStop(1, "rgba(255,247,218,0)");
  sc.fillStyle = sw;
  sc.fillRect(0, 0, 96, 96);
  const mist = new T.CanvasTexture(steamCanvas);
  const wisps = Array.from({ length: 12 }, () => {
    const m = new T.SpriteMaterial({
      map: mist,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const w = new T.Sprite(m);
    scene.add(w);
    return w;
  });
  let width = 0,
    height = 0;
  function draw(
    yaw: number,
    lift: number,
    entry: number,
    time: number,
    isThermal: boolean,
  ) {
    const w = canvas.clientWidth,
      h = canvas.clientHeight;
    if (!w || !h) return;
    if (w !== width || h !== height) {
      width = w;
      height = h;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    model.thermal(isThermal);
    model.cup.rotation.y = yaw;
    model.cup.position.y = 0.085 + lift * 0.58 + (1 - entry) * 0.65;
    model.cup.rotation.z = (1 - entry) * -0.18 + lift * 0.045;
    for (let i = 0; i < wisps.length; i++) {
      const p = (time * 0.35 + i / wisps.length) % 1,
        steam = wisps[i];
      steam.position.set(
        -0.1 + Math.sin(p * 5 + i * 0.64) * 0.14 + p * 0.14,
        model.cup.position.y + 1.31 + p * 0.9,
        Math.cos(i * 0.91 + p * 4) * 0.11,
      );
      steam.scale.set(0.11 + p * 0.27, 0.16 + p * 0.35, 1);
      steam.material.opacity = Math.sin(p * Math.PI) * 0.26;
      steam.material.color.set(isThermal ? 0xff9648 : 0xffffff);
    }
    renderer.render(scene, camera);
  }
  function dispose() {
    model.dispose();
    board.geometry.dispose();
    stand.children.slice(1).forEach((m) => (m as T.Mesh).geometry.dispose());
    boardMat.dispose();
    ringMat.dispose();
    shadow.geometry.dispose();
    shadowMat.dispose();
    shadowTex.dispose();
    for (const s of wisps) s.material.dispose();
    mist.dispose();
    renderer.dispose();
  }
  return { draw, dispose };
}
