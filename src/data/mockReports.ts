import type { Report } from "../types/report";

export const mockReports: Report[] = [
  {
    id: "REP-001",
    titulo: "Bache grande en avenida principal",
    categoria: "Vialidad",
    prioridad: "Alta",
    estado: "En Progreso",
    fechaCreacion: new Date("2025-01-29T10:30:00"),
    ubicacion: "Av. Juárez #1234, Colonia Centro",
    descripcion: "Bache de aproximadamente 1 metro de diámetro que representa peligro para vehículos"
  },
  {
    id: "REP-002",
    titulo: "Luminaria fundida en parque",
    categoria: "Alumbrado Público",
    prioridad: "Media",
    estado: "Pendiente",
    fechaCreacion: new Date("2025-01-28T15:45:00"),
    ubicacion: "Parque Municipal, Zona Norte",
    descripcion: "Luminaria apagada desde hace una semana"
  },
  {
    id: "REP-003",
    titulo: "Fuga de agua en esquina",
    categoria: "Agua y Drenaje",
    prioridad: "Alta",
    estado: "En Revisión",
    fechaCreacion: new Date("2025-01-28T08:20:00"),
    ubicacion: "Calle Morelos esquina con Hidalgo",
    descripcion: "Fuga considerable de agua potable que está inundando la calle"
  },
  {
    id: "REP-004",
    titulo: "Basura acumulada en terreno baldío",
    categoria: "Limpieza",
    prioridad: "Media",
    estado: "Pendiente",
    fechaCreacion: new Date("2025-01-27T14:00:00"),
    ubicacion: "Calle Independencia #567",
    descripcion: "Acumulación de basura que está atrayendo plagas"
  },
  {
    id: "REP-005",
    titulo: "Señal de tránsito vandalizada",
    categoria: "Señalización",
    prioridad: "Baja",
    estado: "Resuelto",
    fechaCreacion: new Date("2025-01-26T11:30:00"),
    ubicacion: "Cruce de Av. Reforma con Calle 5 de Mayo",
    descripcion: "Señal de alto con graffiti que dificulta su lectura"
  },
  {
    id: "REP-006",
    titulo: "Árbol caído bloqueando calle",
    categoria: "Áreas Verdes",
    prioridad: "Alta",
    estado: "En Progreso",
    fechaCreacion: new Date("2025-01-26T09:15:00"),
    ubicacion: "Calle Allende #890",
    descripcion: "Árbol derribado por viento fuerte que impide el paso vehicular"
  },
  {
    id: "REP-007",
    titulo: "Coladera destapada peligrosa",
    categoria: "Vialidad",
    prioridad: "Alta",
    estado: "En Revisión",
    fechaCreacion: new Date("2025-01-25T16:20:00"),
    ubicacion: "Calle Zaragoza #234",
    descripcion: "Coladera sin tapa que representa riesgo para peatones y vehículos"
  },
  {
    id: "REP-008",
    titulo: "Grafitis en edificio público",
    categoria: "Vandalismo",
    prioridad: "Baja",
    estado: "Rechazado",
    fechaCreacion: new Date("2025-01-25T10:00:00"),
    ubicacion: "Biblioteca Municipal",
    descripcion: "Múltiples grafitis en la fachada del edificio"
  },
  {
    id: "REP-009",
    titulo: "Semáforo descompuesto",
    categoria: "Señalización",
    prioridad: "Alta",
    estado: "En Progreso",
    fechaCreacion: new Date("2025-01-24T13:45:00"),
    ubicacion: "Cruce Av. Insurgentes con Blvd. Miguel Alemán",
    descripcion: "Semáforo que no funciona causando congestionamiento"
  },
  {
    id: "REP-010",
    titulo: "Alumbrado público intermitente",
    categoria: "Alumbrado Público",
    prioridad: "Media",
    estado: "Pendiente",
    fechaCreacion: new Date("2025-01-24T07:30:00"),
    ubicacion: "Calle Constitución, toda la cuadra",
    descripcion: "Varias luminarias parpadeando durante la noche"
  }
];
