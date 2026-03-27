import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { MatchLeaderboardPage } from "../MatchLeaderboardPage";
import { AuthContext } from "../../features/auth/AuthContext";
import { leaderboardService } from "../../features/leaderboard/leaderboardService";

vi.mock("../../features/leaderboard/leaderboardService", () => ({
  leaderboardService: {
    getMatchLeaderboard: vi.fn()
  }
}));

const leaderboardResponse = {
  matchId: 1,
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
  filtersApplied: { country: "", state: "", city: "" },
  leaderboardAvailable: true,
  availabilityMessage: null,
  totalEntries: 2,
  page: 0,
  size: 20,
  items: [
    { rank: 1, userId: 1, userName: "Alpha", city: "Mumbai", state: "Maharashtra", country: "India", pointsAwarded: 150, combinedScoreError: 0, submittedAt: "2026-03-19T10:00:00Z", currentUser: false },
    { rank: 2, userId: 2, userName: "Beta", city: "Pune", state: "Maharashtra", country: "India", pointsAwarded: 140, combinedScoreError: 5, submittedAt: "2026-03-19T10:05:00Z", currentUser: true }
  ],
  currentUserRank: { matchId: 1, userId: 2, rank: 2, pointsAwarded: 140, combinedScoreError: 5 }
};

function renderLeaderboardPage() {
  return render(
    <MemoryRouter initialEntries={["/leaderboard/match/1"]}>
      <AuthContext.Provider value={{ status: "authenticated", token: "token-123", user: { id: 2, mobileNumber: "+919999999999", profileCompleted: true }, signIn: vi.fn(), signOut: vi.fn(), refreshUser: vi.fn() }}>
        <Routes>
          <Route path="/leaderboard/match/:matchId" element={<MatchLeaderboardPage />} />
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>
  );
}

describe("MatchLeaderboardPage", () => {
  it("renders the leaderboard table and highlights the current user", async () => {
    vi.mocked(leaderboardService.getMatchLeaderboard).mockResolvedValue(leaderboardResponse);

    renderLeaderboardPage();

    const page = await screen.findByTestId("match-leaderboard-page");
    expect(within(page).getByText(/Alpha/i)).toBeInTheDocument();
    expect(within(page).getByText(/Beta/i)).toBeInTheDocument();
    expect(screen.getByTestId("leaderboard-row-current")).toBeInTheDocument();
    expect(within(page).getByText(/Your rank/i)).toBeInTheDocument();
  });

  it("applies filters through the service call", async () => {
    const user = userEvent.setup();
    vi.mocked(leaderboardService.getMatchLeaderboard).mockResolvedValue(leaderboardResponse);

    renderLeaderboardPage();

    const page = await screen.findByTestId("match-leaderboard-page");

    await user.type(within(page).getAllByLabelText(/Country/i)[0], "India");
    await user.type(within(page).getAllByLabelText(/State/i)[0], "Maharashtra");
    await user.click(within(page).getByRole("button", { name: /Apply filters/i }));

    await waitFor(() => expect(leaderboardService.getMatchLeaderboard).toHaveBeenLastCalledWith("token-123", 1, { country: "India", state: "Maharashtra", city: "" }, 0, 20));
  });

  it("renders the empty availability state cleanly", async () => {
    vi.mocked(leaderboardService.getMatchLeaderboard).mockResolvedValue({
      ...leaderboardResponse,
      leaderboardAvailable: false,
      availabilityMessage: "Leaderboard is not available until scoring is complete for this match.",
      items: [],
      totalEntries: 0,
      currentUserRank: null
    });

    renderLeaderboardPage();

    await waitFor(() => expect(screen.getByText(/Leaderboard is not available until scoring is complete/i)).toBeInTheDocument());
  });
});

