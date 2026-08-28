# DevFlow — Product Requirements Document

## 1. Product Overview

DevFlow is a production-oriented engineering project-management SaaS platform designed for software development teams.

It provides a centralized workspace where organizations can manage teams, projects, issues, sprints, workflows, collaboration, notifications, and engineering metrics.

The product is designed to demonstrate real-world software engineering practices rather than being a simple CRUD application.

### Core Concept

```text
Organization
    ├── Teams
    │     └── Members
    │
    └── Projects
          ├── Issues
          ├── Sprints
          ├── Comments
          ├── Attachments
          └── Activity / Audit History
```

## 2. Product Goals

### Primary Goals

1. Provide software teams with a complete project-management workspace.
2. Support issue-based development workflows.
3. Allow teams to plan and execute work using sprints and Kanban boards.
4. Provide collaboration features such as comments, mentions, notifications, and realtime updates.
5. Provide role-based access control.
6. Track project and engineering activity through audit history and metrics.
7. Demonstrate production-grade backend and frontend architecture.
8. Provide a strong portfolio project demonstrating full-stack engineering capabilities.

### Engineering Goals

The project should demonstrate:

- Modular backend architecture
- RESTful API design
- PostgreSQL relational data modeling
- Authentication and authorization
- RBAC and permission checks
- Realtime communication
- Caching
- Background jobs
- Automated testing
- Dockerized development
- CI/CD
- API documentation
- Security practices
- Observability-ready architecture
- Clean separation of responsibilities

## 3. Target Users

### 3.1 Organization Owner

The person responsible for creating and managing an organization.

Responsibilities:

- Manage organization settings
- Manage members
- Manage teams
- Manage projects
- Manage roles and permissions
- View organization-level metrics

### 3.2 Engineering Manager

Responsible for managing projects and development teams.

Responsibilities:

- Create and manage projects
- Manage project members
- Create and manage sprints
- Assign issues
- Monitor progress
- Review engineering metrics

### 3.3 Developer

The primary day-to-day user.

Responsibilities:

- View assigned work
- Create and update issues
- Move issues through workflows
- Participate in discussions
- Comment and mention teammates
- Upload attachments
- Manage sprint work

### 3.4 Viewer

Read-only user.

Can:

- View projects
- View issues
- View sprint progress
- View comments
- View project metrics

Cannot modify project data.

## 4. Core Features

### 4.1 Authentication

Users must be able to securely authenticate.

**Requirements**

- User registration
- Login
- Logout
- Access token
- Refresh token
- Secure httpOnly cookies
- Password hashing
- Password validation
- Account activation
- Session management
- Protected API routes

**Future Consideration**

- Google OAuth
- GitHub OAuth
- Two-factor authentication

## 5. Organizations

Organizations are the highest-level tenant in DevFlow.

**Requirements**

Users can:

- Create an organization
- Update organization information
- View organization information
- Invite members
- Remove members
- Assign organization roles
- View organization members

**Organization Isolation**

Users must only be able to access organizations they belong to.
Every organization-owned resource must be associated with an organization.

## 6. Teams

Organizations can contain multiple teams.

Examples:

```text
Acme Inc.
├── Backend Team
├── Frontend Team
├── Mobile Team
└── QA Team
```

**Requirements**

Managers can:

- Create teams
- Rename teams
- Delete teams
- Add members
- Remove members
- View team members

Users can:

- View teams they belong to
- View team projects
- View team activity

## 7. Projects

Projects represent software products or major engineering initiatives.

**Project Data**

A project contains:

- Name
- Key
- Description
- Status
- Team
- Members
- Created date
- Updated date

Example:

```text
Project:
DevFlow

Key:
DF

Issue:
DF-123
```

**Requirements**

Authorized users can:

- Create projects
- Update projects
- Archive projects
- Add members
- Remove members
- View project details
- View project activity
- View project metrics

## 8. Issues

Issues are the primary unit of work.

**Issue Types**

- Task
- Bug
- Feature
- Improvement

**Issue Properties**

Each issue contains:

- ID
- Project
- Title
- Description
- Type
- Status
- Priority
- Assignee
- Reporter
- Labels
- Sprint
- Story points
- Due date
- Created date
- Updated date
- Completed date

**Priority**

- Critical
- High
- Medium
- Low

