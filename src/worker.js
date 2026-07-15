const topics = ["Admissions", "Campus Life", "Events", "Support", "Library", "Research", "Alumni", "Careers", "Wellness", "News"];
const scenarios = [
  ["baseline", "Baseline"],
  ["missing-menu", "Missing menu"],
  ["missing-footer", "Missing footer"],
  ["no-images", "No images"],
  ["large-images", "Large images"],
  ["text-change", "Text changed"],
  ["broken-mobile", "Broken mobile"],
  ["animation-on", "Animation on"],
  ["layout-shift", "Layout shift"],
  ["deactivated-pages", "Some pages disabled"],
  ["mixed-regression", "Mixed regression"]
];
const pages = Array.from({ length: 50 }, (_, index) => {
  const number = index + 1;
  const padded = String(number).padStart(2, "0");
  const topic = topics[index % topics.length];
  return {
    number,
    slug: `page-${padded}`,
    title: `${topic} Page ${padded}`,
    topic,
    summary: `Sample ${topic.toLowerCase()} content for visual regression testing page ${padded}.`,
    image: `/assets/lab-${(index % 4) + 1}.svg`,
    accent: ["teal", "blue", "rose", "amber", "green"][index % 5]
  };
});

export default {
  async fetch(request) {
    const url = new URL(request.url);
    return route(url);
  }
};

function route(url) {
  const path = clean(url.pathname);
  if (path === "/assets/site.css") return text(css(), 200, "text/css; charset=utf-8");
  if (/^\/assets\/lab-[1-4]\.svg$/.test(path)) return svg(path);
  if (path === "/") return html(home(url.origin));
  if (path === "/admin") return html(admin(url.origin));
  if (path === "/sitemap.xml") return xml(sitemap(url.origin, ""));

  const scenarioSitemap = path.match(/^\/scenario\/([^/]+)\/sitemap\.xml$/);
  if (scenarioSitemap) {
    if (!hasScenario(scenarioSitemap[1])) return status(404);
    return xml(sitemap(url.origin, `/scenario/${scenarioSitemap[1]}`));
  }

  const pageMatch = path.match(/^\/page\/(page-\d{2})$/);
  if (pageMatch) return pageResponse("baseline", pageMatch[1], url.searchParams);

  const scenarioPage = path.match(/^\/scenario\/([^/]+)\/page\/(page-\d{2})$/);
  if (scenarioPage) {
    if (!hasScenario(scenarioPage[1])) return status(404);
    return pageResponse(scenarioPage[1], scenarioPage[2], url.searchParams);
  }

  const statusMatch = path.match(/^\/status\/(400|404|500|503)$/);
  if (statusMatch) return status(Number(statusMatch[1]));

  const errorMatch = path.match(/^\/error\/(page-\d{2})\/(400|404|500|503)$/);
  if (errorMatch) return status(Number(errorMatch[2]), getPage(errorMatch[1]));

  return status(404);
}

function pageResponse(scenario, slug, params) {
  const page = getPage(slug);
  if (!page) return status(404);
  const config = configFor(scenario, params, page);
  if (config.disabled) return status(404, page);
  return html(testPage(page, scenario, config));
}

function home(origin) {
  const pageLinks = pages.slice(0, 12).map((page) => `<a href="/page/${page.slug}">${esc(page.title)}</a>`).join("");
  const scenarioLinks = scenarios.filter(([id]) => id !== "baseline").slice(0, 8)
    .map(([id, label]) => `<a href="/scenario/${id}/page/page-01">${esc(label)}</a>`).join("");
  return layout("Visdiff Lab", `
    <header class="site-header">${brand()}<nav class="main-nav"><a href="/page/page-01">Page 01</a><a href="/page/page-10">Page 10</a><a href="/page/page-25">Page 25</a><a href="/admin">Admin</a></nav></header>
    <section class="hero"><div><p class="eyebrow">Visual regression fixture</p><h1>Visdiff Lab</h1><p>A small controlled site with predictable pages, images, menus, footers, responsive layouts, animations, and intentional HTTP errors.</p><div class="actions"><a class="button primary" href="/admin">Open admin controls</a><a class="button" href="/sitemap.xml">View sitemap</a></div></div><img src="/assets/lab-1.svg" alt="Abstract test content"></section>
    <section class="content-grid"><article class="panel"><h2>50 pages</h2><p>Use these URLs as a stable page inventory for baseline and target runs.</p><div class="link-grid">${pageLinks}</div></article><article class="panel"><h2>Scenario base URLs</h2><p>Point a target run at a scenario base URL to generate visual differences.</p><div class="link-grid">${scenarioLinks}</div></article></section>
    <footer class="site-footer"><span>${esc(origin)}</span><a href="/status/500">HTTP 500 test</a></footer>`);
}

