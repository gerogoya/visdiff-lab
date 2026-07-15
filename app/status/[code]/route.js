import { buildStatusHtml, normalizeStatusCode } from "@/lib/statusHtml";

export async function GET(_request, context) {
  const { code } = await context.params;
  const status = normalizeStatusCode(code);
  return new Response(buildStatusHtml({ status }), {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8"
    }
  });
}