**Requirements**

Users with appropriate permissions can:

- Create issues
- Update issues
- Delete issues
- Assign issues
- Change priority
- Change status
- Add labels
- Add issues to sprints
- Add story points
- Set due dates
- Add comments
- Attach files

## 9. Issue Workflow

Each project has a configurable workflow.

Default workflow:

```text
Backlog
   ↓
Todo
   ↓
In Progress
   ↓
In Review
   ↓
Done
```

**Requirements**

Users can move issues between statuses when authorized.
The system must record status transitions in the issue history.

Example:

```text
DF-123
Todo → In Progress

Changed by:
Ahmed

Time:
2026-08-23 14:30
```

## 10. Kanban Board

Projects provide a Kanban board.

Example:

```text
BACKLOG       TODO        IN PROGRESS       REVIEW       DONE
----------------------------------------------------------------
DF-101        DF-120      DF-123            DF-115       DF-100
DF-102        DF-121      DF-124            DF-116       DF-105
```

**Requirements**

- Display issues grouped by status
- Drag and drop issues
- Persist status changes
- Persist issue ordering
- Optimistic UI updates
- Realtime board updates
- Permission validation on the backend

The frontend must never be treated as the source of truth for authorization.

## 11. Sprints

Sprints allow teams to organize work into time-boxed iterations.

**Sprint Properties**

- Name
- Goal
- Start date
- End date
- Status
- Project

**Sprint Status**

```text
Planned
Active
Completed
```

**Requirements**

Managers can:

- Create sprints
- Start sprints
- Complete sprints
- Add issues
- Remove issues
- Set sprint goals

Users can:

- View sprint progress
- View sprint issues
- Update assigned issues

## 12. Sprint Planning

Sprint planning should provide:

```text
Sprint Capacity
----------------
Total Story Points: 42

Completed: 25
Remaining: 17
```

The system should calculate:

- Total issues
- Completed issues
- Remaining issues
- Story points
- Completed story points
- Completion percentage

## 13. Comments

Users can comment on issues.

**Requirements**

- Create comment
- Edit own comment
- Delete own comment
- Display comment author
- Display timestamp
- Support mentions

Example:

```text
@Ahmed please review the authentication middleware.
```

## 14. Mentions

Users can mention other users inside comments.

Example:

```text
@john Can you review this PR?
```

When a user is mentioned:

1. The system creates a notification.
2. The mentioned user receives the notification.
3. The notification links to the relevant issue/comment.

## 15. Attachments

Users can attach files to issues and comments.

**Requirements**

- Upload files
- Download files
- Delete attachments when authorized
- Validate file type
- Validate file size
- Store metadata
- Associate attachments with resources

The actual file storage should be abstracted from the application layer.

## 16. Notifications

DevFlow provides an in-app notification system.

**Notification Events**

Users may receive notifications when:

- Assigned to an issue
- Mentioned in a comment
- Added to a project
- Added to a team
- Issue status changes
- Issue priority changes
- Sprint starts
- Sprint ends
- Someone comments on an issue

**Notification Properties**

- Type
- Recipient
- Actor
- Resource
- Read status
- Created date

## 17. Realtime Updates

DevFlow should provide realtime updates for collaborative workflows.

**Examples**

When one developer moves:

```text
DF-123
Todo → In Progress
```

other users currently viewing the project should receive the update without refreshing.

**Realtime Events**

Potential events:

```text
issue.created
issue.updated
issue.deleted
issue.status_changed
comment.created
comment.updated
comment.deleted
notification.created
sprint.updated
```

WebSockets should be used for realtime communication.

## 18. Search

Users should be able to search project data.

**Searchable Data**

- Issue title
- Issue description
- Issue key
- Comments
- Labels
- Users

Example:

```text
Search:
authentication
```

Results:

```text
DF-123 Fix authentication refresh token
DF-141 Authentication middleware refactor
DF-155 Add OAuth authentication
```

## 19. Filtering and Sorting

Issue lists must support filtering.

**Filters**

- Status
- Priority
- Assignee
- Reporter
- Issue type
- Sprint
- Label
- Due date

**Sorting**

- Created date
- Updated date
- Priority
- Due date
- Story points

Filters should be represented through URL query parameters where appropriate.

Example:

