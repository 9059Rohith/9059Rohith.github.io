import { copyFile, mkdir } from "node:fs/promises";
for (const slug of ["udhyogapay", "vaakmitra", "life-os", "skylark"]) {
  const dir = "dist/projects/" + slug;
  await mkdir(dir, { recursive: true });
  await copyFile("dist/index.html", dir + "/index.html");
}
