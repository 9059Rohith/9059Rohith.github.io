import * as T from "three";

export const legLength = 18;
const readingDepth = 8.8;
const up = new T.Vector3(0, 1, 0);
const smooth = (x: number) => T.MathUtils.smoothstep(x, 0, 1);

/** One distance-based curve supplies the chase camera, aircraft heading, wake and world anchors. */
export function createCourse(count: number) {
  const length = (count - 1) * legLength;
  const bends = [
    0, 1.8, -4.8, -12.4, -9.6, 3.8, 13.0, 8.2, -6.4, -12.2, -3.8, 0,
  ];
  const heights = [
    0, 0.35, 1.1, 0.3, -0.9, -0.4, 1.2, 1.9, 0.3, -0.45, 0.25, 0.4,
  ];
  const points = [
    new T.Vector3(0, 0, 22),
    ...bends.map(
      (x, i) =>
        new T.Vector3(x, heights[i], (-i * length) / (bends.length - 1)),
    ),
    new T.Vector3(0, 0.4, -length - 38),
  ];
  const curve = new T.CatmullRomCurve3(points, false, "centripetal");
  curve.arcLengthDivisions = 1600;
  const distances = curve.getLengths(),
    start =
      distances[Math.round(curve.arcLengthDivisions / (points.length - 1))];
  const end =
      distances[
        Math.round(
          (curve.arcLengthDivisions * (points.length - 2)) /
            (points.length - 1),
        )
      ],
    total = curve.getLength();
  const step = (end - start) / (count - 1);
  function at(distance: number, out: T.Vector3) {
    return curve.getPointAt(
      T.MathUtils.clamp((start + distance) / total, 0, 1),
      out,
    );
  }
  const mobileAim = new T.Vector3();
  const camera = new T.PerspectiveCamera(55, 1, 0.1, 100),
    ahead = new T.Vector3(),
    right = new T.Vector3(),
    dir = new T.Vector3();
  let width = 0,
    height = 0;
  const anchors = Array.from({ length: count }, () => new T.Vector3());
  const station = new T.PerspectiveCamera(),
    local = new T.Vector3();
  const sides = Array.from({ length: count }, (_, i) => (i % 2 ? 1 : -1));
  /** Use the curve tangent for camera yaw. At reading distance the camera slides toward the chapter. */
  function placeCamera(cam: T.PerspectiveCamera, p: number) {
    const distance = p * step,
      i = Math.round(p),
      offset = p - i;
    at(distance, cam.position);
    at(distance + 0.8, ahead);
    dir.subVectors(ahead, cam.position).normalize();
    right.crossVectors(dir, up).normalize();
    const reading =
      i > 0 && i < count - 1
        ? smooth(1 - Math.min(1, Math.abs(offset) * 2))
        : 0;
    const mobile = width / height < 0.86;
    cam.position.addScaledVector(
      right,
      (mobile ? 0.18 : 0.99) * reading * sides[i],
    );
    cam.position.y += mobile ? 0.32 : 0.12;
    ahead.copy(cam.position).addScaledVector(dir, 8);
    ahead.addScaledVector(right, reading * sides[i] * (mobile ? 0.05 : 0.42));
    if (mobile) {
      at(distance + 8.1, mobileAim);
      ahead.x += 0.7 * (mobileAim.x - ahead.x);
      ahead.y -= 0.65;
    }
    cam.lookAt(ahead);
    cam.updateMatrixWorld();
  }
  /** Author anchors once per viewport in world coordinates. Passage and magnification then follow perspective. */
  function resize(w: number, h: number) {
    if (w === width && h === height) return;
    width = w;
    height = h;
    camera.aspect = w / h;
    camera.fov = w / h < 0.86 ? 60 : 55;
    camera.updateProjectionMatrix();
    const f = Math.tan(T.MathUtils.degToRad(camera.fov / 2));
    for (let i = 0; i < count; i++) {
      placeCamera(station, i);
      const mobile = w / h < 0.86,
        screenX = mobile ? 0 : sides[i] * 0.42,
        screenY = mobile ? -0.41 : 0.03;
      anchors[i]
        .set(
          screenX * readingDepth * f * camera.aspect,
          screenY * readingDepth * f,
          -readingDepth,
        )
        .applyMatrix4(station.matrixWorld);
    }
  }
  /** Keep headings, links and accessible text in the DOM while projecting their actual positions in the scene. */
  function projectChapters(
    elements: HTMLElement[],
    p: number,
    reduced: boolean,
  ) {
    for (const element of elements) {
      const i = Number(element.dataset.station),
        distance = i - p;
      local.copy(anchors[i]).applyMatrix4(camera.matrixWorldInverse);
      const depth = -local.z,
        scale = readingDepth / Math.max(depth, 0.1);
      const opacity = reduced
        ? Number(i === Math.round(p))
        : smooth((depth - 1.05) / 2.4) *
          smooth((2.4 - distance) / 1.2) *
          Math.min(1, Math.pow(scale, 2.55));
      if (opacity < 0.014 || depth <= 0) {
        element.style.visibility = "hidden";
        continue;
      }
      local.applyMatrix4(camera.projectionMatrix);
      element.style.visibility = "visible";
      element.style.opacity = String(opacity);
      element.style.zIndex = String(count - i);
      element.style.transform = `translate3d(${(local.x + 1) * width * 0.5}px,${(1 - local.y) * height * 0.5}px,0) translate(-50%,-50%) scale(${scale})`;
    }
  }
  return {
    camera,
    step,
    at,
    resize,
    placeCamera,
    projectChapters,
    length: (count - 1) * step,
  };
}
