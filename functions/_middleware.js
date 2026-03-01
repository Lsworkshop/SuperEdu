export async function onRequest(context) {
  const request = context.request;
  const url = new URL(request.url);
  const userAgent = request.headers.get("user-agent") || "";

  const isMobile = /iphone|android|mobile/i.test(userAgent);

  // 防止已在 app 域名上时重复跳转
  if (isMobile && !url.hostname.includes("cfsapp")) {
    const redirectUrl = new URL(url.toString());
    redirectUrl.hostname = "cfsapp.lsfinova.com";

    return Response.redirect(redirectUrl.toString(), 302);
  }

  return context.next();
}