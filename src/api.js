// Backend connection lives ONLY in this file. Demo mode works without it.
// Endpoints below exist in the FastAPI issuer backend written earlier: GET /health, GET /public-key,
// POST /issue, POST /verify. Only /health is wired here. Connect the others when you are ready.
export const BACKEND_URL = 'http://localhost:8000';

export async function checkBackendHealth() {
  const res = await fetch(BACKEND_URL + '/health');
  if (!res.ok) throw new Error('Backend answered with status ' + res.status);
  return res.json();
}

// TODO: later, call POST /issue with { consent, records, ask, rate, months, margin, cap }
// and show the returned { report, signature, public_key } in the Bank page.
