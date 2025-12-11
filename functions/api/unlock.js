export async function onRequestPost({ request, env }) { 
  try {
    const data = await request.json();
    const { firstName, lastName, email } = data;

    // -------------- Email Format Check --------------
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email format" }), { status: 400 });
    }

    // -------------- Required Fields --------------
    if (!firstName || !lastName || !email) {
      return new Response(JSON.stringify({ error: "Missing required fields." }), {
        status: 400,
      });
    }

    const now = new Date().toISOString();

    // -------------- Generate Soft Login Token --------------
    const token = crypto.randomUUID();  
    // Cloudflare Workers 内置 crypto 支持 UUID，无需额外库

    // -------------- Insert Into D1 --------------
    await env.DB.prepare(
      `INSERT INTO unlocks (first_Name, last_Name, email, created_At, token)
       VALUES (?, ?, ?, ?, ?)`
    )
    .bind(firstName, lastName, email, now, token)
    .run();

    // -------------- SUCCESS Response with Token --------------
    return new Response(JSON.stringify({ 
      success: true,
      token: token 
    }), { status: 200 });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500
    });
  }
}
