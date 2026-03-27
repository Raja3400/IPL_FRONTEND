import { Analytics } from "@vercel/analytics/react";
import { AuthProvider } from "../features/auth/AuthContext";
import { RouterProvider } from "../routes/RouterProvider";

export function App() {
  return (
    <AuthProvider>
      <RouterProvider />
      <Analytics />
    </AuthProvider>
  );
}
