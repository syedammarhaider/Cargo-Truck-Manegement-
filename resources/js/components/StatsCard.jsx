// ── StatsCard ─────────────────────────────────────────────────────────────────
const COLOR_MAP = {
  blue:   'bg-blue-900/50 text-blue-400',
  green:  'bg-emerald-900/50 text-emerald-400',
  yellow: 'bg-amber-900/50 text-amber-400',
  red:    'bg-red-900/50 text-red-400',
  purple: 'bg-purple-900/50 text-purple-400',
  sky:    'bg-sky-900/50 text-sky-400',
  orange: 'bg-orange-900/50 text-orange-400',
}

export function StatsCard({ title, value, icon: Icon, color = 'blue', trend, onClick }) {
  return (
    <div onClick={onClick}
      className={`bg-[#0d1e35] rounded-xl p-5 border border-slate-700/60 hover:border-slate-600 transition-all ${onClick ? 'cursor-pointer hover:scale-[1.01]' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{title}</p>
        {Icon && <div className={`p-2 rounded-lg ${COLOR_MAP[color]}`}><Icon size={15} /></div>}
      </div>
      <p className="text-white text-2xl font-bold">{value ?? '—'}</p>
      {trend && <p className="text-slate-500 text-xs mt-1.5">{trend}</p>}
    </div>
  )
}

export default StatsCard
