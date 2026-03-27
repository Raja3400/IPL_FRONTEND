import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MatchesPage } from "../MatchesPage";
import { matchService } from "../../features/matches/matchService";

vi.mock("../../features/matches/matchService", () => ({
  matchService: {
    listMatches: vi.fn()
  }
}));

describe("MatchesPage", () => {
  beforeEach(() => {
    vi.mocked(matchService.listMatches).mockReset();
  });

  it("renders match cards from the API", async () => {
    vi.mocked(matchService.listMatches).mockResolvedValue([
      {
        id: 1,
        matchNumber: 1,
        stage: "LEAGUE",
        team1: { id: 1, name: "Mumbai Indians", code: "MI" },
        team2: { id: 2, name: "Chennai Super Kings", code: "CSK" },
        venue: { id: 1, name: "Wankhede Stadium", city: "Mumbai", country: "India" },
        matchStartTime: "2026-03-22T19:30:00",
        timezone: "Asia/Kolkata",
        status: "UPCOMING"
      }
    ]);

    render(
      <MemoryRouter>
        <MatchesPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText(/IPL Fixtures/i)).toBeInTheDocument());
    expect(screen.getByText("MI")).toBeInTheDocument();
    expect(screen.getByText("CSK")).toBeInTheDocument();
    expect(screen.getByText(/Wankhede Stadium/i)).toBeInTheDocument();
    expect(screen.getByText("UPCOMING")).toBeInTheDocument();
  });

  it("renders error state when the API fails", async () => {
    vi.mocked(matchService.listMatches).mockRejectedValue(new Error("Failed to load matches"));

    render(
      <MemoryRouter>
        <MatchesPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText("Failed to load matches")).toBeInTheDocument());
  });
});
