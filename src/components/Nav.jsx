export default function Nav() {
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      height: 56,
      background: 'rgba(13,13,15,0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center',
      padding: '0 24px',
      gap: 12,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: 'var(--amber)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 800, color: '#0D0D0F',
          fontFamily: 'var(--font-display)',
        }}>D</div>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text)', letterSpacing: '-0.01em' }}>
          DIYA
        </span>
        <span style={{
          fontSize: 10, padding: '2px 7px', borderRadius: 99,
          background: 'var(--amber-dim)', border: '1px solid var(--border-amber)',
          color: 'var(--amber)', fontWeight: 500, letterSpacing: '0.04em',
        }}>AI</span>
      </div>

      <div style={{ flex: 1 }} />

      {/* Status pill */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '5px 12px', borderRadius: 99,
        background: 'var(--surface2)', border: '1px solid var(--border)',
      }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', animation: 'pulse 2s infinite' }} />
        <span style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 500 }}>Gemini Active</span>
      </div>

      {/* Nav links */}
      {['Dashboard', 'History', 'Help'].map(link => (
        <button key={link} style={{
          background: 'none', border: 'none',
          fontSize: 13, color: 'var(--text-3)', fontWeight: 500,
          padding: '6px 12px', borderRadius: 6,
          transition: 'color 0.15s, background 0.15s',
        }}
        onMouseEnter={e => { e.target.style.color = 'var(--text)'; e.target.style.background = 'var(--surface2)'; }}
        onMouseLeave={e => { e.target.style.color = 'var(--text-3)'; e.target.style.background = 'none'; }}
        >{link}</button>
      ))}
    </nav>
  )
}