// After build: keep every deployed file under the Cloudflare Pages 25 MB limit, and leave preview-only
// material out of normal builds (inspiration photos ship only when VITE_INSPIRATION=1).
import { existsSync, rmSync, statSync } from "node:fs";

const oversized = "dist/media/hero-film-graded.mp4";
if (existsSync(oversized)) {
  const mb = (statSync(oversized).size / 1e6).toFixed(1);
  rmSync(oversized);
  console.log(`postbuild: removed ${oversized} (${mb} MB) to stay under the 25 MB Pages limit`);
}
if (process.env.VITE_INSPIRATION !== "1" && existsSync("dist/media/inspiration")) {
  rmSync("dist/media/inspiration", { recursive: true, force: true });
  console.log("postbuild: inspiration photos left out (VITE_INSPIRATION is off)");
}
