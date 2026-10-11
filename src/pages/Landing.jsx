import { Icon, DemoBadge } from '../components.jsx';

export default function Landing({ onStart }) {
  return (
    <div className="landing">
      <header className="land-top">
        <div className="brand dark"><span className="logo"><Icon name="shield" size={22} /></span> UPI Trust</div>
        <DemoBadge />
      </header>
      <section className="hero">
        <div>
          <h1>Your Transactions. Your Proof. Your Opportunity.</h1>
          <p className="lead">
            UPI Trust turns a small business owner's UPI statement into a signed, tamper-evident
            cash-flow history that a lender can check without trusting a single number on faith.
          </p>
          <div className="problem card">
            <h3>The problem</h3>
            <p>
              A tiffin cart owner like Murugan receives about ₹4,000 a day on UPI. He has no salary slip,
              no tax return and no bureau record, so a bank has nothing it can verify and says no.
              The only lender left is a moneylender charging around 10% a month.
            </p>
            <p>
              The evidence exists on his phone. It is just not in a form a bank can trust.
            </p>
          </div>
          <button className="btn primary big" onClick={onStart}>Start Demo</button>
          <p className="fine">Prototype with simulated data and a simulated issuer. No real bank is involved.</p>
        </div>
        <div className="card proof">
          <h3>How the proof works</h3>
          <div className="step"><Icon name="user" /><div><b>Murugan</b><span>shares his UPI history with consent</span></div></div>
          <div className="step"><Icon name="stamp" /><div><b>Issuer</b><span>checks it and signs a fingerprint of it</span></div></div>
          <div className="step"><Icon name="bank" /><div><b>Bank</b><span>recomputes the fingerprint and checks the signature</span></div></div>
          <p className="fine">Change one rupee in the history and the check fails. You can try it in the demo.</p>
        </div>
      </section>
    </div>
  );
}
