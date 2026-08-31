import type { ReactNode } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface AuthLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

const features = [
  'Projects',
  'Issues & sprints',
  'Team collaboration',
] as const;

function AuthLayout({ title, description, children }: AuthLayoutProps) {
  return (
    <main className="grid min-h-dvh md:grid-cols-2">
      {/* Marketing panel */}
      <section className="relative hidden flex-col justify-between overflow-hidden border-l bg-muted/30 p-10 md:flex lg:p-16">
        {/* Decorative background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,var(--color-border)_1px,transparent_0)] bg-size-[24px_24px] mask-[radial-gradient(ellipse_80%_60%_at_50%_0%,black_40%,transparent_100%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl"
        />

        <div className="relative z-10">
          <a
            href="/"
            className="text-xl font-semibold tracking-tight transition-opacity hover:opacity-80"
          >
            Devflow
          </a>
        </div>

        <div className="relative z-10 max-w-lg space-y-8">
          <div className="space-y-4">
            <h2 className="text-5xl font-bold leading-[1.05] tracking-tight lg:text-6xl">
              Build better software.
              <br />
              Together.
            </h2>

            <p className="max-w-md text-lg text-muted-foreground">
              The engineering workspace for teams that plan, build, and ship
              software together.
            </p>
          </div>

          <ul className="space-y-3 text-sm">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-2.5">
                <CheckCircle2
                  className="size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs text-muted-foreground">
          Devflow · Engineering workspace
        </p>
      </section>{' '}
      {/* Form panel */}
      <section className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-105">
          {/* Mobile-only logo */}
          <a
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-lg font-semibold tracking-tight md:hidden"
          >
            Devflow
          </a>

          <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
            <div className="mb-8 space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>

            {children}
          </div>
        </div>
      </section>
    </main>
  );
}

export default AuthLayout;
