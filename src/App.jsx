import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import RepairSession from './pages/RepairSession.jsx'
import Nav from './components/Nav.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/repair" element={<RepairSession />} />
      </Routes>
    </BrowserRouter>
  )
}
