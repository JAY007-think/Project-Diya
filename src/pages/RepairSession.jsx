import { useState } from 'react'
import axios from 'axios'
import VideoPane from '../components/VideoPane.jsx'
import StepsPanel from '../components/StepsPanel.jsx'
import ChatPanel from '../components/ChatPanel.jsx'
import AlertBanner from '../components/AlertBanner.jsx'

export default function RepairSession() {
  const [session, setSession] = useState('idle')
  const [analysis, setAnalysis] = useState(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m DIYA 👋 Upload a photo of the device you want to repair and click **Analyze Device** — I\'ll identify it and guide you through every step safely.' }
  ])
  const [uploadedImage, setUploadedImage] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [criticalAlert, setCriticalAlert] = useState(null)

  const analyzeFrame = async (imageBase64, question = '') => {
    setIsAnalyzing(true)
    try {
      const res = await axios.post('/api/analyze', {
        imageBase64,
        userQuestion: question || undefined,
        previousSteps: analysis?.steps?.filter(s => s.completed).map(s => s.title).join(', ') || '',
        sessionContext: analysis ? `Repairing: ${analysis.device}` : '',
      })
      const data = res.data.analysis
      setAnalysis(data)
      setSession('active')
      if (data.safetyAlerts?.some(a => a.level === 'critical')) {
        setCriticalAlert(data.safetyAlerts.find(a => a.level === 'critical').message)
      }
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: `✅ **Device:** ${data.device}\n\n📋 **Diagnosis:** ${data.diagnosis}\n\n⏱ **Estimated time:** ${data.estimatedTime} | **Skill level:** ${data.complexity}\n\n🔧 **Tools needed:** ${data.toolsRequired?.join(', ')}\n\nI've prepared **${data.steps?.length} repair steps** for you. Let's begin!`
      }])
    } catch (err) {
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ Analysis failed: ${err.response?.data?.error || err.message}`
      }])
    }
    setIsAnalyzing(false)
  }

  const handleImageUpload = (file) => {
    const reader = new FileReader()
    reader.onload = e => setUploadedImage(e.target.result)
    reader.readAsDataURL(file)
  }

  const sendChat = async () => {
    if (!chatInput.trim() || isChatLoading) return
    const userMsg = chatInput.trim()
    setChatInput('')
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setIsChatLoading(true)

    const history = [...chatMessages, { role: 'user', content: userMsg }].map(m => ({ role: m.role, content: m.content }))

    try {
      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history,
          deviceContext: analysis ? `Repairing ${analysis.device}. Current step: ${analysis.steps?.[currentStepIndex]?.title}` : 'General DIY help',
        }),
      })

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''
      setChatMessages(prev => [...prev, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        for (const line of chunk.split('\n').filter(l => l.startsWith('data: '))) {
          const data = line.slice(6)
          if (data === '[DONE]') break
          try {
            const parsed = JSON.parse(data)
            if (parsed.text) {
              fullText += parsed.text
              setChatMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = { role: 'assistant', content: fullText }
                return updated
              })
            }
          } catch {}
        }
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.message}` }])
    }
    setIsChatLoading(false)
  }

  const markStepDone = (idx) => {
    setAnalysis(prev => ({ ...prev, steps: prev.steps.map((s, i) => i === idx ? { ...s, completed: true } : s) }))
    if (idx + 1 < analysis.steps.length) setCurrentStepIndex(idx + 1)
  }

  return (
    <div style={{ paddingTop: 56, height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>

      {criticalAlert && <AlertBanner message={criticalAlert} onDismiss={() => setCriticalAlert(null)} />}

      {/* Status bar */}
      <div style={{
        padding: '8px 20px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 16,
        background: 'var(--surface)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: session === 'active' ? 'var(--green)' : 'var(--text-3)',
            animation: session === 'active' ? 'pulse 1.5s infinite' : 'none',
          }} />
          <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>
            {session === 'idle' ? 'Waiting for device' : `Repairing: ${analysis?.device}`}
          </span>
        </div>

        {analysis && (
          <>
            <div style={{ width: 1, height: 14, background: 'var(--border)' }} />
            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>
              Complexity: <span style={{ color: 'var(--amber)', fontWeight: 600 }}>{analysis.complexity}</span>
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>
              Steps: <span style={{ color: 'var(--amber)', fontWeight: 600 }}>{analysis.steps?.filter(s => s.completed).length}/{analysis.steps?.length}</span>
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>
              ETA: <span style={{ color: 'var(--amber)', fontWeight: 600 }}>{analysis.estimatedTime}</span>
            </span>
          </>
        )}

        <div style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
          gemini-2.5-flash
        </div>
      </div>

      {/* 3-panel layout */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 300px 300px', overflow: 'hidden' }}>
        <VideoPane
          uploadedImage={uploadedImage}
          onImageUpload={handleImageUpload}
          onAnalyze={() => uploadedImage && analyzeFrame(uploadedImage)}
          onAnalyzeWithQuestion={q => uploadedImage && analyzeFrame(uploadedImage, q)}
          isAnalyzing={isAnalyzing}
          analysis={analysis}
        />
        <StepsPanel
          steps={analysis?.steps || []}
          currentIndex={currentStepIndex}
          onMarkDone={markStepDone}
          toolsRequired={analysis?.toolsRequired || []}
          currentFocus={analysis?.currentFocus}
        />
        <ChatPanel
          messages={chatMessages}
          input={chatInput}
          onInputChange={setChatInput}
          onSend={sendChat}
          isLoading={isChatLoading}
        />
      </div>
    </div>
  )
}