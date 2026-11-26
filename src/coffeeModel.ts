import * as T from "three";

/** Revolve a double-walled ceramic profile around a recessed espresso surface. Local Y is up. */
export function makeCoffee() {
  const cup = new T.Group();
  const profile = [
    [0, 0.06],
    [0.56, 0.06],
    [0.67, 0.1],
    [0.73, 0.22],
    [0.79, 0.55],
    [0.85, 1.22],
    [0.86, 1.34],
    [0.855, 1.38],
    [0.832, 1.4],
    [0.808, 1.384],
    [0.795, 1.33],
    [0.77, 1.1],
    [0.63, 0.28],
    [0.54, 0.16],
    [0, 0.16],
  ];
  const body = new T.LatheGeometry(
    profile.map(([x, y]) => new T.Vector2(x, y)),
    96,
  );
  const glaze = new T.MeshStandardMaterial({
    color: 0xe9d6ac,
    roughness: 0.24,
    metalness: 0.05,
  });
  const heat = new T.MeshBasicMaterial({ vertexColors: true });
  const palette = [
    new T.Color("#471c81"),
    new T.Color("#b52a54"),
    new T.Color("#ff641b"),
    new T.Color("#ffd837"),
    new T.Color("#fff1a2"),
  ];
  function thermalGeometry(g: T.BufferGeometry) {
    const pos = g.getAttribute("position"),
      colors = [],
      c = new T.Color();
    for (let i = 0; i < pos.count; i++) {
      const v =
        T.MathUtils.clamp(
          (pos.getY(i) / 1.4) * 0.88 + 0.1 * Math.cos(pos.getX(i) * 3),
          0,
          0.999,
        ) * 4;
      c.copy(palette[Math.floor(v)]).lerp(palette[Math.floor(v) + 1], v % 1);
      colors.push(c.r, c.g, c.b);
    }
    g.setAttribute("color", new T.Float32BufferAttribute(colors, 3));
    return g;
  }
  const shell = new T.Mesh<T.BufferGeometry, T.Material>(
    thermalGeometry(body),
    glaze,
  );
  shell.castShadow = true;
  shell.receiveShadow = true;
  cup.add(shell);
  const handlePath = new T.CatmullRomCurve3(
    [
      [0.8, 1.14],
      [1.12, 1.22],
      [1.34, 1.04],
      [1.36, 0.79],
      [1.23, 0.54],
      [0.93, 0.39],
      [0.72, 0.46],
    ].map(([x, y]) => new T.Vector3(x, y, 0)),
  );
  const handle = new T.Mesh<T.BufferGeometry, T.Material>(
    thermalGeometry(new T.TubeGeometry(handlePath, 52, 0.09, 14, false)),
    glaze,
  );
  handle.castShadow = true;
  cup.add(handle);
  const paint = document.createElement("canvas");
  paint.width = paint.height = 512;
  const ctx = paint.getContext("2d")!;
  const fill = ctx.createRadialGradient(200, 202, 15, 256, 256, 256);
  fill.addColorStop(0, "#4c2010");
  fill.addColorStop(0.65, "#69361c");
  fill.addColorStop(0.92, "#97562c");
  fill.addColorStop(0.98, "#c28b53");
  fill.addColorStop(1, "#4b2315");
  ctx.fillStyle = fill;
  ctx.fillRect(0, 0, 512, 512);
  let seed = 31;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let i = 0; i < 2250; i++) {
    const a = random() * Math.PI * 2,
      r = 250 * Math.sqrt(random());
    ctx.fillStyle = i % 3 ? "#eab67d38" : "#3f180e45";
    ctx.beginPath();
    ctx.arc(
      256 + Math.cos(a) * r,
      256 + Math.sin(a) * r,
      0.3 + random() * 1.6,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.save();
  ctx.translate(262, 252);
  ctx.rotate(-0.4);
  ctx.lineCap = "round";
  for (let i = 0; i < 12; i++) {
    const y = -81 + i * 11,
      w = 16 + 50 * Math.sin(((i + 0.3) / 12) * Math.PI);
    ctx.strokeStyle = i % 2 ? "#f3d4a3" : "#dba76e";
    ctx.lineWidth = 3.2 + i * 0.42;
    ctx.beginPath();
    ctx.moveTo(-w, y);
    ctx.bezierCurveTo(-w * 0.74, y + 18, -w * 0.35, y + 21, 0, y + 13);
    ctx.bezierCurveTo(w * 0.35, y + 20, w * 0.88, y + 12, w, y - 4);
    ctx.stroke();
  }
  ctx.strokeStyle = "#f4d4a9";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, -89);
  ctx.bezierCurveTo(-7, -15, -5, 41, 8, 87);
  ctx.stroke();
  ctx.restore();
  const coffeeTexture = new T.CanvasTexture(paint);
  coffeeTexture.colorSpace = T.SRGBColorSpace;
  const coffee = new T.MeshStandardMaterial({
    map: coffeeTexture,
    roughness: 0.24,
  });
  const hotLiquid = new T.MeshBasicMaterial({ color: 0xffe98a });
  const liquid = new T.Mesh<T.BufferGeometry, T.Material>(
    new T.CircleGeometry(0.798, 96),
    coffee,
  );
  liquid.rotation.x = -Math.PI / 2;
  liquid.position.y = 1.285;
  cup.add(liquid);
  function thermal(on: boolean) {
    shell.material = handle.material = on ? heat : glaze;
    liquid.material = on ? hotLiquid : coffee;
  }
  function dispose() {
    for (const mesh of [shell, handle, liquid]) mesh.geometry.dispose();
    for (const m of [glaze, heat, coffee, hotLiquid]) m.dispose();
    coffeeTexture.dispose();
  }
  return { cup, thermal, dispose };
}
