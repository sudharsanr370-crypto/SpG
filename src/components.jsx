import { monthName, inr } from './data.js';

const PATHS = {
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z',
  check: 'M5 13l4 4L19 7',
  x: 'M6 6l12 12M18 6L6 18',
  user: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21c0-4 4-6 8-6s8 2 8 6',
  bank: 'M3 10l9-6 9 6M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18',
  home: 'M3 11l9-8 9 8M5 10v10h14V10',
  alert: 'M12 4l9 16H3L12 4zM12 10v4M12 17h.01',
  stamp: 'M9 12l2 2 4-4M12 3l2.5 2H18v3.5L20 11l-2 2.5V17h-3.5L12 19l-2.5-2H6v-3.5L4 11l2-2.5V5h3.5L12 3z',
};

export function Icon({ name, size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  );
}

export const DemoBadge = () => <span className="badge demo">DEMO DATA</span>;

export function Status({ state, children }) {
  // state: 'ok' | 'fail' | 'idle'
  const icon = state === 'ok' ? 'check' : state === 'fail' ? 'x' : 'alert';
  return (
    <span className={'status ' + state}>
      <Icon name={icon} size={16} /> {children}
    </span>
  );
}

export function Stat({ label, value, note }) {
  return (
    <div className="card stat">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      {note && <div className="note">{note}</div>}
    </div>
  );
}

export function BarChart({ months }) {
  const W = 600, H = 240, pad = 36;
  const max = Math.max(...months.map((m) => m.credits)) * 1.1;
  const slot = (W - pad * 2) / months.length;
  const y = (v) => H - pad - (v / max) * (H - pad * 2);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label="Monthly credits and estimated expenses">
      {[0, 0.5, 1].map((f) => (
        <g key={f}>
          <line x1={pad} x2={W - pad} y1={y(max * f / 1.1)} y2={y(max * f / 1.1)} stroke="#E4E7EC" />
          <text x={pad - 6} y={y(max * f / 1.1) + 4} fontSize="10" textAnchor="end" fill="#667085">
            {Math.round((max * f) / 1.1 / 1000)}k
          </text>
        </g>
      ))}
      {months.map((m, i) => {
        const x = pad + i * slot + slot * 0.15;
        const w = slot * 0.3;
        return (
          <g key={m.month}>
            <rect x={x} y={y(m.credits)} width={w} height={H - pad - y(m.credits)} rx="4" fill="#12B76A">
              <title>{monthName(m.month) + ' credits ' + inr(m.credits)}</title>
            </rect>
            <rect x={x + w + 4} y={y(m.expenses)} width={w} height={H - pad - y(m.expenses)} rx="4" fill="#0B1F3A">
              <title>{monthName(m.month) + ' est. expenses ' + inr(m.expenses)}</title>
            </rect>
            <text x={x + w} y={H - 12} fontSize="11" textAnchor="middle" fill="#475467">{monthName(m.month)}</text>
          </g>
        );
      })}
    </svg>
  );
}
