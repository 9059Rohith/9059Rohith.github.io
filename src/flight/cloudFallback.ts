import { Euler, Mesh, PerspectiveCamera, Vector3 } from "three";

/** A second canvas projects the same cloud positions, aircraft pose and wake on 2D-only devices. */
export function createCloudFallback(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d"),
    banksImage = new Image(),
    planeImage = new Image(),
    tmp = new Vector3(),
    point = new Vector3();
  let repaint: (() => void) | undefined;
  banksImage.onload = planeImage.onload = () => {
    if (canvas.isConnected) repaint?.();
  };
  banksImage.src = "/flight-art/cloud-bank.webp";
  planeImage.src = "/flight-art/glider-heading.webp";
  function draw(
    cam: PerspectiveCamera,
    banks: Mesh[],
    plane: { position: Vector3; rotation: Euler; scale: Vector3 },
    wake: Float32Array,
    w: number,
    h: number,
  ) {
    if (!ctx) return;
    repaint = () => draw(cam, banks, plane, wake, w, h);
    const ratio = Math.min(devicePixelRatio, 1.35);
    if (
      canvas.width !== Math.round(w * ratio) ||
      canvas.height !== Math.round(h * ratio)
    ) {
      canvas.width = Math.round(w * ratio);
      canvas.height = Math.round(h * ratio);
    }
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const focal = h / (2 * Math.tan((cam.fov * Math.PI) / 360));
    function project(pos: Vector3) {
      tmp.copy(pos).applyMatrix4(cam.matrixWorldInverse);
      const depth = -tmp.z;
      return {
        x: w / 2 + (tmp.x * focal) / depth,
        y: h / 2 - (tmp.y * focal) / depth,
        depth,
        k: focal / depth,
      };
    }
    if (banksImage.naturalWidth) {
      const visible = banks
        .map((m, i) => ({ m, i, ...project(m.position) }))
        .filter((b) => b.depth > 1 && b.depth < 54)
        .sort((a, b) => b.depth - a.depth);
      for (const b of visible) {
        ctx.globalAlpha = 0.9 * Math.min(1, b.depth / 2, (54 - b.depth) / 35);
        const width = b.k * b.m.scale.x * 2,
          height = b.k * b.m.scale.y * 1.4,
          slot = b.i % 6;
        ctx.drawImage(
          banksImage,
          (slot % 3) * 280,
          Math.floor(slot / 3) * 196,
          280,
          196,
          b.x - width / 2,
          b.y - height / 2,
          width,
          height,
        );
      }
    }
    ctx.globalAlpha = 0.58;
    ctx.fillStyle = "#f6eefe";
    ctx.beginPath();
    const edges: [number, number, number, number][] = [];
    for (let j = 0; j < wake.length; j += 6) {
      const l = project(point.fromArray(wake, j)),
        r = project(point.fromArray(wake, j + 3));
      if (l.depth <= 0.16 || r.depth <= 0.16) break;
      edges.push([l.x, l.y, r.x, r.y]);
    }
    for (const [x, y] of edges) ctx.lineTo(x, y);
    for (let i = edges.length - 1; i >= 0; i--)
      ctx.lineTo(edges[i][2], edges[i][3]);
    ctx.fill();
    ctx.globalAlpha = 1;
    if (planeImage.naturalWidth) {
      const p = project(plane.position),
        width = 6.6 * plane.scale.x * p.k;
      const bearing = Math.atan2(
        cam.position.x - plane.position.x,
        cam.position.z - plane.position.z,
      );
      const angle = plane.rotation.y - bearing;
      const yaw = Math.atan2(Math.sin(angle), Math.cos(angle)),
        slot = Math.round(12 + 12 * Math.max(-1, Math.min(1, yaw / 0.9)));
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(-plane.rotation.z);
      ctx.drawImage(
        planeImage,
        (slot % 5) * 350,
        Math.floor(slot / 5) * 124,
        350,
        124,
        -width / 2,
        (-width * 62) / 350,
        width,
        (width * 124) / 350,
      );
      ctx.restore();
      canvas.dataset.painted = "true";
    }
  }
  return { draw };
}
