import type { Report } from "../types/report";

export const mockReports: Report[] = [
  {
    id: "REP-001",
    titulo: "Fuga de agua en avenida principal",
    categoria: "Servicio de Agua",
    prioridad: "Alta",
    estado: "En Progreso",
    fechaCreacion: new Date("2025-01-29T10:30:00"),
    ubicacion: "Av. Juárez #1234, Colonia Centro",
    descripcion: "Fuga considerable de agua potable que está inundando la calle y desperdiciando recurso"
  },
  {
    id: "REP-002",
    titulo: "Alumbrado público fundido en parque",
    categoria: "Servicio Eléctrico",
    prioridad: "Media",
    estado: "Pendiente",
    fechaCreacion: new Date("2025-01-28T15:45:00"),
    ubicacion: "Parque Municipal, Zona Norte",
    descripcion: "Luminaria apagada desde hace una semana, zona oscura de noche"
  },
  {
    id: "REP-003",
    titulo: "Drenaje tapado en esquina",
    categoria: "Servicio de Agua",
    prioridad: "Alta",
    estado: "En Revisión",
    fechaCreacion: new Date("2025-01-28T08:20:00"),
    ubicacion: "Calle Morelos esquina con Hidalgo",
    descripcion: "Alcantarilla tapada que provoca inundación cuando llueve"
  },
  {
    id: "REP-004",
    titulo: "Basura acumulada en terreno baldío",
    categoria: "Servicios Municipales",
    prioridad: "Media",
    estado: "Pendiente",
    fechaCreacion: new Date("2025-01-27T14:00:00"),
    ubicacion: "Calle Independencia #567",
    descripcion: "Acumulación de basura que está atrayendo plagas y genera mal olor"
  },
  {
    id: "REP-005",
    titulo: "Poste de luz inclinado peligrosamente",
    categoria: "Servicio Eléctrico",
    prioridad: "Alta",
    estado: "En Progreso",
    fechaCreacion: new Date("2025-01-26T11:30:00"),
    ubicacion: "Cruce de Av. Reforma con Calle 5 de Mayo",
    descripcion: "Poste a punto de caer después del último temporal, cables expuestos"
  },
  {
    id: "REP-006",
    titulo: "Bache grande en calle principal",
    categoria: "Servicios Municipales",
    prioridad: "Alta",
    estado: "En Progreso",
    fechaCreacion: new Date("2025-01-26T09:15:00"),
    ubicacion: "Calle Allende #890",
    descripcion: "Bache de aproximadamente 1 metro que ha causado daños a varios vehículos"
  },
  {
    id: "REP-007",
    titulo: "Falta de agua en toda la colonia",
    categoria: "Servicio de Agua",
    prioridad: "Alta",
    estado: "En Revisión",
    fechaCreacion: new Date("2025-01-25T16:20:00"),
    ubicacion: "Colonia Los Pinos (toda la zona)",
    descripcion: "Llevamos 3 días sin servicio de agua, afecta a más de 200 familias"
  },
  {
    id: "REP-008",
    titulo: "Cables caídos en la banqueta",
    categoria: "Servicio Eléctrico",
    prioridad: "Alta",
    estado: "Resuelto",
    fechaCreacion: new Date("2025-01-25T10:00:00"),
    ubicacion: "Calle Zaragoza #234",
    descripcion: "Cables de luz caídos que representan riesgo de electrocución para peatones"
  },
  {
    id: "REP-009",
    titulo: "Señalización dañada en cruce peligroso",
    categoria: "Servicios Municipales",
    prioridad: "Media",
    estado: "Pendiente",
    fechaCreacion: new Date("2025-01-24T13:45:00"),
    ubicacion: "Cruce Av. Insurgentes con Blvd. Miguel Alemán",
    descripcion: "Señal de alto y semáforo dañados, han ocurrido accidentes"
  },
  {
    id: "REP-010",
    titulo: "Fuga de drenaje con mal olor",
    categoria: "Servicio de Agua",
    prioridad: "Media",
    estado: "Rechazado",
    fechaCreacion: new Date("2025-01-24T07:30:00"),
    ubicacion: "Calle Constitución #45",
    descripcion: "Aguas negras saliendo de una coladera, genera mal olor en toda la cuadra"
  }
];
