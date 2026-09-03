import { useParams } from 'react-router-dom';

function OrganizationPage() {
  const { id } = useParams();
  return <div>Organization: {id}</div>;
}
export default OrganizationPage;
