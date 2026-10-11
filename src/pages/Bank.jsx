import { useEffect, useState } from 'react';
import { Status, Stat, DemoBadge } from '../components.jsx';
import { inr, summarize, assess, EMI_SHARE } from '../data.js';
import { verifyPackage } from '../crypto.js';

export default function Bank({ txs, original, profile, pkg, keys, onModify, onReset, onIssuer }) {
  const [res, setRes] = useState(null);

  useEffect(() => {
    let live = true;
    if (pkg && keys) verifyPackage(txs, pkg, keys.publicKey).then((r) => live && setRes(r));
    else setRes(null);
    return () => { live = false; };
  }, [txs, pkg, keys]);

  if (!pkg) {
    return (
      <div>
        <div className="page-head"><h2>Bank dashboard</h2><DemoBadge /></div>
        <div className="card">
          <p>Nothing received yet. The issuer has to verify and sign the history first.</p>
          <button className="btn primary" onClick={onIssuer}>Go to issuer</button>
        </div>
      </div>
    );
  }

  const ok = res && res.signatureValid && res.integrityOk;
  const changed = res && res.firstBroken >= 0 ? txs[res.firstBroken] : null;
  const before = changed ? original.find((t) => t.id === changed.id) : null;
  const s = summarize(txs);
  const a = assess(s);

  return (
    <div>
      <div className="page-head"><h2>Bank dashboard</h2><DemoBadge /></div>
      <p className="note">The bank recomputes the hash chain from the data it received and checks the issuer's signature with the public key. The applicant's own numbers are not trusted.</p>

      <div className="card profile">
        <div><b>Applicant:</b> {profile.name} (demo) · {profile.business} · {pkg.txCount} UPI credits, {s.months.length} months</div>
        <div className="note">Signed by: {pkg.issuer}</div>
      </div>

      <div className="grid2">
        <div className={'card verdict ' + (!res ? '' : ok ? 'okc' : 'failc')}>
          <h3>Verification result</h3>
          <div className="checks">
            <div><span>Signature</span>
              {!res ? <Status state="idle">Checking…</Status>
                : res.signatureValid ? <Status state="ok">Valid for this data</Status>
                : <Status state="fail">Does not match this data</Status>}</div>
            <div><span>Transaction integrity</span>
              {!res ? <Status state="idle">Checking…</Status>
                : res.integrityOk ? <Status state="ok">All {pkg.txCount} hashes match</Status>
                : <Status state="fail">Changed at {changed ? changed.id : 'a missing or extra row'}</Status>}</div>
          </div>
          {res && ok && <div className="msg ok">Verified. The history is exactly what the issuer signed.</div>}
          {res && !ok && <div className="msg fail">Verification failed. The data was changed after signing, so it cannot be relied on.</div>}
        </div>

        <div className="card">
          <h3>Tampering demonstration</h3>
          <p>Change one transaction after signing and watch the bank's check fail.</p>
          <div className="cta-row">
            <button className="btn danger" onClick={onModify}>Modify a transaction (+₹5,000)</button>
            <button className="btn ghost" onClick={onReset}>Restore original data</button>
          </div>
          {changed && before && (
            <div className="diff">
              {changed.id} on {changed.date}: signed amount <b>{inr(before.amount)}</b>, received amount <b>{inr(changed.amount)}</b>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h3>Verified cash-flow summary</h3>
        {ok ? (
          <>
            <div className="grid4">
              <Stat label="Avg monthly business receipts" value={inr(s.avgReceipts)} />
              <Stat label="Weakest month receipts" value={inr(s.weakReceipts)} />
              <Stat label="Excluded: refunds and transfers" value={inr(s.avgOther)} note="per month, average" />
              <Stat label="Indicative EMI room" value={inr(s.emiCapacity)} note={`${EMI_SHARE * 100}% of weak-month surplus`} />
            </div>
            <div className={'msg ' + (a.supported ? 'ok' : 'warn')}>
              {a.supported
                ? 'Indicative result: the verified evidence supports a first-loan discussion. This is not a loan approval.'
                : 'Indicative result: not supported yet. The data is genuine, but it is not strong enough.'}
              {!a.supported && (
                <ul className="reasons">
                  {a.reasons.map((x) => <li key={x}>{x}</li>)}
                  <li>What would help: more months of steady sales receipts from customers.</li>
                </ul>
              )}
            </div>
            <p className="note">
              Financial assessment (illustrative): based on the weakest month, estimated surplus is {inr(s.weakSurplus)}.
              Expenses are an assumption, not a measured figure. This is not a credit score, not a bureau record and not a loan decision.
            </p>
          </>
        ) : (
          <div className="msg fail">Assessment blocked because the data did not pass verification.</div>
        )}
      </div>
    </div>
  );
}
