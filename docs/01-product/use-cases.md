# DevFlow — Use Cases

**Version:** 1.0
**Status:** Draft
**Product:** DevFlow — Engineering Project Management Platform

## 1. Introduction

This document defines the primary use cases for the DevFlow MVP.

A use case describes how an actor interacts with DevFlow to accomplish a specific goal.

Each use case contains:

- Actor
- Goal
- Preconditions
- Main flow
- Alternative flows
- Error cases
- Postconditions

## 2. Authentication

### UC-AUTH-001 — Register

**Actor:** Unauthenticated User
**Goal:** Create a DevFlow account.

**Preconditions**

- User does not have an existing account.
- User has access to a valid email address.

**Main Flow**

1. User opens the registration page.
2. User enters their name.
3. User enters their email.
4. User enters their password.
5. User submits the registration form.
6. System validates the input.
7. System checks that the email is not already registered.
8. System creates the user account.
9. System authenticates the user.
10. System redirects the user to the application.

**Alternative Flows**

_A1 — Validation failure_

1. System detects invalid input.
2. System displays the validation errors.
3. User corrects the input.
4. Registration continues.

_A2 — Email already registered_

1. System detects that the email already exists.
2. System rejects the registration.
3. System informs the user that the account already exists.

**Postconditions**

- A user account exists.
- The user can authenticate with the account.

### UC-AUTH-002 — Login

**Actor:** Registered User
**Goal:** Access their DevFlow account.

**Preconditions**

- User has an existing account.
- User account is active.

**Main Flow**

1. User opens the login page.
2. User enters email and password.
3. User submits the form.
4. System validates the credentials.
5. System creates an authenticated session.
6. System returns the authenticated user.
7. User is redirected to the application.

**Alternative Flows**

_A1 — Invalid credentials_

1. System rejects the credentials.
2. System returns an authentication error.
3. User remains on the login page.

_A2 — Disabled account_

1. System detects that the account is disabled.
2. Authentication is rejected.
3. User is informed that the account cannot be accessed.

**Postconditions**

- User has an authenticated session.

### UC-AUTH-003 — Logout

**Actor:** Authenticated User
**Goal:** End the current session.

**Main Flow**

1. User selects logout.
2. System invalidates the current authentication session.
3. User is redirected to the login page.

**Postconditions**

- User is no longer authenticated.

### UC-AUTH-004 — Get Current User

**Actor:** Authenticated User
**Goal:** Retrieve the user's current account and membership information.

**Main Flow**

1. Application requests the current user.
2. System validates authentication.
3. System retrieves the user's information.
4. System returns the user information and applicable organization membership.

**Error Cases**

- User is not authenticated.
- User account no longer exists.
- User account has been disabled.

## 3. Organization Management

### UC-ORG-001 — Create Organization

**Actor:** Authenticated User
**Goal:** Create an organization for a team.

**Preconditions**

- User is authenticated.

**Main Flow**

1. User selects "Create Organization".
2. User enters the organization name.
3. User submits the form.
4. System validates the name.
5. System creates the organization.
6. System creates an organization membership for the user.
7. User is assigned the Administrator role.
8. System opens the organization.

**Postconditions**

- Organization exists.
- User is an organization administrator.

### UC-ORG-002 — Invite Member

**Actor:** Organization Admin
**Goal:** Add another user to the organization.

**Preconditions**

- Actor is an organization administrator.
- Target email is valid.
- Target user is not already a member.

**Main Flow**

1. Admin opens organization members.
2. Admin selects "Invite Member".
3. Admin enters the user's email.
4. Admin selects the organization role.
5. Admin submits the invitation.
6. System validates the request.
7. System creates an invitation.
8. System sends an invitation notification to the target user.

**Alternative Flows**

_A1 — User already belongs to organization_

1. System detects an existing membership.
2. Invitation is rejected.

_A2 — Existing pending invitation_

1. System detects an existing invitation.
2. System prevents a duplicate invitation.

**Postconditions**

- A pending invitation exists.

### UC-ORG-003 — Accept Invitation

**Actor:** Invited User
**Goal:** Join an organization.

**Preconditions**

