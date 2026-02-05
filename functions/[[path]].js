export async function onRequest(context) {
  const url = new URL(context.request.url);

  // 只处理 /nsxxxx 或 /nsxxxx/... 这种路径
  const m = url.pathname.match(/^\/(ns[0-9A-Za-z_-]+)(\/.*)?$/);
  if (!m) {
    // 不是 ns 前缀，交给静态资源或其他更具体的 functions
    return context.next();
  }

  const ns = m[1];
  const rest = m[2] || "/";

  // 映射到真实静态文件路径
  url.pathname = (rest === "/" || rest === "") ? "/index.html" : rest;

  // 关键：用 ASSETS.fetch 取静态资源（最稳）
  const req = new Request(url.toString(), context.request);
  const resp = await context.env.ASSETS.fetch(req);

  // 调试用：你可以在浏览器 Network 里看到这个 header
  const newResp = new Response(resp.body, resp);
  newResp.headers.set("x-finova-ns", ns);
  newResp.headers.set("x-finova-mapped", url.pathname);
  return newResp;
}
