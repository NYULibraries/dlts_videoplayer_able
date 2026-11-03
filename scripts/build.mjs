import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["js/dlts-player.js"],
  bundle: true,
  format: "esm",
  outfile: "dist/dlts-able-player.js",
});
