export async function onRequest(context) {
  const userAgent = context.request.headers.get("user-agent") || "";

  const isMobile = /iphone|android|mobile/i.test(userAgent);

  if (isMobile) {
    return Response.redirect("https://cfsapp.finovawm.com", 302);
  }

  return context.next();
}