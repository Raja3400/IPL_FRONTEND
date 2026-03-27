import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PredictionPanel } from "../PredictionPanel";
import { AuthContext } from "../../features/auth/AuthContext";
import { predictionService } from "../../features/predictions/predictionService";
import { ApiError } from "../../services/apiClient";

vi.mock("../../features/predictions/predictionService", () => ({
  predictionService: {
    getPredictionForMatch: vi.fn(),
    createPrediction: vi.fn(),
    updatePrediction: vi.fn(),
    getMyPredictions: vi.fn(),
    getPredictionScore: vi.fn()
  }
}));

const mockMatch = {
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
    { id: 2, fullName: "Ishan Kishan", teamId: 1, teamCode: "MI", role: "WICKET_KEEPER" },
    { id: 13, fullName: "Ruturaj Gaikwad", teamId: 2, teamCode: "CSK", role: "BATTER" },
    { id: 18, fullName: "MS Dhoni", teamId: 2, teamCode: "CSK", role: "WICKET_KEEPER" }
  ]
};

const existingPrediction = {
  id: 10,
  matchId: 1,
  matchNumber: 1,
  matchStatus: "UPCOMING",
  matchStartTime: "2026-03-22T19:30:00",
  team1: mockMatch.team1,
  team2: mockMatch.team2,
  predictedWinnerTeam: mockMatch.team1,
  predictedTossWinnerTeam: mockMatch.team2,
  highestRunScorerPlayer: mockMatch.players[0],
  highestWicketTakerPlayer: mockMatch.players[1],
  mostSixesPlayer: mockMatch.players[0],
  mostFoursPlayer: mockMatch.players[2],
  mostCatchesPlayer: mockMatch.players[3],
  manOfMatchPlayer: mockMatch.players[2],
  longestSixPlayer: mockMatch.players[0],
  bestStrikerPlayer: mockMatch.players[2],
  predictedTeam1Score: 182,
  predictedTeam2Score: 176,
  isLocked: false,
  pointsAwarded: 0,
  scoredAt: null,
  submittedAt: "2026-03-20T10:00:00Z",
  updatedAt: "2026-03-20T10:00:00Z"
};

function renderPanel() {
  return render(
    <MemoryRouter>
      <AuthContext.Provider
        value={{
          status: "authenticated",
          token: "token-123",
          user: { id: 1, mobileNumber: "+919999999999", profileCompleted: true },
          signIn: vi.fn(),
          signOut: vi.fn(),
          refreshUser: vi.fn()
        }}
      >
        <PredictionPanel match={mockMatch} />
      </AuthContext.Provider>
    </MemoryRouter>
  );
}

describe("PredictionPanel", () => {
  beforeEach(() => {
    vi.mocked(predictionService.getPredictionForMatch).mockReset();
    vi.mocked(predictionService.createPrediction).mockReset();
    vi.mocked(predictionService.updatePrediction).mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the form for an authenticated user without an existing prediction", async () => {
    vi.mocked(predictionService.getPredictionForMatch).mockRejectedValue(new ApiError("Prediction not found", 404));

    renderPanel();

    const panel = await screen.findByTestId("prediction-panel");
    expect(within(panel).getByText(/Make your match prediction/i)).toBeInTheDocument();
    expect(within(panel).getByLabelText(/^Match winner$/i)).toBeInTheDocument();
    expect(within(panel).getByLabelText(/^MI predicted score$/i)).toBeInTheDocument();
    expect(within(panel).getByRole("button", { name: /^Submit prediction$/i })).toBeInTheDocument();
  });

  it("submits a new prediction", async () => {
    const user = userEvent.setup();
    vi.mocked(predictionService.getPredictionForMatch).mockRejectedValue(new ApiError("Prediction not found", 404));
    vi.mocked(predictionService.createPrediction).mockResolvedValue(existingPrediction);

    renderPanel();

    const panel = await screen.findByTestId("prediction-panel");

    await waitFor(() => expect(within(panel).getByRole("button", { name: /^Submit prediction$/i })).toBeInTheDocument());

    await user.selectOptions(within(panel).getByLabelText(/^Match winner$/i), "1");
    await user.selectOptions(within(panel).getByLabelText(/^Toss winner$/i), "2");
    await user.selectOptions(within(panel).getByLabelText(/^Highest run scorer$/i), "1");
    await user.selectOptions(within(panel).getByLabelText(/^Highest wicket taker$/i), "2");
    await user.selectOptions(within(panel).getByLabelText(/^Most sixes$/i), "1");
    await user.selectOptions(within(panel).getByLabelText(/^Most fours$/i), "13");
    await user.selectOptions(within(panel).getByLabelText(/^Most catches$/i), "18");
    await user.selectOptions(within(panel).getByLabelText(/^Man of the match$/i), "13");
    await user.selectOptions(within(panel).getByLabelText(/^Longest six$/i), "1");
    await user.selectOptions(within(panel).getByLabelText(/^Best striker$/i), "13");
    await user.type(within(panel).getByLabelText(/^MI predicted score$/i), "182");
    await user.type(within(panel).getByLabelText(/^CSK predicted score$/i), "176");
    await user.click(within(panel).getByRole("button", { name: /^Submit prediction$/i }));

    await waitFor(() => expect(predictionService.createPrediction).toHaveBeenCalled());
    expect(within(panel).getByText(/Prediction created successfully/i)).toBeInTheDocument();
  }, 10000);

  it("prefills the form when a prediction already exists", async () => {
    vi.mocked(predictionService.getPredictionForMatch).mockResolvedValue(existingPrediction);

    renderPanel();

    const panel = await screen.findByTestId("prediction-panel");

    await waitFor(() => expect(within(panel).getByDisplayValue("182")).toBeInTheDocument());
    expect(within(panel).getByDisplayValue("176")).toBeInTheDocument();
    expect(within(panel).getByRole("button", { name: /^Update prediction$/i })).toBeInTheDocument();
  });

  it("disables editing when the prediction is locked", async () => {
    vi.mocked(predictionService.getPredictionForMatch).mockResolvedValue({
      ...existingPrediction,
      isLocked: true
    });

    renderPanel();

    const panel = await screen.findByTestId("prediction-panel");

    await waitFor(() => expect(within(panel).getByText(/Predictions are locked for this match/i)).toBeInTheDocument());
    expect(within(panel).getByRole("button", { name: /^Update prediction$/i })).toBeDisabled();
    expect(within(panel).getByLabelText(/^Match winner$/i)).toBeDisabled();
  });
});