function admin(origin) {
  const pageOptions = pages.map((page) => `<option value="${page.slug}">${esc(page.title)}</option>`).join("");
  const scenarioOptions = scenarios.map(([id, label]) => `<option value="${id}"${id === "mixed-regression" ? " selected" : ""}>${esc(label)}</option>`).join("");
  return layout("Admin - Visdiff Lab", `
    <header class="site-header">${brand()}<nav class="main-nav"><a href="/page/page-01">Pages</a><a href="/sitemap.xml">Sitemap</a></nav></header>
    <section class="admin-header"><p class="eyebrow">Control panel</p><h1>Test controls</h1><p>Build URLs for baseline, target scenarios, visual changes, disabled pages, and real HTTP status responses.</p></section>
    <section class="admin-grid">
      <article class="panel"><h2>Scenario</h2><label class="field">Scenario preset<select id="scenario">${scenarioOptions}</select></label><label class="field">Page<select id="page">${pageOptions}</select></label><label class="field">HTTP status<select id="status"><option value="400">400 Bad Request</option><option value="404">404 Not Found</option><option value="500" selected>500 Server Error</option><option value="503">503 Service Unavailable</option></select></label></article>
      <article class="panel"><h2>Custom visual toggles</h2>${toggle("hideMenu", "Hide main menu")}${toggle("hideFooter", "Hide footer", true)}${toggle("hideImages", "Hide images")}${toggle("largeImages", "Large images", true)}${toggle("textChange", "Change text", true)}${toggle("breakMobile", "Break mobile layout")}${toggle("animate", "Enable animation")}${toggle("layoutShift", "Shift layout")}</article>
      <article class="panel wide"><h2>URLs for Visdiff</h2><div id="urlRows"></div></article>
      <article class="panel wide"><h2>Preview</h2><iframe id="preview" title="Scenario preview" class="preview-frame"></iframe></article>
    </section>
    <script>
      const origin=${JSON.stringify(origin)};
      const controls=["hideMenu","hideFooter","hideImages","largeImages","textChange","breakMobile","animate","layoutShift"];
      const val=(id)=>document.getElementById(id).value;
      function query(){const p=new URLSearchParams();controls.forEach((id)=>{if(document.getElementById(id).checked)p.set(id,"1")});return p.toString()}
      function row(label,url){return '<div class="url-row"><span>'+label+'</span><code>'+url+'</code><a class="button small" href="'+url+'" target="_blank" rel="noreferrer">Open</a></div>'}
      function render(){const s=val("scenario"),p=val("page"),st=val("status"),q=query();const custom=origin+"/page/"+p+(q?"?"+q:"");const rows=[["Baseline base URL",origin],["Target scenario base URL",origin+"/scenario/"+s],["Baseline sitemap",origin+"/sitemap.xml"],["Scenario sitemap",origin+"/scenario/"+s+"/sitemap.xml"],["Baseline page",origin+"/page/"+p],["Scenario page",origin+"/scenario/"+s+"/page/"+p],["Custom query page",custom],["Disabled page 404",origin+"/page/"+p+"?disabled=1"],["Generic HTTP status",origin+"/status/"+st],["Page-specific HTTP status",origin+"/error/"+p+"/"+st]];document.getElementById("urlRows").innerHTML=rows.map(([l,u])=>row(l,u)).join("");document.getElementById("preview").src="/scenario/"+s+"/page/"+p}
      document.querySelectorAll("select,input").forEach((el)=>el.addEventListener("change",render));render();
    </script>`);
}

