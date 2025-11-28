export async function onRequestPost({ request, env }) {
  try {
    const { firstName, lastName, email, service } = await request.json();

    if (!firstName || !lastName || !email || !service) {
      return new Response(JSON.stringify({ success: false, message: "Missing fields" }), { status: 400 });
    }

    await env.DB.prepare(
      `INSERT INTO Applications (firstName, lastName, email, service, createdAt)
       VALUES (?, ?, ?, ?, ?)`
    ).bind(firstName, lastName, email, service, new Date().toISOString()).run();

    return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" }});
  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
  }
}
