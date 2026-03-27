import { SpeedInsights } from "@vercel/speed-insights/react";
import { AuthProvider } from "../features/auth/AuthContext";
import { RouterProvider } from "../routes/RouterProvider";

export function App() {
  return (
    <AuthProvider>
      <RouterProvider />
      <SpeedInsights />
    </AuthProvider>
  );
}
