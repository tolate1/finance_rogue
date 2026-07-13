import { copyFile, cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { extname, relative, resolve, sep } from "node:path";

await rm("dist/server", { recursive: true, force: true });
await mkdir("dist/server", { recursive: true });
await mkdir("dist/.openai", { recursive: true });

async function copyWebAssets(source, destination) {
  await mkdir(destination, { recursive: true });
  const entries = await readdir(source, { withFileTypes: true });
  await Promise.all(entries
    .filter(entry => entry.isFile() && entry.name.endsWith(".webp"))
    .map(entry => copyFile(`${source}/${entry.name}`, `${destination}/${entry.name}`)));
}

await Promise.all([
  copyWebAssets("assets/company-logos", "dist/client/assets/company-logos"),
  copyWebAssets("assets/icons", "dist/client/assets/icons"),
  cp("data", "dist/client/data", { recursive: true }),
  copyFile(".openai/hosting.json", "dist/.openai/hosting.json"),
]);

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async entry => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? collectFiles(path) : [path];
  }));
  return nested.flat();
}

const clientRoot = resolve("dist/client");
const files = await collectFiles(clientRoot);
const assets = Object.fromEntries(await Promise.all(files.map(async file => {
  const pathname = `/${relative(clientRoot, file).split(sep).join("/")}`;
  const body = (await readFile(file)).toString("base64");
  return [pathname, {
    body,
    contentType: contentTypes[extname(file)] || "application/octet-stream",
  }];
})));

assets["/"] = assets["/index.html"];

const workerSource = `
const assets = ${JSON.stringify(assets)};

function decodeBase64(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    let pathname;
    try {
      pathname = decodeURIComponent(url.pathname);
    } catch {
      return new Response("Bad request", { status: 400 });
    }

    const asset = assets[pathname] || assets["/index.html"];
    const headers = {
      "cache-control": pathname === "/" || pathname === "/index.html"
        ? "no-cache"
        : "public, max-age=31536000, immutable",
      "content-type": asset.contentType,
      "x-content-type-options": "nosniff",
    };
    const body = request.method === "HEAD" ? null : decodeBase64(asset.body);
    return new Response(body, { status: 200, headers });
  },
};
`;

await writeFile("dist/server/index.js", workerSource);
