// ── StatusBadge ───────────────────────────────────────────────────────────────
const STATUS_MAP = {
  idle:        'bg-slate-700/80 text-slate-300',
  in_transit:  'bg-blue-900/60 text-blue-300',
  maintenance: 'bg-amber-900/60 text-amber-300',
  pending:     'bg-slate-700/80 text-slate-300',
  dispatched:  'bg-purple-900/60 text-purple-300',
  delivered:   'bg-emerald-900/60 text-emerald-300',
  cancelled:   'bg-red-900/60 text-red-300',
  active:      'bg-emerald-900/60 text-emerald-300',
  inactive:    'bg-slate-700/80 text-slate-400',
  paid:        'bg-emerald-900/60 text-emerald-300',
  unpaid:      'bg-red-900/60 text-red-300',
  overdue:     'bg-orange-900/60 text-orange-300',
}

export function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_MAP[status] || 'bg-slate-700 text-slate-300'}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
      {status?.replace(/_/g, ' ')}
    </span>
  )
}

export default StatusBadge
