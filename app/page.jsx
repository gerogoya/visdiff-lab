import Link from "next/link";
import { pages, scenarios } from "@/lib/siteData";

export default function HomePage() {
  return (
    <main className="shell">
      <header className="site-header">
        <Link className="brand" href="/">Visdiff Lab</Link>
        <nav className="main-nav" aria-label="Main navigation">
          <Link href="/page/page-01">Page 01</Link>
          <Link href="/page/page-10">Page 10</Link>
          <Link href="/page/page-25">Page 25</Link>
          <Link href="/admin">Admin</Link>
        </nav>
      </header>

      <section className="hero">
        <div>
          <p className="eyebrow">Visual regression fixture</p>
          <h1>Visdiff Lab</h1>
          <p>
            A small controlled site with predictable pages, images, menus, footers,
            responsive layouts, animations, and intentional HTTP errors.
          </p>
          <div className="actions">
            <Link className="button primary" href="/admin">Open admin controls</Link>
            <Link className="button" href="/sitemap.xml">View sitemap</Link>
          </div>
        </div>
        <img src="/assets/lab-1.svg" alt="Abstract test content" />
      </section>

      <section className="content-grid">
        <article className="panel">
          <h2>50 pages</h2>
          <p>
            Use these URLs as a stable page inventory for baseline and target runs.
          </p>
          <div className="link-grid">
            {pages.slice(0, 12).map((page) => (
              <Link key={page.slug} href={`/page/${page.slug}`}>{page.title}</Link>
            ))}
          </div>
        </article>

        <article className="panel">
          <h2>Scenario base URLs</h2>
          <p>
            Point a target run at a scenario base URL to generate visual differences.
          </p>
          <div className="link-grid">
            {scenarios.filter((scenario) => scenario.id !== "baseline").slice(0, 8).map((scenario) => (
              <Link key={scenario.id} href={`/scenario/${scenario.id}/page/page-01`}>
                {scenario.label}
              </Link>
            ))}
          </div>
        </article>
      </section>

      <footer className="site-footer">
        <span>Visdiff Lab</span>
        <Link href="/status/500">HTTP 500 test</Link>
      </footer>
    </main>
  );
}