function testPage(page, scenario, config) {
  const heroClass = ["hero", "content-hero", `accent-${page.accent}`, config.largeImages && "large-images", config.hideImages && "hide-images", config.breakMobile && "broken-mobile"].filter(Boolean).join(" ");
  const related = pages.slice(page.number % 8, (page.number % 8) + 6);
  return layout(`${page.title} - Visdiff Lab`, `
    <header class="site-header">${brand()}${config.hideMenu ? "" : `<nav class="main-nav"><a href="/page/page-01">Page 01</a><a href="/page/page-10">Page 10</a><a href="/page/page-25">Page 25</a><a href="/page/page-50">Page 50</a><a href="/admin">Admin</a></nav>`}</header>
    <section class="${heroClass}"><div><p class="eyebrow">Scenario: ${esc(scenario)}</p><h1>${esc(config.textChange ? `${page.title} updated` : page.title)}</h1><p>${esc(config.textChange ? `Changed copy for ${page.topic}. This should create a clear text diff for Visdiff.` : page.summary)}</p><div class="actions"><a class="button primary" href="/page/${page.slug}">Baseline page</a><a class="button" href="/admin">Admin controls</a></div></div>${config.hideImages ? "" : `<img src="${page.image}" alt="${esc(page.topic)} sample">`}</section>
    ${config.animate ? `<div class="moving-banner">Animated banner for screenshot stability tests</div>` : ""}
    <section class="split ${config.layoutShift ? "layout-shift" : ""}"><div><h2>50/50 layout block</h2><p>This section exists to catch column shifts, image sizing changes, and responsive stacking issues.</p><ul><li>Stable heading and paragraph text</li><li>Predictable links and buttons</li><li>Repeatable image and card layout</li></ul></div><div class="metric-box"><span>Page</span><strong>${String(page.number).padStart(2, "0")}</strong><small>${esc(page.topic)}</small></div></section>
    <section class="cards ${config.layoutShift ? "layout-shift" : ""}">${related.map((item) => `<article class="mini-card"><h3>${esc(item.topic)}</h3><p>${esc(item.summary)}</p><a href="/page/${item.slug}">Open ${item.slug}</a></article>`).join("")}</section>
    <section class="slider-strip"><div>Slide A</div><div>Slide B</div><div>Slide C</div></section>
    ${config.hideFooter ? "" : `<footer class="site-footer"><span>Footer content for ${esc(page.title)}</span><a href="/status/400">HTTP 400</a><a href="/status/500">HTTP 500</a></footer>`}`);
}

function status(code, page = pages[0]) {
  const title = code === 400 ? "Bad Request" : code === 404 ? "Not Found" : code === 503 ? "Service Unavailable" : "Server Error";
  return html(layout(`${title} - Visdiff Lab`, `
    <header class="site-header">${brand()}<nav class="main-nav"><a href="/admin">Admin</a><a href="/sitemap.xml">Sitemap</a></nav></header>
    <section class="status-page"><p class="eyebrow">HTTP ${code}</p><h1>${esc(title)}</h1><p>This response intentionally returns HTTP ${code}. It is tied to ${esc(page.title)} so Visdiff can validate technical failures and page-specific error states.</p><div class="content-grid"><article class="panel"><h2>Page</h2><p>${esc(page.slug)}</p></article><article class="panel"><h2>Status</h2><p>${code}</p></article></div></section>`), code);
}

function configFor(scenario, params, page) {
  const c = { hideMenu: false, hideFooter: false, hideImages: false, largeImages: false, textChange: false, breakMobile: false, animate: false, layoutShift: false, disabled: params.get("disabled") === "1" };
  if (scenario === "missing-menu") c.hideMenu = true;
  if (scenario === "missing-footer") c.hideFooter = true;
  if (scenario === "no-images") c.hideImages = true;
  if (scenario === "large-images") c.largeImages = true;
  if (scenario === "text-change") c.textChange = true;
  if (scenario === "broken-mobile") c.breakMobile = true;
  if (scenario === "animation-on") c.animate = true;
  if (scenario === "layout-shift") c.layoutShift = true;
  if (scenario === "deactivated-pages") c.disabled = page.number % 10 === 0;
  if (scenario === "mixed-regression") Object.assign(c, { hideFooter: true, largeImages: true, textChange: true, layoutShift: true });
  Object.keys(c).forEach((key) => {
    if (params.get(key) === "1") c[key] = true;
    if (params.get(key) === "0") c[key] = false;
  });
  return c;
}

