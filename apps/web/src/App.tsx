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
import ProjectLayout from './ui/ProjectLayout';
import SprintsPage from './pages/SprintsPage';
import SprintPage from './pages/SprintPage';

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

              <Route path="projects/:projectId" element={<ProjectLayout />}>
                <Route index element={<ProjectPage />} />
                <Route path="sprints" element={<SprintsPage />} />
                <Route path="sprints/:sprintId" element={<SprintPage />} />
                <Route path="issues" element={<IssuesPage />} />
                <Route path="members" element={<ProjectMembersPage />} />
                <Route path="labels" element={<LabelsPage />} />
                <Route path="issues/:issueId" element={<IssuePage />} />
              </Route>

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
