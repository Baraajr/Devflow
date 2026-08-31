import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  CircleDot,
  GitBranch,
  ListChecks,
  Rocket,
  Users,
} from 'lucide-react';

import Logo from '../ui/Logo';

function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Logo />

          <nav className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-md px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Log in
            </Link>

            <Link
              to="/register"
              className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main className="pt-16">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border">
          {/* Background */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-0 h-125 w-200 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />

            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  'linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)',
                backgroundSize: '48px 48px',
                maskImage:
                  'radial-gradient(ellipse at center, black 20%, transparent 75%)',
                WebkitMaskImage:
                  'radial-gradient(ellipse at center, black 20%, transparent 75%)',
              }}
            />
          </div>

          <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-20 sm:pb-24 sm:pt-28">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Built for software teams
              </div>

              <h1 className="text-balance text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                Plan the work.
                <br />
                <span className="text-primary">Ship the software.</span>
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-balance text-lg leading-8 text-muted-foreground">
                DevFlow gives engineering teams one place to plan projects,
                track issues, run sprints, and keep everyone moving toward the
                next release.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  to="/register"
                  className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Create your workspace
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  to="/login"
                  className="inline-flex h-11 items-center rounded-md border border-border px-6 text-sm font-medium transition-colors hover:bg-surface-hover"
                >
                  Sign in
                </Link>
              </div>

              <p className="mt-4 text-xs text-muted-foreground">
                Free for small teams · No credit card required
              </p>
            </div>

            {/* Product Preview */}
            <div className="mx-auto mt-16 max-w-6xl">
              <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-2xl">
                {/* Window header */}
                <div className="flex h-11 items-center gap-2 border-b border-border px-4">
                  <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
                  <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
                  <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />

                  <div className="ml-4 h-6 w-48 rounded-md bg-background" />
                </div>

                <div className="grid min-h-90 grid-cols-[180px_1fr]">
                  {/* Sidebar */}
                  <aside className="hidden border-r border-border p-4 sm:block">
                    <div className="mb-6 h-7 w-24 rounded bg-background" />

                    <div className="space-y-2">
                      <PreviewNavItem active label="Overview" />
                      <PreviewNavItem label="Projects" />
                      <PreviewNavItem label="Issues" />
                      <PreviewNavItem label="Sprints" />
                    </div>

                    <div className="mt-8 h-px bg-border" />

                    <div className="mt-6 space-y-3">
                      <div className="h-3 w-20 rounded bg-background" />
                      <div className="h-3 w-28 rounded bg-background" />
                      <div className="h-3 w-24 rounded bg-background" />
                    </div>
                  </aside>

                  {/* Dashboard */}
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="h-5 w-32 rounded bg-background" />
                        <div className="mt-2 h-3 w-48 rounded bg-background" />
                      </div>

                      <div className="hidden h-8 w-24 rounded-md bg-primary/20 sm:block" />
                    </div>

                    <div className="mt-8 grid gap-4 sm:grid-cols-3">
                      <PreviewCard
                        icon={GitBranch}
                        label="Projects"
                        value="8"
                      />

                      <PreviewCard
                        icon={CircleDot}
                        label="Open issues"
                        value="24"
                      />

                      <PreviewCard
                        icon={CheckCircle2}
                        label="Completed"
                        value="67"
                      />
                    </div>

                    <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
                      <div className="rounded-lg border border-border p-5">
                        <div className="flex items-center justify-between">
                          <div className="h-4 w-28 rounded bg-background" />
                          <div className="h-3 w-16 rounded bg-background" />
                        </div>

                        <div className="mt-6 space-y-4">
                          <PreviewIssue
                            title="Implement project dashboard"
                            status="In progress"
                          />

                          <PreviewIssue
                            title="Add issue filtering"
                            status="Review"
                          />

                          <PreviewIssue
                            title="Improve authentication flow"
                            status="Done"
                          />

                          <PreviewIssue
                            title="Create sprint planning"
                            status="Todo"
                          />
                        </div>
                      </div>

                      <div className="rounded-lg border border-border p-5">
                        <div className="h-4 w-24 rounded bg-background" />

                        <div className="mt-6 space-y-5">
                          <PreviewProgress
                            label="Sprint progress"
                            value="72%"
                          />

                          <PreviewProgress
                            label="Issues completed"
                            value="58%"
                          />

                          <PreviewProgress
                            label="Release progress"
                            value="84%"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Workflow */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
            <div className="max-w-2xl">
              <p className="text-sm font-medium text-primary">THE WORKFLOW</p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                From idea to shipped software.
              </h2>

              <p className="mt-4 leading-7 text-muted-foreground">
                Keep planning, execution, and progress connected without
                spreading your team's work across multiple tools.
              </p>
            </div>

            <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-3">
              <WorkflowCard
                number="01"
                icon={GitBranch}
                title="Plan"
                description="Create projects, define the work, and organize priorities before development starts."
              />

              <WorkflowCard
                number="02"
                icon={ListChecks}
                title="Track"
                description="Turn work into issues, assign ownership, and keep your team's progress visible."
              />

              <WorkflowCard
                number="03"
                icon={Rocket}
                title="Ship"
                description="Run focused sprints, monitor progress, and move completed work toward release."
              />
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-medium text-primary">
                MADE FOR ENGINEERING
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Everything your team needs to stay aligned.
              </h2>

              <p className="mt-4 text-muted-foreground">
                Simple tools for the everyday work of building software.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              <Feature
                icon={GitBranch}
                title="Projects"
                description="Give every initiative a clear home with its own team, issues, and progress."
              />

              <Feature
                icon={ListChecks}
                title="Issues"
                description="Track bugs, tasks, and improvements from backlog to completion."
              />

              <Feature
                icon={Rocket}
                title="Sprints"
                description="Plan focused iterations and understand how much work is moving forward."
              />

              <Feature
                icon={Users}
                title="Team collaboration"
                description="Keep ownership, activity, and project communication visible to everyone."
              />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section>
          <div className="mx-auto max-w-4xl px-6 py-24 text-center sm:py-28">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Give your team a better way to ship.
            </h2>

            <p className="mx-auto mt-5 max-w-xl leading-7 text-muted-foreground">
              Create your workspace, start your first project, and bring your
              engineering workflow into one place.
            </p>

            <Link
              to="/register"
              className="mt-8 inline-flex h-11 items-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground sm:flex-row">
          <Logo />

          <p>&copy; {new Date().getFullYear()} DevFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function WorkflowCard({
  number,
  icon: Icon,
  title,
  description,
}: {
  number: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-background p-7 sm:p-8">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          {number}
        </span>

        <Icon className="h-5 w-5 text-primary" />
      </div>

      <h3 className="mt-10 text-xl font-semibold">{title}</h3>

      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-border p-6 transition-colors hover:bg-surface-hover">
      <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>

      <h3 className="font-semibold">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function PreviewNavItem({
  label,
  active = false,
}: {
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`rounded-md px-3 py-2 text-xs ${
        active
          ? 'bg-primary/10 font-medium text-primary'
          : 'text-muted-foreground'
      }`}
    >
      {label}
    </div>
  );
}

function PreviewCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>

        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>

      <p className="mt-3 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function PreviewIssue({ title, status }: { title: string; status: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />

        <span className="truncate text-xs text-muted-foreground">{title}</span>
      </div>

      <span className="shrink-0 text-[10px] text-muted-foreground">
        {status}
      </span>
    </div>
  );
}

function PreviewProgress({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>

        <span className="font-medium">{value}</span>
      </div>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: value }}
        />
      </div>
    </div>
  );
}

export default LandingPage;
