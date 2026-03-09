import { useNavigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'

const features = [
  { icon: '🎥', label: 'Live Video Analysis' },
  { icon: '⚡', label: 'Real-Time Safety Alerts' },
  { icon: '🔧', label: 'Step-by-Step Guidance' },
  { icon: '🧠', label: 'Multimodal Nova AI' },
  { icon: '💬', label: 'Interactive Q&A' },
]

const howCards = [
  { num: '01', icon: '📱', title: 'Point Your Camera', desc: 'Aim at the broken device. DIYA instantly identifies it using Amazon Nova\'s multimodal vision — no setup needed.' },
  { num: '02', icon: '🔍', title: 'AI Diagnoses the Issue', desc: 'Nova analyzes visual cues, components, and damage. It finds the fault area and estimates repair complexity.' },
  { num: '03', icon: '📋', title: 'Step-by-Step Guidance', desc: 'Get dynamic instructions tailored to exactly what the camera sees. Steps update as you make progress.' },
  { num: '04', icon: '🛡️', title: 'Safety First, Always', desc: 'Continuous hazard monitoring — exposed wires, capacitors, heat risks. Instant alerts protect you.' },
]

const techStack = [
  { logo: '🌩️', name: 'Amazon Nova Pro', desc: 'Multimodal video + text reasoning at the core of every repair session.', tag: 'Core AI' },
  { logo: '👁️', name: 'Nova Vision', desc: 'Frame-by-frame device identification, component detection, and hazard analysis.', tag: 'Vision' },
  { logo: '🔊', name: 'Nova Sonic', desc: 'Hands-free voice interaction — ask questions without putting your tools down.', tag: 'Voice' },
  { logo: '☁️', name: 'AWS Bedrock', desc: 'Managed inference with streaming for sub-200ms real-time response.', tag: 'Infrastructure' },
]

export default function Landing() {
  const navigate = useNavigate()
  const revealRefs = useRef([])

  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.opacity = 1
          e.target.style.transform = 'translateY(0)'
        }
      })
    }, { threshold: 0.1 })
    revealRefs.current.forEach(el => el && io.observe(el))
    return () => io.disconnect()
  }, [])

  const addReveal = (el) => {
    if (el && !revealRefs.current.includes(el)) {
      el.style.opacity = 0
      el.style.transform = 'translateY(32px)'
      el.style.transition = 'opacity 0.7s ease, transform 0.7s ease'
      revealRefs.current.push(el)
    }
  }

  return (
    <div>
      {/* ── HERO ── */}
      <section style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '120px 48px 80px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Grid bg */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, black 20%, transparent 100%)',
          maskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, black 20%, transparent 100%)',
        }} />
        <div style={{ position: 'absolute', width: 600, height: 600, background: 'radial-gradient(circle, rgba(245,166,35,0.1) 0%, transparent 70%)', top: -100, left: -150, pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Eyebrow */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28, animation: 'fadeUp 0.8s ease both' }}>
            <div style={{ width: 48, height: 1, background: 'var(--amber)' }} />
            <span style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--amber)' }}>
              Amazon Nova Hackathon · 2025
            </span>
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: 'clamp(72px, 12vw, 140px)', lineHeight: 0.88,
            letterSpacing: '-0.04em', marginBottom: 32,
            animation: 'fadeUp 0.8s 0.1s ease both',
          }}>
            <span style={{ WebkitTextStroke: '2px var(--amber)', color: 'transparent' }}>DIY</span>
            <span style={{ color: 'var(--amber)' }}>A</span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontFamily: 'var(--font-serif)', fontStyle: 'italic',
            fontSize: 'clamp(18px, 2.5vw, 28px)', color: 'var(--text-dim)',
            maxWidth: 540, lineHeight: 1.4, marginBottom: 40,
            animation: 'fadeUp 0.8s 0.2s ease both',
          }}>
            Intelligent AI-Powered DIY Assistant — fix your devices with confidence, guided by real-time video intelligence.
          </p>

          {/* CTA */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', animation: 'fadeUp 0.8s 0.3s ease both' }}>
            <button onClick={() => navigate('/repair')} style={{
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              background: 'var(--amber)', color: '#0A0A08',
              padding: '14px 32px', border: 'none', borderRadius: 2,
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => { e.target.style.transform='translateY(-2px)'; e.target.style.boxShadow='0 12px 40px rgba(245,166,35,0.3)' }}
            onMouseLeave={e => { e.target.style.transform=''; e.target.style.boxShadow='' }}
            >
              Start Repair Session ↗
            </button>
            <a href="#how" style={{ fontSize: 12, letterSpacing: '0.1em', color: 'var(--text-dim)', textDecoration: 'none' }}>
              How it works →
            </a>
          </div>

          {/* Feature strip */}
          <div ref={addReveal} style={{
            display: 'flex', marginTop: 64, borderTop: '1px solid var(--border-dim)',
            borderBottom: '1px solid var(--border-dim)',
          }}>
            {features.map((f, i) => (
              <div key={i} style={{
                flex: 1, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 10,
                borderRight: i < features.length - 1 ? '1px solid var(--border-dim)' : 'none',
              }}>
                <span style={{ fontSize: 18 }}>{f.icon}</span>
                <span style={{ fontSize: 11, letterSpacing: '0.04em', color: 'var(--text-dim)' }}>{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={{ padding: '100px 48px' }}>
        <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--amber)', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 24, height: 1, background: 'var(--amber)' }} /> How It Works
        </div>
        <h2 ref={addReveal} style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(32px,5vw,64px)', letterSpacing: '-0.03em', lineHeight: 1, maxWidth: 560, marginBottom: 60 }}>
          Your AI repair partner, <em style={{ fontFamily: 'var(--font-serif)', color: 'var(--amber)' }}>every step</em> of the way.
        </h2>

        <div ref={addReveal} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, background: 'var(--border-dim)' }}>
          {howCards.map((c, i) => (
            <div key={i} style={{
              background: 'var(--surface)', padding: '48px 40px', position: 'relative', overflow: 'hidden',
              transition: 'background 0.3s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}
            >
              <div style={{ position: 'absolute', right: 28, top: 20, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 80, color: 'rgba(245,166,35,0.06)', lineHeight: 1 }}>{c.num}</div>
              <div style={{ width: 44, height: 44, borderRadius: 3, background: 'var(--amber-glow)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 24 }}>{c.icon}</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: 12 }}>{c.title}</h3>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text-dim)' }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TECH STACK ── */}
      <section style={{ background: 'var(--surface)', padding: '100px 48px' }}>
        <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--amber)', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 24, height: 1, background: 'var(--amber)' }} /> Technology Stack
        </div>
        <h2 ref={addReveal} style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(28px,4vw,52px)', letterSpacing: '-0.03em', marginBottom: 60 }}>
          Built on Amazon Nova
        </h2>
        <div ref={addReveal} style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, background: 'var(--border-dim)' }}>
          {techStack.map((t, i) => (
            <div key={i} style={{ background: 'var(--surface)', padding: '36px 28px', display: 'flex', flexDirection: 'column', gap: 12, position: 'relative', overflow: 'hidden', transition: 'background 0.3s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}
            >
              <div style={{ fontSize: 28 }}>{t.logo}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>{t.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.6 }}>{t.desc}</div>
              <div style={{ fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '3px 8px', border: '1px solid var(--border)', color: 'var(--amber)', borderRadius: 2, width: 'fit-content', marginTop: 'auto' }}>{t.tag}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid var(--border-dim)', padding: '60px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 36, color: 'var(--amber)', letterSpacing: '-0.03em' }}>DIYA</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 4 }}>Amazon Nova Hackathon · 2025</div>
        </div>
        <div style={{ display: 'flex', gap: 40 }}>
          {[['~120ms','Avg Latency'],['500+','Devices'],['99%','Safety Acc.']].map(([n,l]) => (
            <div key={l}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: 'var(--text)' }}>{n}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{l}</div>
            </div>
          ))}
        </div>
      </footer>
    </div>
  )
}
