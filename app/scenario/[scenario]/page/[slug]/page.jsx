import { notFound } from "next/navigation";
import { getPageBySlug, pages, resolveScenarioConfig, scenarios } from "@/lib/siteData";
import { TestPage } from "@/lib/TestPage";

export function generateStaticParams() {
  return scenarios.flatMap((scenario) =>
    pages.map((page) => ({ scenario: scenario.id, slug: page.slug }))
  );
}

export async function generateMetadata({ params }) {
  const { scenario, slug } = await params;
  const page = getPageBySlug(slug);
  return {
    title: page ? `${page.title} - ${scenario} - Visdiff Lab` : "Scenario - Visdiff Lab"
  };
}

export default async function ScenarioPage({ params, searchParams }) {
  const { scenario, slug } = await params;
  const query = await searchParams;
  const page = getPageBySlug(slug);
  if (!page) notFound();

  const config = resolveScenarioConfig(scenario, query, page);
  if (config.disabled) notFound();

  return <TestPage page={page} config={config} scenarioId={scenario} />;
}
