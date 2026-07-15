import { pages } from "@/lib/siteData";
import { buildSitemapXml } from "@/lib/statusHtml";

export function GET(request) {
  const origin = new URL(request.url).origin;
  const urls = pages.map((page) => `${origin}/page/${page.slug}`);
  return new Response(buildSitemapXml(urls), {
    status: 200,
    headers: {
      "content-type": "application/xml; charset=utf-8"
    }
  });
}
