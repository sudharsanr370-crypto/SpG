import { useState } from 'react';
import { Status, Stat, DemoBadge } from '../components.jsx';
import { inr, sanityCheck } from '../data.js';
import { checkBackendHealth } from '../api.js';

export default function Issuer({ txs, stats, pkg, ready, onIssue, onNext }) {
  const [problems, setProblems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [backend, setBackend] = useState('');

  async function verify() {
    setBusy(true);
    const p = sanityCheck(txs);
    setProblems(p);
    if (p.length === 0) await onIssue();
    setBusy(false);
  }

  async function ping() {
    setBackend('Checking…');
    try {
      const h = await checkBackendHealth();
      setBackend('Backend online: ' + h.status + ' (issuer ' + h.issuer + ')');
    } catch {
      setBackend('Backend not reachable. The demo still works without it.');
    }
  }

  const total = txs.reduce((s, t) => s + t.amount, 0);
  return (
    <div>
      <div className="page-head"><h2>Issuer verification</h2><DemoBadge /></div>
      <p className="note">Simulated issuer. In real use this would be a bank or Account Aggregator holding the private key.</p>

      <div className="grid4">
        <Stat label="Transactions received" value={txs.length} />
        <Stat label="Total credits" value={inr(total)} />
        <Stat label="Months covered" value={stats.months.length} />
        <Stat label="Weakest month receipts" value={inr(stats.weakReceipts)} />
      </div>

      <div className="card">
        <h3>Verify and sign</h3>
        <p>The issuer checks the history, builds a hash chain over every transaction, and signs the final hash.</p>
        <button className="btn primary" disabled={busy || !ready} onClick={verify}>
          {busy ? 'Verifying…' : 'Verify History'}
        </button>
        {!ready && <span className="note"> Preparing demo signing key…</span>}

        {problems.length > 0 && (
          <div className="msg fail">Not signed. {problems.join('. ')}.</div>
        )}
        {pkg && problems.length === 0 && (
          <div className="msg ok">History verified and signed by the demo issuer. Ready to send to the bank.</div>
        )}

        <div className="checks">
          <div><span>Digital signature</span>
            {pkg ? <Status state="ok">Signed ({pkg.algorithm})</Status> : <Status state="idle">Not signed yet</Status>}</div>
          <div><span>History integrity</span>
            {pkg ? <Status state="ok">Hash chain of {pkg.txCount} transactions built</Status> : <Status state="idle">Not checked yet</Status>}</div>
        </div>
        {pkg && <div className="mono">Final hash: {pkg.head}</div>}
      </div>

      <div className="cta-row">
        <button className="btn primary" disabled={!pkg} onClick={onNext}>Send signed history to bank</button>
        <button className="btn ghost" onClick={ping}>Check backend connection</button>
        {backend && <span className="note">{backend}</span>}
      </div>
    </div>
  );
}
