import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Session } from "@supabase/supabase-js";

// Mock dependencies
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
    from: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

const TestChild = () => <div>Protected Content</div>;

const createMockSession = (userId: string): Session => ({
  user: { id: userId } as Session["user"],
  access_token: "mock-token",
  refresh_token: "mock-refresh-token",
  expires_in: 3600,
  token_type: "bearer",
  expires_at: Date.now() / 1000 + 3600,
});

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should show loading state initially", () => {
    vi.mocked(supabase.auth.getSession).mockReturnValue(
      new Promise(() => {}) // Never resolves to keep loading state
    );

    render(
      <BrowserRouter>
        <ProtectedRoute>
          <TestChild />
        </ProtectedRoute>
      </BrowserRouter>
    );

    expect(screen.getByText("Validando credenciais Axioma...")).toBeInTheDocument();
  });

  it("should redirect to /auth when no session exists", async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    });

    render(
      <BrowserRouter>
        <ProtectedRoute>
          <TestChild />
        </ProtectedRoute>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    });
  });

  it("should render children when session exists and no role restriction", async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: {
        session: createMockSession("user-123"),
      },
      error: null,
    });

    render(
      <BrowserRouter>
        <ProtectedRoute>
          <TestChild />
        </ProtectedRoute>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Protected Content")).toBeInTheDocument();
    });
  });

  it("should check role and render children when user has allowed role", async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: {
        session: createMockSession("user-123"),
      },
      error: null,
    });

    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockSingle = vi.fn().mockResolvedValue({
      data: { role: "auditor" },
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
        <ProtectedRoute allowedRoles={["auditor"]}>
          <TestChild />
        </ProtectedRoute>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Protected Content")).toBeInTheDocument();
    });

    expect(supabase.from).toHaveBeenCalledWith("profiles");
  });

  it("should show error toast and not render children when user has wrong role", async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: {
        session: createMockSession("user-123"),
      },
      error: null,
    });

    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockSingle = vi.fn().mockResolvedValue({
      data: { role: "empresa" },
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
        <ProtectedRoute allowedRoles={["auditor"]}>
          <TestChild />
        </ProtectedRoute>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Acesso negado para esta modalidade.");
      expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    });
  });

  it("should handle database errors gracefully", async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: {
        session: createMockSession("user-123"),
      },
      error: null,
    });

    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockSingle = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "Database error" },
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
        <ProtectedRoute allowedRoles={["auditor"]}>
          <TestChild />
        </ProtectedRoute>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Acesso negado para esta modalidade.");
      expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    });
  });

  it("should allow master role to bypass all role restrictions", async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: {
        session: createMockSession("user-master"),
      },
      error: null,
    });

    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockSingle = vi.fn().mockResolvedValue({
      data: { role: "master" },
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
        <ProtectedRoute allowedRoles={["auditor"]}>
          <TestChild />
        </ProtectedRoute>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Protected Content")).toBeInTheDocument();
    });

    // Master role should not trigger error toast
    expect(toast.error).not.toHaveBeenCalled();
  });
});

