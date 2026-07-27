import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import ReportForm from './pages/ReportForm'
import MyReports from './pages/MyReports'
import MapaIncidencias from './pages/MapaIncidencias'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing sin layout (tiene su propio diseño) */}
        <Route path="/" element={<Landing />} />

        {/* Rutas con layout de navegación */}
        <Route element={<Layout />}>
          <Route path="crear-reporte" element={<ReportForm />} />
          <Route path="mis-reportes" element={<MyReports />} />
          <Route path="mapa" element={<MapaIncidencias />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
