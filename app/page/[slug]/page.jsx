import { notFound } from "next/navigation";
import { getPageBySlug, pages, resolveScenarioConfig } from "@/lib/siteData";
import { TestPage } from "@/lib/TestPage";

export function generateStaticParams() {
  return pages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const page = getPageBySlug(slug);
  return {
    title: page ? `${page.title} - Visdiff Lab` : "Page - Visdiff Lab"
  };
}

export default async function ContentPage({ params, searchParams }) {
  const { slug } = await params;
  const query = await searchParams;
  const page = getPageBySlug(slug);
  if (!page) notFound();

  const config = resolveScenarioConfig("baseline", query);
  if (config.disabled) notFound();

  return <TestPage page={page} config={config} scenarioId="baseline" />;
}
