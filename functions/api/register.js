export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const data = await request.json();

    const { firstName, lastName, email } = data;

    if (!firstName || !lastName || !email) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    }

    await env.DB.prepare(
      `INSERT INTO users (first_name, last_name, email, created_at)
       VALUES (?, ?, ?, datetime('now'))`
    )
      .bind(firstName, lastName, email)
      .run();

    return Response.json({ success: true });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
