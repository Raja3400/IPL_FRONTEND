import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { MatchDetailPage } from "../MatchDetailPage";
import { AuthContext } from "../../features/auth/AuthContext";
import { matchService } from "../../features/matches/matchService";

vi.mock("../../features/matches/matchService", () => ({
  matchService: {
    getMatchDetails: vi.fn()
  }
}));

vi.mock("../../features/predictions/predictionService", () => ({
  predictionService: {
    getPredictionForMatch: vi.fn(),
    createPrediction: vi.fn(),
    updatePrediction: vi.fn(),
    getMyPredictions: vi.fn()
  }
}));

describe("MatchDetailPage", () => {
  it("renders the match detail and players by team", async () => {
    vi.mocked(matchService.getMatchDetails).mockResolvedValue({
      id: 1,
      matchNumber: 1,
      stage: "LEAGUE",
      status: "UPCOMING",
      matchStartTime: "2026-03-22T19:30:00",
      timezone: "Asia/Kolkata",
      team1: { id: 1, name: "Mumbai Indians", code: "MI" },
      team2: { id: 2, name: "Chennai Super Kings", code: "CSK" },
      venue: { id: 1, name: "Wankhede Stadium", city: "Mumbai", country: "India" },
      players: [
        { id: 1, fullName: "Rohit Sharma", teamId: 1, teamCode: "MI", role: "BATTER" },
        { id: 13, fullName: "Ruturaj Gaikwad", teamId: 2, teamCode: "CSK", role: "BATTER" }
      ]
    });

    render(
      <MemoryRouter initialEntries={["/matches/1"]}>
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
          <Routes>
            <Route path="/matches/:id" element={<MatchDetailPage />} />
          </Routes>
        </AuthContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText(/MI/i)).toBeInTheDocument());
    expect(screen.getByText(/CSK/i)).toBeInTheDocument();
    expect(screen.getByText("Rohit Sharma")).toBeInTheDocument();
    expect(screen.getByText("Ruturaj Gaikwad")).toBeInTheDocument();
    expect(screen.getByText("Wankhede Stadium")).toBeInTheDocument();
  });

  it("renders error state when the API fails", async () => {
    vi.mocked(matchService.getMatchDetails).mockRejectedValue(new Error("Match not found"));

    render(
      <MemoryRouter initialEntries={["/matches/999"]}>
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
          <Routes>
            <Route path="/matches/:id" element={<MatchDetailPage />} />
          </Routes>
        </AuthContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText("Match not found")).toBeInTheDocument());
  });
});
