import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router";
import { useState } from "react";
import { AdminRoute } from "./components/admin/AdminRoute";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { LoadingScreen } from "./components/common/LoadingScreen";
import { RouteTransition } from "./components/common/RouteTransition";
import ScrollToTop from "./components/common/ScrollToTop";
import { SiteIdentityEffects } from "./components/common/SiteIdentityEffects";
import { SmoothScrollProvider } from "./components/common/SmoothScrollProvider";
import { AdminLayout } from "./components/layout/AdminLayout";
import { Footer } from "./components/layout/Footer";
import { Navbar } from "./components/layout/Navbar";
import { SpiderModeEffects } from "./components/portfolio/SpiderModeEffects";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { ThemeModeProvider } from "./context/ThemeModeContext";
import AdminCertificatesPage from "./pages/admin/AdminCertificatesPage";
import AdminCertificateFormPage from "./pages/admin/AdminCertificateFormPage";
import AdminCommentsPage from "./pages/admin/AdminCommentsPage";
import AdminCreativeWorkFormPage from "./pages/admin/AdminCreativeWorkFormPage";
import AdminCreativeWorksPage from "./pages/admin/AdminCreativeWorksPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminExperiencePage from "./pages/admin/AdminExperiencePage";
import AdminHeroPage from "./pages/admin/AdminHeroPage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminMediaPage from "./pages/admin/AdminMediaPage";
import AdminMessagesPage from "./pages/admin/AdminMessagesPage";
import AdminProfilePage from "./pages/admin/AdminProfilePage";
import AdminProjectFormPage from "./pages/admin/AdminProjectFormPage";
import AdminProjectsPage from "./pages/admin/AdminProjectsPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import AdminTechnologyFormPage from "./pages/admin/AdminTechnologyFormPage";
import AdminTechStackPage from "./pages/admin/AdminTechStackPage";
import AboutPage from "./pages/public/AboutPage";
import CertificatesPage from "./pages/public/CertificatesPage";
import ContactPage from "./pages/public/ContactPage";
import CreativeWorkDetailPage from "./pages/public/CreativeWorkDetailPage";
import CreativeWorksPage from "./pages/public/CreativeWorksPage";
import HomePage from "./pages/public/HomePage";
import NotFoundPage from "./pages/public/NotFoundPage";
import ProjectDetailPage from "./pages/public/ProjectDetailPage";
import ProjectsPage from "./pages/public/ProjectsPage";

function PublicLayout() {
  const [publicReady, setPublicReady] = useState(() => Boolean((window as Window & { __fazri_portfolio_boot_splash_seen__?: boolean }).__fazri_portfolio_boot_splash_seen__));

  return (
    <div className="flex min-h-screen flex-col font-inter selection:bg-[var(--color-accent-main)] selection:text-white">
      <LoadingScreen onComplete={() => setPublicReady(true)} />
      {publicReady && (
        <SmoothScrollProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <SpiderModeEffects />
            <div className="flex flex-1 flex-col">
              <ErrorBoundary>
                <RouteTransition>
                  <Outlet />
                </RouteTransition>
              </ErrorBoundary>
            </div>
            <Footer />
          </div>
        </SmoothScrollProvider>
      )}
    </div>
  );
}

function ProtectedAdminLayout() {
  return (
    <AdminRoute>
      <AdminLayout>
        <Outlet />
      </AdminLayout>
    </AdminRoute>
  );
}

export function AppRouter() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<ProtectedAdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="profile" element={<AdminProfilePage />} />
          <Route path="hero" element={<AdminHeroPage />} />
          <Route path="projects" element={<AdminProjectsPage />} />
          <Route path="projects/new" element={<AdminProjectFormPage />} />
          <Route path="projects/:id/edit" element={<AdminProjectFormPage />} />
          <Route path="tech-stack" element={<AdminTechStackPage />} />
          <Route path="tech-stack/new" element={<AdminTechnologyFormPage />} />
          <Route path="tech-stack/:id/edit" element={<AdminTechnologyFormPage />} />
          <Route path="creative-works" element={<AdminCreativeWorksPage />} />
          <Route path="creative-works/new" element={<AdminCreativeWorkFormPage />} />
          <Route path="creative-works/:id/edit" element={<AdminCreativeWorkFormPage />} />
          <Route path="experience" element={<AdminExperiencePage />} />
          <Route path="certificates" element={<AdminCertificatesPage />} />
          <Route path="certificates/new" element={<AdminCertificateFormPage />} />
          <Route path="certificates/:id/edit" element={<AdminCertificateFormPage />} />
          <Route path="comments" element={<AdminCommentsPage />} />
          <Route path="messages" element={<AdminMessagesPage />} />
          <Route path="media" element={<AdminMediaPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:slug" element={<ProjectDetailPage />} />
          <Route path="/creative-works" element={<CreativeWorksPage />} />
          <Route path="/creative-works/:slug" element={<CreativeWorkDetailPage />} />
          <Route path="/certificates" element={<CertificatesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeModeProvider>
        <LanguageProvider>
          <AdminAuthProvider>
            <SiteIdentityEffects />
            <AppRouter />
          </AdminAuthProvider>
        </LanguageProvider>
      </ThemeModeProvider>
    </BrowserRouter>
  );
}
