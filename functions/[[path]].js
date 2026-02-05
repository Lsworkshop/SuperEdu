export async function onRequest(context) {
  const url = new URL(context.request.url);

  // 只处理 /nsxxxx 或 /nsxxxx/... 
  const m = url.pathname.match(/^\/(ns[0-9A-Za-z_-]+)(\/.*)?$/);
  if (!m) return context.next();

  const rest = m[2] || "/";

  // 映射到真实静态文件
url.pathname = (rest === "/" || rest === "") ? "/home.html" : rest;

  // 取静态资源：成功就返回，不成功就交回给 Pages 默认处理
  const req = new Request(url.toString(), context.request);
  const resp = await context.env.ASSETS.fetch(req);

  if (resp.status === 404) return context.next();
  return resp;
}
