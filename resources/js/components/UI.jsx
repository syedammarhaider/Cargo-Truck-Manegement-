// ── Modal wrapper ─────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        className={`bg-[#0d1e35] rounded-2xl border border-slate-600/60 shadow-2xl w-full ${wide ? 'max-w-2xl' : 'max-w-md'} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/60">
          <h2 className="font-semibold text-white text-sm">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><span className="text-lg leading-none">×</span></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

// ── Input / Select / Textarea ─────────────────────────────────────────────────
const inputBase = 'w-full bg-[#060d1a] border border-slate-600/60 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 transition-colors'

export function Input({ label, ...props }) {
  return (
    <div>
      {label && <label className="block text-xs text-slate-400 mb-1">{label}</label>}
      <input className={inputBase} {...props} />
    </div>
  )
}

export function Select({ label, children, ...props }) {
  return (
    <div>
      {label && <label className="block text-xs text-slate-400 mb-1">{label}</label>}
      <select className={inputBase} {...props}>{children}</select>
    </div>
  )
}

export function Textarea({ label, ...props }) {
  return (
    <div>
      {label && <label className="block text-xs text-slate-400 mb-1">{label}</label>}
      <textarea className={`${inputBase} resize-none`} {...props} />
    </div>
  )
}

// ── Confirm dialog ────────────────────────────────────────────────────────────
export function ConfirmModal({ open, onClose, onConfirm, message, danger }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
      <div className="bg-[#0d1e35] rounded-xl border border-slate-600 p-6 max-w-sm w-full">
        <p className="text-white text-sm mb-5">{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 text-sm transition-colors">Cancel</button>
          <button onClick={() => { onConfirm(); onClose() }}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${danger ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-sky-500 hover:bg-sky-600 text-white'}`}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Pagination ────────────────────────────────────────────────────────────────
export function Pagination({ meta, page, setPage }) {
  if (!meta?.last_page || meta.last_page <= 1) return null
  return (
    <div className="flex items-center justify-between text-xs text-slate-400">
      <span>Showing {((page - 1) * (meta.per_page || 15)) + 1}–{Math.min(page * (meta.per_page || 15), meta.total)} of {meta.total}</span>
      <div className="flex gap-2">
        {[...Array(Math.min(meta.last_page, 5))].map((_, i) => {
          const p = i + 1
          return (
            <button key={p} onClick={() => setPage(p)}
              className={`w-7 h-7 rounded text-xs transition-colors ${page === p ? 'bg-sky-500 text-white' : 'bg-[#0d1e35] border border-slate-700 hover:border-slate-500'}`}>
              {p}
            </button>
          )
        })}
        {meta.last_page > 5 && <span className="text-slate-500 px-1">...</span>}
      </div>
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────
export function Empty({ icon: Icon, message }) {
  return (
    <div className="text-center py-16 text-slate-600">
      {Icon && <Icon size={40} className="mx-auto mb-3 opacity-30" />}
      <p className="text-sm">{message}</p>
    </div>
  )
}
