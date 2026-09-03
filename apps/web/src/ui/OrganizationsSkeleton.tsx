import { Card, CardContent, CardFooter, CardHeader } from '../ui/Card';
import { Skeleton } from './Skeleton';

function OrganizationsSkeleton() {
  return (
    <div>
      {/* Top bar */}
      <div className="flex justify-between border-b p-6">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-10 w-44" />
      </div>

      {/* Organization cards */}
      <div className="grid gap-4 px-4 pt-10 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="mt-2 h-4 w-48" />
            </CardHeader>

            <CardContent>
              <Skeleton className="h-4 w-24" />
            </CardContent>

            <CardFooter>
              <Skeleton className="h-4 w-16" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default OrganizationsSkeleton;
