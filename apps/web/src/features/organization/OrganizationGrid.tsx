import { NavLink } from 'react-router-dom';
import useOrganizations from '../../hooks/useOrganizations';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../../ui/Card';
function OrganizationGrid({
  organizations,
}: {
  organizations: NonNullable<ReturnType<typeof useOrganizations>['data']>;
}) {
  return (
    <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
      {organizations.map((org) => (
        <NavLink to={`/organizations/${org.id}`} key={org.id} className="group">
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle>{org.name}</CardTitle>

              {org.description && (
                <CardDescription className="line-clamp-2">
                  {org.description}
                </CardDescription>
              )}
            </CardHeader>

            <CardContent>
              <span className="text-sm text-muted-foreground">
                {org.memberCount} members
              </span>
            </CardContent>

            <CardFooter>
              <span className="text-sm capitalize text-muted-foreground">
                {org.role}
              </span>
            </CardFooter>
          </Card>
        </NavLink>
      ))}
    </div>
  );
}

export default OrganizationGrid;
