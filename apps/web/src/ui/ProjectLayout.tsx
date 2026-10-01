import { Navigate, Outlet, useParams } from 'react-router-dom';

import { useProject } from '../hooks/useProjects';
import { Spinner } from './Spinner';

function ProjectLayout() {
  const { projectId } = useParams<{
    projectId: string;
  }>();

  const { data: project, isPending, isError } = useProject(projectId);

  if (!projectId) {
    return <Navigate to="/organizations" replace />;
  }

  if (isPending) {
    return (
      <div className="flex min-h-75 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !project) {
    return <Navigate to="/organizations" replace />;
  }

  return <Outlet context={{ project }} />;
}

export default ProjectLayout;
