import { useRef, useState } from 'react'

export default function VideoPane({ uploadedImage, onImageUpload, onAnalyze, onAnalyzeWithQuestion, isAnalyzing, analysis }) {
  const fileRef = useRef()
  const [dragOver, setDragOver] = useState(false)
  const [question, setQuestion] = useState('')

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file?.type.startsWith('image/')) onImageUpload(file)
  }

  return (
    <div style={{
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden', background: '#0A0A0C',
    }}>

      {/* Image area */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {uploadedImage ? (
          <img src={uploadedImage} alt="device" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
        ) : (
          <div
            onClick={() => fileRef.current.click()}
            style={{
              textAlign: 'center', padding: '40px 32px',
              border: `2px dashed ${dragOver ? 'var(--amber)' : 'var(--border)'}`,
              borderRadius: 16, margin: 24, cursor: 'pointer',
              background: dragOver ? 'var(--amber-glow)' : 'transparent',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.4 }}>📷</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
              {dragOver ? 'Drop to upload' : 'Upload device image'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 20, lineHeight: 1.6 }}>
              Drag & drop or click to browse<br />JPG, PNG supported
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '9px 20px', borderRadius: 8,
              background: 'var(--amber)', color: '#0D0D0F',
              fontSize: 13, fontWeight: 600,
            }}>
              Choose Image
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => e.target.files[0] && onImageUpload(e.target.files[0])} />
          </div>
        )}

        {/* Analyzing overlay */}
        {isAnalyzing && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(13,13,15,0.75)', backdropFilter: 'blur(4px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16,
          }}>
            <div style={{ position: 'absolute', left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,transparent,var(--amber),transparent)', animation: 'scanLine 1.5s ease-in-out infinite' }} />
            <div style={{ width: 44, height: 44, border: '2.5px solid var(--surface3)', borderTopColor: 'var(--amber)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--amber)', marginBottom: 4 }}>Analyzing Device</div>
              <div style={{ fontSize: 12, color: 'var(--text-2)' }}>Gemini Vision is processing...</div>
            </div>
          </div>
        )}

        {/* Detection badge */}
        {analysis && !isAnalyzing && uploadedImage && (
          <div style={{
            position: 'absolute', top: 12, left: 12,
            background: 'rgba(13,13,15,0.85)', backdropFilter: 'blur(12px)',
            border: '1px solid var(--border-amber)',
            borderRadius: 10, padding: '10px 14px',
          }}>
            <div style={{ fontSize: 10, color: 'var(--amber)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
              ✦ Identified
            </div>
            <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600, marginBottom: 3 }}>{analysis.device}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ flex: 1, height: 3, background: 'var(--surface3)', borderRadius: 99 }}>
                <div style={{ width: `${analysis.confidence}%`, height: '100%', background: 'var(--green)', borderRadius: 99 }} />
              </div>
              <span style={{ fontSize: 10, color: 'var(--green)', fontWeight: 600 }}>{analysis.confidence}%</span>
            </div>
          </div>
        )}

        {/* Safety badge */}
        {analysis?.safetyAlerts?.some(a => a.level === 'critical') && !isAnalyzing && (
          <div style={{
            position: 'absolute', bottom: 72, right: 12,
            background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 8, padding: '7px 12px',
            display: 'flex', alignItems: 'center', gap: 7,
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--red)', animation: 'pulse 0.8s infinite' }} />
            <span style={{ fontSize: 11, color: 'var(--red)', fontWeight: 600 }}>Safety Alert Active</span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="Describe the issue (optional)..."
          style={{
            width: '100%', background: 'var(--surface2)',
            border: '1px solid var(--border)', borderRadius: 8,
            padding: '9px 14px', fontSize: 13, color: 'var(--text)', outline: 'none',
            transition: 'border-color 0.15s',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--border-amber)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
          onKeyDown={e => { if (e.key === 'Enter' && uploadedImage) { onAnalyzeWithQuestion(question); setQuestion('') }}}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => fileRef.current?.click()} style={{
            flex: 1, padding: '9px', borderRadius: 8, fontSize: 12, fontWeight: 500,
            background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text-2)',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => e.target.style.borderColor = 'var(--border-amber)'}
          onMouseLeave={e => e.target.style.borderColor = 'var(--border)'}
          >
            📁 New Image
          </button>
          <button
            onClick={() => { onAnalyzeWithQuestion(question); setQuestion('') }}
            disabled={!uploadedImage || isAnalyzing}
            style={{
              flex: 2, padding: '9px 16px', borderRadius: 8,
              fontSize: 13, fontWeight: 600,
              background: !uploadedImage ? 'var(--surface2)' : 'var(--amber)',
              color: !uploadedImage ? 'var(--text-3)' : '#0D0D0F',
              border: 'none', transition: 'all 0.2s',
              opacity: isAnalyzing ? 0.7 : 1,
            }}>
            {isAnalyzing ? '⏳ Analyzing...' : '🔍 Analyze Device'}
          </button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={e => e.target.files[0] && onImageUpload(e.target.files[0])} />
      </div>
    </div>
  )
}