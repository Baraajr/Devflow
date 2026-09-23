/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';

import { createTestApp } from '../helpers/create-test-app';
import { cleanDatabase } from '../helpers/clean-database';
import { createAuthenticatedAgent } from '../helpers/helpers';

import { OrganizationMember } from '../../src/organization/entities/organization-members.entity';
import { OrganizationRole } from '../../src/organization/enums/organization-role.enum';
import { ProjectRole } from '../../src/projects/enums/project-role.enum';

describe('Project Integration', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  const API_PREFIX = '/api/v1';
  const ORGANIZATION_URL = `${API_PREFIX}/organization`;
  const ORGANIZATIONS_URL = `${API_PREFIX}/organizations`;
  const PROJECTS_URL = `${API_PREFIX}/projects`;
  const AUTH_ME_URL = `${API_PREFIX}/auth/me`;

  const INVALID_UUID = '00000000-0000-0000-0000-000000000000';

  type TestAgent = ReturnType<typeof request.agent>;

  const owner = {
    email: 'project-owner@example.com',
    firstName: 'Project',
    lastName: 'Owner',
    password: 'Password123',
    passwordConfirm: 'Password123',
  };

  const manager = {
    email: 'project-manager@example.com',
    firstName: 'Project',
    lastName: 'Manager',
    password: 'Password123',
    passwordConfirm: 'Password123',
  };

  const member = {
    email: 'project-member@example.com',
    firstName: 'Project',
    lastName: 'Member',
    password: 'Password123',
    passwordConfirm: 'Password123',
  };

  const outsider = {
    email: 'project-outsider@example.com',
    firstName: 'Project',
    lastName: 'Outsider',
    password: 'Password123',
    passwordConfirm: 'Password123',
  };

  const organization = {
    name: 'Project Test Organization',
    description: 'Organization used by project integration tests',
  };

  const project = {
    name: 'Test Project',
    key: 'TEST',
    description: 'Test project description',
  };

  beforeAll(async () => {
    app = await createTestApp();
    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await cleanDatabase(dataSource);
  });

  // ---------------------------------------------------------------------------
  // Test helpers
  // ---------------------------------------------------------------------------

  const createTestUser = async (
    credentials: typeof owner,
  ): Promise<{
    agent: TestAgent;
    userId: string;
  }> => {
    const agent = await createAuthenticatedAgent(app, credentials);
    const response = await agent.get(AUTH_ME_URL).expect(200);

    return {
      agent,
      userId: response.body.id,
    };
  };

  const createTestOrganization = async (): Promise<{
    agent: TestAgent;
    organizationId: string;
    userId: string;
  }> => {
    const { agent, userId } = await createTestUser(owner);

    const response = await agent
      .post(ORGANIZATION_URL)
      .send(organization)
      .expect(201);

    return {
      agent,
      organizationId: response.body.id,
      userId,
    };
  };

  const addUserToOrganization = async (
    organizationId: string,
    userId: string,
    role: OrganizationRole = OrganizationRole.DEVELOPER,
  ): Promise<void> => {
    const repository = dataSource.getRepository(OrganizationMember);

    await repository.save(
      repository.create({
        organizationId,
        userId,
        role,
      }),
    );
  };

  const createOrganizationUser = async (
    credentials: typeof owner,
    organizationId: string,
    role: OrganizationRole = OrganizationRole.DEVELOPER,
  ): Promise<{
    agent: TestAgent;
    userId: string;
  }> => {
    const result = await createTestUser(credentials);

    await addUserToOrganization(organizationId, result.userId, role);

    return result;
  };

  const createTestProject = async (
    agent: TestAgent,
    organizationId: string,
    data = project,
  ) => {
    return agent
      .post(`${ORGANIZATIONS_URL}/${organizationId}/projects`)
      .send(data)
      .expect(201);
  };

  const addProjectMember = async (
    agent: TestAgent,
    projectId: string,
    userId: string,
    role: ProjectRole = ProjectRole.DEVELOPER,
  ) => {
    return agent
      .post(`${PROJECTS_URL}/${projectId}/members`)
      .send({
        userId,
        role,
      })
      .expect(201);
  };

  // ---------------------------------------------------------------------------
  // Create
  // ---------------------------------------------------------------------------

  describe('POST /organizations/:organizationId/projects', () => {
    it('should create a project successfully', async () => {
      const { agent, organizationId } = await createTestOrganization();

      const response = await createTestProject(agent, organizationId);

      expect(response.body).toMatchObject({
        organizationId,
        name: project.name,
        key: project.key,
        description: project.description,
      });

      expect(response.body.id).toBeDefined();
      expect(response.body.slug).toBeDefined();
      expect(response.body.createdAt).toBeDefined();
      expect(response.body.updatedAt).toBeDefined();
    });

    it('should trim project fields and normalize the key', async () => {
      const { agent, organizationId } = await createTestOrganization();

      const response = await createTestProject(agent, organizationId, {
        name: '  Test Project  ',
        key: ' test ',
        description: '  Test project description  ',
      });

      expect(response.body).toMatchObject({
        name: 'Test Project',
        key: 'TEST',
        description: 'Test project description',
        slug: 'test-project',
      });
    });

    it('should create the authenticated user as a project admin', async () => {
      const { agent, organizationId, userId } = await createTestOrganization();

      const projectResponse = await createTestProject(agent, organizationId);

      const membersResponse = await agent
        .get(`${PROJECTS_URL}/${projectResponse.body.id}/members`)
        .expect(200);

      expect(membersResponse.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            userId,
            role: ProjectRole.ADMIN,
          }),
        ]),
      );
    });

    it('should allow an organization manager to create a project', async () => {
      const { organizationId } = await createTestOrganization();

      const { agent: managerAgent } = await createOrganizationUser(
        manager,
        organizationId,
        OrganizationRole.MANAGER,
      );

      const response = await createTestProject(managerAgent, organizationId);

      expect(response.body).toMatchObject({
        organizationId,
        name: project.name,
        key: project.key,
      });
    });

    it('should reject a non-management organization member', async () => {
      const { organizationId } = await createTestOrganization();

      const { agent: memberAgent } = await createOrganizationUser(
        member,
        organizationId,
        OrganizationRole.DEVELOPER,
      );

      await memberAgent
        .post(`${ORGANIZATIONS_URL}/${organizationId}/projects`)
        .send(project)
        .expect(403);
    });

    it('should reject a user who is not an organization member', async () => {
      const { organizationId } = await createTestOrganization();
      const { agent: outsiderAgent } = await createTestUser(outsider);

      await outsiderAgent
        .post(`${ORGANIZATIONS_URL}/${organizationId}/projects`)
        .send(project)
        .expect(403);
    });

    it('should reject an unauthenticated request', async () => {
      const { organizationId } = await createTestOrganization();

      await request(app.getHttpServer())
        .post(`${ORGANIZATIONS_URL}/${organizationId}/projects`)
        .send(project)
        .expect(401);
    });

    it('should reject an empty request body', async () => {
      const { agent, organizationId } = await createTestOrganization();

      await agent
        .post(`${ORGANIZATIONS_URL}/${organizationId}/projects`)
        .send({})
        .expect(400);
    });

    it('should reject an invalid project name', async () => {
      const { agent, organizationId } = await createTestOrganization();

      await agent
        .post(`${ORGANIZATIONS_URL}/${organizationId}/projects`)
        .send({
          ...project,
          name: 'a',
        })
        .expect(400);
    });

    it('should reject a project name that exceeds the maximum length', async () => {
      const { agent, organizationId } = await createTestOrganization();

      await agent
        .post(`${ORGANIZATIONS_URL}/${organizationId}/projects`)
        .send({
          ...project,
          name: 'a'.repeat(151),
        })
        .expect(400);
    });

    it('should reject an invalid project key', async () => {
      const { agent, organizationId } = await createTestOrganization();

      await agent
        .post(`${ORGANIZATIONS_URL}/${organizationId}/projects`)
        .send({
          ...project,
          key: 'a',
        })
        .expect(400);
    });

    it('should reject duplicate project keys in the same organization', async () => {
      const { agent, organizationId } = await createTestOrganization();

      await createTestProject(agent, organizationId);

      await agent
        .post(`${ORGANIZATIONS_URL}/${organizationId}/projects`)
        .send({
          ...project,
          name: 'Another Project',
        })
        .expect(409);
    });

    it('should reject duplicate project names in the same organization', async () => {
      const { agent, organizationId } = await createTestOrganization();

      await createTestProject(agent, organizationId);

      await agent
        .post(`${ORGANIZATIONS_URL}/${organizationId}/projects`)
        .send({
          ...project,
          key: 'ANOTHER',
        })
        .expect(409);
    });

    it('should allow the same project key in different organizations', async () => {
      const firstOrganization = await createTestOrganization();

      await createTestProject(
        firstOrganization.agent,
        firstOrganization.organizationId,
      );

      await cleanDatabase(dataSource);

      const secondOrganization = await createTestOrganization();

      const response = await createTestProject(
        secondOrganization.agent,
        secondOrganization.organizationId,
      );

      expect(response.body.key).toBe(project.key);
    });
  });

  // ---------------------------------------------------------------------------
  // Find all
  // ---------------------------------------------------------------------------

  describe('GET /organizations/:organizationId/projects', () => {
    it('should return the organization projects for an owner', async () => {
      const { agent, organizationId } = await createTestOrganization();

      await createTestProject(agent, organizationId);

      const response = await agent
        .get(`${ORGANIZATIONS_URL}/${organizationId}/projects`)
        .expect(200);

      expect(response.body).toMatchObject({
        data: expect.arrayContaining([
          expect.objectContaining({
            name: project.name,
            key: project.key,
          }),
        ]),
        total: 1,
        page: 1,
        limit: 20,
      });
    });

    it('should return all projects for an organization manager', async () => {
      const { agent: ownerAgent, organizationId } =
        await createTestOrganization();

      const { agent: managerAgent } = await createOrganizationUser(
        manager,
        organizationId,
        OrganizationRole.MANAGER,
      );

      await createTestProject(ownerAgent, organizationId, {
        ...project,
        name: 'Project One',
        key: 'ONE',
      });

      await createTestProject(ownerAgent, organizationId, {
        ...project,
        name: 'Project Two',
        key: 'TWO',
      });

      const response = await managerAgent
        .get(`${ORGANIZATIONS_URL}/${organizationId}/projects`)
        .expect(200);

      expect(response.body.total).toBe(2);
      expect(response.body.data).toHaveLength(2);
    });

    it('should return only projects explicitly assigned to a regular member', async () => {
      const { agent: ownerAgent, organizationId } =
        await createTestOrganization();

      const { agent: memberAgent, userId: memberUserId } =
        await createOrganizationUser(
          member,
          organizationId,
          OrganizationRole.DEVELOPER,
        );

      const firstProject = await createTestProject(ownerAgent, organizationId, {
        ...project,
        name: 'Project One',
        key: 'ONE',
      });

      await createTestProject(ownerAgent, organizationId, {
        ...project,
        name: 'Project Two',
        key: 'TWO',
      });

      await addProjectMember(ownerAgent, firstProject.body.id, memberUserId);

      const response = await memberAgent
        .get(`${ORGANIZATIONS_URL}/${organizationId}/projects`)
        .expect(200);

      expect(response.body.total).toBe(1);
      expect(response.body.data).toEqual([
        expect.objectContaining({
          id: firstProject.body.id,
          key: 'ONE',
        }),
      ]);
    });

    it('should return an empty list for a regular member with no project assignments', async () => {
      const { agent: ownerAgent, organizationId } =
        await createTestOrganization();

      const { agent: memberAgent } = await createOrganizationUser(
        member,
        organizationId,
        OrganizationRole.DEVELOPER,
      );

      await createTestProject(ownerAgent, organizationId);

      const response = await memberAgent
        .get(`${ORGANIZATIONS_URL}/${organizationId}/projects`)
        .expect(200);

      expect(response.body).toMatchObject({
        data: [],
        total: 0,
        page: 1,
        limit: 20,
      });
    });

    it('should reject an unauthenticated request', async () => {
      const { organizationId } = await createTestOrganization();

      await request(app.getHttpServer())
        .get(`${ORGANIZATIONS_URL}/${organizationId}/projects`)
        .expect(401);
    });

    it('should reject a user who is not an organization member', async () => {
      const { organizationId } = await createTestOrganization();
      const { agent: outsiderAgent } = await createTestUser(outsider);

      await outsiderAgent
        .get(`${ORGANIZATIONS_URL}/${organizationId}/projects`)
        .expect(403);
    });
  });

  // ---------------------------------------------------------------------------
  // Find one
  // ---------------------------------------------------------------------------

  describe('GET /projects/:projectId', () => {
    it('should return a project for its organization owner', async () => {
      const { agent, organizationId } = await createTestOrganization();

      const projectResponse = await createTestProject(agent, organizationId);

      const response = await agent
        .get(`${PROJECTS_URL}/${projectResponse.body.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: projectResponse.body.id,
        organizationId,
        name: project.name,
        key: project.key,
      });
    });

    it('should return a project for an organization manager', async () => {
      const { agent: ownerAgent, organizationId } =
        await createTestOrganization();

      const { agent: managerAgent } = await createOrganizationUser(
        manager,
        organizationId,
        OrganizationRole.MANAGER,
      );

      const projectResponse = await createTestProject(
        ownerAgent,
        organizationId,
      );

      const response = await managerAgent
        .get(`${PROJECTS_URL}/${projectResponse.body.id}`)
        .expect(200);

      expect(response.body.id).toBe(projectResponse.body.id);
    });

    it('should return a project for a project member', async () => {
      const { agent: ownerAgent, organizationId } =
        await createTestOrganization();

      const { agent: memberAgent, userId: memberUserId } =
        await createOrganizationUser(
          member,
          organizationId,
          OrganizationRole.DEVELOPER,
        );

      const projectResponse = await createTestProject(
        ownerAgent,
        organizationId,
      );

      await addProjectMember(ownerAgent, projectResponse.body.id, memberUserId);

      const response = await memberAgent
        .get(`${PROJECTS_URL}/${projectResponse.body.id}`)
        .expect(200);

      expect(response.body.id).toBe(projectResponse.body.id);
    });

    it('should reject an organization member who is not assigned to the project', async () => {
      const { agent: ownerAgent, organizationId } =
        await createTestOrganization();

      const { agent: memberAgent } = await createOrganizationUser(
        member,
        organizationId,
        OrganizationRole.DEVELOPER,
      );

      const projectResponse = await createTestProject(
        ownerAgent,
        organizationId,
      );

      await memberAgent
        .get(`${PROJECTS_URL}/${projectResponse.body.id}`)
        .expect(404);
    });

    it('should reject a user outside the organization', async () => {
      const { agent: ownerAgent, organizationId } =
        await createTestOrganization();

      const { agent: outsiderAgent } = await createTestUser(outsider);

      const projectResponse = await createTestProject(
        ownerAgent,
        organizationId,
      );

      await outsiderAgent
        .get(`${PROJECTS_URL}/${projectResponse.body.id}`)
        .expect(404);
    });

    it('should return 404 for a non-existent project', async () => {
      const { agent } = await createTestOrganization();

      await agent.get(`${PROJECTS_URL}/${INVALID_UUID}`).expect(404);
    });

    it('should reject an unauthenticated request', async () => {
      await request(app.getHttpServer())
        .get(`${PROJECTS_URL}/${INVALID_UUID}`)
        .expect(401);
    });
  });

  // ---------------------------------------------------------------------------
  // Update
  // ---------------------------------------------------------------------------

  describe('PATCH /projects/:projectId', () => {
    it('should update a project successfully', async () => {
      const { agent, organizationId } = await createTestOrganization();

      const projectResponse = await createTestProject(agent, organizationId);

      const response = await agent
        .patch(`${PROJECTS_URL}/${projectResponse.body.id}`)
        .send({
          name: 'Updated Project',
          description: 'Updated description',
        })
        .expect(200);

      expect(response.body).toMatchObject({
        id: projectResponse.body.id,
        name: 'Updated Project',
        description: 'Updated description',
        slug: 'updated-project',
      });
    });

    it('should allow an organization manager to update a project', async () => {
      const { agent: ownerAgent, organizationId } =
        await createTestOrganization();

      const { agent: managerAgent } = await createOrganizationUser(
        manager,
        organizationId,
        OrganizationRole.MANAGER,
      );

      const projectResponse = await createTestProject(
        ownerAgent,
        organizationId,
      );

      const response = await managerAgent
        .patch(`${PROJECTS_URL}/${projectResponse.body.id}`)
        .send({
          name: 'Manager Updated Project',
        })
        .expect(200);

      expect(response.body.name).toBe('Manager Updated Project');
    });

    it('should allow a project admin to update the project', async () => {
      const { agent: ownerAgent, organizationId } =
        await createTestOrganization();

      const { agent: adminAgent, userId: adminUserId } =
        await createOrganizationUser(
          manager,
          organizationId,
          OrganizationRole.DEVELOPER,
        );

      const projectResponse = await createTestProject(
        ownerAgent,
        organizationId,
      );

      await addProjectMember(
        ownerAgent,
        projectResponse.body.id,
        adminUserId,
        ProjectRole.ADMIN,
      );

      await adminAgent
        .patch(`${PROJECTS_URL}/${projectResponse.body.id}`)
        .send({
          name: 'Admin Updated Project',
        })
        .expect(200);
    });

    it('should reject an unauthorized project member from updating', async () => {
      const { agent: ownerAgent, organizationId } =
        await createTestOrganization();

      const { agent: memberAgent, userId: memberUserId } =
        await createOrganizationUser(
          member,
          organizationId,
          OrganizationRole.DEVELOPER,
        );

      const projectResponse = await createTestProject(
        ownerAgent,
        organizationId,
      );

      await addProjectMember(ownerAgent, projectResponse.body.id, memberUserId);

      await memberAgent
        .patch(`${PROJECTS_URL}/${projectResponse.body.id}`)
        .send({
          name: 'Unauthorized Update',
        })
        .expect(403);
    });

    it('should reject an invalid update', async () => {
      const { agent, organizationId } = await createTestOrganization();

      const projectResponse = await createTestProject(agent, organizationId);

      await agent
        .patch(`${PROJECTS_URL}/${projectResponse.body.id}`)
        .send({
          name: 'a',
        })
        .expect(400);
    });

    it('should reject a duplicate project key during update', async () => {
      const { agent, organizationId } = await createTestOrganization();

      await createTestProject(agent, organizationId, {
        ...project,
        name: 'Project One',
        key: 'ONE',
      });

      const secondProject = await createTestProject(agent, organizationId, {
        ...project,
        name: 'Project Two',
        key: 'TWO',
      });

      await agent
        .patch(`${PROJECTS_URL}/${secondProject.body.id}`)
        .send({
          key: 'ONE',
        })
        .expect(409);
    });

    it('should reject an unauthenticated request', async () => {
      await request(app.getHttpServer())
        .patch(`${PROJECTS_URL}/${INVALID_UUID}`)
        .send({
          name: 'Updated Project',
        })
        .expect(401);
    });
  });

  // ---------------------------------------------------------------------------
  // Delete project
  // ---------------------------------------------------------------------------

  describe('DELETE /projects/:projectId', () => {
    it('should delete a project successfully', async () => {
      const { agent, organizationId } = await createTestOrganization();

      const projectResponse = await createTestProject(agent, organizationId);

      await agent
        .delete(`${PROJECTS_URL}/${projectResponse.body.id}`)
        .expect(204);

      await agent.get(`${PROJECTS_URL}/${projectResponse.body.id}`).expect(404);
    });

    it('should allow an organization manager to delete a project', async () => {
      const { agent: ownerAgent, organizationId } =
        await createTestOrganization();

      const { agent: managerAgent } = await createOrganizationUser(
        manager,
        organizationId,
        OrganizationRole.MANAGER,
      );

      const projectResponse = await createTestProject(
        ownerAgent,
        organizationId,
      );

      await managerAgent
        .delete(`${PROJECTS_URL}/${projectResponse.body.id}`)
        .expect(204);
    });

    it('should allow a project admin to delete the project', async () => {
      const { agent: ownerAgent, organizationId } =
        await createTestOrganization();

      const { agent: adminAgent, userId: adminUserId } =
        await createOrganizationUser(
          manager,
          organizationId,
          OrganizationRole.DEVELOPER,
        );

      const projectResponse = await createTestProject(
        ownerAgent,
        organizationId,
      );

      await addProjectMember(
        ownerAgent,
        projectResponse.body.id,
        adminUserId,
        ProjectRole.ADMIN,
      );

      await adminAgent
        .delete(`${PROJECTS_URL}/${projectResponse.body.id}`)
        .expect(204);
    });

    it('should reject a non-admin project member', async () => {
      const { agent: ownerAgent, organizationId } =
        await createTestOrganization();

      const { agent: memberAgent, userId: memberUserId } =
        await createOrganizationUser(
          member,
          organizationId,
          OrganizationRole.DEVELOPER,
        );

      const projectResponse = await createTestProject(
        ownerAgent,
        organizationId,
      );

      await addProjectMember(ownerAgent, projectResponse.body.id, memberUserId);

      await memberAgent
        .delete(`${PROJECTS_URL}/${projectResponse.body.id}`)
        .expect(403);
    });

    it('should reject an unauthenticated request', async () => {
      await request(app.getHttpServer())
        .delete(`${PROJECTS_URL}/${INVALID_UUID}`)
        .expect(401);
    });
  });

  // ---------------------------------------------------------------------------
  // Get members
  // ---------------------------------------------------------------------------

  describe('GET /projects/:projectId/members', () => {
    it('should return project members', async () => {
      const { agent, organizationId, userId } = await createTestOrganization();

      const projectResponse = await createTestProject(agent, organizationId);

      const response = await agent
        .get(`${PROJECTS_URL}/${projectResponse.body.id}/members`)
        .expect(200);

      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            userId,
            role: ProjectRole.ADMIN,
          }),
        ]),
      );
    });

    it('should allow an organization manager to view project members', async () => {
      const { agent: ownerAgent, organizationId } =
        await createTestOrganization();

      const { agent: managerAgent } = await createOrganizationUser(
        manager,
        organizationId,
        OrganizationRole.MANAGER,
      );

      const projectResponse = await createTestProject(
        ownerAgent,
        organizationId,
      );

      const response = await managerAgent
        .get(`${PROJECTS_URL}/${projectResponse.body.id}/members`)
        .expect(200);

      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            role: ProjectRole.ADMIN,
          }),
        ]),
      );
    });

    it('should allow a project member to view members', async () => {
      const { agent: ownerAgent, organizationId } =
        await createTestOrganization();

      const { agent: memberAgent, userId: memberUserId } =
        await createOrganizationUser(
          member,
          organizationId,
          OrganizationRole.DEVELOPER,
        );

      const projectResponse = await createTestProject(
        ownerAgent,
        organizationId,
      );

      await addProjectMember(ownerAgent, projectResponse.body.id, memberUserId);

      const response = await memberAgent
        .get(`${PROJECTS_URL}/${projectResponse.body.id}/members`)
        .expect(200);

      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            userId: memberUserId,
            role: ProjectRole.DEVELOPER,
          }),
        ]),
      );
    });

    it('should reject an organization member who is not assigned to the project', async () => {
      const { agent: ownerAgent, organizationId } =
        await createTestOrganization();

      const { agent: memberAgent } = await createOrganizationUser(
        member,
        organizationId,
        OrganizationRole.DEVELOPER,
      );

      const projectResponse = await createTestProject(
        ownerAgent,
        organizationId,
      );

      await memberAgent
        .get(`${PROJECTS_URL}/${projectResponse.body.id}/members`)
        .expect(404);
    });

    it('should reject an unauthorized user', async () => {
      const { agent: ownerAgent, organizationId } =
        await createTestOrganization();

      const { agent: outsiderAgent } = await createTestUser(outsider);

      const projectResponse = await createTestProject(
        ownerAgent,
        organizationId,
      );

      await outsiderAgent
        .get(`${PROJECTS_URL}/${projectResponse.body.id}/members`)
        .expect(404);
    });

    it('should reject an unauthenticated request', async () => {
      await request(app.getHttpServer())
        .get(`${PROJECTS_URL}/${INVALID_UUID}/members`)
        .expect(401);
    });
  });

  // ---------------------------------------------------------------------------
  // Add member
  // ---------------------------------------------------------------------------

  describe('POST /projects/:projectId/members', () => {
    it('should add an organization member to the project', async () => {
      const { agent: ownerAgent, organizationId } =
        await createTestOrganization();

      const { userId: memberUserId } = await createOrganizationUser(
        member,
        organizationId,
        OrganizationRole.DEVELOPER,
      );

      const projectResponse = await createTestProject(
        ownerAgent,
        organizationId,
      );

      const response = await addProjectMember(
        ownerAgent,
        projectResponse.body.id,
        memberUserId,
      );

      expect(response.body).toMatchObject({
        projectId: projectResponse.body.id,
        userId: memberUserId,
        organizationId,
        role: ProjectRole.DEVELOPER,
      });
    });

    it('should allow a project admin to add members', async () => {
      const { agent: ownerAgent, organizationId } =
        await createTestOrganization();

      const { agent: adminAgent, userId: adminUserId } =
        await createOrganizationUser(
          manager,
          organizationId,
          OrganizationRole.DEVELOPER,
        );

      const { userId: memberUserId } = await createOrganizationUser(
        member,
        organizationId,
        OrganizationRole.DEVELOPER,
      );

      const projectResponse = await createTestProject(
        ownerAgent,
        organizationId,
      );

      await addProjectMember(
        ownerAgent,
        projectResponse.body.id,
        adminUserId,
        ProjectRole.ADMIN,
      );

      await addProjectMember(adminAgent, projectResponse.body.id, memberUserId);
    });

    it('should reject a user who is not an organization member', async () => {
      const { agent: ownerAgent, organizationId } =
        await createTestOrganization();

      const { userId: outsiderUserId } = await createTestUser(outsider);

      const projectResponse = await createTestProject(
        ownerAgent,
        organizationId,
      );

      await ownerAgent
        .post(`${PROJECTS_URL}/${projectResponse.body.id}/members`)
        .send({
          userId: outsiderUserId,
          role: ProjectRole.DEVELOPER,
        })
        .expect(400);
    });

    it('should reject adding the same project member twice', async () => {
      const { agent: ownerAgent, organizationId } =
        await createTestOrganization();

      const { userId: memberUserId } = await createOrganizationUser(
        member,
        organizationId,
        OrganizationRole.DEVELOPER,
      );

      const projectResponse = await createTestProject(
        ownerAgent,
        organizationId,
      );

      const payload = {
        userId: memberUserId,
        role: ProjectRole.DEVELOPER,
      };

      await ownerAgent
        .post(`${PROJECTS_URL}/${projectResponse.body.id}/members`)
        .send(payload)
        .expect(201);

      await ownerAgent
        .post(`${PROJECTS_URL}/${projectResponse.body.id}/members`)
        .send(payload)
        .expect(409);
    });

    it('should reject a non-admin project member from adding members', async () => {
      const { agent: ownerAgent, organizationId } =
        await createTestOrganization();

      const { agent: memberAgent, userId: memberUserId } =
        await createOrganizationUser(
          member,
          organizationId,
          OrganizationRole.DEVELOPER,
        );

      const { userId: ownerUserId } = await ownerAgent
        .get(AUTH_ME_URL)
        .expect(200)
        .then((response) => ({
          userId: response.body.id,
        }));

      const projectResponse = await createTestProject(
        ownerAgent,
        organizationId,
      );

      await addProjectMember(ownerAgent, projectResponse.body.id, memberUserId);

      await memberAgent
        .post(`${PROJECTS_URL}/${projectResponse.body.id}/members`)
        .send({
          userId: ownerUserId,
          role: ProjectRole.VIEWER,
        })
        .expect(403);
    });

    it('should reject an unauthenticated request', async () => {
      await request(app.getHttpServer())
        .post(`${PROJECTS_URL}/${INVALID_UUID}/members`)
        .send({
          userId: INVALID_UUID,
          role: ProjectRole.DEVELOPER,
        })
        .expect(401);
    });
  });

  // ---------------------------------------------------------------------------
  // Update member role
  // ---------------------------------------------------------------------------

  describe('PATCH /projects/:projectId/members/:memberUserId', () => {
    it('should update a project member role', async () => {
      const { agent: ownerAgent, organizationId } =
        await createTestOrganization();

      const { userId: memberUserId } = await createOrganizationUser(
        member,
        organizationId,
        OrganizationRole.DEVELOPER,
      );

      const projectResponse = await createTestProject(
        ownerAgent,
        organizationId,
      );

      await addProjectMember(
        ownerAgent,
        projectResponse.body.id,
        memberUserId,
        ProjectRole.DEVELOPER,
      );

      const response = await ownerAgent
        .patch(
          `${PROJECTS_URL}/${projectResponse.body.id}/members/${memberUserId}`,
        )
        .send({
          role: ProjectRole.VIEWER,
        })
        .expect(200);

      expect(response.body).toMatchObject({
        projectId: projectResponse.body.id,
        userId: memberUserId,
        role: ProjectRole.VIEWER,
      });
    });

    it('should allow an organization manager to update member roles', async () => {
      const { agent: ownerAgent, organizationId } =
        await createTestOrganization();

      const { agent: managerAgent } = await createOrganizationUser(
        manager,
        organizationId,
        OrganizationRole.MANAGER,
      );

      const { userId: memberUserId } = await createOrganizationUser(
        member,
        organizationId,
        OrganizationRole.DEVELOPER,
      );

      const projectResponse = await createTestProject(
        ownerAgent,
        organizationId,
      );

      await addProjectMember(
        ownerAgent,
        projectResponse.body.id,
        memberUserId,
        ProjectRole.DEVELOPER,
      );

      const response = await managerAgent
        .patch(
          `${PROJECTS_URL}/${projectResponse.body.id}/members/${memberUserId}`,
        )
        .send({
          role: ProjectRole.VIEWER,
        })
        .expect(200);

      expect(response.body.role).toBe(ProjectRole.VIEWER);
    });

    it('should reject updating a non-existent project member', async () => {
      const { agent, organizationId } = await createTestOrganization();

      const projectResponse = await createTestProject(agent, organizationId);

      await agent
        .patch(
          `${PROJECTS_URL}/${projectResponse.body.id}/members/${INVALID_UUID}`,
        )
        .send({
          role: ProjectRole.VIEWER,
        })
        .expect(404);
    });

    it('should reject a non-admin project member from changing roles', async () => {
      const { agent: ownerAgent, organizationId } =
        await createTestOrganization();

      const { agent: memberAgent, userId: memberUserId } =
        await createOrganizationUser(
          member,
          organizationId,
          OrganizationRole.DEVELOPER,
        );

      const { userId: ownerUserId } = await ownerAgent
        .get(AUTH_ME_URL)
        .expect(200)
        .then((response) => ({
          userId: response.body.id,
        }));

      const projectResponse = await createTestProject(
        ownerAgent,
        organizationId,
      );

      await addProjectMember(ownerAgent, projectResponse.body.id, memberUserId);

      await memberAgent
        .patch(
          `${PROJECTS_URL}/${projectResponse.body.id}/members/${ownerUserId}`,
        )
        .send({
          role: ProjectRole.VIEWER,
        })
        .expect(403);
    });

    it('should reject demoting the last project admin', async () => {
      const { agent, organizationId, userId } = await createTestOrganization();

      const projectResponse = await createTestProject(agent, organizationId);

      await agent
        .patch(`${PROJECTS_URL}/${projectResponse.body.id}/members/${userId}`)
        .send({
          role: ProjectRole.VIEWER,
        })
        .expect(400);
    });

    it('should allow demoting an admin when another admin exists', async () => {
      const {
        agent: ownerAgent,
        organizationId,
        userId: ownerUserId,
      } = await createTestOrganization();

      const { userId: secondAdminUserId } = await createOrganizationUser(
        manager,
        organizationId,
        OrganizationRole.DEVELOPER,
      );

      const projectResponse = await createTestProject(
        ownerAgent,
        organizationId,
      );

      await addProjectMember(
        ownerAgent,
        projectResponse.body.id,
        secondAdminUserId,
        ProjectRole.ADMIN,
      );

      const response = await ownerAgent
        .patch(
          `${PROJECTS_URL}/${projectResponse.body.id}/members/${ownerUserId}`,
        )
        .send({
          role: ProjectRole.VIEWER,
        })
        .expect(200);

      expect(response.body).toMatchObject({
        userId: ownerUserId,
        role: ProjectRole.VIEWER,
      });
    });

    it('should reject an unauthenticated request', async () => {
      await request(app.getHttpServer())
        .patch(`${PROJECTS_URL}/${INVALID_UUID}/members/${INVALID_UUID}`)
        .send({
          role: ProjectRole.VIEWER,
        })
        .expect(401);
    });
  });

  // ---------------------------------------------------------------------------
  // Remove member
  // ---------------------------------------------------------------------------

  describe('DELETE /projects/:projectId/members/:memberUserId', () => {
    it('should remove a project member', async () => {
      const { agent: ownerAgent, organizationId } =
        await createTestOrganization();

      const { userId: memberUserId } = await createOrganizationUser(
        member,
        organizationId,
        OrganizationRole.DEVELOPER,
      );

      const projectResponse = await createTestProject(
        ownerAgent,
        organizationId,
      );

      await addProjectMember(ownerAgent, projectResponse.body.id, memberUserId);

      await ownerAgent
        .delete(
          `${PROJECTS_URL}/${projectResponse.body.id}/members/${memberUserId}`,
        )
        .expect(204);

      const response = await ownerAgent
        .get(`${PROJECTS_URL}/${projectResponse.body.id}/members`)
        .expect(200);

      expect(
        response.body.some(
          (item: { userId: string }) => item.userId === memberUserId,
        ),
      ).toBe(false);
    });

    it('should allow a project admin to remove members', async () => {
      const { agent: ownerAgent, organizationId } =
        await createTestOrganization();

      const { agent: adminAgent, userId: adminUserId } =
        await createOrganizationUser(
          manager,
          organizationId,
          OrganizationRole.DEVELOPER,
        );

      const { userId: memberUserId } = await createOrganizationUser(
        member,
        organizationId,
        OrganizationRole.DEVELOPER,
      );

      const projectResponse = await createTestProject(
        ownerAgent,
        organizationId,
      );

      await addProjectMember(
        ownerAgent,
        projectResponse.body.id,
        adminUserId,
        ProjectRole.ADMIN,
      );

      await addProjectMember(ownerAgent, projectResponse.body.id, memberUserId);

      await adminAgent
        .delete(
          `${PROJECTS_URL}/${projectResponse.body.id}/members/${memberUserId}`,
        )
        .expect(204);
    });

    it('should reject removing the last project admin', async () => {
      const { agent, organizationId, userId } = await createTestOrganization();

      const projectResponse = await createTestProject(agent, organizationId);

      await agent
        .delete(`${PROJECTS_URL}/${projectResponse.body.id}/members/${userId}`)
        .expect(400);
    });

    it('should allow removing an admin when another admin exists', async () => {
      const {
        agent: ownerAgent,
        organizationId,
        userId: ownerUserId,
      } = await createTestOrganization();

      const { userId: secondAdminUserId } = await createOrganizationUser(
        manager,
        organizationId,
        OrganizationRole.DEVELOPER,
      );

      const projectResponse = await createTestProject(
        ownerAgent,
        organizationId,
      );

      await addProjectMember(
        ownerAgent,
        projectResponse.body.id,
        secondAdminUserId,
        ProjectRole.ADMIN,
      );

      await ownerAgent
        .delete(
          `${PROJECTS_URL}/${projectResponse.body.id}/members/${ownerUserId}`,
        )
        .expect(204);
    });

    it('should reject removing a non-existent member', async () => {
      const { agent, organizationId } = await createTestOrganization();

      const projectResponse = await createTestProject(agent, organizationId);

      await agent
        .delete(
          `${PROJECTS_URL}/${projectResponse.body.id}/members/${INVALID_UUID}`,
        )
        .expect(404);
    });

    it('should reject a non-admin project member from removing members', async () => {
      const { agent: ownerAgent, organizationId } =
        await createTestOrganization();

      const { agent: memberAgent, userId: memberUserId } =
        await createOrganizationUser(
          member,
          organizationId,
          OrganizationRole.DEVELOPER,
        );

      const { userId: ownerUserId } = await ownerAgent
        .get(AUTH_ME_URL)
        .expect(200)
        .then((response) => ({
          userId: response.body.id,
        }));

      const projectResponse = await createTestProject(
        ownerAgent,
        organizationId,
      );

      await addProjectMember(ownerAgent, projectResponse.body.id, memberUserId);

      await memberAgent
        .delete(
          `${PROJECTS_URL}/${projectResponse.body.id}/members/${ownerUserId}`,
        )
        .expect(403);
    });

    it('should reject an unauthenticated request', async () => {
      await request(app.getHttpServer())
        .delete(`${PROJECTS_URL}/${INVALID_UUID}/members/${INVALID_UUID}`)
        .expect(401);
    });
  });
});
