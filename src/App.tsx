import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ReportForm from './pages/ReportForm'
import Dashboard from './pages/Dashboard'
import MyReports from './pages/MyReports'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<ReportForm />} />
          <Route path="mis-reportes" element={<MyReports />} />
          {/* Dashboard accesible solo por URL directa (no aparece en menú) */}
          <Route path="dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
