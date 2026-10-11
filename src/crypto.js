// Real hashing and signing with the browser's built-in Web Crypto. No library needed.
// The issuer here is SIMULATED inside the browser. A real bank is NOT involved.
const enc = new TextEncoder();
const toHex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
const fromHex = (h) => new Uint8Array(h.match(/.{2}/g).map((b) => parseInt(b, 16)));
const ALGO = { name: 'ECDSA', hash: 'SHA-256' };

export async function sha256(text) {
  return toHex(await crypto.subtle.digest('SHA-256', enc.encode(text)));
}

export const txLine = (t) => `${t.id}|${t.date}|${t.party}|${t.category}|${t.amount}`;

// Each hash includes the previous hash, so changing one transaction changes every hash after it.
export async function buildChain(txs) {
  const hashes = [];
  let prev = 'GENESIS';
  for (const t of txs) {
    prev = await sha256(prev + '|' + txLine(t));
    hashes.push(prev);
  }
  return hashes;
}

export function createIssuerKeys() {
  return crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign', 'verify']);
}

export async function issueHistory(txs, keys) {
  const hashes = await buildChain(txs);
  const head = hashes[hashes.length - 1];
  const sig = await crypto.subtle.sign(ALGO, keys.privateKey, enc.encode(head));
  return {
    issuer: 'DEMO ISSUER (simulated in browser)',
    algorithm: 'ECDSA P-256 + SHA-256',
    issuedAt: new Date().toISOString(),
    txCount: txs.length,
    hashes,
    head,
    signature: toHex(sig),
  };
}

// The bank recomputes everything from the transactions it received.
export async function verifyPackage(txs, pkg, publicKey) {
  const hashes = await buildChain(txs);
  const head = hashes[hashes.length - 1];
  let signatureValid = false;
  try {
    signatureValid = await crypto.subtle.verify(ALGO, publicKey, fromHex(pkg.signature), enc.encode(head));
  } catch {
    signatureValid = false;
  }
  let firstBroken = -1;
  const n = Math.max(hashes.length, pkg.hashes.length);
  for (let i = 0; i < n; i++) {
    if (hashes[i] !== pkg.hashes[i]) {
      firstBroken = i;
      break;
    }
  }
  return { signatureValid, integrityOk: firstBroken === -1, firstBroken, head };
}
