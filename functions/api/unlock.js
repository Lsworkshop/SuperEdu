export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const data = await request.json();
    const { email } = data;

    if (!email) {
      return new Response(JSON.stringify({ error: "Missing email" }), { status: 400 });
    }

    await env.DB.prepare(
      `INSERT INTO unlocks (email, created_at)
       VALUES (?, datetime('now'))`
    )
      .bind(email)
      .run();

    return Response.json({ success: true });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
