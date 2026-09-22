import { ArrowUpRight, Building2, Users } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../../ui/Card';
import type { useOrganizations } from '../../hooks/useOrganizations';

function Organizations({
  organizations,
}: {
  organizations: NonNullable<ReturnType<typeof useOrganizations>['data']>;
}) {
  return (
    <div className="grid gap-5 p-6 lg:p-8 sm:grid-cols-2 lg:grid-cols-3">
      {organizations.map((org) => (
        <NavLink to={`/organizations/${org.id}`} key={org.id} className="group">
          <Card className="h-full overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Building2 className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <CardTitle className="truncate">{org.name}</CardTitle>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Organization
                    </p>
                  </div>
                </div>

                <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary group-hover:opacity-100" />
              </div>

              <CardDescription className="mt-4 line-clamp-2 min-h-10 leading-5">
                {org.description || 'No description provided'}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>
                  {org.memberCount}{' '}
                  {org.memberCount === 1 ? 'member' : 'members'}
                </span>
              </div>
            </CardContent>

            <CardFooter className="justify-between border-t pt-4">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {org.role}
              </span>

              <span className="text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                Open organization →
              </span>
            </CardFooter>
          </Card>
        </NavLink>
      ))}
    </div>
  );
}

export default Organizations;
