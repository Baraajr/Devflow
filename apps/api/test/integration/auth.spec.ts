import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import request from 'supertest';

import { createTestApp } from '../helpers/create-test-app';
import { cleanDatabase } from '../helpers/clean-database';

describe('Auth Integration', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  const baseUrl = '/api/v1/auth';

  const validUser = {
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    password: 'Password123',
    passwordConfirm: 'Password123',
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

  describe('POST /auth/register', () => {
    it('should register a user successfully', async () => {
      const response = await request(app.getHttpServer())
        .post(`${baseUrl}/register`)
        .send(validUser)
        .expect(201);

      expect(response.body).toMatchObject({
        email: validUser.email,
        firstName: validUser.firstName,
        lastName: validUser.lastName,
      });

      expect(response.body).not.toHaveProperty('password');
      expect(response.body).not.toHaveProperty('passwordHash');

      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toContain('access_token=');
    });

    it('should reject duplicate email', async () => {
      await request(app.getHttpServer())
        .post(`${baseUrl}/register`)
        .send(validUser)
        .expect(201);

      const response = await request(app.getHttpServer())
        .post(`${baseUrl}/register`)
        .send({
          ...validUser,
          firstName: 'Another',
        })
        .expect(409);

      expect(response.body).toBeDefined();
    });

    it('should reject invalid email', async () => {
      const response = await request(app.getHttpServer())
        .post(`${baseUrl}/register`)
        .send({
          ...validUser,
          email: 'invalid-email',
        })
        .expect(400);

      expect(response.body).toBeDefined();
    });

    it('should reject missing email', async () => {
      const { email, ...data } = validUser;

      await request(app.getHttpServer())
        .post(`${baseUrl}/register`)
        .send(data)
        .expect(400);
    });

    it('should reject missing first name', async () => {
      const { firstName, ...data } = validUser;

      await request(app.getHttpServer())
        .post(`${baseUrl}/register`)
        .send(data)
        .expect(400);
    });

    it('should reject missing last name', async () => {
      const { lastName, ...data } = validUser;

      await request(app.getHttpServer())
        .post(`${baseUrl}/register`)
        .send(data)
        .expect(400);
    });

    it('should reject when passwords do not match', async () => {
      await request(app.getHttpServer())
        .post(`${baseUrl}/register`)
        .send({
          ...validUser,
          passwordConfirm: 'DifferentPassword123',
        })
        .expect(400);
    });

    it('should reject a password that does not satisfy validation rules', async () => {
      await request(app.getHttpServer())
        .post(`${baseUrl}/register`)
        .send({
          ...validUser,
          password: '123',
          passwordConfirm: '123',
        })
        .expect(400);
    });

    it('should reject missing password', async () => {
      const { password, passwordConfirm, ...data } = validUser;

      await request(app.getHttpServer())
        .post(`${baseUrl}/register`)
        .send(data)
        .expect(400);
    });

    it('should reject missing password confirmation', async () => {
      const { passwordConfirm, ...data } = validUser;

      await request(app.getHttpServer())
        .post(`${baseUrl}/register`)
        .send(data)
        .expect(400);
    });

    it('should reject an empty request body', async () => {
      await request(app.getHttpServer())
        .post(`${baseUrl}/register`)
        .send({})
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post(`${baseUrl}/register`)
        .send(validUser)
        .expect(201);
    });

    it('should login successfully with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post(`${baseUrl}/login`)
        .send({
          email: validUser.email,
          password: validUser.password,
        })
        .expect(200);

      expect(response.body).toMatchObject({
        email: validUser.email,
        firstName: validUser.firstName,
        lastName: validUser.lastName,
      });

      expect(response.body).not.toHaveProperty('password');
      expect(response.body).not.toHaveProperty('passwordHash');

      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toContain('access_token=');
    });

    it('should reject an incorrect password', async () => {
      const response = await request(app.getHttpServer())
        .post(`${baseUrl}/login`)
        .send({
          email: validUser.email,
          password: 'WrongPassword123',
        })
        .expect(401);

      expect(response.body).toBeDefined();
    });

    it('should reject a non-existing email', async () => {
      const response = await request(app.getHttpServer())
        .post(`${baseUrl}/login`)
        .send({
          email: 'unknown@example.com',
          password: validUser.password,
        })
        .expect(401);

      expect(response.body).toBeDefined();
    });

    it('should reject an invalid email', async () => {
      await request(app.getHttpServer())
        .post(`${baseUrl}/login`)
        .send({
          email: 'invalid-email',
          password: validUser.password,
        })
        .expect(400);
    });

    it('should reject missing email', async () => {
      await request(app.getHttpServer())
        .post(`${baseUrl}/login`)
        .send({
          password: validUser.password,
        })
        .expect(400);
    });

    it('should reject missing password', async () => {
      await request(app.getHttpServer())
        .post(`${baseUrl}/login`)
        .send({
          email: validUser.email,
        })
        .expect(400);
    });

    it('should reject an empty request body', async () => {
      await request(app.getHttpServer())
        .post(`${baseUrl}/login`)
        .send({})
        .expect(400);
    });
  });

  describe('GET /auth/me', () => {
    it('should return the authenticated user', async () => {
      const agent = request.agent(app.getHttpServer());

      await agent.post(`${baseUrl}/register`).send(validUser).expect(201);

      const response = await agent.get(`${baseUrl}/me`).expect(200);

      expect(response.body).toMatchObject({
        email: validUser.email,
        firstName: validUser.firstName,
        lastName: validUser.lastName,
      });

      expect(response.body).not.toHaveProperty('password');
      expect(response.body).not.toHaveProperty('passwordHash');
    });

    it('should reject unauthenticated requests', async () => {
      await request(app.getHttpServer()).get(`${baseUrl}/me`).expect(401);
    });

    it('should reject an invalid authentication cookie', async () => {
      await request(app.getHttpServer())
        .get(`${baseUrl}/me`)
        .set('Cookie', 'access_token=invalid-token')
        .expect(401);
    });

    it('should reject an empty authentication cookie', async () => {
      await request(app.getHttpServer())
        .get(`${baseUrl}/me`)
        .set('Cookie', 'access_token=')
        .expect(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout successfully', async () => {
      const agent = request.agent(app.getHttpServer());

      await agent.post(`${baseUrl}/register`).send(validUser).expect(201);

      await agent.post(`${baseUrl}/logout`).expect(200);
    });

    it('should clear the authentication cookie', async () => {
      const agent = request.agent(app.getHttpServer());

      const registerResponse = await agent
        .post(`${baseUrl}/register`)
        .send(validUser)
        .expect(201);

      expect(registerResponse.headers['set-cookie'][0]).toContain(
        'access_token=',
      );

      const logoutResponse = await agent.post(`${baseUrl}/logout`).expect(200);

      expect(logoutResponse.body).toEqual({
        message: 'Logged out successfully',
      });

      expect(logoutResponse.headers['set-cookie']).toBeDefined();
      expect(logoutResponse.headers['set-cookie'][0]).toContain(
        'access_token=;',
      );
    });

    it('should be idempotent when called without authentication', async () => {
      const response = await request(app.getHttpServer())
        .post(`${baseUrl}/logout`)
        .expect(200);

      expect(response.body).toEqual({
        message: 'Logged out successfully',
      });
    });

    it('should no longer authenticate the user after logout', async () => {
      const agent = request.agent(app.getHttpServer());

      await agent.post(`${baseUrl}/register`).send(validUser).expect(201);

      await agent.get(`${baseUrl}/me`).expect(200);

      await agent.post(`${baseUrl}/logout`).expect(200);

      await agent.get(`${baseUrl}/me`).expect(401);
    });
  });
});
