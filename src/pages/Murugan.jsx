import { useState } from 'react';
import { Stat, BarChart, DemoBadge, Icon } from '../components.jsx';
import { inr, EXPENSE_RATE } from '../data.js';

export default function Murugan({ txs, stats, profile, applicant, onSwitch, onNext }) {
  const [all, setAll] = useState(false);
  const rows = all ? txs : txs.slice(-12);
  return (
    <div>
      <div className="page-head">
        <h2>{profile.name}'s dashboard</h2>
        <DemoBadge />
      </div>

      <div className="cta-row">
        <span className="note">Demo applicant:</span>
        <button className={'btn ' + (applicant === 'murugan' ? 'primary' : 'ghost')} onClick={() => onSwitch('murugan')}>Murugan (steady sales)</button>
        <button className={'btn ' + (applicant === 'irregular' ? 'primary' : 'ghost')} onClick={() => onSwitch('irregular')}>Ravi (uneven income)</button>
      </div>

      <div className="card profile">
        <span className="avatar"><Icon name="user" size={28} /></span>
        <div>
          <b>{profile.name}</b> (demo applicant)
          <div className="note">{profile.business} · UPI since April 2026 · {txs.length} credits in history</div>
        </div>
      </div>

      <div className="grid4">
        <Stat label="Monthly UPI credits" value={inr(stats.avgCredits)} note="average per month" />
        <Stat label="Estimated business receipts" value={inr(stats.avgReceipts)} note="credits tagged as sales" />
        <Stat label="Refunds and other transfers" value={inr(stats.avgOther)} note="not counted as business income" />
        <Stat label="Estimated expenses" value={inr(stats.avgExpenses)} note={`assumed ${EXPENSE_RATE * 100}% of receipts`} />
      </div>

      <div className="card">
        <h3>Monthly cash flow</h3>
        <BarChart months={stats.months} />
        <div className="legend"><i className="g" /> UPI credits <i className="n" /> Estimated expenses (assumption)</div>
      </div>

      <div className="card">
        <div className="row-between">
          <h3>Transaction history</h3>
          <button className="btn ghost" onClick={() => setAll(!all)}>{all ? 'Show last 12' : `Show all ${txs.length}`}</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>ID</th><th>Date</th><th>From</th><th>Type (demo tag)</th><th className="r">Amount</th></tr></thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.id}>
                  <td>{t.id}</td><td>{t.date}</td><td>{t.party}</td>
                  <td><span className={'tag ' + t.category}>{t.category}</span></td>
                  <td className="r">{inr(t.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="cta-row">
        <button className="btn primary" onClick={onNext}>Share with issuer (I consent)</button>
        <span className="note">{profile.name} shares this history. No bank login is shared.</span>
      </div>
    </div>
  );
}
