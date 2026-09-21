import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';

import { OrganizationMember } from '../../src/organization/entities/organization-members.entity';
import { OrganizationRole } from '../../src/organization/enums/organization-role.enum';

export interface TestUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  passwordConfirm?: string;
}

interface AuthMeResponse {
  id: string;
}

export const TEST_PASSWORD = 'Password123';

export const owner: TestUser = {
  email: 'owner@example.com',
  firstName: 'Test',
  lastName: 'Owner',
  password: TEST_PASSWORD,
  passwordConfirm: TEST_PASSWORD,
};

export const manager: TestUser = {
  email: 'manager@example.com',
  firstName: 'Test',
  lastName: 'Manager',
  password: TEST_PASSWORD,
  passwordConfirm: TEST_PASSWORD,
};

export const developer: TestUser = {
  email: 'developer@example.com',
  firstName: 'Test',
  lastName: 'Developer',
  password: TEST_PASSWORD,
  passwordConfirm: TEST_PASSWORD,
};

export const viewer: TestUser = {
  email: 'viewer@example.com',
  firstName: 'Test',
  lastName: 'Viewer',
  password: TEST_PASSWORD,
  passwordConfirm: TEST_PASSWORD,
};

export const member: TestUser = {
  email: 'member@example.com',
  firstName: 'Test',
  lastName: 'Member',
  password: TEST_PASSWORD,
};

export const invitedUser: TestUser = {
  email: 'invited@example.com',
  firstName: 'Invited',
  lastName: 'User',
  password: TEST_PASSWORD,
  passwordConfirm: TEST_PASSWORD,
};

export const anotherUser: TestUser = {
  email: 'another@example.com',
  firstName: 'Another',
  lastName: 'User',
  password: TEST_PASSWORD,
  passwordConfirm: TEST_PASSWORD,
};

export const invitationOrganization = {
  name: 'Invitation Test Organization',
  description: 'Organization used for invitation integration tests',
};

export const organization = {
  name: 'Test Organization',
  description: 'Test organization description',
};

export const createAuthenticatedAgent = async (
  app: INestApplication,
  user: TestUser,
): Promise<request.Agent> => {
  const httpServer = app.getHttpServer() as Parameters<typeof request.agent>[0];

  const agent = request.agent(httpServer);

  await agent.post('/api/v1/auth/register').send(user).expect(201);

  await agent
    .post('/api/v1/auth/login')
    .send({
      email: user.email,
      password: user.password,
    })
    .expect(200);

  return agent;
};

export const registerAndGetUserId = async (
  app: INestApplication,
  user: TestUser,
): Promise<string> => {
  const agent = await createAuthenticatedAgent(app, user);

  const response = await agent.get('/api/v1/auth/me').expect(200);

  const body = response.body as AuthMeResponse;

  return body.id;
};

export const createOrganization = async (
  agent: request.Agent,
  data: {
    name: string;
    description?: string;
  },
) => {
  return agent.post('/api/v1/organization').send(data).expect(201);
};

export const addOrganizationMember = async (
  dataSource: DataSource,
  organizationId: string,
  userId: string,
  role: OrganizationRole,
): Promise<OrganizationMember> => {
  const repository = dataSource.getRepository(OrganizationMember);

  const member = repository.create({
    organizationId,
    userId,
    role,
  });

  return repository.save(member);
};
