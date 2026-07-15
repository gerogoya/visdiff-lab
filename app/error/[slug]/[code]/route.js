import { getPageBySlug } from "@/lib/siteData";
import { buildStatusHtml, normalizeStatusCode } from "@/lib/statusHtml";

export async function GET(_request, context) {
  const { slug, code } = await context.params;
  const status = normalizeStatusCode(code);
  const page = getPageBySlug(slug);

  return new Response(buildStatusHtml({ status, page }), {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8"
    }
  });
}