function layout(title, body) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(title)}</title><meta name="description" content="A simple visual regression fixture site for Visdiff."><link rel="stylesheet" href="/assets/site.css"></head><body><main class="shell">${body}</main></body></html>`;
}

function brand() {
  return `<a class="brand" href="/">Visdiff Lab</a>`;
}

function sitemap(origin, prefix) {
  const items = pages.map((page) => `  <url><loc>${esc(`${origin}${prefix}/page/${page.slug}`)}</loc><changefreq>weekly</changefreq></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</urlset>\n`;
}

function css() {
  return `:root{--ink:#17211f;--muted:#5c6d68;--line:#d7e1dd;--surface:#fff;--soft:#f3f7f5;--teal:#0f766e;--blue:#4866c9;--rose:#c4483d;--amber:#b98016;--green:#2f805c}*{box-sizing:border-box}body{margin:0;background:#f8fbfa;color:var(--ink);font-family:Arial,Helvetica,sans-serif}a{color:inherit}.shell{width:min(1180px,calc(100% - 32px));margin:0 auto;padding:22px 0 34px}.site-header,.site-footer{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px 0}.site-header{border-bottom:1px solid var(--line)}.site-footer{border-top:1px solid var(--line);margin-top:34px;color:var(--muted)}.brand{color:var(--teal);font-size:22px;font-weight:800;text-decoration:none}.main-nav{display:flex;flex-wrap:wrap;gap:14px}.main-nav a,.site-footer a,.mini-card a{color:var(--teal);font-weight:700;text-decoration:none}.hero{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(280px,.95fr);align-items:center;gap:34px;padding:52px 0 28px}.content-hero{padding-top:34px}.hero h1,.admin-header h1,.status-page h1{margin:0;font-size:clamp(40px,8vw,86px);line-height:.96;letter-spacing:0}.hero p,.admin-header p,.status-page p{color:var(--muted);font-size:18px;line-height:1.6;max-width:690px}.eyebrow{margin:0 0 12px;color:var(--teal);font-size:13px;font-weight:800;letter-spacing:0;text-transform:uppercase}.hero img{display:block;width:100%;max-height:420px;object-fit:cover;border:1px solid var(--line);border-radius:8px}.actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:24px}.button{display:inline-flex;align-items:center;justify-content:center;min-height:42px;padding:0 16px;border:1px solid var(--line);border-radius:6px;background:#fff;color:var(--ink);font-weight:800;text-decoration:none}.button.primary{border-color:var(--teal);background:var(--teal);color:#fff}.button.small{min-height:32px;padding:0 10px;font-size:13px}.content-grid,.admin-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;margin-top:28px}.admin-grid{align-items:start}.panel{padding:22px;background:var(--surface);border:1px solid var(--line);border-radius:8px}.panel.wide{grid-column:1/-1}.panel h2{margin:0 0 10px;font-size:24px;letter-spacing:0}.panel p,.mini-card p,.split p,.split li{color:var(--muted);line-height:1.55}.link-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:18px}.link-grid a{padding:10px 12px;background:var(--soft);border-radius:6px;color:var(--teal);font-weight:700;text-decoration:none}.split{display:grid;grid-template-columns:1fr 320px;gap:26px;align-items:stretch;margin-top:28px;padding:26px;background:var(--soft);border-radius:8px}.metric-box{display:grid;place-items:center;min-height:220px;border-radius:8px;background:#fff;border:1px solid var(--line);text-align:center}.metric-box strong{font-size:72px;line-height:1;letter-spacing:0}.metric-box span,.metric-box small{color:var(--muted);font-weight:700}.cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin-top:24px}.mini-card{min-height:170px;padding:18px;background:#fff;border:1px solid var(--line);border-radius:8px}.mini-card h3{margin:0 0 8px}.slider-strip{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:24px}.slider-strip div{display:grid;min-height:120px;place-items:center;border-radius:8px;color:#fff;font-size:24px;font-weight:800}.slider-strip div:nth-child(1){background:var(--teal)}.slider-strip div:nth-child(2){background:var(--blue)}.slider-strip div:nth-child(3){background:var(--rose)}.large-images{grid-template-columns:minmax(280px,.75fr) minmax(360px,1.25fr)}.large-images img{min-height:500px}.hide-images{grid-template-columns:1fr}.layout-shift.split{grid-template-columns:300px 1fr}.layout-shift.cards{grid-template-columns:1.4fr .8fr 1fr}.moving-banner{margin:10px 0 24px;padding:14px;border-radius:8px;background:#fff1c2;color:#664400;font-weight:800;animation:slide-banner 2.4s linear infinite alternate}@keyframes slide-banner{from{transform:translateX(0)}to{transform:translateX(34px)}}.admin-header{padding:38px 0 10px}.field{display:grid;gap:8px;margin-top:16px;color:var(--muted);font-weight:800}select{min-height:42px;border:1px solid var(--line);border-radius:6px;background:#fff;color:var(--ink);font:inherit;padding:0 12px}.check{display:flex;align-items:center;gap:10px;margin:12px 0;font-weight:700}.check input{width:18px;height:18px}.url-row{display:grid;grid-template-columns:210px minmax(0,1fr) auto;align-items:center;gap:12px;padding:10px 0;border-top:1px solid var(--line)}.url-row span{color:var(--muted);font-weight:800}.url-row code{overflow-wrap:anywhere;padding:8px 10px;border-radius:6px;background:var(--soft)}.preview-frame{width:100%;min-height:560px;border:1px solid var(--line);border-radius:8px;background:#fff}.status-page{margin-top:44px;padding:42px;border:1px solid var(--line);border-radius:8px;background:#fff}@media(max-width:760px){.site-header,.site-footer{align-items:flex-start;flex-direction:column}.hero,.content-grid,.admin-grid,.split,.cards,.slider-strip{grid-template-columns:1fr}.hero h1,.admin-header h1,.status-page h1{font-size:42px}.url-row{grid-template-columns:1fr}.broken-mobile,.broken-mobile.split{grid-template-columns:640px 640px}.broken-mobile .site-header{width:980px}}`;
}