- A valid invitation exists.
- Invitation has not expired.
- User is authenticated or can authenticate.

**Main Flow**

1. User opens the invitation.
2. System validates the invitation.
3. User accepts the invitation.
4. System creates organization membership.
5. System assigns the role specified by the invitation.
6. System marks the invitation as accepted.

**Postconditions**

- User is a member of the organization.

### UC-ORG-004 — Remove Member

**Actor:** Organization Admin
**Goal:** Remove a member from an organization.

**Preconditions**

- Actor is an organization administrator.
- Target user is an organization member.

**Main Flow**

1. Admin opens organization members.
2. Admin selects a member.
3. Admin selects "Remove".
4. System validates the administrator's permission.
5. System removes the user's organization membership.
6. System revokes access to organization resources.

**Alternative Flows**

_A1 — Last administrator_
The system rejects the operation if removing the member would leave the organization without an administrator.

**Postconditions**

- Target user no longer has access to the organization.

### UC-ORG-005 — Change Member Role

**Actor:** Organization Admin
**Goal:** Change an organization member's role.

**Main Flow**

1. Admin opens organization members.
2. Admin selects a member.
3. Admin chooses a new role.
4. System validates the role.
5. System updates the membership.

**Alternative Flows**

_A1 — Removing the last administrator_
The system rejects the operation.

**Postconditions**

- Member has the new organization role.

## 4. Project Management

### UC-PROJECT-001 — Create Project

**Actor:** Organization Admin / Engineering Manager
**Goal:** Create a project inside an organization.

**Preconditions**

- Actor belongs to the organization.
- Actor has permission to create projects.

**Main Flow**

1. User opens the organization's projects.
2. User selects "Create Project".
3. User enters project name.
4. User enters project key.
5. User enters description.
6. User submits the form.
7. System validates the information.
8. System checks project key uniqueness.
9. System creates the project.
10. System creates the default workflow.
11. System adds the creator as a project member.

**Alternative Flows**

_A1 — Project key already exists_

1. System detects the duplicate key.
2. Project creation is rejected.
3. User is asked to choose another key.

**Postconditions**

- Project exists.
- Default workflow exists.
- Creator is a project member.

### UC-PROJECT-002 — View Project

**Actor:** Project Member
**Goal:** View project information.

**Main Flow**

1. User opens the project.
2. System verifies project membership.
3. System retrieves project information.
4. System displays the project.

Project information includes:

- Project details
- Issues
- Current sprint
- Members
- Workflow
- Recent activity

**Error Cases**

- User is not authorized.
- Project does not exist.

### UC-PROJECT-003 — Update Project

**Actor:** Organization Admin / Engineering Manager
**Goal:** Modify project information.

**Main Flow**

1. User opens project settings.
2. User changes project information.
3. User submits changes.
4. System validates permissions.
5. System validates the new information.
6. System updates the project.
7. System records the activity.

### UC-PROJECT-004 — Archive Project

**Actor:** Organization Admin / Engineering Manager
**Goal:** Stop active development on a project while preserving its data.

**Main Flow**

1. User opens project settings.
2. User selects "Archive Project".
3. System asks for confirmation.
4. User confirms.
5. System archives the project.
6. System records the activity.

**Postconditions**

- Project is archived.
- Existing project data remains available.
- New issues cannot be created.

### UC-PROJECT-005 — Manage Project Members

**Actor:** Organization Admin / Engineering Manager
**Goal:** Control which organization members can participate in a project.

**Main Flow**

1. User opens project members.
2. User selects "Add Member".
3. User selects an organization member.
4. System validates that the user belongs to the organization.
5. System adds the user to the project.

**Alternative Flows**

_A1 — User is not an organization member_
The operation is rejected.

_A2 — User is already a project member_
The operation is rejected.

## 5. Issue Management

### UC-ISSUE-001 — Create Issue

**Actor:** Project Member
**Goal:** Create a unit of engineering work.

**Preconditions**

- User is authenticated.
- User is a project member.
- Project is active.

**Main Flow**

