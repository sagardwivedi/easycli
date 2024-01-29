import dts from "bun-plugin-dts";

await Bun.build({
  entrypoints: ["./src/index.ts"],
  outdir: "./dist",
  minify: true,
  target: "bun",
  splitting: true,
  format: "esm",
  plugins:[dts()]
});
