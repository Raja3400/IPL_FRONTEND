import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { RulesPage } from "../RulesPage";

describe("RulesPage", () => {
  it("renders scoring and tie-break sections", () => {
    render(
      <MemoryRouter>
        <RulesPage />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: /Prediction Rules & Scoring/i })).toBeInTheDocument();
    expect(screen.getByText(/Match winner/i)).toBeInTheDocument();
    expect(screen.getByText(/Bowler with more wickets wins/i)).toBeInTheDocument();
    expect(screen.getByText(/Total team score prediction points/i)).toBeInTheDocument();
    expect(screen.getByText(/Final result values stored by the system/i)).toBeInTheDocument();
  });
});
