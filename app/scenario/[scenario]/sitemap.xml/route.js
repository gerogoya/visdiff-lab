import { pages, scenarioExists } from "@/lib/siteData";
import { buildSitemapXml } from "@/lib/statusHtml";

export async function GET(request, context) {
  const { scenario } = await context.params;
  if (!scenarioExists(scenario)) {
    return new Response("Scenario not found", { status: 404 });
  }

  const origin = new URL(request.url).origin;
  const urls = pages.map((page) => `${origin}/scenario/${scenario}/page/${page.slug}`);
  return new Response(buildSitemapXml(urls), {
    status: 200,
    headers: {
      "content-type": "application/xml; charset=utf-8"
    }
  });
}