1. User opens a project.
2. User selects "Create Issue".
3. User enters a title.
4. User optionally enters description.
5. User selects priority.
6. User optionally selects an assignee.
7. User optionally selects labels.
8. User optionally selects a due date.
9. User submits the issue.
10. System validates the input.
11. System validates the assignee.
12. System creates the issue.
13. System generates a unique issue identifier.
14. System records an activity.
15. System displays the created issue.

**Alternative Flows**

_A1 — Invalid assignee_
The system rejects the request if the assignee is not a member of the project.

_A2 — Missing title_
The system rejects the request and displays a validation error.

**Postconditions**

- Issue exists.
- Issue belongs to the project.
- Issue has an initial workflow status.
- Issue creation is recorded in activity history.

### UC-ISSUE-002 — View Issue

**Actor:** Project Member
**Goal:** View an issue and its related information.

**Main Flow**

1. User opens an issue.
2. System verifies project access.
3. System retrieves the issue.
4. System retrieves comments.
5. System retrieves activity.
6. System displays the issue.

### UC-ISSUE-003 — Update Issue

**Actor:** Project Member
**Goal:** Modify issue information.

**Main Flow**

1. User opens an issue.
2. User selects edit.
3. User changes one or more fields.
4. User submits changes.
5. System validates permissions.
6. System validates the new values.
7. System updates the issue.
8. System records relevant changes.
9. System displays the updated issue.

### UC-ISSUE-004 — Assign Issue

**Actor:** Project Member with appropriate permission
**Goal:** Assign an issue to a developer.

**Main Flow**

1. User opens an issue.
2. User selects an assignee.
3. System verifies that the assignee belongs to the project.
4. System updates the issue.
5. System records the assignment.
6. System creates a notification for the assignee.

**Error Cases**

- Assignee does not belong to the project.
- User does not have permission.
- Issue does not exist.

### UC-ISSUE-005 — Move Issue

**Actor:** Project Member
**Goal:** Move an issue through the project's workflow.

**Main Flow**

1. User opens the project board.
2. User selects an issue.
3. User moves the issue to another status.
4. System checks whether the transition is allowed.
5. System updates the issue status.
6. System records the status change.
7. System updates the project board.

**Alternative Flows**

_A1 — Invalid transition_

1. System detects that the transition is not allowed.
2. Status remains unchanged.
3. System informs the user.

### UC-ISSUE-006 — Search Issues

**Actor:** Project Member
**Goal:** Find issues quickly.

**Main Flow**

1. User enters a search term.
2. System searches issues accessible to the user.
3. System returns matching issues.

Search may match:

- Issue identifier
- Issue title

### UC-ISSUE-007 — Filter Issues

**Actor:** Project Member
**Goal:** Narrow the list of issues.

**Main Flow**

1. User opens the issue list.
2. User selects one or more filters.
3. System applies the filters.
4. System returns matching issues.

Available filters:

- Status
- Priority
- Assignee
- Label
- Sprint

## 6. Comments

### UC-COMMENT-001 — Add Comment

**Actor:** Project Member
**Goal:** Discuss an issue.

**Main Flow**

1. User opens an issue.
2. User enters comment text.
3. User submits the comment.
4. System validates access.
5. System creates the comment.
6. System records the activity.
7. System displays the comment.

### UC-COMMENT-002 — Edit Comment

**Actor:** Comment Author
**Goal:** Correct or update a comment.

**Main Flow**

1. User opens their comment.
2. User selects edit.
3. User changes the content.
4. User submits the changes.
5. System validates ownership.
6. System updates the comment.

**Error Cases**
A user cannot edit another user's comment unless they have an administrative permission allowing it.

### UC-COMMENT-003 — Delete Comment

**Actor:** Comment Author / Authorized Manager
**Goal:** Remove a comment.

**Main Flow**

1. User selects a comment.
2. User selects delete.
3. System verifies permission.
4. System deletes or deactivates the comment.
5. System updates the issue.

## 7. Sprint Management

### UC-SPRINT-001 — Create Sprint

**Actor:** Engineering Manager
**Goal:** Plan a period of development work.

**Main Flow**

1. Manager opens the project's sprint section.
2. Manager selects "Create Sprint".
3. Manager enters sprint name.
4. Manager enters start date.
5. Manager enters end date.
6. Manager submits the sprint.
7. System validates the dates.
8. System creates the sprint.

