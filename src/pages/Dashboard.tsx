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
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Clock,
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle,
  MapPin,
  Calendar,
  Filter,
  RotateCcw,
  FileText,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";

// Componente de fila skeleton para la tabla
function TableRowSkeleton() {
  return (
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
}

// Componente de tarjeta KPI
function KpiCard({
  icon: Icon,
  label,
  value,
  color,
  bgColor,
  borderColor,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: string;
  bgColor: string;
  borderColor: string;
}) {
  return (
    <div className={`bg-white rounded-xl p-5 border-2 ${borderColor} shadow-lg hover:shadow-xl transition-shadow`}>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

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

  // Estadísticas de los reportes
  const stats = useMemo(() => {
    const total = reports.length;
    const pendientes = reports.filter(r => r.estado === "Pendiente").length;
    const enProgreso = reports.filter(r => r.estado === "En Progreso" || r.estado === "En Revisión").length;
    const resueltos = reports.filter(r => r.estado === "Resuelto").length;
    const altaPrioridad = reports.filter(r => r.prioridad === "Alta").length;

    return { total, pendientes, enProgreso, resueltos, altaPrioridad };
  }, [reports]);

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

  const hasActiveFilters = priorityFilter !== "all" || categoryFilter !== "all";

  const clearFilters = () => {
    setPriorityFilter("all");
    setCategoryFilter("all");
  };

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
      month: "short",
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

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case "Alta":
        return { color: "bg-red-100 text-red-800 border-red-200", icon: AlertTriangle };
      case "Media":
        return { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: AlertCircle };
      case "Baja":
        return { color: "bg-green-100 text-green-800 border-green-200", icon: ShieldCheck };
      default:
        return { color: "bg-gray-100 text-gray-800 border-gray-200", icon: AlertCircle };
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Pendiente":
        return { color: "bg-gray-100 text-gray-800 border-gray-200", icon: Clock };
      case "En Revisión":
        return { color: "bg-blue-100 text-blue-800 border-blue-200", icon: Eye };
      case "En Progreso":
        return { color: "bg-purple-100 text-purple-800 border-purple-200", icon: TrendingUp };
      case "Resuelto":
        return { color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle };
      case "Rechazado":
        return { color: "bg-red-100 text-red-800 border-red-200", icon: XCircle };
      default:
        return { color: "bg-gray-100 text-gray-800 border-gray-200", icon: Clock };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl p-8 md:p-10 text-white shadow-2xl border-4 border-indigo-800">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Dashboard Administrativo</h1>
              <p className="text-lg text-blue-100 font-medium">
                Gestión y seguimiento de reportes ciudadanos
              </p>
            </div>
            {!isLoadingReports && (
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/20">
                <FileText className="w-5 h-5 text-blue-200" />
                <div>
                  <p className="text-sm text-blue-200 font-medium">Total activos</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* KPI Cards */}
        {!isLoadingReports && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              icon={Clock}
              label="Pendientes"
              value={stats.pendientes}
              color="text-amber-600"
              bgColor="bg-amber-50"
              borderColor="border-amber-200"
            />
            <KpiCard
              icon={TrendingUp}
              label="En proceso"
              value={stats.enProgreso}
              color="text-blue-600"
              bgColor="bg-blue-50"
              borderColor="border-blue-200"
            />
            <KpiCard
              icon={CheckCircle}
              label="Resueltos"
              value={stats.resueltos}
              color="text-green-600"
              bgColor="bg-green-50"
              borderColor="border-green-200"
            />
            <KpiCard
              icon={AlertTriangle}
              label="Alta prioridad"
              value={stats.altaPrioridad}
              color="text-red-600"
              bgColor="bg-red-50"
              borderColor="border-red-200"
            />
          </div>
        )}

        {/* Skeleton de KPIs durante carga */}
        {isLoadingReports && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl p-5 border-2 border-gray-200 shadow-lg animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-gray-100">
                    <div className="w-6 h-6 bg-gray-200 rounded"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                    <div className="h-7 bg-gray-200 rounded w-10"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border-2 border-blue-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Filter className="w-5 h-5 text-white" />
              </div>
              Filtros de Búsqueda
            </h2>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="border-2 border-gray-300 hover:border-red-300 hover:bg-red-50 hover:text-red-700 transition-colors font-semibold"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Limpiar filtros
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Filtro de Prioridad */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Prioridad
              </label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter} disabled={isLoadingReports}>
                <SelectTrigger className="h-12 border-2 border-gray-300 hover:border-blue-500 transition-colors bg-white">
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
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Categoría
              </label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter} disabled={isLoadingReports}>
                <SelectTrigger className="h-12 border-2 border-gray-300 hover:border-blue-500 transition-colors bg-white">
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

        {/* Tabla de reportes */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-blue-100">
          {/* Encabezado de la tabla */}
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800">Lista de Reportes</h3>
            {!isLoadingReports && hasActiveFilters && (
              <span className="text-sm font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-full border border-blue-200">
                {filteredAndSortedReports.length} de {reports.length} reportes
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    ID
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Reporte
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Prioridad
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Ubicación
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {isLoadingReports ? (
                  <>
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                  </>
                ) : (
                  filteredAndSortedReports.map((report) => {
                    const priorityConfig = getPriorityConfig(report.prioridad);
                    const statusConfig = getStatusConfig(report.estado);
                    const PriorityIcon = priorityConfig.icon;
                    const StatusIcon = statusConfig.icon;

                    return (
                      <tr
                        key={report.id}
                        className="hover:bg-blue-50/50 transition-colors group"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-200">
                            {report.id}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                              {report.titulo}
                            </p>
                            {report.descripcion && (
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                {report.descripcion}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-700">
                            {report.categoria}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full border ${priorityConfig.color}`}>
                            <PriorityIcon className="w-3.5 h-3.5" />
                            {report.prioridad}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Select
                            value={report.estado}
                            onValueChange={(newStatus: string) => updateReportStatus(report.id, newStatus as ReportStatus)}
                            disabled={updatingReportId === report.id}
                          >
                            <SelectTrigger className="w-[160px] border-2 bg-white h-9">
                              <SelectValue>
                                {updatingReportId === report.id ? (
                                  <div className="flex items-center">
                                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                    <span className="text-xs font-semibold">Actualizando...</span>
                                  </div>
                                ) : (
                                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-bold rounded-full border ${statusConfig.color}`}>
                                    <StatusIcon className="w-3 h-3" />
                                    {report.estado}
                                  </span>
                                )}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pendiente">
                                <span className="flex items-center gap-2">
                                  <Clock className="w-3.5 h-3.5 text-gray-500" />
                                  Pendiente
                                </span>
                              </SelectItem>
                              <SelectItem value="En Revisión">
                                <span className="flex items-center gap-2">
                                  <Eye className="w-3.5 h-3.5 text-blue-500" />
                                  En Revisión
                                </span>
                              </SelectItem>
                              <SelectItem value="En Progreso">
                                <span className="flex items-center gap-2">
                                  <TrendingUp className="w-3.5 h-3.5 text-purple-500" />
                                  En Progreso
                                </span>
                              </SelectItem>
                              <SelectItem value="Resuelto">
                                <span className="flex items-center gap-2">
                                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                                  Resuelto
                                </span>
                              </SelectItem>
                              <SelectItem value="Rechazado">
                                <span className="flex items-center gap-2">
                                  <XCircle className="w-3.5 h-3.5 text-red-500" />
                                  Rechazado
                                </span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            <span className="font-medium">{formatDate(report.fechaCreacion)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600 max-w-[200px]">
                            <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            <span className="truncate font-medium">{formatLocation(report.ubicacion)}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {!isLoadingReports && filteredAndSortedReports.length === 0 && (
            <div className="text-center py-16 px-6">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5 border-2 border-blue-100">
                <FileText className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {hasActiveFilters ? "Sin resultados" : "No hay reportes"}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                {hasActiveFilters
                  ? "No se encontraron reportes con los filtros seleccionados. Intenta con una combinación diferente."
                  : "Aún no se han registrado reportes ciudadanos en el sistema."}
              </p>
              {hasActiveFilters && (
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="border-2 border-blue-300 text-blue-700 hover:bg-blue-50 font-semibold"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Limpiar filtros
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Footer con resumen */}
        {!isLoadingReports && filteredAndSortedReports.length > 0 && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-5 rounded-xl shadow-lg border-2 border-indigo-800">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-200" />
                <span className="text-lg font-bold">
                  Mostrando {filteredAndSortedReports.length} {filteredAndSortedReports.length === 1 ? "reporte" : "reportes"}
                </span>
                {hasActiveFilters && (
                  <span className="text-sm text-blue-200 font-medium">
                    (filtrado de {reports.length} totales)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-blue-100">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-400"></span>
                  {stats.altaPrioridad} urgentes
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  {stats.pendientes} pendientes
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-400"></span>
                  {stats.resueltos} resueltos
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
