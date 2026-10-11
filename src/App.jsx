import { useEffect, useMemo, useState } from 'react';
import { Icon } from './components.jsx';
import { makeTransactions, summarize, PROFILES } from './data.js';
import { createIssuerKeys, issueHistory } from './crypto.js';
import Landing from './pages/Landing.jsx';
import Murugan from './pages/Murugan.jsx';
import Issuer from './pages/Issuer.jsx';
import Bank from './pages/Bank.jsx';

const NAV = [
  { id: 'murugan', label: 'Murugan', icon: 'user' },
  { id: 'issuer', label: 'Issuer', icon: 'stamp' },
  { id: 'bank', label: 'Bank', icon: 'bank' },
];

export default function App() {
  const [applicant, setApplicant] = useState('murugan');
  const original = useMemo(() => makeTransactions(applicant), [applicant]);
  const profile = PROFILES[applicant];
  const [page, setPage] = useState('landing');
  const [txs, setTxs] = useState(original);
  const [keys, setKeys] = useState(null);
  const [pkg, setPkg] = useState(null);

  useEffect(() => { createIssuerKeys().then(setKeys); }, []);

  const stats = useMemo(() => summarize(txs), [txs]);

  async function issue() {
    // The issuer signs the history exactly as Murugan shared it.
    setPkg(await issueHistory(original, keys));
    setTxs(original);
  }

  function switchApplicant(id) {
    setApplicant(id);
    setTxs(makeTransactions(id));
    setPkg(null);
  }

  function modify() {
    const i = Math.min(20, original.length - 1);
    setTxs(txs.map((t, k) => (k === i ? { ...t, amount: original[i].amount + 5000 } : t)));
  }

  if (page === 'landing') return <Landing onStart={() => setPage('murugan')} />;

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand"><span className="logo"><Icon name="shield" size={22} /></span> UPI Trust</div>
        <nav>
          {NAV.map((n) => (
            <button key={n.id} className={'nav' + (page === n.id ? ' active' : '')} onClick={() => setPage(n.id)}>
              <Icon name={n.icon} /> <span>{n.label}</span>
            </button>
          ))}
          <button className="nav" onClick={() => setPage('landing')}><Icon name="home" /> <span>Home</span></button>
        </nav>
        <div className="side-note">Prototype. Simulated issuer. Demo data only.</div>
      </aside>
      <main className="main">
        {page === 'murugan' && <Murugan txs={txs} stats={stats} profile={profile} applicant={applicant} onSwitch={switchApplicant} onNext={() => setPage('issuer')} />}
        {page === 'issuer' && (
          <Issuer txs={original} stats={summarize(original)} pkg={pkg} ready={!!keys}
            onIssue={issue} onNext={() => setPage('bank')} />
        )}
        {page === 'bank' && (
          <Bank txs={txs} original={original} profile={profile} pkg={pkg} keys={keys}
            onModify={modify} onReset={() => setTxs(original)} onIssuer={() => setPage('issuer')} />
        )}
      </main>
    </div>
  );
}
