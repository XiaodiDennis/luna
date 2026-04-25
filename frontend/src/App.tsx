import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./lib/auth";

import { LandingPage } from "./pages/LandingPage";
import { SongLibraryPage } from "./pages/SongLibraryPage";
import { GamePage } from "./pages/GamePage";
import { AIGeneratePage } from "./pages/AIGeneratePage";
import { PricingPage } from "./pages/PricingPage";
import { LoginPage } from "./pages/LoginPage";
import { AccountPage } from "./pages/AccountPage";
import { ProgressPage } from "./pages/ProgressPage";
import { ProductDesignPage } from "./pages/ProductDesignPage";
import { AssessmentPage } from "./pages/AssessmentPage";
import { StudentDashboardPage } from "./pages/StudentDashboardPage";
import { TeacherDashboardPage } from "./pages/TeacherDashboardPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route path="/songs" element={<SongLibraryPage />} />
          <Route path="/play/:songId" element={<GamePage />} />

          <Route path="/generate" element={<AIGeneratePage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/login" element={<LoginPage />} />

          <Route path="/account" element={<AccountPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/design" element={<ProductDesignPage />} />

          <Route path="/assessment" element={<AssessmentPage />} />
          <Route path="/student-dashboard" element={<StudentDashboardPage />} />
          <Route path="/teacher-dashboard" element={<TeacherDashboardPage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}