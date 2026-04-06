import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { PredictionScorePage } from "../PredictionScorePage";
import { AuthContext } from "../../features/auth/AuthContext";
import { predictionService } from "../../features/predictions/predictionService";

vi.mock("../../features/predictions/predictionService", () => ({
  predictionService: {
    getPredictionScore: vi.fn()
  }
}));

describe("PredictionScorePage", () => {
  it("renders predicted values, actual values, total points, and breakdown", async () => {
    vi.mocked(predictionService.getPredictionScore).mockResolvedValue({
      predictionId: 10,
      matchId: 1,
      pointsAwarded: 150,
      totalPoints: 150,
      scoredAt: "2026-03-23T10:00:00Z",
      resultStatus: "FINAL",
      matchSummary: {
        id: 1,
        matchNumber: 1,
        stage: "LEAGUE",
        status: "COMPLETED",
        matchStartTime: "2026-03-22T19:30:00",
        timezone: "Asia/Kolkata",
        team1: { id: 1, name: "Mumbai Indians", code: "MI" },
        team2: { id: 2, name: "Chennai Super Kings", code: "CSK" },
        venue: { id: 1, name: "Wankhede Stadium", city: "Mumbai", country: "India" }
      },
      myPrediction: {
        winnerTeam: { id: 1, name: "Mumbai Indians", code: "MI" },
        tossWinnerTeam: { id: 2, name: "Chennai Super Kings", code: "CSK" },
        highestRunScorerPlayer: { id: 1, fullName: "Rohit Sharma", teamId: 1, teamCode: "MI", role: "BATTER" },
        highestWicketTakerPlayer: { id: 21, fullName: "Deepak Chahar", teamId: 2, teamCode: "CSK", role: "BOWLER" },
        mostSixesPlayer: { id: 5, fullName: "Suryakumar Yadav", teamId: 1, teamCode: "MI", role: "BATTER" },
        mostFoursPlayer: { id: 6, fullName: "Tilak Varma", teamId: 1, teamCode: "MI", role: "BATTER" },
        mostCatchesPlayer: { id: 17, fullName: "Ruturaj Gaikwad", teamId: 2, teamCode: "CSK", role: "BATTER" },
        manOfMatchPlayer: { id: 18, fullName: "MS Dhoni", teamId: 2, teamCode: "CSK", role: "WICKET_KEEPER" },
        bestEconomyBowlerPlayer: { id: 4, fullName: "Jasprit Bumrah", teamId: 1, teamCode: "MI", role: "BOWLER" },
        longestSixPlayer: { id: 4, fullName: "Jasprit Bumrah", teamId: 1, teamCode: "MI", role: "BOWLER" },
        bestStrikerPlayer: { id: 5, fullName: "Suryakumar Yadav", teamId: 1, teamCode: "MI", role: "BATTER" },
        team1Score: 182,
        team2Score: 176
      },
      actualResult: {
        resultStatus: "FINAL",
        winnerTeam: { id: 1, name: "Mumbai Indians", code: "MI" },
        tossWinnerTeam: { id: 2, name: "Chennai Super Kings", code: "CSK" },
        highestRunScorerPlayer: { id: 1, fullName: "Rohit Sharma", teamId: 1, teamCode: "MI", role: "BATTER" },
        highestWicketTakerPlayer: { id: 21, fullName: "Deepak Chahar", teamId: 2, teamCode: "CSK", role: "BOWLER" },
        mostSixesPlayer: { id: 5, fullName: "Suryakumar Yadav", teamId: 1, teamCode: "MI", role: "BATTER" },
        mostFoursPlayer: { id: 6, fullName: "Tilak Varma", teamId: 1, teamCode: "MI", role: "BATTER" },
        mostCatchesPlayer: { id: 17, fullName: "Ruturaj Gaikwad", teamId: 2, teamCode: "CSK", role: "BATTER" },
        manOfMatchPlayer: { id: 18, fullName: "MS Dhoni", teamId: 2, teamCode: "CSK", role: "WICKET_KEEPER" },
        bestEconomyBowlerPlayer: { id: 4, fullName: "Jasprit Bumrah", teamId: 1, teamCode: "MI", role: "BOWLER" },
        longestSixPlayer: { id: 4, fullName: "Jasprit Bumrah", teamId: 1, teamCode: "MI", role: "BOWLER" },
        bestStrikerPlayer: { id: 5, fullName: "Suryakumar Yadav", teamId: 1, teamCode: "MI", role: "BATTER" },
        team1Score: 182,
        team2Score: 176
      },
      scoreBreakdown: {
        winner: { predicted: 1, actual: 1, matched: true, points: 10 },
        bestEconomyBowler: { predicted: 4, actual: 4, matched: true, points: 5 },
        team1Score: { predicted: 182, actual: 182, difference: 0, points: 25 }
      }
    });

    render(
      <MemoryRouter initialEntries={["/predictions/1"]}>
        <AuthContext.Provider value={{ status: "authenticated", token: "token-123", user: { id: 1, mobileNumber: "+919999999999", profileCompleted: true }, signIn: vi.fn(), signOut: vi.fn(), refreshUser: vi.fn() }}>
          <Routes>
            <Route path="/predictions/:matchId" element={<PredictionScorePage />} />
          </Routes>
        </AuthContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText("150")).toBeInTheDocument());
    expect(screen.getByText(/Mumbai Indians vs Chennai Super Kings/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Best Economical Bowler/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/MI Score/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/CSK Score/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Actual Result/i)).toBeInTheDocument();
    expect(screen.getByText(/Score Breakdown/i)).toBeInTheDocument();
    expect(screen.getByText(/Match Leaderboard/i)).toBeInTheDocument();
  });

  it("renders the error state when the API fails", async () => {
    vi.mocked(predictionService.getPredictionScore).mockRejectedValue(new Error("Score not available"));

    render(
      <MemoryRouter initialEntries={["/predictions/1"]}>
        <AuthContext.Provider value={{ status: "authenticated", token: "token-123", user: { id: 1, mobileNumber: "+919999999999", profileCompleted: true }, signIn: vi.fn(), signOut: vi.fn(), refreshUser: vi.fn() }}>
          <Routes>
            <Route path="/predictions/:matchId" element={<PredictionScorePage />} />
          </Routes>
        </AuthContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText("Score not available")).toBeInTheDocument());
  });
});

