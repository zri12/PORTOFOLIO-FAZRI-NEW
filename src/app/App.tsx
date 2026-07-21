import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router";
import { lazy, Suspense, useState } from "react";
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

const AdminCertificatesPage = lazy(() => import("./pages/admin/AdminCertificatesPage"));
const AdminArticlesPage = lazy(() => import("./pages/admin/AdminArticlesPage"));
const AdminArticleFormPage = lazy(() => import("./pages/admin/AdminArticleFormPage"));
const AdminCertificateFormPage = lazy(() => import("./pages/admin/AdminCertificateFormPage"));
const AdminCommentsPage = lazy(() => import("./pages/admin/AdminCommentsPage"));
const AdminCreativeWorkFormPage = lazy(() => import("./pages/admin/AdminCreativeWorkFormPage"));
const AdminCreativeWorksPage = lazy(() => import("./pages/admin/AdminCreativeWorksPage"));
const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboardPage"));
const AdminExperiencePage = lazy(() => import("./pages/admin/AdminExperiencePage"));
const AdminHeroPage = lazy(() => import("./pages/admin/AdminHeroPage"));
const AdminLoginPage = lazy(() => import("./pages/admin/AdminLoginPage"));
const AdminMediaPage = lazy(() => import("./pages/admin/AdminMediaPage"));
const AdminMessagesPage = lazy(() => import("./pages/admin/AdminMessagesPage"));
const AdminProfilePage = lazy(() => import("./pages/admin/AdminProfilePage"));
const AdminProjectFormPage = lazy(() => import("./pages/admin/AdminProjectFormPage"));
const AdminProjectsPage = lazy(() => import("./pages/admin/AdminProjectsPage"));
const AdminSettingsPage = lazy(() => import("./pages/admin/AdminSettingsPage"));
const AdminTechnologyFormPage = lazy(() => import("./pages/admin/AdminTechnologyFormPage"));
const AdminTechStackPage = lazy(() => import("./pages/admin/AdminTechStackPage"));
const AboutPage = lazy(() => import("./pages/public/AboutPage"));
const BlogPage = lazy(() => import("./pages/public/BlogPage"));
const ArticleDetailPage = lazy(() => import("./pages/public/ArticleDetailPage"));
const CertificatesPage = lazy(() => import("./pages/public/CertificatesPage"));
const ContactPage = lazy(() => import("./pages/public/ContactPage"));
const CreativeWorkDetailPage = lazy(() => import("./pages/public/CreativeWorkDetailPage"));
const CreativeWorksPage = lazy(() => import("./pages/public/CreativeWorksPage"));
const HomePage = lazy(() => import("./pages/public/HomePage"));
const NotFoundPage = lazy(() => import("./pages/public/NotFoundPage"));
const ProjectDetailPage = lazy(() => import("./pages/public/ProjectDetailPage"));
const ProjectsPage = lazy(() => import("./pages/public/ProjectsPage"));

function RouteFallback() {
  return <div className="min-h-[45vh] bg-[var(--color-bg-primary)]" aria-busy="true" aria-label="Loading page" />;
}

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
      <Suspense fallback={<RouteFallback />}>
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
            <Route path="articles" element={<AdminArticlesPage />} />
            <Route path="articles/new" element={<AdminArticleFormPage />} />
            <Route path="articles/:id/edit" element={<AdminArticleFormPage />} />
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
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<ArticleDetailPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
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
