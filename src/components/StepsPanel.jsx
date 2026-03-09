import { useState } from 'react'

export default function StepsPanel({ steps, currentIndex, onMarkDone, toolsRequired, currentFocus }) {
  const [view, setView] = useState('overview') // 'overview' | 'step'
  const [activeStep, setActiveStep] = useState(0)

  const done = steps.filter(s => s.completed).length
  const pct = steps.length > 0 ? (done / steps.length) * 100 : 0
  const current = steps[activeStep]

  // Open step detail view
  const openStep = (i) => { setActiveStep(i); setView('step') }

  // ── STEP DETAIL VIEW ──────────────────────────────────────
  if (view === 'step' && current) {
    const isDone = current.completed
    const isActive = activeStep === currentIndex && !isDone

    return (
      <div style={{ borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--surface)' }}>

        {/* Header */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <button onClick={() => setView('overview')} style={{
            width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)',
            background: 'var(--surface2)', color: 'var(--text-2)', fontSize: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-amber)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >←</button>
          <span style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 500 }}>All Steps</span>
          <div style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
            {activeStep + 1} / {steps.length}
          </div>
        </div>

        {/* Step content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Step number + status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 800,
              background: isDone ? 'var(--green-dim)' : isActive ? 'var(--amber)' : 'var(--surface3)',
              color: isDone ? 'var(--green)' : isActive ? '#0D0D0F' : 'var(--text-3)',
              border: `1.5px solid ${isDone ? 'rgba(16,185,129,0.25)' : isActive ? 'var(--amber)' : 'var(--border)'}`,
              fontFamily: 'var(--font-display)',
            }}>
              {isDone ? '✓' : activeStep + 1}
            </div>
            <div>
              {isActive && (
                <div style={{ fontSize: 10, color: 'var(--amber)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 3 }}>
                  ● Current Step
                </div>
              )}
              {isDone && (
                <div style={{ fontSize: 10, color: 'var(--green)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 3 }}>
                  ✓ Completed
                </div>
              )}
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3, fontFamily: 'var(--font-display)' }}>
                {current.title}
              </div>
            </div>
          </div>

          {/* Description */}
          <div style={{
            padding: '16px', borderRadius: 10,
            background: 'var(--surface2)', border: '1px solid var(--border)',
            fontSize: 13, color: 'var(--text-2)', lineHeight: 1.8,
          }}>
            {current.description}
          </div>

          {/* Safety alerts for this step */}
          {isActive && currentFocus && (
            <div style={{
              padding: '12px 14px', borderRadius: 10,
              background: 'var(--amber-glow)', border: '1px solid var(--border-amber)',
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
                💡 Focus
              </div>
              <div style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.6 }}>{currentFocus}</div>
            </div>
          )}

          {/* Mark done */}
          {isActive && (
            <button
              onClick={() => { onMarkDone(activeStep); if (activeStep + 1 < steps.length) setActiveStep(activeStep + 1) }}
              style={{
                width: '100%', padding: '14px', borderRadius: 10, border: 'none',
                background: 'var(--amber)', color: '#0D0D0F',
                fontSize: 14, fontWeight: 700, letterSpacing: '0.02em',
                fontFamily: 'var(--font-display)',
                transition: 'opacity 0.15s',
                boxShadow: '0 4px 20px rgba(245,158,11,0.25)',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >✓ Mark as Done</button>
          )}

          {/* Already done message */}
          {isDone && (
            <div style={{
              padding: '12px', borderRadius: 10, textAlign: 'center',
              background: 'var(--green-dim)', border: '1px solid rgba(16,185,129,0.2)',
              fontSize: 13, color: 'var(--green)', fontWeight: 600,
            }}>✓ This step is complete</div>
          )}
        </div>

        {/* Prev / Next navigation */}
        <div style={{
          padding: '12px 16px', borderTop: '1px solid var(--border)',
          display: 'flex', gap: 8, flexShrink: 0,
        }}>
          <button
            onClick={() => setActiveStep(i => Math.max(0, i - 1))}
            disabled={activeStep === 0}
            style={{
              flex: 1, padding: '10px', borderRadius: 8,
              background: 'var(--surface2)', border: '1px solid var(--border)',
              color: activeStep === 0 ? 'var(--text-3)' : 'var(--text-2)',
              fontSize: 13, fontWeight: 500, transition: 'all 0.15s',
            }}
            onMouseEnter={e => { if (activeStep > 0) e.currentTarget.style.borderColor = 'var(--border-amber)' }}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >← Prev</button>
          <button
            onClick={() => setActiveStep(i => Math.min(steps.length - 1, i + 1))}
            disabled={activeStep === steps.length - 1}
            style={{
              flex: 1, padding: '10px', borderRadius: 8,
              background: 'var(--surface2)', border: '1px solid var(--border)',
              color: activeStep === steps.length - 1 ? 'var(--text-3)' : 'var(--text-2)',
              fontSize: 13, fontWeight: 500, transition: 'all 0.15s',
            }}
            onMouseEnter={e => { if (activeStep < steps.length - 1) e.currentTarget.style.borderColor = 'var(--border-amber)' }}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >Next →</button>
        </div>
      </div>
    )
  }

  // ── OVERVIEW VIEW ─────────────────────────────────────────
  return (
    <div style={{ borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--surface)' }}>

      {/* Header */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>Repair Steps</span>
          {steps.length > 0 && (
            <span style={{
              fontSize: 11, padding: '2px 10px', borderRadius: 99,
              background: pct === 100 ? 'var(--green-dim)' : 'var(--amber-dim)',
              color: pct === 100 ? 'var(--green)' : 'var(--amber)',
              fontWeight: 600, border: `1px solid ${pct === 100 ? 'rgba(16,185,129,0.2)' : 'var(--border-amber)'}`,
            }}>
              {pct === 100 ? '✓ Done' : `${done}/${steps.length}`}
            </span>
          )}
        </div>
        {steps.length > 0 && (
          <div style={{ height: 4, background: 'var(--surface3)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 99, transition: 'width 0.5s ease', width: `${pct}%`,
              background: pct === 100 ? 'var(--green)' : 'linear-gradient(90deg, var(--amber), var(--amber-soft))',
            }} />
          </div>
        )}
      </div>

      {/* Current focus */}
      {currentFocus && (
        <div style={{ padding: '11px 16px', background: 'var(--amber-glow)', borderBottom: '1px solid var(--border-amber)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--amber)', animation: 'pulse 1.5s infinite' }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--amber)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>Current Focus</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.6 }}>{currentFocus}</div>
        </div>
      )}

      {/* Steps list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px', display: 'flex', flexDirection: 'column', gap: 5 }}>
        {steps.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.15 }}>🔧</div>
            <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7 }}>Analyze a device image to get<br />your step-by-step repair guide</div>
          </div>
        ) : steps.map((step, i) => {
          const isDone = step.completed
          const isActive = i === currentIndex && !isDone

          return (
            <div key={i} onClick={() => openStep(i)} style={{
              padding: '11px 13px', borderRadius: 10, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 11,
              border: `1px solid ${isDone ? 'rgba(16,185,129,0.15)' : isActive ? 'var(--border-amber)' : 'var(--border)'}`,
              background: isDone ? 'rgba(16,185,129,0.04)' : isActive ? 'rgba(245,158,11,0.05)' : 'var(--surface2)',
              boxShadow: isActive ? '0 0 0 1px var(--border-amber)' : 'none',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = isDone ? 'rgba(16,185,129,0.3)' : 'var(--border-amber)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = isDone ? 'rgba(16,185,129,0.15)' : isActive ? 'var(--border-amber)' : 'var(--border)'}
            >
              {/* Number */}
              <div style={{
                width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700,
                background: isDone ? 'var(--green-dim)' : isActive ? 'var(--amber)' : 'var(--surface3)',
                color: isDone ? 'var(--green)' : isActive ? '#0D0D0F' : 'var(--text-3)',
              }}>
                {isDone ? '✓' : i + 1}
              </div>

              {/* Title */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 12, fontWeight: 600, lineHeight: 1.4,
                  color: isDone ? 'var(--text-3)' : 'var(--text)',
                  textDecoration: isDone ? 'line-through' : 'none',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{step.title}</div>
                {isActive && <div style={{ fontSize: 10, color: 'var(--amber)', fontWeight: 600, marginTop: 2 }}>● Active</div>}
              </div>

              {/* Arrow */}
              <div style={{ fontSize: 11, color: 'var(--text-3)', flexShrink: 0 }}>›</div>
            </div>
          )
        })}
      </div>

      {/* Tools — compact */}
      {toolsRequired?.length > 0 && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '10px 12px', flexShrink: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            🔧 Tools
            <span style={{ fontSize: 10, padding: '1px 7px', borderRadius: 99, background: 'var(--amber-dim)', color: 'var(--amber)', border: '1px solid var(--border-amber)', fontWeight: 600 }}>{toolsRequired.length}</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {toolsRequired.map((tool, i) => (
              <div key={i} style={{
                fontSize: 10, padding: '4px 9px', borderRadius: 6,
                background: 'var(--surface2)', border: '1px solid var(--border)',
                color: 'var(--text-2)',
              }}>{tool}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}