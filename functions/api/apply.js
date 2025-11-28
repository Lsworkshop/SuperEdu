// apply.js
import { appendRow } from "./lib_google.js";

export async function onRequestPost({ request }) {
  try {
    const data = await request.json();
    const { firstName, lastName, email, service } = data;

    if (!firstName || !lastName || !email || !service) {
      return new Response(JSON.stringify({ success: false, message: "Missing fields" }), { status: 400 });
    }

    await appendRow("SuperEdu_Applications", [firstName, lastName, email, service, new Date().toISOString()]);

    return new Response(JSON.stringify({ success: true, message: "Application submitted successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
