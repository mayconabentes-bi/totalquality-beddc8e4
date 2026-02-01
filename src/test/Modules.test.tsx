import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Modules from "@/components/Modules";

describe("Modules - Role-based Visibility", () => {
  it("should show all modules when no role is provided (public page)", () => {
    render(<Modules />);
    
    expect(screen.getByText("Documentos")).toBeInTheDocument();
    expect(screen.getByText("Auditorias")).toBeInTheDocument();
    expect(screen.getByText("Indicadores")).toBeInTheDocument();
    expect(screen.getByText("Não Conformidades")).toBeInTheDocument();
    expect(screen.getByText("Treinamentos")).toBeInTheDocument();
    expect(screen.getByText("Processos")).toBeInTheDocument();
  });

  it("should show all modules for total_quality_iso role", () => {
    render(<Modules role="total_quality_iso" />);
    
    expect(screen.getByText("Documentos")).toBeInTheDocument();
    expect(screen.getByText("Auditorias")).toBeInTheDocument();
    expect(screen.getByText("Indicadores")).toBeInTheDocument();
    expect(screen.getByText("Não Conformidades")).toBeInTheDocument();
    expect(screen.getByText("Treinamentos")).toBeInTheDocument();
    expect(screen.getByText("Processos")).toBeInTheDocument();
  });

  it("should hide Documentos for auditor role", () => {
    render(<Modules role="auditor" />);
    
    expect(screen.queryByText("Documentos")).not.toBeInTheDocument();
    expect(screen.getByText("Auditorias")).toBeInTheDocument();
    expect(screen.getByText("Indicadores")).toBeInTheDocument();
    expect(screen.getByText("Não Conformidades")).toBeInTheDocument();
    expect(screen.getByText("Treinamentos")).toBeInTheDocument();
    expect(screen.getByText("Processos")).toBeInTheDocument();
  });

  it("should hide Auditorias for empresa role", () => {
    render(<Modules role="empresa" />);
    
    expect(screen.getByText("Documentos")).toBeInTheDocument();
    expect(screen.queryByText("Auditorias")).not.toBeInTheDocument();
    expect(screen.getByText("Indicadores")).toBeInTheDocument();
    expect(screen.getByText("Não Conformidades")).toBeInTheDocument();
    expect(screen.getByText("Treinamentos")).toBeInTheDocument();
    expect(screen.getByText("Processos")).toBeInTheDocument();
  });
});
