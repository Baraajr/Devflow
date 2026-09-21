/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import request from 'supertest';

import { createTestApp } from '../helpers/create-test-app';
import { cleanDatabase } from '../helpers/clean-database';

import { OrganizationMember } from '../../src/organization/entities/organization-members.entity';
import { OrganizationRole } from '../../src/organization/enums/organization-role.enum';
import {
  addOrganizationMember,
  createAuthenticatedAgent,
  createOrganization,
} from '../helpers/helpers';

describe('Organization Integration', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  const baseUrl = '/api/v1/organization';

  const owner = {
    email: 'owner@example.com',
    firstName: 'Organization',
    lastName: 'Owner',
    password: 'Password123',
    passwordConfirm: 'Password123',
  };

  const member = {
    email: 'member@example.com',
    firstName: 'Organization',
    lastName: 'Member',
    password: 'Password123',
    passwordConfirm: 'Password123',
  };

  const manager = {
    email: 'manager@example.com',
    firstName: 'Organization',
    lastName: 'Manager',
    password: 'Password123',
    passwordConfirm: 'Password123',
  };

  const viewer = {
    email: 'viewer@example.com',
    firstName: 'Organization',
    lastName: 'Viewer',
    password: 'Password123',
    passwordConfirm: 'Password123',
  };

  const organization = {
    name: 'Test Organization',
    description: 'Test organization description',
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

  /**
   * Registers a user and retrieves their ID through /auth/me.
   */
  const registerAndGetUserId = async (user: typeof owner): Promise<string> => {
    const agent = await createAuthenticatedAgent(app, user);

    const response = await agent.get('/api/v1/auth/me').expect(200);

    return response.body.id;
  };

  describe('POST /organization', () => {
    it('should create an organization successfully', async () => {
      const agent = await createAuthenticatedAgent(app, owner);

      const response = await createOrganization(agent, organization);

      expect(response.body).toMatchObject({
        name: organization.name,
        description: organization.description,
      });

      expect(response.body.id).toBeDefined();
      expect(response.body.slug).toBeDefined();
      expect(response.body.createdAt).toBeDefined();
      expect(response.body.updatedAt).toBeDefined();
    });

    it('should create the authenticated user as the organization owner', async () => {
      const agent = await createAuthenticatedAgent(app, owner);

      const response = await createOrganization(agent, organization);

      const userResponse = await agent.get('/api/v1/auth/me').expect(200);

      const membersResponse = await agent
        .get(`${baseUrl}/${response.body.id}/members`)
        .expect(200);

      expect(membersResponse.body).toHaveLength(1);

      expect(membersResponse.body[0]).toMatchObject({
        userId: userResponse.body.id,
        role: OrganizationRole.OWNER,
        user: {
          id: userResponse.body.id,
          email: owner.email,
          firstName: owner.firstName,
          lastName: owner.lastName,
        },
      });
    });

    it('should reject duplicate organization names for the same user', async () => {
      const agent = await createAuthenticatedAgent(app, owner);

      await createOrganization(agent, organization);

      const response = await agent
        .post(baseUrl)
        .send({
          ...organization,
          description: 'Another description',
        })
        .expect(409);

      expect(response.body).toBeDefined();
    });

    it('should treat organization names as case-insensitive', async () => {
      const agent = await createAuthenticatedAgent(app, owner);

      await createOrganization(agent, organization);

      await agent
        .post(baseUrl)
        .send({
          ...organization,
          name: 'TEST ORGANIZATION',
        })
        .expect(409);
    });

    it('should allow different users to create organizations with the same name', async () => {
      const ownerAgent = await createAuthenticatedAgent(app, owner);
      const memberAgent = await createAuthenticatedAgent(app, member);

      await createOrganization(ownerAgent, organization);

      const response = await memberAgent
        .post(baseUrl)
        .send(organization)
        .expect(201);

      expect(response.body).toMatchObject({
        name: organization.name,
        description: organization.description,
      });
    });

    it('should reject unauthenticated requests', async () => {
      await request(app.getHttpServer())
        .post(baseUrl)
        .send(organization)
        .expect(401);
    });

    it('should reject an empty request body', async () => {
      const agent = await createAuthenticatedAgent(app, owner);

      await agent.post(baseUrl).send({}).expect(400);
    });

    it('should reject an invalid organization name', async () => {
      const agent = await createAuthenticatedAgent(app, owner);

      await agent
        .post(baseUrl)
        .send({
          ...organization,
          name: 'a',
        })
        .expect(400);
    });

    it('should reject an organization name that exceeds the maximum length', async () => {
      const agent = await createAuthenticatedAgent(app, owner);

      await agent
        .post(baseUrl)
        .send({
          ...organization,
          name: 'a'.repeat(151),
        })
        .expect(400);
    });

    it('should reject a description that exceeds the maximum length', async () => {
      const agent = await createAuthenticatedAgent(app, owner);

      await agent
        .post(baseUrl)
        .send({
          ...organization,
          description: 'a'.repeat(501),
        })
        .expect(400);
    });
  });

  describe('GET /organization', () => {
    it('should return the authenticated user organizations', async () => {
      const agent = await createAuthenticatedAgent(app, owner);

      await createOrganization(agent, organization);

      const response = await agent.get(baseUrl).expect(200);

      expect(response.body).toHaveLength(1);

      expect(response.body[0]).toMatchObject({
        name: organization.name,
        description: organization.description,
        role: OrganizationRole.OWNER,
        memberCount: '1',
      });

      expect(response.body[0].id).toBeDefined();
      expect(response.body[0].slug).toBeDefined();
      expect(response.body[0].userId).toBeDefined();
    });

    it('should return multiple organizations belonging to the user', async () => {
      const agent = await createAuthenticatedAgent(app, owner);

      await createOrganization(agent, {
        name: 'Organization One',
        description: 'First organization',
      });

      await createOrganization(agent, {
        name: 'Organization Two',
        description: 'Second organization',
      });

      const response = await agent.get(baseUrl).expect(200);

      expect(response.body).toHaveLength(2);

      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'Organization One',
          }),
          expect.objectContaining({
            name: 'Organization Two',
          }),
        ]),
      );
    });

    it('should return an empty array when the user has no organizations', async () => {
      const agent = await createAuthenticatedAgent(app, owner);

      const response = await agent.get(baseUrl).expect(200);

      expect(response.body).toEqual([]);
    });

    it('should not return organizations belonging to another user', async () => {
      const ownerAgent = await createAuthenticatedAgent(app, owner);
      const memberAgent = await createAuthenticatedAgent(app, member);

      await createOrganization(ownerAgent, organization);

      const response = await memberAgent.get(baseUrl).expect(200);

      expect(response.body).toEqual([]);
    });

    it('should reject unauthenticated requests', async () => {
      await request(app.getHttpServer()).get(baseUrl).expect(401);
    });
  });

  describe('PATCH /organization/:organizationId', () => {
    it('should allow the owner to update the organization', async () => {
      const agent = await createAuthenticatedAgent(app, owner);

      const createResponse = await createOrganization(agent, organization);

      const response = await agent
        .patch(`${baseUrl}/${createResponse.body.id}`)
        .send({
          name: 'Updated Organization',
          description: 'Updated description',
        })
        .expect(200);

      expect(response.body).toMatchObject({
        id: createResponse.body.id,
        name: 'Updated Organization',
        description: 'Updated description',
      });
    });

    it('should allow a manager to update the organization', async () => {
      const ownerAgent = await createAuthenticatedAgent(app, owner);
      const managerAgent = await createAuthenticatedAgent(app, manager);

      const managerResponse = await managerAgent
        .get('/api/v1/auth/me')
        .expect(200);

      const createResponse = await createOrganization(ownerAgent, organization);

      await addOrganizationMember(
        dataSource,
        createResponse.body.id,
        managerResponse.body.id,
        OrganizationRole.MANAGER,
      );

      const response = await managerAgent
        .patch(`${baseUrl}/${createResponse.body.id}`)
        .send({
          description: 'Updated by manager',
        })
        .expect(200);

      expect(response.body).toMatchObject({
        id: createResponse.body.id,
        description: 'Updated by manager',
      });
    });

    it.each([
      [OrganizationRole.DEVELOPER, member],
      [OrganizationRole.VIEWER, viewer],
    ])(
      'should reject %s from updating the organization',
      async (role, user) => {
        const ownerAgent = await createAuthenticatedAgent(app, owner);
        const memberAgent = await createAuthenticatedAgent(app, user);

        const memberResponse = await memberAgent
          .get('/api/v1/auth/me')
          .expect(200);

        const createResponse = await createOrganization(
          ownerAgent,
          organization,
        );

        await addOrganizationMember(
          dataSource,
          createResponse.body.id,
          memberResponse.body.id,
          role,
        );

        await memberAgent
          .patch(`${baseUrl}/${createResponse.body.id}`)
          .send({
            description: 'Unauthorized update',
          })
          .expect(403);
      },
    );

    it('should reject a user who is not an organization member', async () => {
      const ownerAgent = await createAuthenticatedAgent(app, owner);
      const memberAgent = await createAuthenticatedAgent(app, member);

      const createResponse = await createOrganization(ownerAgent, organization);

      await memberAgent
        .patch(`${baseUrl}/${createResponse.body.id}`)
        .send({
          description: 'Unauthorized update',
        })
        .expect(403);
    });

    it('should reject a non-existing organization', async () => {
      const agent = await createAuthenticatedAgent(app, owner);

      const fakeOrganizationId = '11111111-1111-4111-8111-111111111111';

      await agent
        .patch(`${baseUrl}/${fakeOrganizationId}`)
        .send({
          description: 'Updated description',
        })
        .expect(404);
    });

    it('should reject an invalid organization ID', async () => {
      const agent = await createAuthenticatedAgent(app, owner);

      await agent
        .patch(`${baseUrl}/invalid-id`)
        .send({
          description: 'Updated description',
        })
        .expect(400);
    });

    it('should reject invalid update data', async () => {
      const agent = await createAuthenticatedAgent(app, owner);

      const createResponse = await createOrganization(agent, organization);

      await agent
        .patch(`${baseUrl}/${createResponse.body.id}`)
        .send({
          name: 'a',
        })
        .expect(400);
    });

    it('should reject unauthenticated requests', async () => {
      const fakeOrganizationId = '11111111-1111-4111-8111-111111111111';

      await request(app.getHttpServer())
        .patch(`${baseUrl}/${fakeOrganizationId}`)
        .send({
          description: 'Updated description',
        })
        .expect(401);
    });
  });

  describe('PATCH /organization/:organizationId/members/:userId/role', () => {
    it('should allow the owner to change a member role', async () => {
      const ownerAgent = await createAuthenticatedAgent(app, owner);
      const memberId = await registerAndGetUserId(member);

      const createResponse = await createOrganization(ownerAgent, organization);

      await addOrganizationMember(
        dataSource,
        createResponse.body.id,
        memberId,
        OrganizationRole.DEVELOPER,
      );

      const response = await ownerAgent
        .patch(`${baseUrl}/${createResponse.body.id}/members/${memberId}/role`)
        .send({
          role: OrganizationRole.MANAGER,
        })
        .expect(200);

      expect(response.body).toMatchObject({
        organizationId: createResponse.body.id,
        userId: memberId,
        role: OrganizationRole.MANAGER,
      });
    });

    it.each([
      OrganizationRole.MANAGER,
      OrganizationRole.DEVELOPER,
      OrganizationRole.VIEWER,
    ])('should reject %s from changing member roles', async (role) => {
      const ownerAgent = await createAuthenticatedAgent(app, owner);

      const user =
        role === OrganizationRole.MANAGER
          ? manager
          : role === OrganizationRole.VIEWER
            ? viewer
            : member;

      const memberAgent = await createAuthenticatedAgent(app, user);

      const memberResponse = await memberAgent
        .get('/api/v1/auth/me')
        .expect(200);

      const createResponse = await createOrganization(ownerAgent, organization);

      await addOrganizationMember(
        dataSource,
        createResponse.body.id,
        memberResponse.body.id,
        role,
      );

      const targetUserId = await registerAndGetUserId(
        role === OrganizationRole.MANAGER ? member : manager,
      );

      await addOrganizationMember(
        dataSource,
        createResponse.body.id,
        targetUserId,
        OrganizationRole.DEVELOPER,
      );

      await memberAgent
        .patch(
          `${baseUrl}/${createResponse.body.id}/members/${targetUserId}/role`,
        )
        .send({
          role: OrganizationRole.MANAGER,
        })
        .expect(403);
    });

    it('should reject assigning the owner role', async () => {
      const ownerAgent = await createAuthenticatedAgent(app, owner);
      const memberId = await registerAndGetUserId(member);

      const createResponse = await createOrganization(ownerAgent, organization);

      await addOrganizationMember(
        dataSource,
        createResponse.body.id,
        memberId,
        OrganizationRole.DEVELOPER,
      );

      await ownerAgent
        .patch(`${baseUrl}/${createResponse.body.id}/members/${memberId}/role`)
        .send({
          role: OrganizationRole.OWNER,
        })
        .expect(400);
    });

    it('should reject changing the organization owner role', async () => {
      const ownerAgent = await createAuthenticatedAgent(app, owner);

      const ownerResponse = await ownerAgent.get('/api/v1/auth/me').expect(200);

      const createResponse = await createOrganization(ownerAgent, organization);

      await ownerAgent
        .patch(
          `${baseUrl}/${createResponse.body.id}/members/${ownerResponse.body.id}/role`,
        )
        .send({
          role: OrganizationRole.MANAGER,
        })
        .expect(400);
    });

    it('should reject a non-existing target member', async () => {
      const ownerAgent = await createAuthenticatedAgent(app, owner);

      const createResponse = await createOrganization(ownerAgent, organization);

      const fakeUserId = '22222222-2222-4222-8222-222222222222';

      await ownerAgent
        .patch(
          `${baseUrl}/${createResponse.body.id}/members/${fakeUserId}/role`,
        )
        .send({
          role: OrganizationRole.MANAGER,
        })
        .expect(404);
    });

    it('should reject an invalid organization ID', async () => {
      const agent = await createAuthenticatedAgent(app, owner);

      await agent
        .patch(
          `${baseUrl}/invalid-id/members/11111111-1111-4111-8111-111111111111/role`,
        )
        .send({
          role: OrganizationRole.MANAGER,
        })
        .expect(400);
    });

    it('should reject an invalid user ID', async () => {
      const agent = await createAuthenticatedAgent(app, owner);

      const createResponse = await createOrganization(agent, organization);

      await agent
        .patch(`${baseUrl}/${createResponse.body.id}/members/invalid-id/role`)
        .send({
          role: OrganizationRole.MANAGER,
        })
        .expect(400);
    });

    it('should reject an invalid role', async () => {
      const ownerAgent = await createAuthenticatedAgent(app, owner);
      const memberId = await registerAndGetUserId(member);

      const createResponse = await createOrganization(ownerAgent, organization);

      await addOrganizationMember(
        dataSource,
        createResponse.body.id,
        memberId,
        OrganizationRole.DEVELOPER,
      );

      await ownerAgent
        .patch(`${baseUrl}/${createResponse.body.id}/members/${memberId}/role`)
        .send({
          role: 'invalid-role',
        })
        .expect(400);
    });

    it('should reject unauthenticated requests', async () => {
      const fakeOrganizationId = '11111111-1111-4111-8111-111111111111';

      const fakeUserId = '22222222-2222-4222-8222-222222222222';

      await request(app.getHttpServer())
        .patch(`${baseUrl}/${fakeOrganizationId}/members/${fakeUserId}/role`)
        .send({
          role: OrganizationRole.MANAGER,
        })
        .expect(401);
    });
  });

  describe('DELETE /organization/:organizationId/members/:userId', () => {
    it('should allow the owner to remove a member', async () => {
      const ownerAgent = await createAuthenticatedAgent(app, owner);
      const memberId = await registerAndGetUserId(member);

      const createResponse = await createOrganization(ownerAgent, organization);

      await addOrganizationMember(
        dataSource,
        createResponse.body.id,
        memberId,
        OrganizationRole.DEVELOPER,
      );

      await ownerAgent
        .delete(`${baseUrl}/${createResponse.body.id}/members/${memberId}`)
        .expect(204);

      const membersResponse = await ownerAgent
        .get(`${baseUrl}/${createResponse.body.id}/members`)
        .expect(200);

      expect(membersResponse.body).toHaveLength(1);
      expect(membersResponse.body[0].role).toBe(OrganizationRole.OWNER);
    });

    it('should allow the owner to remove a manager', async () => {
      const ownerAgent = await createAuthenticatedAgent(app, owner);
      const managerId = await registerAndGetUserId(manager);

      const createResponse = await createOrganization(ownerAgent, organization);

      await addOrganizationMember(
        dataSource,
        createResponse.body.id,
        managerId,
        OrganizationRole.MANAGER,
      );

      await ownerAgent
        .delete(`${baseUrl}/${createResponse.body.id}/members/${managerId}`)
        .expect(204);

      const membersResponse = await ownerAgent
        .get(`${baseUrl}/${createResponse.body.id}/members`)
        .expect(200);

      expect(membersResponse.body).toHaveLength(1);
    });

    it('should allow a manager to remove a developer', async () => {
      const ownerAgent = await createAuthenticatedAgent(app, owner);
      const managerAgent = await createAuthenticatedAgent(app, manager);
      const memberId = await registerAndGetUserId(member);

      const managerResponse = await managerAgent
        .get('/api/v1/auth/me')
        .expect(200);

      const createResponse = await createOrganization(ownerAgent, organization);

      await addOrganizationMember(
        dataSource,
        createResponse.body.id,
        managerResponse.body.id,
        OrganizationRole.MANAGER,
      );

      await addOrganizationMember(
        dataSource,
        createResponse.body.id,
        memberId,
        OrganizationRole.DEVELOPER,
      );

      await managerAgent
        .delete(`${baseUrl}/${createResponse.body.id}/members/${memberId}`)
        .expect(204);

      const membersResponse = await ownerAgent
        .get(`${baseUrl}/${createResponse.body.id}/members`)
        .expect(200);

      expect(membersResponse.body).toHaveLength(2);
    });

    it('should allow a manager to remove a viewer', async () => {
      const ownerAgent = await createAuthenticatedAgent(app, owner);
      const managerAgent = await createAuthenticatedAgent(app, manager);
      const viewerId = await registerAndGetUserId(viewer);

      const managerResponse = await managerAgent
        .get('/api/v1/auth/me')
        .expect(200);

      const createResponse = await createOrganization(ownerAgent, organization);

      await addOrganizationMember(
        dataSource,
        createResponse.body.id,
        managerResponse.body.id,
        OrganizationRole.MANAGER,
      );

      await addOrganizationMember(
        dataSource,
        createResponse.body.id,
        viewerId,
        OrganizationRole.VIEWER,
      );

      await managerAgent
        .delete(`${baseUrl}/${createResponse.body.id}/members/${viewerId}`)
        .expect(204);

      const membersResponse = await ownerAgent
        .get(`${baseUrl}/${createResponse.body.id}/members`)
        .expect(200);

      expect(membersResponse.body).toHaveLength(2);
    });

    it('should reject a manager from removing another manager', async () => {
      const ownerAgent = await createAuthenticatedAgent(app, owner);
      const managerAgent = await createAuthenticatedAgent(app, manager);
      const secondManagerId = await registerAndGetUserId(viewer);

      const managerResponse = await managerAgent
        .get('/api/v1/auth/me')
        .expect(200);

      const createResponse = await createOrganization(ownerAgent, organization);

      await addOrganizationMember(
        dataSource,
        createResponse.body.id,
        managerResponse.body.id,
        OrganizationRole.MANAGER,
      );

      await addOrganizationMember(
        dataSource,
        createResponse.body.id,
        secondManagerId,
        OrganizationRole.MANAGER,
      );

      await managerAgent
        .delete(
          `${baseUrl}/${createResponse.body.id}/members/${secondManagerId}`,
        )
        .expect(403);
    });

    it.each([OrganizationRole.DEVELOPER, OrganizationRole.VIEWER])(
      'should reject %s from removing members',
      async (role) => {
        const ownerAgent = await createAuthenticatedAgent(app, owner);

        const user = role === OrganizationRole.DEVELOPER ? member : viewer;

        const memberAgent = await createAuthenticatedAgent(app, user);
        const targetId = await registerAndGetUserId(manager);

        const memberResponse = await memberAgent
          .get('/api/v1/auth/me')
          .expect(200);

        const createResponse = await createOrganization(
          ownerAgent,
          organization,
        );

        await addOrganizationMember(
          dataSource,
          createResponse.body.id,
          memberResponse.body.id,
          role,
        );

        await addOrganizationMember(
          dataSource,
          createResponse.body.id,
          targetId,
          OrganizationRole.DEVELOPER,
        );

        await memberAgent
          .delete(`${baseUrl}/${createResponse.body.id}/members/${targetId}`)
          .expect(403);
      },
    );

    it('should reject removing the organization owner', async () => {
      const ownerAgent = await createAuthenticatedAgent(app, owner);
      const managerAgent = await createAuthenticatedAgent(app, manager);

      const ownerResponse = await ownerAgent.get('/api/v1/auth/me').expect(200);

      const managerResponse = await managerAgent
        .get('/api/v1/auth/me')
        .expect(200);

      const createResponse = await createOrganization(ownerAgent, organization);

      await addOrganizationMember(
        dataSource,
        createResponse.body.id,
        managerResponse.body.id,
        OrganizationRole.MANAGER,
      );

      await managerAgent
        .delete(
          `${baseUrl}/${createResponse.body.id}/members/${ownerResponse.body.id}`,
        )
        .expect(400);
    });

    it('should reject removing a non-existing member', async () => {
      const ownerAgent = await createAuthenticatedAgent(app, owner);

      const createResponse = await createOrganization(ownerAgent, organization);

      const fakeUserId = '22222222-2222-4222-8222-222222222222';

      await ownerAgent
        .delete(`${baseUrl}/${createResponse.body.id}/members/${fakeUserId}`)
        .expect(404);
    });

    it('should reject a user who is not an organization member', async () => {
      const ownerAgent = await createAuthenticatedAgent(app, owner);
      const memberAgent = await createAuthenticatedAgent(app, member);

      const targetId = await registerAndGetUserId(manager);

      const createResponse = await createOrganization(ownerAgent, organization);

      await addOrganizationMember(
        dataSource,
        createResponse.body.id,
        targetId,
        OrganizationRole.DEVELOPER,
      );

      await memberAgent
        .delete(`${baseUrl}/${createResponse.body.id}/members/${targetId}`)
        .expect(403);
    });

    it('should reject an invalid organization ID', async () => {
      const agent = await createAuthenticatedAgent(app, owner);

      await agent
        .delete(
          `${baseUrl}/invalid-id/members/11111111-1111-4111-8111-111111111111`,
        )
        .expect(400);
    });

    it('should reject an invalid user ID', async () => {
      const agent = await createAuthenticatedAgent(app, owner);

      const createResponse = await createOrganization(agent, organization);

      await agent
        .delete(`${baseUrl}/${createResponse.body.id}/members/invalid-id`)
        .expect(400);
    });

    it('should reject unauthenticated requests', async () => {
      const fakeOrganizationId = '11111111-1111-4111-8111-111111111111';

      const fakeUserId = '22222222-2222-4222-8222-222222222222';

      await request(app.getHttpServer())
        .delete(`${baseUrl}/${fakeOrganizationId}/members/${fakeUserId}`)
        .expect(401);
    });
  });

  describe('GET /organization/:organizationId', () => {
    it('should return an organization the user belongs to', async () => {
      const agent = await createAuthenticatedAgent(app, owner);

      const createResponse = await createOrganization(agent, organization);

      const response = await agent
        .get(`${baseUrl}/${createResponse.body.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: createResponse.body.id,
        name: organization.name,
        slug: createResponse.body.slug,
        description: organization.description,
      });
    });

    it('should reject access to an organization the user does not belong to', async () => {
      const ownerAgent = await createAuthenticatedAgent(app, owner);
      const memberAgent = await createAuthenticatedAgent(app, member);

      const createResponse = await createOrganization(ownerAgent, organization);

      await memberAgent.get(`${baseUrl}/${createResponse.body.id}`).expect(404);
    });

    it('should reject a non-existing organization', async () => {
      const agent = await createAuthenticatedAgent(app, owner);

      const fakeOrganizationId = '11111111-1111-4111-8111-111111111111';

      await agent.get(`${baseUrl}/${fakeOrganizationId}`).expect(404);
    });

    it('should reject an invalid organization ID', async () => {
      const agent = await createAuthenticatedAgent(app, owner);

      await agent.get(`${baseUrl}/invalid-id`).expect(400);
    });

    it('should reject unauthenticated requests', async () => {
      const fakeOrganizationId = '11111111-1111-4111-8111-111111111111';

      await request(app.getHttpServer())
        .get(`${baseUrl}/${fakeOrganizationId}`)
        .expect(401);
    });
  });

  describe('GET /organization/:organizationId/members', () => {
    it('should return organization members', async () => {
      const ownerAgent = await createAuthenticatedAgent(app, owner);
      const memberId = await registerAndGetUserId(member);

      const createResponse = await createOrganization(ownerAgent, organization);

      await addOrganizationMember(
        dataSource,
        createResponse.body.id,
        memberId,
        OrganizationRole.DEVELOPER,
      );

      const response = await ownerAgent
        .get(`${baseUrl}/${createResponse.body.id}/members`)
        .expect(200);

      expect(response.body).toHaveLength(2);

      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            userId: memberId,
            role: OrganizationRole.DEVELOPER,
            user: expect.objectContaining({
              id: memberId,
              email: member.email,
              firstName: member.firstName,
              lastName: member.lastName,
            }),
          }),
          expect.objectContaining({
            role: OrganizationRole.OWNER,
            user: expect.objectContaining({
              email: owner.email,
              firstName: owner.firstName,
              lastName: owner.lastName,
            }),
          }),
        ]),
      );
    });

    it('should return the correct member count', async () => {
      const ownerAgent = await createAuthenticatedAgent(app, owner);
      const memberId = await registerAndGetUserId(member);
      const managerId = await registerAndGetUserId(manager);

      const createResponse = await createOrganization(ownerAgent, organization);

      await addOrganizationMember(
        dataSource,
        createResponse.body.id,
        memberId,
        OrganizationRole.DEVELOPER,
      );

      await addOrganizationMember(
        dataSource,
        createResponse.body.id,
        managerId,
        OrganizationRole.MANAGER,
      );

      const response = await ownerAgent
        .get(`${baseUrl}/${createResponse.body.id}/members`)
        .expect(200);

      expect(response.body).toHaveLength(3);
    });

    it('should allow any organization member to view members', async () => {
      const ownerAgent = await createAuthenticatedAgent(app, owner);
      const memberAgent = await createAuthenticatedAgent(app, member);

      const memberResponse = await memberAgent
        .get('/api/v1/auth/me')
        .expect(200);

      const createResponse = await createOrganization(ownerAgent, organization);

      await addOrganizationMember(
        dataSource,
        createResponse.body.id,
        memberResponse.body.id,
        OrganizationRole.DEVELOPER,
      );

      const response = await memberAgent
        .get(`${baseUrl}/${createResponse.body.id}/members`)
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should reject users who are not organization members', async () => {
      const ownerAgent = await createAuthenticatedAgent(app, owner);
      const memberAgent = await createAuthenticatedAgent(app, member);

      const createResponse = await createOrganization(ownerAgent, organization);

      await memberAgent
        .get(`${baseUrl}/${createResponse.body.id}/members`)
        .expect(404);
    });

    it('should reject an invalid organization ID', async () => {
      const agent = await createAuthenticatedAgent(app, owner);

      await agent.get(`${baseUrl}/invalid-id/members`).expect(400);
    });

    it('should reject unauthenticated requests', async () => {
      const fakeOrganizationId = '11111111-1111-4111-8111-111111111111';

      await request(app.getHttpServer())
        .get(`${baseUrl}/${fakeOrganizationId}/members`)
        .expect(401);
    });
  });

  describe('DELETE /organization/:organizationId', () => {
    it('should allow the owner to delete the organization', async () => {
      const agent = await createAuthenticatedAgent(app, owner);

      const createResponse = await createOrganization(agent, organization);

      await agent.delete(`${baseUrl}/${createResponse.body.id}`);

      await agent.get(`${baseUrl}/${createResponse.body.id}`).expect(404);
    });

    it('should delete the organization and its memberships', async () => {
      const ownerAgent = await createAuthenticatedAgent(app, owner);
      const memberId = await registerAndGetUserId(member);

      const createResponse = await createOrganization(ownerAgent, organization);

      await addOrganizationMember(
        dataSource,
        createResponse.body.id,
        memberId,
        OrganizationRole.DEVELOPER,
      );

      await ownerAgent
        .delete(`${baseUrl}/${createResponse.body.id}`)
        .expect(204);

      const membershipRepository = dataSource.getRepository(OrganizationMember);

      const memberships = await membershipRepository.find({
        where: {
          organizationId: createResponse.body.id,
        },
      });

      expect(memberships).toHaveLength(0);
    });

    it('should reject deletion by a non-owner member', async () => {
      const ownerAgent = await createAuthenticatedAgent(app, owner);
      const memberAgent = await createAuthenticatedAgent(app, member);

      const memberResponse = await memberAgent
        .get('/api/v1/auth/me')
        .expect(200);

      const createResponse = await createOrganization(ownerAgent, organization);

      await addOrganizationMember(
        dataSource,
        createResponse.body.id,
        memberResponse.body.id,
        OrganizationRole.DEVELOPER,
      );

      await memberAgent
        .delete(`${baseUrl}/${createResponse.body.id}`)
        .expect(409);
    });

    it('should reject deletion by a user who is not a member', async () => {
      const ownerAgent = await createAuthenticatedAgent(app, owner);
      const memberAgent = await createAuthenticatedAgent(app, member);

      const createResponse = await createOrganization(ownerAgent, organization);

      await memberAgent
        .delete(`${baseUrl}/${createResponse.body.id}`)
        .expect(404);
    });

    it('should reject deletion of a non-existing organization', async () => {
      const agent = await createAuthenticatedAgent(app, owner);

      const fakeOrganizationId = '11111111-1111-4111-8111-111111111111';

      await agent.delete(`${baseUrl}/${fakeOrganizationId}`).expect(404);
    });

    it('should reject an invalid organization ID', async () => {
      const agent = await createAuthenticatedAgent(app, owner);

      await agent.delete(`${baseUrl}/invalid-id`).expect(400);
    });

    it('should reject unauthenticated requests', async () => {
      const fakeOrganizationId = '11111111-1111-4111-8111-111111111111';

      await request(app.getHttpServer())
        .delete(`${baseUrl}/${fakeOrganizationId}`)
        .expect(401);
    });
  });

  describe('DELETE /organization/:organizationId/members/me', () => {
    it('should allow a non-owner member to leave the organization', async () => {
      const ownerAgent = await createAuthenticatedAgent(app, owner);
      const memberAgent = await createAuthenticatedAgent(app, member);

      const memberResponse = await memberAgent
        .get('/api/v1/auth/me')
        .expect(200);

      const createResponse = await createOrganization(ownerAgent, organization);

      await addOrganizationMember(
        dataSource,
        createResponse.body.id,
        memberResponse.body.id,
        OrganizationRole.DEVELOPER,
      );

      await memberAgent
        .delete(`${baseUrl}/${createResponse.body.id}/members/me`)
        .expect(204);

      const membersResponse = await ownerAgent
        .get(`${baseUrl}/${createResponse.body.id}/members`)
        .expect(200);

      expect(membersResponse.body).toHaveLength(1);
      expect(membersResponse.body[0].user.email).toBe(owner.email);
    });

    it('should reject when the organization owner tries to leave', async () => {
      const ownerAgent = await createAuthenticatedAgent(app, owner);

      const createResponse = await createOrganization(ownerAgent, organization);

      await ownerAgent
        .delete(`${baseUrl}/${createResponse.body.id}/members/me`)
        .expect(409);
    });

    it('should reject leaving an organization the user does not belong to', async () => {
      const ownerAgent = await createAuthenticatedAgent(app, owner);
      const memberAgent = await createAuthenticatedAgent(app, member);

      const createResponse = await createOrganization(ownerAgent, organization);

      await memberAgent
        .delete(`${baseUrl}/${createResponse.body.id}/members/me`)
        .expect(404);
    });

    it('should reject leaving a non-existing organization', async () => {
      const agent = await createAuthenticatedAgent(app, owner);

      const fakeOrganizationId = '11111111-1111-4111-8111-111111111111';

      await agent
        .delete(`${baseUrl}/${fakeOrganizationId}/members/me`)
        .expect(404);
    });

    it('should reject an invalid organization ID', async () => {
      const agent = await createAuthenticatedAgent(app, owner);

      await agent.delete(`${baseUrl}/invalid-id/members/me`).expect(400);
    });

    it('should reject unauthenticated requests', async () => {
      const fakeOrganizationId = '11111111-1111-4111-8111-111111111111';

      await request(app.getHttpServer())
        .delete(`${baseUrl}/${fakeOrganizationId}/members/me`)
        .expect(401);
    });
  });
});
