export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    /* ---------- Token Required ---------- */
    if (!token) {
      return new Response(
        "Invalid verification link.",
        { status: 400 }
      );
    }

    /* ---------- Find Verification Record ---------- */
    const record = await env.DB
      .prepare(`
        SELECT
          ev.id,
          ev.member_id,
          ev.email,
          ev.expires_at,
          ev.used
        FROM email_verifications ev
        WHERE ev.token = ?
      `)
      .bind(token)
      .first();

    if (!record) {
      return new Response(
        "This verification link is invalid or has already been used.",
        { status: 400 }
      );
    }

    /* ---------- Already Used ---------- */
    if (record.used === 1) {
      return new Response(
        "This verification link has already been used.",
        { status: 400 }
      );
    }

    /* ---------- Expired ---------- */
    const now = Date.now();
    const expiresAt = new Date(record.expires_at).getTime();

    if (now > expiresAt) {
      return new Response(
        "This verification link has expired. Please register again.",
        { status: 400 }
      );
    }

    /* ---------- Mark Member Verified ---------- */
    await env.DB
      .prepare(`
        UPDATE members
        SET is_verified = 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE member_id = ?
      `)
      .bind(record.member_id)
      .run();

    /* ---------- Mark Token Used ---------- */
    await env.DB
      .prepare(`
        UPDATE email_verifications
        SET used = 1
        WHERE id = ?
      `)
      .bind(record.id)
      .run();

    /* ---------- Success Page ---------- */
    return new Response(
      `
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>Email Verified</title>
          <meta http-equiv="refresh" content="3;url=/login.html" />
          <style>
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont;
              background: #f8fafc;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
            }
            .box {
              background: #fff;
              padding: 32px;
              border-radius: 12px;
              box-shadow: 0 10px 30px rgba(0,0,0,.08);
              text-align: center;
              max-width: 420px;
            }
            h1 { color: #16a34a; }
            p { color: #334155; }
          </style>
        </head>
        <body>
          <div class="box">
            <h1>✅ Email Verified</h1>
            <p>Your email has been successfully verified.</p>
            <p>Redirecting to login…</p>
          </div>
        </body>
      </html>
      `,
      {
        status: 200,
        headers: { "Content-Type": "text/html" }
      }
    );

  } catch (err) {
    console.error("Verify Email Error:", err);

    return new Response(
      "Verification failed. Please try again later.",
      { status: 500 }
    );
  }
}
