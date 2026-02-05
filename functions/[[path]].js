export async function onRequest(context) {
  const url = new URL(context.request.url);

  // 只处理 /nsxxxx 或 /nsxxxx/... 这种路径
  const m = url.pathname.match(/^\/(ns[0-9A-Za-z_-]+)(\/.*)?$/);
  if (!m) return context.next(); // 非 ns 路径交回静态资源/其他函数

  const rest = m[2] || "/";

  // /ns12345/ 映射到 /index.html
  url.pathname = (rest === "/" || rest === "") ? "/index.html" : rest;

  // 用 ASSETS.fetch 取真正静态文件（/apply.html 等）
  const req = new Request(url.toString(), context.request);
  return context.env.ASSETS.fetch(req);
}
