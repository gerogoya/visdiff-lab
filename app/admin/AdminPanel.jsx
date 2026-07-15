"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { pages, scenarios } from "@/lib/siteData";

const visualOptions = [
  { id: "hideMenu", label: "Hide main menu" },
  { id: "hideFooter", label: "Hide footer" },
  { id: "hideImages", label: "Hide images" },
  { id: "largeImages", label: "Large images" },
  { id: "textChange", label: "Change text" },
  { id: "breakMobile", label: "Break mobile layout" },
  { id: "animate", label: "Enable animation" },
  { id: "layoutShift", label: "Shift layout" }
];

function buildQuery(options) {
  const params = new URLSearchParams();
  Object.entries(options).forEach(([key, value]) => {
    if (value) params.set(key, "1");
  });
  return params.toString();
}

export default function AdminPanel() {
  const [scenario, setScenario] = useState("mixed-regression");
  const [pageSlug, setPageSlug] = useState("page-01");
  const [statusCode, setStatusCode] = useState("500");
  const [customOptions, setCustomOptions] = useState({
    hideMenu: false,
    hideFooter: true,
    hideImages: false,
    largeImages: true,
    textChange: true,
    breakMobile: false,
    animate: false,
    layoutShift: false
  });

  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const selectedPage = pages.find((page) => page.slug === pageSlug) ?? pages[0];

  const urls = useMemo(() => {
    const query = buildQuery(customOptions);
    const customPath = `/page/${selectedPage.slug}${query ? `?${query}` : ""}`;
    return {
      baselineBase: origin,
      scenarioBase: `${origin}/scenario/${scenario}`,
      sitemap: `${origin}/sitemap.xml`,
      scenarioSitemap: `${origin}/scenario/${scenario}/sitemap.xml`,
      baselinePage: `${origin}/page/${selectedPage.slug}`,
      scenarioPage: `${origin}/scenario/${scenario}/page/${selectedPage.slug}`,
      customPage: `${origin}${customPath}`,
      disabledPage: `${origin}/page/${selectedPage.slug}?disabled=1`,
      statusPage: `${origin}/status/${statusCode}`,
      pageStatus: `${origin}/error/${selectedPage.slug}/${statusCode}`
    };
  }, [customOptions, origin, scenario, selectedPage.slug, statusCode]);

  const previewPath = `/scenario/${scenario}/page/${selectedPage.slug}`;

  return (
    <main className="shell admin-shell">
      <header className="site-header">
        <Link className="brand" href="/">Visdiff Lab</Link>
        <nav className="main-nav" aria-label="Main navigation">
          <Link href="/page/page-01">Pages</Link>
          <Link href="/sitemap.xml">Sitemap</Link>
        </nav>
      </header>

      <section className="admin-header">
        <div>
          <p className="eyebrow">Control panel</p>
          <h1>Test controls</h1>
          <p>
            Build URLs for baseline, target scenarios, custom visual changes, disabled pages,
            and real HTTP status responses.
          </p>
        </div>
      </section>

      <section className="admin-grid">
        <article className="panel">
          <h2>Scenario</h2>
          <label className="field">
            Scenario preset
            <select value={scenario} onChange={(event) => setScenario(event.target.value)}>
              {scenarios.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </label>

          <label className="field">
            Page
            <select value={pageSlug} onChange={(event) => setPageSlug(event.target.value)}>
              {pages.map((page) => (
                <option key={page.slug} value={page.slug}>{page.title}</option>
              ))}
            </select>
          </label>

          <label className="field">
            HTTP status
            <select value={statusCode} onChange={(event) => setStatusCode(event.target.value)}>
              <option value="400">400 Bad Request</option>
              <option value="404">404 Not Found</option>
              <option value="500">500 Server Error</option>
              <option value="503">503 Service Unavailable</option>
            </select>
          </label>
        </article>

        <article className="panel">
          <h2>Custom visual toggles</h2>
          <div className="toggle-list">
            {visualOptions.map((option) => (
              <label key={option.id} className="check">
                <input
                  type="checkbox"
                  checked={customOptions[option.id]}
                  onChange={(event) => {
                    setCustomOptions((current) => ({
                      ...current,
                      [option.id]: event.target.checked
                    }));
                  }}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </article>

        <article className="panel wide">
          <h2>URLs for Visdiff</h2>
          <UrlRow label="Baseline base URL" value={urls.baselineBase} />
          <UrlRow label="Target scenario base URL" value={urls.scenarioBase} />
          <UrlRow label="Baseline sitemap" value={urls.sitemap} />
          <UrlRow label="Scenario sitemap" value={urls.scenarioSitemap} />
          <UrlRow label="Baseline page" value={urls.baselinePage} />
          <UrlRow label="Scenario page" value={urls.scenarioPage} />
          <UrlRow label="Custom query page" value={urls.customPage} />
          <UrlRow label="Disabled page 404" value={urls.disabledPage} />
          <UrlRow label="Generic HTTP status" value={urls.statusPage} />
          <UrlRow label="Page-specific HTTP status" value={urls.pageStatus} />
        </article>

        <article className="panel wide">
          <h2>Preview</h2>
          <iframe title="Scenario preview" className="preview-frame" src={previewPath} />
        </article>
      </section>
    </main>
  );
}

function UrlRow({ label, value }) {
  return (
    <div className="url-row">
      <span>{label}</span>
      <code>{value}</code>
      <a className="button small" href={value || "#"} target="_blank" rel="noreferrer">Open</a>
    </div>
  );
}