```text
/issues?status=in-progress&priority=high&assignee=123
```

## 20. Audit History

Important actions must be recorded.

Examples:

```text
Ahmed created DF-123

Mohamed assigned DF-123 to Sara

Sara changed DF-123:
Todo → In Progress

Ahmed changed priority:
Medium → High
```

**Audited Actions**

- Issue creation
- Issue deletion
- Assignment changes
- Status changes
- Priority changes
- Sprint changes
- Project membership changes
- Organization membership changes
- Permission changes

Audit logs should be immutable to normal users.

## 21. Engineering Metrics

DevFlow should provide useful engineering metrics.

**Project Metrics**

- Total issues
- Completed issues
- Open issues
- Issues by status
- Issues by priority
- Issues by type
- Sprint completion
- Story points completed
- Average cycle time

**Sprint Metrics**

- Planned work
- Completed work
- Remaining work
- Completion percentage
- Story points completed

**Example Dashboard**

```text
Project Progress

Completed        68%
In Progress      18%
Todo             10%
Backlog           4%

Sprint

42 points planned
31 points completed
11 points remaining
```

Metrics should be calculated from actual project data rather than manually stored dashboard values.

## 22. GitHub Integration

GitHub integration is an optional advanced feature.

The goal is to connect software-development activity with DevFlow issues.

**Potential Features**

- Connect GitHub repository
- Link branches to issues
- Link commits to issues
- Link pull requests to issues
- Display PR status
- Display deployment status

Example:

```text
DF-123 Add authentication refresh tokens

Branch:
feature/DF-123-refresh-token

Pull Request:
#421

Status:
Review requested
```

GitHub integration should not be required for the core application.

## 23. Permissions and RBAC

Authorization must be enforced at the API level.

**Example Permission Model**

```text
Organization
    organization.read
    organization.update
    organization.manage_members

Team
    team.read
    team.create
    team.update
    team.delete
    team.manage_members

Project
    project.read
    project.create
    project.update
    project.delete
    project.manage_members

Issue
    issue.read
    issue.create
    issue.update
    issue.delete
    issue.assign
```

Roles can map to permissions.

Example:

```text
Owner
    All permissions

Manager
    Project management
    Team management
    Issue management

Developer
    Issue creation/update
    Comments
    Attachments

Viewer
    Read-only access
```

## 24. API Requirements

The backend will expose a REST API.

Base URL:

```text
/api/v1
```

Example endpoints:

```text
POST   /auth/register
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout

GET    /organizations
POST   /organizations
GET    /organizations/:id
PATCH  /organizations/:id

GET    /organizations/:id/teams
POST   /organizations/:id/teams

GET    /projects
POST   /projects
GET    /projects/:id
PATCH  /projects/:id

GET    /projects/:id/issues
POST   /projects/:id/issues

GET    /issues/:id
PATCH  /issues/:id
DELETE /issues/:id

GET    /issues/:id/comments
POST   /issues/:id/comments

GET    /projects/:id/sprints
POST   /projects/:id/sprints
PATCH  /sprints/:id

GET    /notifications
PATCH  /notifications/:id/read

GET    /projects/:id/metrics
```

The API should use consistent HTTP status codes and a unified error-response format.

## 25. Frontend Requirements

The frontend will be built with React.

**Main Screens**

```text
Authentication
├── Login
├── Register
└── Forgot Password

Application
├── Dashboard
├── Organizations
├── Teams
├── Projects
│   ├── Overview
│   ├── Board
│   ├── Issues
│   ├── Sprints
│   ├── Metrics
│   └── Activity
├── Issue Details
├── Notifications
└── Settings
```

**UI Requirements**

- Responsive layout
- Loading states
- Error states
- Empty states
- Optimistic updates where appropriate
- Accessible interactions
- Confirmation for destructive actions
- Pagination/infinite loading where appropriate
- URL-driven filters

## 26. Dashboard

The dashboard provides an overview of the user's work.

**Dashboard Sections**

```text
My Assigned Issues
Upcoming Deadlines
Active Sprints
Recent Activity
Notifications
Project Overview
```

Example:

```text
My Work

12 Open Issues
4 In Progress
3 Due This Week
5 Completed This Sprint
```

## 27. Non-Functional Requirements

**Performance**

The application should:

