import { createServer } from "node:http";
import worker from "../src/worker.js";

const port = Number(process.env.PORT || 3100);

createServer(async (req, res) => {
  const request = new Request(`http://127.0.0.1:${port}${req.url}`, {
    method: req.method,
    headers: req.headers
  });
  const response = await worker.fetch(request, {});
  const body = Buffer.from(await response.arrayBuffer());

  res.writeHead(response.status, Object.fromEntries(response.headers));
  res.end(body);
}).listen(port, "127.0.0.1", () => {
  console.log(`Visdiff Lab dev server: http://127.0.0.1:${port}`);
});
