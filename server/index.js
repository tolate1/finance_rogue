import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const clientRoot = resolve(process.cwd(), "dist/client");
const fallbackFile = join(clientRoot, "index.html");
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

function resolveAsset(pathname) {
  const decoded = decodeURIComponent(pathname.split("?")[0]);
  const relative = normalize(decoded).replace(/^(\.\.(\/|\\|$))+/, "").replace(/^[/\\]+/, "");
  const candidate = resolve(clientRoot, relative || "index.html");

  if (!candidate.startsWith(clientRoot)) return null;
  if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  return fallbackFile;
}

function requestHandler(request, response) {
  const file = resolveAsset(request.url || "/");
  if (!file || !existsSync(file)) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  response.writeHead(200, {
    "cache-control": file === fallbackFile ? "no-cache" : "public, max-age=31536000, immutable",
    "content-type": contentTypes[extname(file)] || "application/octet-stream",
    "x-content-type-options": "nosniff",
  });
  createReadStream(file).pipe(response);
}

const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "0.0.0.0";

createServer(requestHandler).listen(port, host, () => {
  console.log(`Finance Roguelike listening on http://${host}:${port}`);
});

export default requestHandler;
