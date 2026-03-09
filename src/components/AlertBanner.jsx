export default function AlertBanner({ message, onDismiss }) {
  return (
    <div style={{
      background: 'rgba(239,68,68,0.1)',
      borderBottom: '1px solid rgba(239,68,68,0.25)',
      padding: '10px 20px',
      display: 'flex', alignItems: 'center', gap: 12,
      animation: 'fadeIn 0.3s ease',
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
        background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13,
      }}>⚠️</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--red)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 2 }}>
          Safety Alert
        </div>
        <div style={{ fontSize: 12, color: '#FCA5A5', lineHeight: 1.5 }}>{message}</div>
      </div>
      <button onClick={onDismiss} style={{
        padding: '6px 14px', borderRadius: 6, flexShrink: 0,
        background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
        color: 'var(--red)', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em',
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => e.target.style.background = 'rgba(239,68,68,0.25)'}
      onMouseLeave={e => e.target.style.background = 'rgba(239,68,68,0.15)'}
      >UNDERSTOOD</button>
    </div>
  )
}