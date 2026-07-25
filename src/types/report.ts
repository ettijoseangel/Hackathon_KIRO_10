export type ReportStatus = 
  | "Pendiente" 
  | "En Revisión" 
  | "En Progreso" 
  | "Resuelto" 
  | "Rechazado";

export type ReportPriority = "Alta" | "Media" | "Baja";

export interface Location {
  lat?: number;
  lng?: number;
  address?: string;
}

export interface Report {
  id: string;
  titulo: string;
  categoria: string;
  prioridad: ReportPriority;
  estado: ReportStatus;
  fechaCreacion: Date;
  ubicacion: Location | string;
  descripcion?: string;
}
