import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Auth from "@/pages/Auth";

// Mock dependencies
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
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

describe("Auth Component", () => {
  it("should render signup form with CNPJ field", () => {
    render(
      <BrowserRouter>
        <Auth />
      </BrowserRouter>
    );

    // Check that signup mode is default
    expect(screen.getByText("Cadastrar")).toBeInTheDocument();

    // Check that all 6 required fields are present
    expect(screen.getByLabelText(/seu nome completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nome da empresa/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cnpj/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/telefone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
  });

  it("should not render role selector component", () => {
    render(
      <BrowserRouter>
        <Auth />
      </BrowserRouter>
    );

    // The role selector should not be present
    expect(screen.queryByText("Modalidade de Acesso")).not.toBeInTheDocument();
    expect(screen.queryByText("Empresa (Cliente)")).not.toBeInTheDocument();
    expect(screen.queryByText("Auditor ISO")).not.toBeInTheDocument();
    expect(screen.queryByText("Total Quality ISO")).not.toBeInTheDocument();
  });

  it("should render CNPJ input with correct placeholder", () => {
    render(
      <BrowserRouter>
        <Auth />
      </BrowserRouter>
    );

    const cnpjInput = screen.getByPlaceholderText("00.000.000/0000-00");
    expect(cnpjInput).toBeInTheDocument();
  });
});