- Use database indexes for frequently queried fields.
- Avoid N+1 database queries.
- Paginate large collections.
- Cache appropriate read-heavy data.
- Use Redis where caching provides measurable value.
- Use background jobs for expensive asynchronous operations.

**Scalability**

The application should be designed so that API instances can scale horizontally.
Realtime communication should not depend on process-local state.

Redis can be used for:

- Cache
- WebSocket pub/sub
- Distributed coordination

**Reliability**

The system should:

- Validate all incoming data.
- Handle unexpected exceptions globally.
- Use database transactions where required.
- Prevent unauthorized resource access.
- Preserve audit history.
- Retry appropriate background jobs.

## 28. Background Jobs

BullMQ will be used for asynchronous jobs.

Potential jobs:

```text
Send notification
Process attachment
Send invitation email
Generate metrics
Process GitHub webhook
Clean expired sessions
```

Jobs should be idempotent where possible.

## 29. Caching

Redis may be used for frequently accessed data.

Potential cache targets:

- Organization metadata
- Project metadata
- Permission data
- Frequently accessed dashboard metrics

Cache invalidation must occur when the underlying data changes.

## 30. Database

PostgreSQL is the primary database.

Core entities:

```text
User
Organization
OrganizationMember
Team
TeamMember
Project
ProjectMember
Issue
IssueStatus
IssueLabel
IssueLabelRelation
Sprint
Comment
Attachment
Notification
AuditLog
RefreshToken
```

Relationships must use foreign keys and appropriate indexes.

## 31. Security Requirements

The system must:

- Hash passwords securely.
- Never store plaintext passwords.
- Use secure authentication tokens.
- Use httpOnly cookies for refresh tokens.
- Validate request payloads.
- Validate authorization on every protected resource.
- Prevent IDOR/BOLA vulnerabilities.
- Validate file uploads.
- Rate-limit sensitive authentication endpoints.
- Protect against common injection attacks.
- Configure CORS explicitly.
- Avoid exposing sensitive internal errors.
- Keep secrets in environment variables.
- Validate webhook signatures for external integrations.

## 32. Testing Strategy

Testing is a first-class requirement.

**Unit Tests**

Test:

- Services
- Business rules
- Utilities
- Permission logic
- Validation
- Metric calculations

**Integration Tests**

Test:

- Authentication
- Database interactions
- API endpoints
- Authorization
- Issue workflows
- Sprint operations

**E2E Tests**

Test critical user flows:

```text
Register
→ Login
→ Create organization
→ Create project
→ Create issue
→ Assign issue
→ Move issue
→ Complete sprint
```

**Frontend Tests**

Test:

- Components
- Hooks
- Forms
- State behavior
- Important user interactions

## 33. CI/CD

GitHub Actions should run automatically on pull requests and main branch changes.

Pipeline:

```text
Push / Pull Request
        ↓
Install dependencies
        ↓
Lint
        ↓
Type check
        ↓
Unit tests
        ↓
Integration tests
        ↓
Build
        ↓
Docker build
        ↓
Deploy
```

A pull request should not be merged when required checks fail.

## 34. Docker

Development and deployment environments should be reproducible with Docker.

Development services:

```text
Frontend
Backend
PostgreSQL
Redis
```

Docker Compose should provide a convenient local development environment.

## 35. Observability

The application should be structured to support:

- Structured logging
- Request IDs
- Error tracking
- Performance monitoring
- Health checks

Health endpoints:

```text
GET /health
GET /health/database
GET /health/redis
```

## 36. Product Rules

**Organization Rules**

- A user must belong to an organization to access its resources.
- Organization members cannot access another organization's private resources.
- Removing a member must revoke their access immediately.

**Project Rules**

- Every project belongs to exactly one organization.
- Project members must belong to the project's organization.
- Archived projects cannot receive new work unless explicitly restored.

**Issue Rules**

- Every issue belongs to exactly one project.
- Issue keys are unique within a project.
- An issue cannot be assigned to a user who does not have access to the project.
- Completed issues must have a completion timestamp.

**Sprint Rules**

- An issue can belong to at most one active sprint.
- Only authorized users can start or complete a sprint.
- Completing a sprint must handle unfinished issues explicitly.

## 37. MVP Scope

The first production-ready version should include:

**Authentication**

