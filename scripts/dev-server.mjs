import { createServer } from "node:http";
import worker from "../src/worker.js";

const port = Number(process.env.PORT || 3100);

createServer(async (req, res) => {
  const requestBody = await readRequestBody(req);
  const request = new Request(`http://127.0.0.1:${port}${req.url}`, {
    method: req.method,
    headers: req.headers,
    body: requestBody
  });
  const response = await worker.fetch(request, process.env);
  const responseBody = Buffer.from(await response.arrayBuffer());

  res.writeHead(response.status, Object.fromEntries(response.headers));
  res.end(responseBody);
}).listen(port, "127.0.0.1", () => {
  console.log(`Visdiff Lab dev server: http://127.0.0.1:${port}`);
});

function readRequestBody(req) {
  if (req.method === "GET" || req.method === "HEAD") return null;
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}
