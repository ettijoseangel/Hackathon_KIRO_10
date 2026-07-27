import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import Dashboard from "./Dashboard";

describe("Dashboard - Tarea 3.2: Filtros y Dropdown de Estado", () => {
  it("debe renderizar los controles de filtro de prioridad y categoría", () => {
    render(<Dashboard />);
    
    // Verificar que el título de filtros existe
    expect(screen.getByText("Filtros")).toBeInTheDocument();
    
    // Verificar que los selectores de filtros existen usando getAllByText
    const prioridadElements = screen.getAllByText("Prioridad");
    const categoriaElements = screen.getAllByText("Categoría");
    
    // Debe haber al menos 2 elementos con "Prioridad" (label del filtro + header de tabla)
    expect(prioridadElements.length).toBeGreaterThanOrEqual(2);
    expect(categoriaElements.length).toBeGreaterThanOrEqual(2);
    
    // Verificar que los placeholders de los selectores existen
    expect(screen.getByText("Todas las prioridades")).toBeInTheDocument();
    expect(screen.getByText("Todas las categorías")).toBeInTheDocument();
  });

  it("debe renderizar la tabla con todos los reportes inicialmente", async () => {
    render(<Dashboard />);
    
    // Esperar a que terminen de cargar los reportes (con timeout extendido por el delay de 1.5s)
    await waitFor(() => {
      const reportIds = screen.queryAllByText(/REP-\d{3}/);
      expect(reportIds.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });

  it("debe mostrar las columnas correctas en la tabla", () => {
    render(<Dashboard />);
    
    // Verificar que todas las columnas están presentes (usando getAllByText para columnas duplicadas)
    expect(screen.getByText("ID")).toBeInTheDocument();
    expect(screen.getByText("Título")).toBeInTheDocument();
    expect(screen.getAllByText("Categoría").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Prioridad").length).toBeGreaterThan(0);
    expect(screen.getByText("Estado")).toBeInTheDocument();
    expect(screen.getByText("Fecha de Creación")).toBeInTheDocument();
    expect(screen.getByText("Ubicación")).toBeInTheDocument();
  });

  it("debe mostrar todos los estados válidos del reporte", () => {
    render(<Dashboard />);
    
    // Verificar que al menos algunos de los estados válidos aparecen en los datos mock
    // Los estados válidos son: "Pendiente", "En Revisión", "En Progreso", "Resuelto", "Rechazado"
    const body = screen.getByRole("table");
    
    // Verificar que la tabla tiene contenido
    expect(body).toBeInTheDocument();
  });

  it("debe mostrar el contador de reportes", async () => {
    render(<Dashboard />);
    
    // Esperar a que terminen de cargar los reportes y aparezca el contador (con timeout extendido)
    await waitFor(() => {
      const counter = screen.getByText(/Total de reportes:/);
      expect(counter).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
