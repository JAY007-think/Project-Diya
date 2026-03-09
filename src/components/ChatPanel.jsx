import { useEffect, useRef } from 'react'

export default function ChatPanel({ messages, input, onInputChange, onSend, isLoading }) {
  const bottomRef = useRef()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const format = (text) => text
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text);font-weight:600">$1</strong>')
    .replace(/\n/g, '<br/>')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg)' }}>

      {/* Header */}
      <div style={{
        padding: '14px 16px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: 'var(--amber)', color: '#0D0D0F',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 800, fontFamily: 'var(--font-display)',
        }}>D</div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>DIYA Assistant</div>
          <div style={{ fontSize: 10, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)', animation: 'pulse 2s infinite' }} />
            Online · Gemini powered
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex', gap: 8, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            animation: 'slideIn 0.2s ease',
          }}>
            {msg.role === 'assistant' && (
              <div style={{
                width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                background: 'var(--amber)', color: '#0D0D0F',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 800, marginTop: 2,
                fontFamily: 'var(--font-display)',
              }}>D</div>
            )}
            <div style={{
              maxWidth: '78%', padding: '10px 14px', lineHeight: 1.65, fontSize: 13,
              borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '4px 12px 12px 12px',
              background: msg.role === 'user' ? 'var(--amber-dim)' : 'var(--surface)',
              border: `1px solid ${msg.role === 'user' ? 'var(--border-amber)' : 'var(--border)'}`,
              color: msg.role === 'user' ? 'var(--text)' : 'var(--text-2)',
            }}
            dangerouslySetInnerHTML={{ __html: format(msg.content) }}
            />
          </div>
        ))}

        {isLoading && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <div style={{
              width: 26, height: 26, borderRadius: 8,
              background: 'var(--amber)', color: '#0D0D0F',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 800, fontFamily: 'var(--font-display)',
            }}>D</div>
            <div style={{
              padding: '12px 16px', borderRadius: '4px 12px 12px 12px',
              background: 'var(--surface)', border: '1px solid var(--border)',
              display: 'flex', gap: 5, alignItems: 'center',
            }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 6, height: 6, borderRadius: '50%', background: 'var(--amber)',
                  animation: `dotBounce 1.2s ${i * 0.2}s infinite ease-in-out`,
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <input
          value={input}
          onChange={e => onInputChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onSend()}
          placeholder="Ask DIYA anything..."
          style={{
            flex: 1, background: 'var(--surface2)',
            border: '1px solid var(--border)', borderRadius: 10,
            padding: '10px 14px', fontSize: 13, color: 'var(--text)', outline: 'none',
            transition: 'border-color 0.15s', resize: 'none',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--border-amber)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
        <button onClick={onSend} disabled={!input.trim() || isLoading} style={{
          width: 40, height: 40, borderRadius: 10, border: 'none', flexShrink: 0,
          background: input.trim() ? 'var(--amber)' : 'var(--surface2)',
          color: input.trim() ? '#0D0D0F' : 'var(--text-3)',
          fontSize: 16, fontWeight: 700, transition: 'all 0.15s',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        onMouseEnter={e => { if (input.trim()) e.target.style.opacity = '0.85' }}
        onMouseLeave={e => e.target.style.opacity = '1'}
        >↑</button>
      </div>
    </div>
  )
}