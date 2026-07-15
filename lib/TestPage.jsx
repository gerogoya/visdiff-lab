import Link from "next/link";
import { pages } from "./siteData";

export function TestPage({ page, config, scenarioId }) {
  const classes = [
    "shell",
    "test-page",
    `accent-${page.accent}`,
    config.largeImages ? "large-images" : "",
    config.hideImages ? "hide-images" : "",
    config.breakMobile ? "broken-mobile" : "",
    config.animate ? "animation-on" : "",
    config.layoutShift ? "layout-shift" : ""
  ].filter(Boolean).join(" ");

  return (
    <main className={classes}>
      <header className="site-header">
        <Link className="brand" href="/">Visdiff Lab</Link>
        {!config.hideMenu && (
          <nav className="main-nav" aria-label="Main navigation">
            <Link href="/page/page-01">Page 01</Link>
            <Link href="/page/page-10">Page 10</Link>
            <Link href="/page/page-25">Page 25</Link>
            <Link href="/page/page-50">Page 50</Link>
            <Link href="/admin">Admin</Link>
          </nav>
        )}
      </header>

      <section className="hero content-hero">
        <div>
          <p className="eyebrow">Scenario: {scenarioId}</p>
          <h1>{config.textChange ? `${page.title} updated` : page.title}</h1>
          <p>
            {config.textChange
              ? `Changed copy for ${page.topic}. This should create a clear text diff for Visdiff.`
              : page.summary}
          </p>
          <div className="actions">
            <Link className="button primary" href={`/page/${page.slug}`}>Baseline page</Link>
            <Link className="button" href="/admin">Admin controls</Link>
          </div>
        </div>
        {!config.hideImages && <img src={page.image} alt={`${page.topic} sample`} />}
      </section>

      {config.animate && <div className="moving-banner">Animated banner for screenshot stability tests</div>}

      <section className="split">
        <div>
          <h2>50/50 layout block</h2>
          <p>
            This section exists to catch column shifts, image sizing changes, and responsive stacking issues.
          </p>
          <ul>
            <li>Stable heading and paragraph text</li>
            <li>Predictable links and buttons</li>
            <li>Repeatable image and card layout</li>
          </ul>
        </div>
        <div className="metric-box">
          <span>Page</span>
          <strong>{String(page.number).padStart(2, "0")}</strong>
          <small>{page.topic}</small>
        </div>
      </section>

      <section className="cards">
        {pages.slice(page.number % 8, (page.number % 8) + 6).map((item) => (
          <article key={item.slug} className="mini-card">
            <h3>{item.topic}</h3>
            <p>{item.summary}</p>
            <Link href={`/page/${item.slug}`}>Open {item.slug}</Link>
          </article>
        ))}
      </section>

      <section className="slider-strip" aria-label="Static slider samples">
        <div>Slide A</div>
        <div>Slide B</div>
        <div>Slide C</div>
      </section>

      {!config.hideFooter && (
        <footer className="site-footer">
          <span>Footer content for {page.title}</span>
          <Link href="/status/400">HTTP 400</Link>
          <Link href="/status/500">HTTP 500</Link>
        </footer>
      )}
    </main>
  );
}
