import { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./lib/auth";
import { AIGeneratePage } from "./pages/AIGeneratePage";
import { AssessmentPage } from "./pages/AssessmentPage";
import { StudentDashboardPage } from "./pages/StudentDashboardPage";
import { TeacherDashboardPage } from "./pages/TeacherDashboardPage";

const LandingPage = lazy(() =>
  import("./pages/LandingPage").then((module) => ({
    default: module.LandingPage,
  }))
);

const ProductDesignPage = lazy(() =>
  import("./pages/ProductDesignPage").then((module) => ({
    default: module.ProductDesignPage,
  }))
);

const ProgressPage = lazy(() =>
  import("./pages/ProgressPage").then((module) => ({
    default: module.ProgressPage,
  }))
);

const PricingPage = lazy(() =>
  import("./pages/PricingPage").then((module) => ({
    default: module.PricingPage,
  }))
);

const LoginPage = lazy(() =>
  import("./pages/LoginPage").then((module) => ({
    default: module.LoginPage,
  }))
);

const AccountPage = lazy(() =>
  import("./pages/AccountPage").then((module) => ({
    default: module.AccountPage,
  }))
);

const SongLibraryPage = lazy(() =>
  import("./pages/SongLibraryPage").then((module) => ({
    default: module.SongLibraryPage,
  }))
);

const GamePage = lazy(() =>
  import("./pages/GamePage").then((module) => ({
    default: module.GamePage,
  }))
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense
          fallback={
            <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
              Завантаження Луна...
            </main>
          }
        >
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/design" element={<ProductDesignPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/generate" element={<AIGeneratePage />} />
            <Route path="/songs" element={<SongLibraryPage />} />
            <Route path="/play/:songId" element={<GamePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
            <Route path="/assessment" element={<AssessmentPage />} />
            <Route path="/student-dashboard" element={<StudentDashboardPage />} />
            <Route path="/teacher-dashboard" element={<TeacherDashboardPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}