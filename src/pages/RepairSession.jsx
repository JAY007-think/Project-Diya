import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import VideoPane from '../components/VideoPane.jsx'
import StepsPanel from '../components/StepsPanel.jsx'
import ChatPanel from '../components/ChatPanel.jsx'
import AlertBanner from '../components/AlertBanner.jsx'

function useWindowSize() {
  const [w, setW] = useState(window.innerWidth)
  useEffect(() => {
    const fn = () => setW(window.innerWidth)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return w
}

export default function RepairSession() {
  const w        = useWindowSize()
  const isMobile = w < 768
  const isTablet = w >= 768 && w < 1100

  const [session, setSession]                   = useState('idle')
  const [analysis, setAnalysis]                 = useState(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [activeTab, setActiveTab]               = useState('image')
  const [chatMessages, setChatMessages]         = useState([
    { role: 'assistant', content: "Hey! 👋 I'm DIYA — your AI repair buddy! Upload a photo of your broken device and let's fix it together. Or just say hi — I don't bite 😄" }
  ])
  const [uploadedImage, setUploadedImage]       = useState(null)
  const [isAnalyzing, setIsAnalyzing]           = useState(false)
  const [chatInput, setChatInput]               = useState('')
  const [isChatLoading, setIsChatLoading]       = useState(false)
  const [criticalAlert, setCriticalAlert]       = useState(null)
  const abortRef = useRef(null)

  const analyzeFrame = async (imageBase64, question = '') => {
    setIsAnalyzing(true)
    if (isMobile) setActiveTab('chat')
    setChatMessages(prev => [...prev, { role: 'assistant', content: '🔍 Analyzing your device...' }])
    try {
      const res  = await axios.post('/api/analyze', {
        imageBase64, userQuestion: question || undefined,
        previousSteps: analysis?.steps?.filter(s => s.completed).map(s => s.title).join(', ') || '',
        sessionContext: analysis ? `Repairing: ${analysis.device}` : '',
      })
      const data = res.data.analysis
      if (!data || data.error) throw new Error(data?.raw || 'Invalid AI response')
      setAnalysis(data)
      setSession('active')
      setCurrentStepIndex(0)
      const crit = data.safetyAlerts?.find(a => a.level === 'critical')
      if (crit) setCriticalAlert(crit.message)
      setChatMessages(prev => {
        const u = [...prev]
        u[u.length - 1] = {
          role: 'assistant',
          content: `✅ **${data.device}** identified!\n\n📋 ${data.diagnosis}\n\n⏱ **${data.estimatedTime}** | 🎯 **${data.complexity}**\n\n🔧 ${data.toolsRequired?.join(', ')}\n\n📝 **${data.steps?.length || 0} steps** ready — let's go! 🚀`
        }
        return u
      })
      if (isMobile) setActiveTab('steps')
    } catch (err) {
      setChatMessages(prev => {
        const u = [...prev]
        u[u.length - 1] = { role: 'assistant', content: `⚠️ ${err.response?.data?.error || err.message}` }
        return u
      })
    }
    setIsAnalyzing(false)
  }

  const handleImageUpload = (file) => {
    const reader = new FileReader()
    reader.onload = e => setUploadedImage(e.target.result)
    reader.readAsDataURL(file)
    if (isMobile) setActiveTab('image')
  }

  const sendChat = async () => {
    if (!chatInput.trim() || isChatLoading) return
    const userMsg    = chatInput.trim()
    setChatInput('')
    const newHistory = [...chatMessages, { role: 'user', content: userMsg }]
    setChatMessages([...newHistory, { role: 'assistant', content: '' }])
    setIsChatLoading(true)
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller
    try {
      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          messages: newHistory.map(m => ({ role: m.role, content: m.content })),
          deviceContext: analysis
            ? `Repairing ${analysis.device}. Step: ${analysis.steps?.[currentStepIndex]?.title}`
            : 'General DIY help',
        }),
      })
      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let fullText  = ''
      let buf       = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        const lines = buf.split('\n')
        buf = lines.pop()
        for (const line of lines) {
          const t = line.trim()
          if (!t.startsWith('data: ')) continue
          const d = t.slice(6).trim()
          if (!d || d === '[DONE]') continue
          try {
            const p = JSON.parse(d)
            if (p.text) {
              fullText += p.text
              setChatMessages(prev => { const u=[...prev]; u[u.length-1]={role:'assistant',content:fullText}; return u })
            }
          } catch {}
        }
      }
      if (!fullText) setChatMessages(prev => { const u=[...prev]; u[u.length-1]={role:'assistant',content:"Hmm, didn't get a response — try again! 🙂"}; return u })
    } catch (err) {
      if (err.name !== 'AbortError') setChatMessages(prev => { const u=[...prev]; u[u.length-1]={role:'assistant',content:`❌ ${err.message}`}; return u })
    }
    setIsChatLoading(false)
  }

  const markStepDone = (idx) => {
    setAnalysis(prev => ({ ...prev, steps: prev.steps.map((s,i) => i===idx ? {...s,completed:true} : s) }))
    if (idx + 1 < analysis.steps.length) {
      setCurrentStepIndex(idx + 1)
      setChatMessages(prev => [...prev, { role: 'assistant', content: `✅ Step ${idx+1} done! Next: **${analysis.steps[idx+1]?.title}** 💪` }])
    } else {
      setChatMessages(prev => [...prev, { role: 'assistant', content: `🎉 **All done!** Amazing work — your device is repaired! 🔧✨` }])
    }
  }

  const done  = analysis?.steps?.filter(s => s.completed).length || 0
  const total = analysis?.steps?.length || 0
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0

  const tabs = [
    { id: 'image', label: '📷 Image' },
    { id: 'steps', label: total > 0 ? `🔧 Steps (${done}/${total})` : '🔧 Steps' },
    { id: 'chat',  label: '💬 Chat' },
  ]

  const sharedProps = {
    VideoPane: {
      uploadedImage, onImageUpload: handleImageUpload,
      onAnalyze: () => uploadedImage && analyzeFrame(uploadedImage),
      onAnalyzeWithQuestion: q => uploadedImage && analyzeFrame(uploadedImage, q),
      isAnalyzing, analysis,
    },
    StepsPanel: {
      steps: analysis?.steps || [], currentIndex: currentStepIndex,
      onMarkDone: markStepDone, toolsRequired: analysis?.toolsRequired || [],
      currentFocus: analysis?.currentFocus,
    },
    ChatPanel: {
      messages: chatMessages, input: chatInput,
      onInputChange: setChatInput, onSend: sendChat, isLoading: isChatLoading,
    },
  }

  return (
    <div style={{ paddingTop: 56, height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>

      {criticalAlert && <AlertBanner message={criticalAlert} onDismiss={() => setCriticalAlert(null)} />}

      {/* Status Bar */}
      <div style={{
        padding: '7px 16px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'var(--surface)', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: session==='active' ? 'var(--green)' : isAnalyzing ? 'var(--amber)' : 'var(--text-3)',
            animation: (session==='active'||isAnalyzing) ? 'pulse 1.5s infinite' : 'none',
          }} />
          <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500, maxWidth: isMobile ? 130 : 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {isAnalyzing ? 'Analyzing...' : session==='idle' ? 'Ready to repair' : analysis?.device}
          </span>
        </div>

        {analysis && !isAnalyzing && !isMobile && (
          <>
            <div style={{ width: 1, height: 14, background: 'var(--border)' }} />
            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Level: <span style={{ color: 'var(--amber)', fontWeight: 600 }}>{analysis.complexity}</span></span>
            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>ETA: <span style={{ color: 'var(--amber)', fontWeight: 600 }}>{analysis.estimatedTime}</span></span>
          </>
        )}

        {total > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: isMobile ? 50 : 80, height: 4, background: 'var(--surface3)', borderRadius: 99 }}>
              <div style={{ height: '100%', borderRadius: 99, width: `${pct}%`, background: pct===100?'var(--green)':'var(--amber)', transition: 'width 0.4s' }} />
            </div>
            <span style={{ fontSize: 11, color: pct===100?'var(--green)':'var(--amber)', fontWeight: 600 }}>{done}/{total}</span>
          </div>
        )}

        {!isMobile && (
          <div style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
            gemini-2.5-flash
          </div>
        )}
      </div>

      {/* Mobile Tab Bar */}
      {isMobile && (
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0 }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              flex: 1, padding: '10px 4px', border: 'none', fontSize: 11, fontWeight: 600,
              background: activeTab===tab.id ? 'rgba(245,158,11,0.1)' : 'transparent',
              color: activeTab===tab.id ? 'var(--amber)' : 'var(--text-3)',
              borderBottom: `2px solid ${activeTab===tab.id ? 'var(--amber)' : 'transparent'}`,
              transition: 'all 0.15s', cursor: 'pointer',
            }}>{tab.label}</button>
          ))}
        </div>
      )}

      {/* Main Content */}
      {isMobile ? (
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{ display: activeTab==='image' ? 'flex' : 'none', flexDirection: 'column', height: '100%' }}>
            <VideoPane {...sharedProps.VideoPane} />
          </div>
          <div style={{ display: activeTab==='steps' ? 'flex' : 'none', flexDirection: 'column', height: '100%' }}>
            <StepsPanel {...sharedProps.StepsPanel} />
          </div>
          <div style={{ display: activeTab==='chat' ? 'flex' : 'none', flexDirection: 'column', height: '100%' }}>
            <ChatPanel {...sharedProps.ChatPanel} />
          </div>
        </div>
      ) : isTablet ? (
        <div style={{ flex: 1, overflow: 'hidden', display: 'grid', gridTemplateRows: '55% 45%', gridTemplateColumns: '1fr 1fr' }}>
          <div style={{ gridColumn: '1 / -1', overflow: 'hidden', borderBottom: '1px solid var(--border)' }}>
            <VideoPane {...sharedProps.VideoPane} />
          </div>
          <div style={{ overflow: 'hidden', borderRight: '1px solid var(--border)' }}>
            <StepsPanel {...sharedProps.StepsPanel} />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <ChatPanel {...sharedProps.ChatPanel} />
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 300px 300px', overflow: 'hidden' }}>
          <VideoPane {...sharedProps.VideoPane} />
          <StepsPanel {...sharedProps.StepsPanel} />
          <ChatPanel {...sharedProps.ChatPanel} />
        </div>
      )}
    </div>
  )
}