import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { DashboardPage } from "../pages/DashboardPage";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { MatchDetailPage } from "../pages/MatchDetailPage";
import { MatchLeaderboardPage } from "../pages/MatchLeaderboardPage";
import { MatchesPage } from "../pages/MatchesPage";
import { MyPredictionsPage } from "../pages/MyPredictionsPage";
import { PredictionScorePage } from "../pages/PredictionScorePage";
import { ProfilePage } from "../pages/ProfilePage";
import { RulesPage } from "../pages/RulesPage";
import { StatusPage } from "../pages/StatusPage";
import { TournamentLeaderboardPage } from "../pages/TournamentLeaderboardPage";
import { VerifyOtpPage } from "../pages/VerifyOtpPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: "status",
        element: <StatusPage />
      },
      {
        path: "matches",
        element: <MatchesPage />
      },
      {
        path: "rules",
        element: <RulesPage />
      },
      {
        path: "matches/:id",
        element: <MatchDetailPage />
      },
      {
        path: "login",
        element: <LoginPage />
      },
      {
        path: "verify-otp",
        element: <VerifyOtpPage />
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "dashboard",
            element: <DashboardPage />
          },
          {
            path: "profile",
            element: <ProfilePage />
          },
          {
            path: "my-predictions",
            element: <MyPredictionsPage />
          },
          {
            path: "predictions/:matchId",
            element: <PredictionScorePage />
          },
          {
            path: "leaderboard/match/:matchId",
            element: <MatchLeaderboardPage />
          },
          {
            path: "leaderboard/tournament",
            element: <TournamentLeaderboardPage />
          }
        ]
      }
    ]
  }
]);
