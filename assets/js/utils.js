// utils.js
// expose validation and simple fetch helper

window.supereduValidateEmail = function(email){
  if(!email || typeof email !== 'string') return false;
  // simple RFC-esque pattern
  const p = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return p.test(email);
};

window.supereduPostJSON = async function(url, payload){
  const res = await fetch(url, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(payload)
  });
  const json = await res.json().catch(()=>({}));
  return { ok: res.ok, status: res.status, body: json };
};
