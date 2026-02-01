import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

// Mock dependencies
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      getSession: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const createMockSession = (userId: string): Session => ({
  user: { id: userId } as Session["user"],
  access_token: "mock-token",
  refresh_token: "mock-refresh-token",
  expires_in: 3600,
  token_type: "bearer",
  expires_at: Date.now() / 1000 + 3600,
});

describe("Dashboard - Role-based Visibility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should hide Documentos for auditor role", async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: {
        session: createMockSession("user-123"),
      },
      error: null,
    });

    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockSingle = vi.fn()
      .mockResolvedValueOnce({
        data: {
          id: "profile-123",
          full_name: "Test Auditor",
          role: "auditor",
          company_id: "company-123",
        },
        error: null,
      })
      .mockResolvedValueOnce({
        data: {
          id: "company-123",
          name: "Test Company",
          cnpj: null,
          phone: null,
          industry: null,
          size: null,
        },
        error: null,
      });

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
    } as never);

    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ single: mockSingle });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Test Auditor/)).toBeInTheDocument();
    });

    // Check that Documentos module card is NOT shown for auditor
    const moduleCards = screen.queryAllByText("Documentos");
    const documentosModuleCard = moduleCards.find(el => 
      el.className.includes("font-display") && el.tagName === "H3"
    );
    expect(documentosModuleCard).toBeUndefined();
    
    // Check that Auditorias module card IS shown
    const auditoriasCards = screen.getAllByText("Auditorias");
    const auditoriasModuleCard = auditoriasCards.find(el => 
      el.className.includes("font-display") && el.tagName === "H3"
    );
    expect(auditoriasModuleCard).toBeDefined();
    
    // Check that Configurações module card IS shown
    expect(screen.getByRole("heading", { name: "Configurações", level: 3 })).toBeInTheDocument();
  });

  it("should hide Auditorias and Configurações for empresa role", async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: {
        session: createMockSession("user-456"),
      },
      error: null,
    });

    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockSingle = vi.fn()
      .mockResolvedValueOnce({
        data: {
          id: "profile-456",
          full_name: "Test Empresa",
          role: "empresa",
          company_id: "company-456",
        },
        error: null,
      })
      .mockResolvedValueOnce({
        data: {
          id: "company-456",
          name: "Test Company 2",
          cnpj: null,
          phone: null,
          industry: null,
          size: null,
        },
        error: null,
      });

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
    } as never);

    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ single: mockSingle });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Test Empresa/)).toBeInTheDocument();
    });

    // Check that Auditorias module card is NOT shown for empresa
    const auditoriasCards = screen.queryAllByText("Auditorias");
    const auditoriasModuleCard = auditoriasCards.find(el => 
      el.className.includes("font-display") && el.tagName === "H3"
    );
    expect(auditoriasModuleCard).toBeUndefined();
    
    // Check that Configurações module card is NOT shown for empresa
    expect(screen.queryByRole("heading", { name: "Configurações", level: 3 })).not.toBeInTheDocument();
    
    // Check that Documentos module card IS shown
    expect(screen.getByRole("heading", { name: "Documentos", level: 3 })).toBeInTheDocument();
  });

  it("should show all modules for total_quality_iso role", async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: {
        session: createMockSession("user-789"),
      },
      error: null,
    });

    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockSingle = vi.fn()
      .mockResolvedValueOnce({
        data: {
          id: "profile-789",
          full_name: "Test Admin",
          role: "total_quality_iso",
          company_id: "company-789",
        },
        error: null,
      })
      .mockResolvedValueOnce({
        data: {
          id: "company-789",
          name: "Total Quality Company",
          cnpj: null,
          phone: null,
          industry: null,
          size: null,
        },
        error: null,
      });

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
    } as never);

    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ single: mockSingle });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Test Admin/)).toBeInTheDocument();
    });

    // Check that ALL module cards are shown for total_quality_iso
    expect(screen.getByRole("heading", { name: "Documentos", level: 3 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Configurações", level: 3 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Não Conformidades", level: 3 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Indicadores", level: 3 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Treinamentos", level: 3 })).toBeInTheDocument();
    
    // Auditorias appears in multiple places, check for the module card
    const auditoriasCards = screen.getAllByText("Auditorias");
    const auditoriasModuleCard = auditoriasCards.find(el => 
      el.className.includes("font-display") && el.tagName === "H3"
    );
    expect(auditoriasModuleCard).toBeDefined();
  });

  it("should show all modules and Painel Master for master role", async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: {
        session: createMockSession("user-master"),
      },
      error: null,
    });

    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockSingle = vi.fn()
      .mockResolvedValueOnce({
        data: {
          id: "profile-master",
          full_name: "Master User",
          role: "master",
          company_id: null,
        },
        error: null,
      })
      .mockResolvedValueOnce({
        data: null,
        error: null,
      });

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
    } as never);

    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ single: mockSingle });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Master User/)).toBeInTheDocument();
    });

    // Check that ALL module cards are shown for master
    expect(screen.getByRole("heading", { name: "Documentos", level: 3 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Configurações", level: 3 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Não Conformidades", level: 3 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Indicadores", level: 3 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Treinamentos", level: 3 })).toBeInTheDocument();
    
    // Auditorias appears in multiple places, check for the module card
    const auditoriasCards = screen.getAllByText("Auditorias");
    const auditoriasModuleCard = auditoriasCards.find(el => 
      el.className.includes("font-display") && el.tagName === "H3"
    );
    expect(auditoriasModuleCard).toBeDefined();

    // Check that Painel Master quick action is shown
    expect(screen.getByText("Painel Master")).toBeInTheDocument();
  });
});
