import { useState, useMemo, useEffect } from "react";
import { mockReports } from "../data/mockReports";
import type { Report, Location, ReportStatus } from "../types/report";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  
  // Estados de carga
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [updatingReportId, setUpdatingReportId] = useState<string | null>(null);

  // Simular carga inicial de reportes (GET)
  useEffect(() => {
    const loadReports = async () => {
      setIsLoadingReports(true);
      try {
        // Simular delay de red (1.5 segundos)
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // TODO: Aquí se implementará la petición HTTP GET real al backend
        setReports(mockReports);
      } catch (error) {
        console.error('Error al cargar reportes:', error);
      } finally {
        setIsLoadingReports(false);
      }
    };

    loadReports();
  }, []);

  // Obtener categorías únicas de los reportes
  const categories = useMemo(() => {
    const uniqueCategories = new Set(mockReports.map(r => r.categoria));
    return Array.from(uniqueCategories).sort();
  }, []);

  // Filtrar y ordenar reportes
  const filteredAndSortedReports = useMemo(() => {
    let filtered = [...reports];

    // Aplicar filtro de prioridad
    if (priorityFilter !== "all") {
      filtered = filtered.filter(r => r.prioridad === priorityFilter);
    }

    // Aplicar filtro de categoría
    if (categoryFilter !== "all") {
      filtered = filtered.filter(r => r.categoria === categoryFilter);
    }

    // Ordenar por fecha de creación en orden descendente (más recientes primero)
    return filtered.sort((a, b) => {
      return b.fechaCreacion.getTime() - a.fechaCreacion.getTime();
    });
  }, [reports, priorityFilter, categoryFilter]);

  // Función para actualizar el estado de un reporte
  const updateReportStatus = async (reportId: string, newStatus: ReportStatus) => {
    setUpdatingReportId(reportId);
    
    try {
      // Simular delay de red (1 segundo)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // TODO: Aquí se implementará la petición HTTP PATCH real al backend
      setReports(prevReports =>
        prevReports.map(report =>
          report.id === reportId
            ? { ...report, estado: newStatus }
            : report
        )
      );
    } catch (error) {
      console.error('Error al actualizar el estado del reporte:', error);
      alert('Error al actualizar el estado. Por favor, intenta de nuevo.');
    } finally {
      setUpdatingReportId(null);
    }
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat("es-MX", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  };

  const formatLocation = (ubicacion: string | Location): string => {
    if (typeof ubicacion === "string") {
      return ubicacion;
    }
    if (ubicacion.address) {
      return ubicacion.address;
    }
    if (ubicacion.lat && ubicacion.lng) {
      return `${ubicacion.lat.toFixed(4)}, ${ubicacion.lng.toFixed(4)}`;
    }
    return "Sin ubicación";
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case "Alta":
        return "bg-red-100 text-red-800";
      case "Media":
        return "bg-yellow-100 text-yellow-800";
      case "Baja":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "Pendiente":
        return "bg-gray-100 text-gray-800";
      case "En Revisión":
        return "bg-blue-100 text-blue-800";
      case "En Progreso":
        return "bg-purple-100 text-purple-800";
      case "Resuelto":
        return "bg-green-100 text-green-800";
      case "Rechazado":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Componente de fila skeleton para la tabla
  const TableRowSkeleton = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </td>
      <td className="px-6 py-4">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
          <div className="h-3 bg-gray-200 rounded w-48"></div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-5 bg-gray-200 rounded-full w-16"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-9 bg-gray-200 rounded w-32"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-28"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-36"></div>
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header con gradiente más saturado */}
        <div className="mb-8 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl p-8 text-white shadow-2xl">
          <h1 className="text-4xl font-bold mb-2">Dashboard Administrativo</h1>
          <p className="text-lg text-blue-100">
            Gestión y seguimiento de reportes ciudadanos
          </p>
        </div>

        {/* Controles de filtro con fondo más sólido */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-blue-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            Filtros de Búsqueda
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Filtro de Prioridad */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Prioridad
              </label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter} disabled={isLoadingReports}>
                <SelectTrigger className="h-12 border-2 border-gray-300 hover:border-blue-500 transition-colors">
                  <SelectValue placeholder="Todas las prioridades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las prioridades</SelectItem>
                  <SelectItem value="Alta">Alta</SelectItem>
                  <SelectItem value="Media">Media</SelectItem>
                  <SelectItem value="Baja">Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtro de Categoría */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Categoría
              </label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter} disabled={isLoadingReports}>
                <SelectTrigger className="h-12 border-2 border-gray-300 hover:border-blue-500 transition-colors">
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-blue-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y-2 divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
                  >
                    ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
                  >
                    Título
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
                  >
                    Categoría
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
                  >
                    Prioridad
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
                  >
                    Estado
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
                  >
                    Fecha de Creación
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
                  >
                    Ubicación
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoadingReports ? (
                  // Mostrar skeleton rows mientras carga
                  <>
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                  </>
                ) : (
                  filteredAndSortedReports.map((report) => (
                  <tr key={report.id} className="hover:bg-blue-50 transition-colors border-l-4 border-transparent hover:border-blue-500">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {report.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs">
                        <div className="font-semibold text-gray-900">{report.titulo}</div>
                        {report.descripcion && (
                          <div className="text-gray-600 text-xs mt-1 truncate">
                            {report.descripcion}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                      {report.categoria}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${getPriorityColor(
                          report.prioridad
                        )}`}
                      >
                        {report.prioridad}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Select
                        value={report.estado}
                        onValueChange={(newStatus: string) => updateReportStatus(report.id, newStatus as ReportStatus)}
                        disabled={updatingReportId === report.id}
                      >
                        <SelectTrigger className="w-[150px] border-2">
                          <SelectValue>
                            {updatingReportId === report.id ? (
                              <div className="flex items-center">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                <span className="text-xs font-semibold">Actualizando...</span>
                              </div>
                            ) : (
                              <span
                                className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${getStatusColor(
                                  report.estado
                                )}`}
                              >
                                {report.estado}
                              </span>
                            )}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pendiente">Pendiente</SelectItem>
                          <SelectItem value="En Revisión">En Revisión</SelectItem>
                          <SelectItem value="En Progreso">En Progreso</SelectItem>
                          <SelectItem value="Resuelto">Resuelto</SelectItem>
                          <SelectItem value="Rechazado">Rechazado</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                      {formatDate(report.fechaCreacion)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="max-w-xs truncate font-medium">{formatLocation(report.ubicacion)}</div>
                    </td>
                  </tr>
                ))
              )}
              </tbody>
            </table>
          </div>

          {!isLoadingReports && filteredAndSortedReports.length === 0 && (
            <div className="text-center py-16 bg-gray-50">
              <p className="text-gray-500 text-lg font-medium">No hay reportes disponibles</p>
            </div>
          )}
        </div>

        {!isLoadingReports && (
          <div className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-4 rounded-xl shadow-lg">
            <span className="text-lg font-bold">Total de reportes:</span> 
            <span className="text-2xl font-bold ml-3">{filteredAndSortedReports.length}</span>
          </div>
        )}
      </div>
    </div>
  );
}
