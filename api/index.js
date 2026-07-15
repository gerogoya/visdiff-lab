import worker from "../src/worker.js";

export default async function handler(req, res) {
  const protocol = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers.host || "localhost";
  const requestUrl = `${protocol}://${host}${req.url || "/"}`;
  const request = new Request(requestUrl, {
    method: req.method,
    headers: req.headers
  });
  const response = await worker.fetch(request, {});
  const body = Buffer.from(await response.arrayBuffer());

  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });
  res.status(response.status).send(body);
}