function svg(path) {
  const id = Number(path.match(/lab-(\d)/)[1]);
  const c = [["#e8f5f1", "#0f766e", "#b8dfd7", "#f2b84b"], ["#edf2ff", "#4866c9", "#b7c4f2", "#f6c65b"], ["#fff4f2", "#d45445", "#f2a29a", "#ffce86"], ["#f7f6eb", "#2f805c", "#5fb0a0", "#f0b13d"]][id - 1];
  return text(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520" role="img" aria-label="Lab sample ${id}"><rect width="800" height="520" fill="${c[0]}"/><rect x="70" y="80" width="660" height="360" rx="18" fill="#fff" stroke="${c[1]}" stroke-width="8"/><circle cx="230" cy="250" r="92" fill="${c[1]}"/><rect x="380" y="150" width="260" height="42" fill="${c[2]}"/><rect x="380" y="226" width="310" height="42" fill="${c[3]}"/><rect x="380" y="302" width="190" height="42" fill="${c[1]}"/></svg>`, 200, "image/svg+xml; charset=utf-8");
}

function html(body, code = 200) {
  return text(body, code, "text/html; charset=utf-8");
}

function xml(body) {
  return text(body, 200, "application/xml; charset=utf-8");
}

function text(body, code, type) {
  return new Response(body, { status: code, headers: { "content-type": type, "cache-control": "no-store" } });
}

function toggle(id, label, checked = false) {
  return `<label class="check"><input id="${id}" type="checkbox"${checked ? " checked" : ""}><span>${esc(label)}</span></label>`;
}

function getPage(slug) {
  return pages.find((page) => page.slug === slug);
}

function hasScenario(id) {
  return scenarios.some(([scenarioId]) => scenarioId === id);
}

function clean(path) {
  return path.endsWith("/") && path !== "/" ? path.slice(0, -1) : path;
}

function esc(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