**Error Cases**

- End date is before start date.
- Project does not exist.
- User lacks permission.

### UC-SPRINT-002 — Add Issues to Sprint

**Actor:** Engineering Manager
**Goal:** Select issues for a sprint.

**Main Flow**

1. Manager opens a sprint.
2. Manager selects issues.
3. System verifies that the issues belong to the same project.
4. System adds the issues to the sprint.

**Alternative Flows**

_A1 — Issue belongs to another project_
The system rejects the operation.

_A2 — Issue already belongs to another active sprint_
The system rejects the operation according to the MVP sprint rules.

### UC-SPRINT-003 — Start Sprint

**Actor:** Engineering Manager
**Goal:** Begin active development for a sprint.

**Main Flow**

1. Manager opens a planned sprint.
2. Manager selects "Start Sprint".
3. System validates the sprint state.
4. System validates that another active sprint does not exist.
5. System starts the sprint.
6. System records the activity.
7. Team members can see the sprint as active.

**Error Cases**

- Sprint is already active.
- Sprint is completed.
- Another sprint is already active.

### UC-SPRINT-004 — Complete Sprint

**Actor:** Engineering Manager
**Goal:** Finish an active sprint.

**Main Flow**

1. Manager opens the active sprint.
2. Manager selects "Complete Sprint".
3. System calculates completed and incomplete issues.
4. System marks the sprint as completed.
5. System records the activity.
6. System displays the final sprint results.

**Postconditions**

- Sprint is completed.
- Incomplete issues remain available in the project.

### UC-SPRINT-005 — View Sprint Progress

**Actor:** Project Member
**Goal:** Understand the current sprint's progress.

**Main Flow**

1. User opens the active sprint.
2. System calculates sprint statistics.
3. System displays:
   - Total issues
   - Completed issues
   - Incomplete issues
   - Completion percentage

## 8. Dashboard

### UC-DASHBOARD-001 — View Project Dashboard

**Actor:** Project Member
**Goal:** Understand the current state of a project.

**Main Flow**

1. User opens a project.
2. User opens the dashboard.
3. System retrieves project statistics.
4. System retrieves current sprint information.
5. System retrieves recent activity.
6. System displays the project overview.

**Dashboard Information**

```text
Total Issues
Completed Issues
Open Issues
Issues by Status
Current Sprint
Sprint Progress
Recent Activity
```

## 9. Activity Tracking

### UC-ACTIVITY-001 — View Project Activity

**Actor:** Project Member
**Goal:** See important actions performed within a project.

**Main Flow**

1. User opens the project's activity section.
2. System retrieves activity records.
3. System displays them in chronological order.

Example:

```text
Ahmed created DEV-142
Ahmed assigned DEV-142 to Mohamed
Mohamed moved DEV-142 to IN_PROGRESS
Mohamed commented on DEV-142
Mohamed moved DEV-142 to CODE_REVIEW
```

## 10. Notifications

### UC-NOTIFICATION-001 — Receive Notification

**Actor:** User
**Goal:** Be informed about relevant project activity.

**Events**

A notification may be created when:

- An issue is assigned to the user.
- The user is mentioned.
- Relevant activity occurs on an issue.
- Other supported notification events occur.

### UC-NOTIFICATION-002 — View Notifications

**Actor:** Authenticated User
**Goal:** View notifications.

**Main Flow**

1. User opens notifications.
2. System retrieves the user's notifications.
3. System displays unread and read notifications.

### UC-NOTIFICATION-003 — Mark Notification as Read

**Actor:** Authenticated User
**Goal:** Mark a notification as handled.

**Main Flow**

1. User selects a notification.
2. System verifies ownership.
3. System marks the notification as read.
4. Notification state is updated.

## 11. Cross-Cutting Authorization Rules

Authorization must be checked for every protected operation.

The system must verify:

```text
Is the user authenticated?
        ↓
Does the user belong to the organization?
        ↓
Does the user belong to the project?
        ↓
Does the user's role allow the operation?
```

A user must never gain access to an organization or project resource simply by knowing its identifier.

For example:

