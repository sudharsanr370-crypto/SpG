// DEMO DATA ONLY. Generated in the browser. Not a real person's statement.
export const EXPENSE_RATE = 0.65; // assumption: expenses = 65% of business receipts
export const EMI_SHARE = 0.3; // assumption: EMI should not exceed 30% of weak-month surplus

export const MIN_EMI_ROOM = 5000; // assumption: below this the EMI room is too small to matter
export const PROFILES = {
  murugan: { name: 'Murugan', business: 'Tiffin cart owner' },
  irregular: { name: 'Ravi', business: 'Part-time tailoring, uneven orders' },
};

const MONTHS = ['2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09'];
const DAYS = [2, 6, 10, 14, 18, 22, 26, 29];
const NAMES = ['Anita S', 'Karthik R', 'Meena P', 'Raju T', 'Divya K', 'Suresh M', 'Lakshmi N', 'Arun V'];

export const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');
export const monthName = (m) =>
  new Date(m + '-01').toLocaleString('en-IN', { month: 'short', year: '2-digit' });

function makeIrregular() {
  let seed = 21;
  const r = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
  const pad = (d) => String(d).padStart(2, '0');
  const out = [];
  let n = 1;
  MONTHS.forEach((m, mi) => {
    const rows = [];
    const sales = 2 + Math.floor(r() * 4);
    for (let i = 0; i < sales; i++) {
      rows.push({
        date: m + '-' + pad(3 + Math.floor(r() * 24)),
        party: NAMES[(i + mi) % 8] + ' (customer)',
        category: 'sale',
        amount: Math.round((1500 + r() * 5000) / 100) * 100,
      });
    }
    rows.push({ date: m + '-08', party: 'Friend transfer', category: 'transfer', amount: 5000 });
    rows.push({ date: m + '-15', party: 'Supplier refund', category: 'refund', amount: 1000 });
    rows.push({ date: m + '-17', party: 'Family transfer', category: 'transfer', amount: 4000 + (mi % 2) * 2000 });
    rows.push({ date: m + '-24', party: 'Friend transfer', category: 'transfer', amount: 5000 });
    rows.sort((a, b) => a.date.localeCompare(b.date));
    rows.forEach((x) => out.push({ id: 'T' + pad(n++).padStart(3, '0'), ...x }));
  });
  return out;
}

export function makeTransactions(profile = 'murugan') {
  if (profile === 'irregular') return makeIrregular();
  let seed = 7;
  const r = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
  const out = [];
  let n = 1;
  MONTHS.forEach((m, mi) => {
    const rows = [];
    DAYS.forEach((d, i) => {
      rows.push({
        date: m + '-' + String(d).padStart(2, '0'),
        party: NAMES[(i + mi) % 8] + ' (customer)',
        category: 'sale',
        amount: Math.round((13000 + r() * 5000) / 100) * 100,
      });
    });
    rows.push({
      date: m + '-12',
      party: 'Supplier refund',
      category: 'refund',
      amount: Math.round((1500 + r() * 1500) / 100) * 100,
    });
    if (mi % 2 === 0) {
      rows.push({ date: m + '-20', party: 'Family transfer', category: 'transfer', amount: 5000 });
    }
    rows.sort((a, b) => a.date.localeCompare(b.date));
    rows.forEach((x) => out.push({ id: 'T' + String(n++).padStart(3, '0'), ...x }));
  });
  return out;
}

export function summarize(txs) {
  const by = {};
  txs.forEach((t) => {
    const m = t.date.slice(0, 7);
    if (!by[m]) by[m] = { month: m, credits: 0, receipts: 0, other: 0 };
    by[m].credits += t.amount;
    if (t.category === 'sale') by[m].receipts += t.amount;
    else by[m].other += t.amount;
  });
  const months = Object.values(by).sort((a, b) => a.month.localeCompare(b.month));
  months.forEach((m) => (m.expenses = Math.round(m.receipts * EXPENSE_RATE)));
  const avg = (k) => Math.round(months.reduce((s, m) => s + m[k], 0) / months.length);
  const weakReceipts = Math.min(...months.map((m) => m.receipts));
  const weakSurplus = Math.round(weakReceipts * (1 - EXPENSE_RATE));
  return {
    months,
    avgCredits: avg('credits'),
    avgReceipts: avg('receipts'),
    avgOther: avg('other'),
    avgExpenses: avg('expenses'),
    weakReceipts,
    weakSurplus,
    emiCapacity: Math.round(weakSurplus * EMI_SHARE),
  };
}

// Basic checks the issuer runs before signing.
export function sanityCheck(txs) {
  const problems = [];
  if (txs.length < 20) problems.push('Too few transactions');
  if (txs.some((t) => !(t.amount > 0))) problems.push('A transaction has a zero or negative amount');
  for (let i = 1; i < txs.length; i++) {
    if (txs[i].date < txs[i - 1].date) {
      problems.push('Dates are not in order');
      break;
    }
  }
  if (new Set(txs.map((t) => t.id)).size !== txs.length) problems.push('Duplicate transaction ids');
  return problems;
}

// Illustrative assessment on VERIFIED data only. Not a credit score and not a loan decision.
export function assess(s) {
  const reasons = [];
  const credits = s.months.reduce((a, m) => a + m.credits, 0);
  const receipts = s.months.reduce((a, m) => a + m.receipts, 0);
  const share = receipts / credits;
  const ratio = s.weakReceipts / s.avgReceipts;
  if (share < 0.7) reasons.push('Only ' + Math.round(share * 100) + '% of credits are sales. The rest are transfers and refunds.');
  if (ratio < 0.6) reasons.push('The weakest month has ' + Math.round(ratio * 100) + '% of average sales. Income is uneven.');
  if (s.emiCapacity < MIN_EMI_ROOM) reasons.push('Indicative EMI room is ' + inr(s.emiCapacity) + ', below the ' + inr(MIN_EMI_ROOM) + ' minimum.');
  return { supported: reasons.length === 0, reasons };
}
