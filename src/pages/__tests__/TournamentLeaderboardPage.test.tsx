import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { TournamentLeaderboardPage } from "../TournamentLeaderboardPage";
import { AuthContext } from "../../features/auth/AuthContext";
import { leaderboardService } from "../../features/leaderboard/leaderboardService";

vi.mock("../../features/leaderboard/leaderboardService", () => ({
  leaderboardService: {
    getMatchLeaderboard: vi.fn(),
    getTournamentLeaderboard: vi.fn()
  }
}));

const leaderboardResponse = {
  filtersApplied: { country: "India", state: "", city: "" },
  totalEntries: 2,
  page: 0,
  size: 20,
  items: [
    { rank: 1, userId: 1, userName: "Alpha", city: "Mumbai", state: "Maharashtra", country: "India", totalPoints: 320, matchesPredicted: 3, matchesScored: 2, totalCombinedScoreError: 6, currentUser: false },
    { rank: 2, userId: 2, userName: "Beta", city: "Pune", state: "Maharashtra", country: "India", totalPoints: 290, matchesPredicted: 3, matchesScored: 2, totalCombinedScoreError: 12, currentUser: true }
  ],
  currentUserSummary: { userId: 2, userName: "Beta", rank: 2, totalPoints: 290, matchesPredicted: 3, matchesScored: 2, totalCombinedScoreError: 12 },
  message: null
};

function renderTournamentPage() {
  return render(
    <MemoryRouter initialEntries={["/leaderboard/tournament"]}>
      <AuthContext.Provider value={{ status: "authenticated", token: "token-123", user: { id: 2, mobileNumber: "+919999999999", profileCompleted: true }, signIn: vi.fn(), signOut: vi.fn(), refreshUser: vi.fn() }}>
        <Routes>
          <Route path="/leaderboard/tournament" element={<TournamentLeaderboardPage />} />
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>
  );
}

describe("TournamentLeaderboardPage", () => {
  it("renders the leaderboard and current user summary", async () => {
    vi.mocked(leaderboardService.getTournamentLeaderboard).mockResolvedValue(leaderboardResponse);

    renderTournamentPage();

    await screen.findByText(/Tournament Leaderboard/i);
    expect(screen.getByText(/Alpha/i)).toBeInTheDocument();
    expect(screen.getByText(/Beta/i)).toBeInTheDocument();
    expect(screen.getByText(/Global Rank/i)).toBeInTheDocument();
    expect(screen.getAllByText(/You/i).length).toBeGreaterThan(0);
  });

  it("applies filters through the service call", async () => {
    const user = userEvent.setup();
    vi.mocked(leaderboardService.getTournamentLeaderboard).mockResolvedValue(leaderboardResponse);

    renderTournamentPage();

    await screen.findByText(/Tournament Leaderboard/i);
    const stateSelect = screen.getAllByLabelText(/State/i)[0];
    await user.selectOptions(stateSelect, "Maharashtra");
    await user.click(screen.getByRole("button", { name: /Search Rankings/i }));

    await waitFor(() => expect(leaderboardService.getTournamentLeaderboard).toHaveBeenLastCalledWith("token-123", { country: "India", state: "Maharashtra", city: "" }, 0, 20));
  });

  it("renders the empty state cleanly", async () => {
    vi.mocked(leaderboardService.getTournamentLeaderboard).mockResolvedValue({
      ...leaderboardResponse,
      items: [],
      totalEntries: 0,
      currentUserSummary: { userId: 2, userName: "Beta", rank: null, totalPoints: 0, matchesPredicted: 1, matchesScored: 0, totalCombinedScoreError: 0 },
      message: "Tournament leaderboard is not available until scored predictions exist."
    });

    renderTournamentPage();

    await waitFor(() => expect(screen.getByText(/Tournament leaderboard is not available until scored predictions exist/i)).toBeInTheDocument());
  });
});


