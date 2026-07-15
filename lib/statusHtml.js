import { pages } from "./siteData";

const supportedCodes = new Set([400, 404, 500, 503]);

export function normalizeStatusCode(value) {
  const code = Number(value);
  return supportedCodes.has(code) ? code : 500;
}

export function buildSitemapXml(urls) {
  const items = urls.map((url) => {
    return [
      "  <url>",
      `    <loc>${escapeXml(url)}</loc>`,
      "    <changefreq>weekly</changefreq>",
      "  </url>"
    ].join("\n");
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</urlset>\n`;
}

export function buildStatusHtml({ status, page }) {
  const selectedPage = page ?? pages[0];
  const title = statusTitle(status);
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} - Visdiff Lab</title>
  <style>
    body { margin: 0; font-family: Arial, sans-serif; background: #f7faf9; color: #17211f; }
    .shell { width: min(1100px, calc(100% - 32px)); margin: 0 auto; padding: 24px 0; }
    .header, .footer { display: flex; justify-content: space-between; gap: 16px; padding: 18px 0; border-bottom: 1px solid #d5ded9; }
    .footer { border-top: 1px solid #d5ded9; border-bottom: 0; margin-top: 40px; }
    .brand { font-weight: 800; color: #0f5d50; text-decoration: none; }
    .status { margin-top: 48px; padding: 36px; background: #ffffff; border: 1px solid #d5ded9; border-radius: 8px; }
    .eyebrow { margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0; font-size: 13px; color: #b42318; font-weight: 700; }
    h1 { margin: 0 0 14px; font-size: clamp(34px, 7vw, 76px); line-height: 1; letter-spacing: 0; }
    p { max-width: 720px; line-height: 1.65; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 28px; }
    .card { padding: 18px; background: #eef6f3; border-radius: 8px; min-height: 110px; }
    @media (max-width: 720px) { .grid { grid-template-columns: 1fr; } .header { align-items: flex-start; flex-direction: column; } }
  </style>
</head>
<body>
  <main class="shell">
    <header class="header">
      <a class="brand" href="/">Visdiff Lab</a>
      <nav><a href="/admin">Admin</a> | <a href="/sitemap.xml">Sitemap</a></nav>
    </header>
    <section class="status">
      <p class="eyebrow">HTTP ${status}</p>
      <h1>${title}</h1>
      <p>This response intentionally returns HTTP ${status}. It is tied to ${escapeHtml(selectedPage.title)} so Visdiff can validate technical failures and page-specific error states.</p>
      <div class="grid">
        <article class="card"><strong>Page</strong><p>${escapeHtml(selectedPage.slug)}</p></article>
        <article class="card"><strong>Expected status</strong><p>${status}</p></article>
        <article class="card"><strong>Purpose</strong><p>Capture, compare, and report HTTP failures.</p></article>
      </div>
    </section>
    <footer class="footer">
      <span>Visdiff Lab status fixture</span>
      <a href="/page/page-01">Back to content</a>
    </footer>
  </main>
</body>
</html>`;
}

function statusTitle(status) {
  switch (status) {
    case 400:
      return "Bad Request";
    case 404:
      return "Not Found";
    case 503:
      return "Service Unavailable";
    default:
      return "Server Error";
  }
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeHtml(value) {
  return escapeXml(value).replace(/'/g, "&#039;");
}
