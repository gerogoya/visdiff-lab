import Link from "next/link";

export default function NotFound() {
  return (
    <main className="shell">
      <header className="site-header">
        <Link className="brand" href="/">Visdiff Lab</Link>
        <nav className="main-nav" aria-label="Main navigation">
          <Link href="/admin">Admin</Link>
          <Link href="/sitemap.xml">Sitemap</Link>
        </nav>
      </header>
      <section className="status-page">
        <p className="eyebrow">HTTP 404</p>
        <h1>Page not found</h1>
        <p>This route is intentionally useful for testing missing pages in Visdiff.</p>
        <Link className="button primary" href="/admin">Back to admin</Link>
      </section>
    </main>
  );
}
