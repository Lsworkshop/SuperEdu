export async function onRequest(context) {
  const url = new URL(context.request.url);

  // 匹配 /ns12345 或 /ns12345/... 形式
  const m = url.pathname.match(/^\/(ns[0-9A-Za-z_-]+)(\/.*)?$/);
  if (!m) return context.next();

  const ns = m[1];
  const rest = m[2] || "/";

  // /ns12345/ 视为首页
  url.pathname = rest === "/" ? "/index.html" : rest;

  // 取真实静态资源（/index.html /apply.html 等）
  const resp = await fetch(url.toString(), context.request);

  // 可选：加个调试头，确认 ns 兜底生效
  const newResp = new Response(resp.body, resp);
  newResp.headers.set("x-finova-ns", ns);
  return newResp;
}
