import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { AppShell } from "../components/AppShell";
import { AuthContext } from "../features/auth/AuthContext";

describe("AppShell", () => {
  it("renders the application brand and public navigation", () => {
    const router = createMemoryRouter([
      {
        path: "/",
        element: <AppShell />,
        children: [{ index: true, element: <div>Home</div> }]
      }
    ]);

    render(
      <AuthContext.Provider
        value={{
          status: "anonymous",
          token: null,
          user: null,
          signIn: vi.fn(),
          signOut: vi.fn(),
          refreshUser: vi.fn()
        }}
      >
        <RouterProvider router={router} />
      </AuthContext.Provider>
    );

    expect(screen.getByText(/IPL PREDICTOR/i)).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Primary navigation" })).toBeInTheDocument();
    expect(screen.getByText("Matches")).toBeInTheDocument();
    expect(screen.getByText("Rules")).toBeInTheDocument();
    expect(screen.getByText("Login")).toBeInTheDocument();
  });
});
