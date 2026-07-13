import { copyFile, mkdir } from "node:fs/promises";

await mkdir("dist/server", { recursive: true });
await mkdir("dist/.openai", { recursive: true });

await Promise.all([
  copyFile("server/index.js", "dist/server/index.js"),
  copyFile(".openai/hosting.json", "dist/.openai/hosting.json"),
]);