```text
GET /projects/123
```

must not grant access to project `123` unless the authenticated user has permission to access that project.

## 12. Cross-Cutting Error Scenarios

All use cases must handle the following general conditions where applicable:

**Authentication failure**
The user is not authenticated.

**Authorization failure**
The user is authenticated but does not have permission.

**Resource not found**
The requested resource does not exist or is inaccessible.

**Validation failure**
Input does not satisfy the required rules.

**Business rule violation**
The requested operation conflicts with an application rule.

**Concurrent modification**
The resource was modified by another operation and the requested change can no longer be safely applied.

## 13. Core MVP User Journey

The primary DevFlow workflow connects the individual use cases:

```text
Register
   ↓
Create Organization
   ↓
Invite Team Members
   ↓
Create Project
   ↓
Add Project Members
   ↓
Create Sprint
   ↓
Create Issues
   ↓
Assign Issues
   ↓
Work on Issues
   ↓
Move Issues Through Workflow
   ↓
Comment / Collaborate
   ↓
Complete Sprint
   ↓
View Project Progress
```

This workflow represents the primary business value of the DevFlow MVP.

## 14. Use Case to Requirement Mapping

The following mapping connects the use cases to the functional requirements.

| Use Case            | Related Requirement(s)                    |
| ------------------- | ----------------------------------------- |
| UC-AUTH-001         | FR-AUTH-001                               |
| UC-AUTH-002         | FR-AUTH-002                               |
| UC-AUTH-003         | FR-AUTH-003                               |
| UC-AUTH-004         | FR-AUTH-004                               |
| UC-ORG-001          | FR-ORG-001                                |
| UC-ORG-002          | FR-ORG-003                                |
| UC-ORG-003          | FR-ORG-004                                |
| UC-ORG-004          | FR-ORG-005                                |
| UC-ORG-005          | FR-ORG-006                                |
| UC-PROJECT-001      | FR-PROJECT-001                            |
| UC-PROJECT-002      | FR-PROJECT-003                            |
| UC-PROJECT-003      | FR-PROJECT-004                            |
| UC-PROJECT-004      | FR-PROJECT-005                            |
| UC-PROJECT-005      | FR-PROJECT-006                            |
| UC-ISSUE-001        | FR-ISSUE-001                              |
| UC-ISSUE-002        | FR-ISSUE-002                              |
| UC-ISSUE-003        | FR-ISSUE-003                              |
| UC-ISSUE-004        | FR-ISSUE-005                              |
| UC-ISSUE-005        | FR-WORKFLOW-002                           |
| UC-ISSUE-006        | FR-ISSUE-010                              |
| UC-ISSUE-007        | FR-ISSUE-011                              |
| UC-COMMENT-001      | FR-COMMENT-001                            |
| UC-COMMENT-002      | FR-COMMENT-002                            |
| UC-COMMENT-003      | FR-COMMENT-003                            |
| UC-SPRINT-001       | FR-SPRINT-001                             |
| UC-SPRINT-002       | FR-SPRINT-002                             |
| UC-SPRINT-003       | FR-SPRINT-003                             |
| UC-SPRINT-004       | FR-SPRINT-004                             |
| UC-SPRINT-005       | FR-SPRINT-005                             |
| UC-DASHBOARD-001    | FR-DASHBOARD-001 / FR-DASHBOARD-002       |
| UC-ACTIVITY-001     | Activity Tracking                         |
| UC-NOTIFICATION-001 | FR-NOTIFICATION-001 / FR-NOTIFICATION-002 |
| UC-NOTIFICATION-002 | FR-NOTIFICATION-003                       |
| UC-NOTIFICATION-003 | FR-NOTIFICATION-004                       |

## 15. Next Design Artifact

After completing the use cases, the next artifact is the Domain Model.

The domain model will identify the core entities and relationships discovered from these requirements.

The initial domain is expected to contain concepts such as:

```text
User
Organization
OrganizationMember
Invitation

Project
ProjectMember

Issue
IssueLabel
Label
Comment

Workflow
WorkflowStatus

Sprint
SprintIssue

Notification
Activity
```

The domain model should be created before designing the PostgreSQL schema or API.
