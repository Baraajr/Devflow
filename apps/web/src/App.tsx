import { Route, Routes } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import ProtectedRoute from './ui/ProtectedRoute';
import PublicRoute from './ui/PublicRoute';
import { Toaster } from './ui/Toaster';
import AppLayout from './ui/AppLayout';
import OrganizationsPage from './pages/OrganizationsPage';
import OrganizationPage from './pages/OrganizationPage';
import DashboardPage from './pages/DashboardPage';
import OrganizationLayout from './ui/OrganizationLayout';
import OrganizationMembersPage from './pages/OrganizationMembersPage';
import OrganizationInvitaionsPage from './pages/OrganizationInvitationsPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectPage from './pages/ProjectPage';
import NotFoundPage from './ui/NotFoundPage';
import IssuesPage from './pages/IssuesPage';
import IssuePage from './pages/IssuePage';
import ProjectMembersPage from './pages/ProjectMembersPage';
import LabelsPage from './pages/LabelsPage';

function App() {
  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route element={<PublicRoute />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/organizations" element={<OrganizationsPage />} />

            <Route
              path="/organizations/:organizationId"
              element={<OrganizationLayout />}
            >
              <Route index element={<OrganizationPage />} />
              <Route path="members" element={<OrganizationMembersPage />} />
              <Route path="projects" element={<ProjectsPage />} />

              <Route path="projects/:projectId" element={<ProjectPage />} />

              <Route
                path="projects/:projectId/issues"
                element={<IssuesPage />}
              />
              <Route
                path="projects/:projectId/members"
                element={<ProjectMembersPage />}
              />
              <Route
                path="projects/:projectId/labels"
                element={<LabelsPage />}
              />
              <Route
                path="projects/:projectId/issues/:issueId"
                element={<IssuePage />}
              />

              <Route
                path="invitations"
                element={<OrganizationInvitaionsPage />}
              />
            </Route>
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      <Toaster />
    </>
  );
}

export default App;
