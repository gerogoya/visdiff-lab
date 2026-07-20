import worker from "../src/worker.js";

export default async function handler(req, res) {
  const protocol = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers.host || "localhost";
  const requestUrl = `${protocol}://${host}${req.url || "/"}`;
  const body = await readRequestBody(req);
  const request = new Request(requestUrl, {
    method: req.method,
    headers: req.headers,
    body
  });
  const response = await worker.fetch(request, process.env);
  const responseBody = Buffer.from(await response.arrayBuffer());

  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });
  res.status(response.status).send(responseBody);
}

function readRequestBody(req) {
  if (req.method === "GET" || req.method === "HEAD") return null;
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}