- Registration
- Login
- Logout
- Refresh tokens
- Protected routes

**Organizations**

- Create organization
- Members
- Roles

**Teams**

- Create teams
- Team members

**Projects**

- Create project
- Project members
- Project overview

**Issues**

- CRUD
- Assignment
- Priority
- Status
- Labels
- Comments

**Board**

- Kanban board
- Drag and drop
- Persistent ordering

**Sprints**

- Create sprint
- Start sprint
- Complete sprint
- Sprint issues
- Sprint metrics

**Notifications**

- Assignment notifications
- Mention notifications
- In-app notifications

**Audit**

- Issue activity
- Important project activity

**Infrastructure**

- PostgreSQL
- Redis
- Docker
- Automated tests
- CI/CD

## 38. Post-MVP Features

After the MVP:

1. GitHub integration
2. Advanced metrics
3. Advanced permissions
4. Email notifications
5. File attachments
6. Advanced search
7. Saved filters
8. Custom workflows
9. Custom issue fields
10. Two-factor authentication
11. OAuth
12. Advanced reporting

## 39. Success Criteria

DevFlow is considered successful when a development team can complete the following workflow:

```text
User registers
      ↓
Creates organization
      ↓
Invites teammates
      ↓
Creates team
      ↓
Creates project
      ↓
Creates sprint
      ↓
Creates issues
      ↓
Assigns issues
      ↓
Developers work on issues
      ↓
Issues move through Kanban
      ↓
Developers comment and mention teammates
      ↓
Notifications are generated
      ↓
Sprint progresses
      ↓
Sprint is completed
      ↓
Metrics are generated
      ↓
Activity is recorded in the audit log
```

The entire workflow must be protected by authentication and authorization and covered by automated tests for critical paths.

## 40. Documentation Deliverables

The repository should contain dedicated engineering documentation.

```text
docs/
├── 01-product/
│   ├── prd.md
│   ├── user-stories.md
│   └── acceptance-criteria.md
│
├── 02-system-design/
│   ├── architecture.md
│   ├── realtime.md
│   ├── caching.md
│   └── background-jobs.md
│
├── 03-database/
│   ├── schema.md
│   └── relationships.md
│
├── 04-api/
│   └── api-spec.md
│
└── 05-decisions/
    └── ADRs
```

These documents should evolve alongside the implementation rather than being written only after development is complete.

## 41. Technology Stack

**Frontend**

- React
- TypeScript
- React Router
- React Query
- Tailwind CSS

**Backend**

- NestJS
- TypeScript
- REST API
- WebSockets

**Database**

- PostgreSQL

**Infrastructure**

- Redis
- BullMQ
- Docker
- GitHub Actions

**Testing**

- Unit testing
- Integration testing
- E2E testing

## 42. Architecture Direction

The initial architecture should be a modular monolith, not microservices.

```text
                    React Client
                         │
                         ▼
                 NestJS REST API
                         │
        ┌────────────────┼────────────────┐
        │                │                │
     Auth Module     Project Module    Issue Module
        │                │                │
        ├────────────┬───┴────────────┬───┤
        │            │                │
        ▼            ▼                ▼
    PostgreSQL     Redis          BullMQ
        │
        ▼
    Persistent Data
```

This provides strong architectural boundaries without introducing unnecessary distributed-system complexity.

## 43. Definition of Done

A feature is considered complete when:

- Requirements are documented.
- Database changes are implemented.
- API endpoints are implemented.
- Authorization is enforced.
- Validation is implemented.
- Error handling is implemented.
- Frontend functionality is implemented.
- Loading/error/empty states are handled.
- Unit tests are written where appropriate.
- Integration tests cover critical backend behavior.
- E2E tests cover critical user flows.
- Documentation is updated.
- CI passes.
- The feature works in a production-like Docker environment.

## 44. Product Vision

DevFlow should evolve into a realistic engineering-management platform rather than remain a portfolio CRUD project.

The core objective is to demonstrate the ability to design, build, test, secure, document, deploy, and maintain a production-oriented full-stack system.

The system should prioritize:

```text
Correctness
    ↓
Security
    ↓
Maintainability
    ↓
Testability
    ↓
Performance
    ↓
Scalability
```

The project should intentionally demonstrate engineering decisions that would be relevant to a real software development team.
