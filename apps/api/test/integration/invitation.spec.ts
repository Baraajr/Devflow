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

import { OrganizationInvitation } from '../../src/invitation/entities/organization-invitation.entity';
import { InvitationStatus } from '../../src/invitation/enums/invitation-status.enum';
import { InvitableOrganizationRole } from '../../src/organization/enums/invitable-organization-role.enum';

import {
  addOrganizationMember,
  createAuthenticatedAgent,
  createOrganization,
  registerAndGetUserId,
} from '../helpers/helpers';

describe('Invitation Integration', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  const baseUrl = '/api/v1/invitations';

  const owner = {
    email: 'owner@example.com',
    firstName: 'Invitation',
    lastName: 'Owner',
    password: 'Password123',
    passwordConfirm: 'Password123',
  };

  const manager = {
    email: 'manager@example.com',
    firstName: 'Invitation',
    lastName: 'Manager',
    password: 'Password123',
    passwordConfirm: 'Password123',
  };

  const developer = {
    email: 'developer@example.com',
    firstName: 'Invitation',
    lastName: 'Developer',
    password: 'Password123',
    passwordConfirm: 'Password123',
  };

  const viewer = {
    email: 'viewer@example.com',
    firstName: 'Invitation',
    lastName: 'Viewer',
    password: 'Password123',
    passwordConfirm: 'Password123',
  };

  const invitedUser = {
    email: 'invited@example.com',
    firstName: 'Invited',
    lastName: 'User',
    password: 'Password123',
    passwordConfirm: 'Password123',
  };

  const anotherUser = {
    email: 'another@example.com',
    firstName: 'Another',
    lastName: 'User',
    password: 'Password123',
    passwordConfirm: 'Password123',
  };

  const organization = {
    name: 'Invitation Test Organization',
    description: 'Organization used for invitation integration tests',
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
   * Creates an invitation directly in the database.
   *
   * This is used when a test needs a specific invitation state such as
   * expired, accepted, declined, or cancelled.
   */
  const createInvitation = async ({
    organizationId,
    invitedUserId,
    invitedBy,
    role = InvitableOrganizationRole.DEVELOPER,
    status = InvitationStatus.PENDING,
    expiresAt = new Date(Date.now() + 60 * 60 * 1000),
  }: {
    organizationId: string;
    invitedUserId: string;
    invitedBy: string;
    role?: InvitableOrganizationRole;
    status?: InvitationStatus;
    expiresAt?: Date;
  }): Promise<OrganizationInvitation> => {
    const repository = dataSource.getRepository(OrganizationInvitation);

    const invitation = repository.create({
      organizationId,
      invitedUserId,
      invitedBy,
      role,
      status,
      expiresAt,
    });

    return repository.save(invitation);
  };

  /**
   * Creates an owner and organization and returns all required IDs.
   */
  const createOrganizationSetup = async () => {
    const ownerAgent = await createAuthenticatedAgent(app, owner);

    const ownerResponse = await ownerAgent.get('/api/v1/auth/me').expect(200);

    const organizationResponse = await createOrganization(
      ownerAgent,
      organization,
    );

    return {
      ownerAgent,
      ownerId: ownerResponse.body.id,
      organizationId: organizationResponse.body.id,
    };
  };

  describe('POST /invitations/organization/:organizationId', () => {
    it('should allow the organization owner to invite a user', async () => {
      const { ownerAgent, organizationId } = await createOrganizationSetup();

      await createAuthenticatedAgent(app, invitedUser);

      const response = await ownerAgent
        .post(`${baseUrl}/organization/${organizationId}`)
        .send({
          invitedUserEmail: invitedUser.email,
          role: InvitableOrganizationRole.DEVELOPER,
        })
        .expect(201);

      expect(response.body).toMatchObject({
        organizationId,
        status: InvitationStatus.PENDING,
        role: InvitableOrganizationRole.DEVELOPER,
      });

      expect(response.body.id).toBeDefined();
      expect(response.body.invitedUserId).toBeDefined();
      expect(response.body.invitedBy).toBeDefined();
      expect(response.body.expiresAt).toBeDefined();
      expect(response.body.createdAt).toBeDefined();
      expect(response.body.updatedAt).toBeDefined();
    });

    it('should reject unauthenticated requests', async () => {
      const { organizationId } = await createOrganizationSetup();

      await request(app.getHttpServer())
        .post(`${baseUrl}/organization/${organizationId}`)
        .send({
          invitedUserEmail: invitedUser.email,
          role: InvitableOrganizationRole.DEVELOPER,
        })
        .expect(401);
    });

    it('should reject an invalid organization UUID', async () => {
      const ownerAgent = await createAuthenticatedAgent(app, owner);

      await ownerAgent
        .post(`${baseUrl}/organization/not-a-uuid`)
        .send({
          invitedUserEmail: invitedUser.email,
          role: InvitableOrganizationRole.DEVELOPER,
        })
        .expect(400);
    });

    it('should reject a user who is not a member of the organization', async () => {
      const { organizationId } = await createOrganizationSetup();

      const anotherAgent = await createAuthenticatedAgent(app, anotherUser);

      await createAuthenticatedAgent(app, invitedUser);

      await anotherAgent
        .post(`${baseUrl}/organization/${organizationId}`)
        .send({
          invitedUserEmail: invitedUser.email,
          role: InvitableOrganizationRole.DEVELOPER,
        })
        .expect(403);
    });

    it('should reject a non-owner organization member', async () => {
      const { organizationId } = await createOrganizationSetup();

      const managerAgent = await createAuthenticatedAgent(app, manager);
      const managerId = await managerAgent
        .get('/api/v1/auth/me')
        .then((response) => response.body.id);

      await addOrganizationMember(
        dataSource,
        organizationId,
        managerId,
        OrganizationRole.MANAGER,
      );

      await createAuthenticatedAgent(app, invitedUser);

      await managerAgent
        .post(`${baseUrl}/organization/${organizationId}`)
        .send({
          invitedUserEmail: invitedUser.email,
          role: InvitableOrganizationRole.DEVELOPER,
        })
        .expect(403);
    });

    it('should reject inviting a user who does not exist', async () => {
      const { ownerAgent, organizationId } = await createOrganizationSetup();

      await ownerAgent
        .post(`${baseUrl}/organization/${organizationId}`)
        .send({
          invitedUserEmail: 'does-not-exist@example.com',
          role: InvitableOrganizationRole.DEVELOPER,
        })
        .expect(404);
    });

    it('should reject inviting an existing organization member', async () => {
      const { ownerAgent, ownerId, organizationId } =
        await createOrganizationSetup();

      const memberId = await registerAndGetUserId(app, invitedUser);

      await addOrganizationMember(
        dataSource,
        organizationId,
        memberId,
        OrganizationRole.DEVELOPER,
      );

      expect(ownerId).toBeDefined();

      await ownerAgent
        .post(`${baseUrl}/organization/${organizationId}`)
        .send({
          invitedUserEmail: invitedUser.email,
          role: InvitableOrganizationRole.DEVELOPER,
        })
        .expect(409);
    });

    it('should reject a duplicate pending invitation', async () => {
      const { ownerAgent, organizationId } = await createOrganizationSetup();

      const invitedUserId = await registerAndGetUserId(app, invitedUser);

      await createInvitation({
        organizationId,
        invitedUserId,
        invitedBy: (await ownerAgent.get('/api/v1/auth/me').expect(200)).body
          .id,
      });

      await ownerAgent
        .post(`${baseUrl}/organization/${organizationId}`)
        .send({
          invitedUserEmail: invitedUser.email,
          role: InvitableOrganizationRole.DEVELOPER,
        })
        .expect(409);
    });

    it('should reject an empty request body', async () => {
      const { ownerAgent, organizationId } = await createOrganizationSetup();

      await ownerAgent
        .post(`${baseUrl}/organization/${organizationId}`)
        .send({})
        .expect(400);
    });
  });

  describe('GET /invitations', () => {
    it('should return invitations received by the authenticated user', async () => {
      const { ownerId, organizationId } = await createOrganizationSetup();

      const invitedUserAgent = await createAuthenticatedAgent(app, invitedUser);

      const invitedUserResponse = await invitedUserAgent
        .get('/api/v1/auth/me')
        .expect(200);

      await createInvitation({
        organizationId,
        invitedUserId: invitedUserResponse.body.id,
        invitedBy: ownerId,
      });

      const response = await invitedUserAgent.get(baseUrl).expect(200);

      expect(response.body).toHaveLength(1);

      expect(response.body[0]).toMatchObject({
        organizationId,
        invitedUserId: invitedUserResponse.body.id,
        invitedBy: ownerId,
        status: InvitationStatus.PENDING,
        role: InvitableOrganizationRole.DEVELOPER,
        organization: {
          name: organization.name,
        },
        invitedUser: {
          id: invitedUserResponse.body.id,
          email: invitedUser.email,
          firstName: invitedUser.firstName,
          lastName: invitedUser.lastName,
        },
      });
    });

    it('should return an empty array when the user has no invitations', async () => {
      const agent = await createAuthenticatedAgent(app, owner);

      const response = await agent.get(baseUrl).expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return only invitations belonging to the authenticated user', async () => {
      const { ownerId, organizationId } = await createOrganizationSetup();

      const invitedAgent = await createAuthenticatedAgent(app, invitedUser);
      const anotherAgent = await createAuthenticatedAgent(app, anotherUser);

      const invitedResponse = await invitedAgent
        .get('/api/v1/auth/me')
        .expect(200);

      const anotherResponse = await anotherAgent
        .get('/api/v1/auth/me')
        .expect(200);

      await createInvitation({
        organizationId,
        invitedUserId: invitedResponse.body.id,
        invitedBy: ownerId,
      });

      await createInvitation({
        organizationId,
        invitedUserId: anotherResponse.body.id,
        invitedBy: ownerId,
      });

      const response = await invitedAgent.get(baseUrl).expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].invitedUserId).toBe(invitedResponse.body.id);
    });

    it('should reject unauthenticated requests', async () => {
      await request(app.getHttpServer()).get(baseUrl).expect(401);
    });
  });

  describe('GET /invitations/organization/:organizationId', () => {
    it('should allow the owner to view organization invitations', async () => {
      const { ownerAgent, ownerId, organizationId } =
        await createOrganizationSetup();

      const invitedUserId = await registerAndGetUserId(app, invitedUser);

      await createInvitation({
        organizationId,
        invitedUserId,
        invitedBy: ownerId,
      });

      const response = await ownerAgent
        .get(`${baseUrl}/organization/${organizationId}`)
        .expect(200);

      expect(response.body).toHaveLength(1);

      expect(response.body[0]).toMatchObject({
        organizationId,
        invitedUserId,
        invitedBy: ownerId,
        status: InvitationStatus.PENDING,
        role: InvitableOrganizationRole.DEVELOPER,
      });

      expect(response.body[0].invitedUser).toMatchObject({
        id: invitedUserId,
        email: invitedUser.email,
        firstName: invitedUser.firstName,
        lastName: invitedUser.lastName,
      });
    });

    it('should allow a manager to view organization invitations', async () => {
      const { ownerId, organizationId } = await createOrganizationSetup();

      const managerAgent = await createAuthenticatedAgent(app, manager);
      const managerId = await managerAgent
        .get('/api/v1/auth/me')
        .then((response) => response.body.id);

      await addOrganizationMember(
        dataSource,
        organizationId,
        managerId,
        OrganizationRole.MANAGER,
      );

      const invitedUserId = await registerAndGetUserId(app, invitedUser);

      await createInvitation({
        organizationId,
        invitedUserId,
        invitedBy: ownerId,
      });

      const response = await managerAgent
        .get(`${baseUrl}/organization/${organizationId}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
    });

    it('should reject a developer from viewing organization invitations', async () => {
      const { organizationId } = await createOrganizationSetup();

      const developerAgent = await createAuthenticatedAgent(app, developer);
      const developerId = await developerAgent
        .get('/api/v1/auth/me')
        .then((response) => response.body.id);

      await addOrganizationMember(
        dataSource,
        organizationId,
        developerId,
        OrganizationRole.DEVELOPER,
      );

      await developerAgent
        .get(`${baseUrl}/organization/${organizationId}`)
        .expect(403);
    });

    it('should reject a viewer from viewing organization invitations', async () => {
      const { organizationId } = await createOrganizationSetup();

      const viewerAgent = await createAuthenticatedAgent(app, viewer);
      const viewerId = await viewerAgent
        .get('/api/v1/auth/me')
        .then((response) => response.body.id);

      await addOrganizationMember(
        dataSource,
        organizationId,
        viewerId,
        OrganizationRole.VIEWER,
      );

      await viewerAgent
        .get(`${baseUrl}/organization/${organizationId}`)
        .expect(403);
    });

    it('should reject a user who is not a member of the organization', async () => {
      const { organizationId } = await createOrganizationSetup();

      const anotherAgent = await createAuthenticatedAgent(app, anotherUser);

      await anotherAgent
        .get(`${baseUrl}/organization/${organizationId}`)
        .expect(404);
    });

    it('should reject unauthenticated requests', async () => {
      const { organizationId } = await createOrganizationSetup();

      await request(app.getHttpServer())
        .get(`${baseUrl}/organization/${organizationId}`)
        .expect(401);
    });
  });

  describe('GET /invitations/:invitationId', () => {
    it('should return an invitation belonging to the authenticated user', async () => {
      const { ownerId, organizationId } = await createOrganizationSetup();

      const invitedAgent = await createAuthenticatedAgent(app, invitedUser);

      const invitedUserResponse = await invitedAgent
        .get('/api/v1/auth/me')
        .expect(200);

      const invitation = await createInvitation({
        organizationId,
        invitedUserId: invitedUserResponse.body.id,
        invitedBy: ownerId,
      });

      const response = await invitedAgent
        .get(`${baseUrl}/${invitation.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: invitation.id,
        organizationId,
        invitedUserId: invitedUserResponse.body.id,
        invitedBy: ownerId,
        status: InvitationStatus.PENDING,
        role: InvitableOrganizationRole.DEVELOPER,
      });
    });

    it('should reject access to another user invitation', async () => {
      const { ownerId, organizationId } = await createOrganizationSetup();

      const invitedUserId = await registerAndGetUserId(app, invitedUser);
      const anotherAgent = await createAuthenticatedAgent(app, anotherUser);

      const invitation = await createInvitation({
        organizationId,
        invitedUserId,
        invitedBy: ownerId,
      });

      await anotherAgent.get(`${baseUrl}/${invitation.id}`).expect(404);
    });

    it('should return 404 for a nonexistent invitation', async () => {
      const agent = await createAuthenticatedAgent(app, invitedUser);

      const randomId = '11111111-1111-4111-8111-111111111111';

      await agent.get(`${baseUrl}/${randomId}`).expect(404);
    });

    it('should reject an invalid invitation UUID', async () => {
      const agent = await createAuthenticatedAgent(app, invitedUser);

      await agent.get(`${baseUrl}/not-a-uuid`).expect(400);
    });

    it('should reject unauthenticated requests', async () => {
      const randomId = '11111111-1111-4111-8111-111111111111';

      await request(app.getHttpServer())
        .get(`${baseUrl}/${randomId}`)
        .expect(401);
    });
  });

  describe('POST /invitations/:invitationId/accept', () => {
    it('should accept a pending invitation and create organization membership', async () => {
      const { ownerId, organizationId } = await createOrganizationSetup();

      const invitedAgent = await createAuthenticatedAgent(app, invitedUser);

      const invitedUserResponse = await invitedAgent
        .get('/api/v1/auth/me')
        .expect(200);

      const invitation = await createInvitation({
        organizationId,
        invitedUserId: invitedUserResponse.body.id,
        invitedBy: ownerId,
        role: InvitableOrganizationRole.DEVELOPER,
      });

      const response = await invitedAgent
        .post(`${baseUrl}/${invitation.id}/accept`)
        .expect(201);

      expect(response.body).toMatchObject({
        organizationId,
        userId: invitedUserResponse.body.id,
        role: InvitableOrganizationRole.DEVELOPER,
      });

      const invitationRepository = dataSource.getRepository(
        OrganizationInvitation,
      );

      const savedInvitation = await invitationRepository.findOneBy({
        id: invitation.id,
      });

      expect(savedInvitation?.status).toBe(InvitationStatus.ACCEPTED);

      const memberRepository = dataSource.getRepository(OrganizationMember);

      const member = await memberRepository.findOne({
        where: {
          organizationId,
          userId: invitedUserResponse.body.id,
        },
      });

      expect(member).toBeDefined();
      expect(member?.role).toBe(OrganizationRole.DEVELOPER);
    });

    it('should reject accepting an invitation belonging to another user', async () => {
      const { ownerId, organizationId } = await createOrganizationSetup();

      const invitedUserId = await registerAndGetUserId(app, invitedUser);
      const anotherAgent = await createAuthenticatedAgent(app, anotherUser);

      const invitation = await createInvitation({
        organizationId,
        invitedUserId,
        invitedBy: ownerId,
      });

      await anotherAgent.post(`${baseUrl}/${invitation.id}/accept`).expect(404);
    });

    it('should reject accepting a nonexistent invitation', async () => {
      const agent = await createAuthenticatedAgent(app, invitedUser);

      const randomId = '11111111-1111-4111-8111-111111111111';

      await agent.post(`${baseUrl}/${randomId}/accept`).expect(404);
    });

    it('should mark an expired invitation as expired', async () => {
      const { ownerId, organizationId } = await createOrganizationSetup();

      const invitedAgent = await createAuthenticatedAgent(app, invitedUser);

      const invitedUserResponse = await invitedAgent
        .get('/api/v1/auth/me')
        .expect(200);

      const invitation = await createInvitation({
        organizationId,
        invitedUserId: invitedUserResponse.body.id,
        invitedBy: ownerId,
        expiresAt: new Date(Date.now() - 60 * 1000),
      });

      await invitedAgent.post(`${baseUrl}/${invitation.id}/accept`).expect(409);

      const repository = dataSource.getRepository(OrganizationInvitation);

      const savedInvitation = await repository.findOneBy({
        id: invitation.id,
      });

      expect(savedInvitation?.status).toBe(InvitationStatus.EXPIRED);
    });

    it('should reject an already accepted invitation', async () => {
      const { ownerId, organizationId } = await createOrganizationSetup();

      const invitedAgent = await createAuthenticatedAgent(app, invitedUser);

      const invitedUserResponse = await invitedAgent
        .get('/api/v1/auth/me')
        .expect(200);

      const invitation = await createInvitation({
        organizationId,
        invitedUserId: invitedUserResponse.body.id,
        invitedBy: ownerId,
        status: InvitationStatus.ACCEPTED,
      });

      await invitedAgent.post(`${baseUrl}/${invitation.id}/accept`).expect(409);
    });

    it('should reject accepting when the user is already a member', async () => {
      const { ownerId, organizationId } = await createOrganizationSetup();

      const invitedAgent = await createAuthenticatedAgent(app, invitedUser);

      const invitedUserResponse = await invitedAgent
        .get('/api/v1/auth/me')
        .expect(200);

      await addOrganizationMember(
        dataSource,
        organizationId,
        invitedUserResponse.body.id,
        OrganizationRole.DEVELOPER,
      );

      const invitation = await createInvitation({
        organizationId,
        invitedUserId: invitedUserResponse.body.id,
        invitedBy: ownerId,
      });

      await invitedAgent.post(`${baseUrl}/${invitation.id}/accept`).expect(409);

      const repository = dataSource.getRepository(OrganizationInvitation);

      const savedInvitation = await repository.findOneBy({
        id: invitation.id,
      });

      expect(savedInvitation?.status).toBe(InvitationStatus.CANCELLED);
    });

    it('should reject unauthenticated requests', async () => {
      const randomId = '11111111-1111-4111-8111-111111111111';

      await request(app.getHttpServer())
        .post(`${baseUrl}/${randomId}/accept`)
        .expect(401);
    });
  });

  describe('POST /invitations/:invitationId/decline', () => {
    it('should decline a pending invitation', async () => {
      const { ownerId, organizationId } = await createOrganizationSetup();

      const invitedAgent = await createAuthenticatedAgent(app, invitedUser);

      const invitedUserResponse = await invitedAgent
        .get('/api/v1/auth/me')
        .expect(200);

      const invitation = await createInvitation({
        organizationId,
        invitedUserId: invitedUserResponse.body.id,
        invitedBy: ownerId,
      });

      const response = await invitedAgent
        .post(`${baseUrl}/${invitation.id}/decline`)
        .expect(201);

      expect(response.body.status).toBe(InvitationStatus.DECLINED);

      const repository = dataSource.getRepository(OrganizationInvitation);

      const savedInvitation = await repository.findOneBy({
        id: invitation.id,
      });

      expect(savedInvitation?.status).toBe(InvitationStatus.DECLINED);
    });

    it('should reject declining another user invitation', async () => {
      const { ownerId, organizationId } = await createOrganizationSetup();

      const invitedUserId = await registerAndGetUserId(app, invitedUser);
      const anotherAgent = await createAuthenticatedAgent(app, anotherUser);

      const invitation = await createInvitation({
        organizationId,
        invitedUserId,
        invitedBy: ownerId,
      });

      await anotherAgent
        .post(`${baseUrl}/${invitation.id}/decline`)
        .expect(404);
    });

    it('should mark an expired invitation as expired', async () => {
      const { ownerId, organizationId } = await createOrganizationSetup();

      const invitedAgent = await createAuthenticatedAgent(app, invitedUser);

      const invitedUserResponse = await invitedAgent
        .get('/api/v1/auth/me')
        .expect(200);

      const invitation = await createInvitation({
        organizationId,
        invitedUserId: invitedUserResponse.body.id,
        invitedBy: ownerId,
        expiresAt: new Date(Date.now() - 60 * 1000),
      });

      await invitedAgent
        .post(`${baseUrl}/${invitation.id}/decline`)
        .expect(409);

      const repository = dataSource.getRepository(OrganizationInvitation);

      const savedInvitation = await repository.findOneBy({
        id: invitation.id,
      });

      expect(savedInvitation?.status).toBe(InvitationStatus.EXPIRED);
    });

    it('should reject declining an already processed invitation', async () => {
      const { ownerId, organizationId } = await createOrganizationSetup();

      const invitedAgent = await createAuthenticatedAgent(app, invitedUser);

      const invitedUserResponse = await invitedAgent
        .get('/api/v1/auth/me')
        .expect(200);

      const invitation = await createInvitation({
        organizationId,
        invitedUserId: invitedUserResponse.body.id,
        invitedBy: ownerId,
        status: InvitationStatus.ACCEPTED,
      });

      await invitedAgent
        .post(`${baseUrl}/${invitation.id}/decline`)
        .expect(409);
    });

    it('should reject unauthenticated requests', async () => {
      const randomId = '11111111-1111-4111-8111-111111111111';

      await request(app.getHttpServer())
        .post(`${baseUrl}/${randomId}/decline`)
        .expect(401);
    });
  });

  describe('DELETE /invitations/:invitationId', () => {
    it('should allow the owner to revoke a pending invitation', async () => {
      const { ownerAgent, ownerId, organizationId } =
        await createOrganizationSetup();

      const invitedUserId = await registerAndGetUserId(app, invitedUser);

      const invitation = await createInvitation({
        organizationId,
        invitedUserId,
        invitedBy: ownerId,
      });

      await ownerAgent.delete(`${baseUrl}/${invitation.id}`).expect(204);

      const repository = dataSource.getRepository(OrganizationInvitation);

      const savedInvitation = await repository.findOneBy({
        id: invitation.id,
      });

      expect(savedInvitation?.status).toBe(InvitationStatus.CANCELLED);
    });

    it('should allow a manager to revoke a pending invitation', async () => {
      const { ownerId, organizationId } = await createOrganizationSetup();

      const managerAgent = await createAuthenticatedAgent(app, manager);

      const managerId = await managerAgent
        .get('/api/v1/auth/me')
        .then((response) => response.body.id);

      await addOrganizationMember(
        dataSource,
        organizationId,
        managerId,
        OrganizationRole.MANAGER,
      );

      const invitedUserId = await registerAndGetUserId(app, invitedUser);

      const invitation = await createInvitation({
        organizationId,
        invitedUserId,
        invitedBy: ownerId,
      });

      await managerAgent.delete(`${baseUrl}/${invitation.id}`).expect(204);

      const repository = dataSource.getRepository(OrganizationInvitation);

      const savedInvitation = await repository.findOneBy({
        id: invitation.id,
      });

      expect(savedInvitation?.status).toBe(InvitationStatus.CANCELLED);
    });

    it('should reject a developer from revoking an invitation', async () => {
      const { ownerId, organizationId } = await createOrganizationSetup();

      const developerAgent = await createAuthenticatedAgent(app, developer);

      const developerId = await developerAgent
        .get('/api/v1/auth/me')
        .then((response) => response.body.id);

      await addOrganizationMember(
        dataSource,
        organizationId,
        developerId,
        OrganizationRole.DEVELOPER,
      );

      const invitedUserId = await registerAndGetUserId(app, invitedUser);

      const invitation = await createInvitation({
        organizationId,
        invitedUserId,
        invitedBy: ownerId,
      });

      await developerAgent.delete(`${baseUrl}/${invitation.id}`).expect(403);
    });

    it('should reject a viewer from revoking an invitation', async () => {
      const { ownerId, organizationId } = await createOrganizationSetup();

      const viewerAgent = await createAuthenticatedAgent(app, viewer);

      const viewerId = await viewerAgent
        .get('/api/v1/auth/me')
        .then((response) => response.body.id);

      await addOrganizationMember(
        dataSource,
        organizationId,
        viewerId,
        OrganizationRole.VIEWER,
      );

      const invitedUserId = await registerAndGetUserId(app, invitedUser);

      const invitation = await createInvitation({
        organizationId,
        invitedUserId,
        invitedBy: ownerId,
      });

      await viewerAgent.delete(`${baseUrl}/${invitation.id}`).expect(403);
    });

    it('should reject a user who is not a member of the organization', async () => {
      const { ownerId, organizationId } = await createOrganizationSetup();

      const anotherAgent = await createAuthenticatedAgent(app, anotherUser);

      const invitedUserId = await registerAndGetUserId(app, invitedUser);

      const invitation = await createInvitation({
        organizationId,
        invitedUserId,
        invitedBy: ownerId,
      });

      await anotherAgent.delete(`${baseUrl}/${invitation.id}`).expect(404);
    });

    it('should reject revoking an already accepted invitation', async () => {
      const { ownerAgent, ownerId, organizationId } =
        await createOrganizationSetup();

      const invitedUserId = await registerAndGetUserId(app, invitedUser);

      const invitation = await createInvitation({
        organizationId,
        invitedUserId,
        invitedBy: ownerId,
        status: InvitationStatus.ACCEPTED,
      });

      await ownerAgent.delete(`${baseUrl}/${invitation.id}`).expect(400);
    });

    it('should return 404 for a nonexistent invitation', async () => {
      const ownerAgent = await createAuthenticatedAgent(app, owner);

      const randomId = '11111111-1111-4111-8111-111111111111';

      await ownerAgent.delete(`${baseUrl}/${randomId}`).expect(404);
    });

    it('should reject unauthenticated requests', async () => {
      const randomId = '11111111-1111-4111-8111-111111111111';

      await request(app.getHttpServer())
        .delete(`${baseUrl}/${randomId}`)
        .expect(401);
    });
  });
});
