import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;

  const usersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
  };

  const jwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersService,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should create a user and return an auth response', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      usersService.create.mockResolvedValue({
        id: 'user-id',
        email: 'test@gmail.com',
        firstName: 'test',
        lastName: 'user',
        profileImage: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        passwordHash: 'hashed-password',
      });

      jwtService.signAsync.mockResolvedValue('mock-token');

      const result = await service.register({
        email: 'test@gmail.com',
        firstName: 'test',
        lastName: 'user',
        password: 'test1234',
        passwordConfirm: 'test1234',
      });

      expect(usersService.findByEmail).toHaveBeenCalledTimes(1);
      expect(usersService.findByEmail).toHaveBeenCalledWith('test@gmail.com');

      expect(bcrypt.hash).toHaveBeenCalledTimes(1);
      expect(bcrypt.hash).toHaveBeenCalledWith('test1234', 12);

      expect(usersService.create).toHaveBeenCalledTimes(1);
      expect(usersService.create).toHaveBeenCalledWith({
        email: 'test@gmail.com',
        firstName: 'test',
        lastName: 'user',
        passwordHash: 'hashed-password',
      });

      expect(jwtService.signAsync).toHaveBeenCalledTimes(1);
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: 'user-id',
        email: 'test@gmail.com',
      });

      expect(result).toEqual({
        accessToken: 'mock-token',
        user: {
          id: 'user-id',
          email: 'test@gmail.com',
          firstName: 'test',
          lastName: 'user',
          profileImage: null,
          isActive: true,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      });

      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it('should normalize email and names before creating the user', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      usersService.create.mockResolvedValue({
        id: 'user-id',
        email: 'test@gmail.com',
        firstName: 'John',
        lastName: 'Doe',
        profileImage: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      jwtService.signAsync.mockResolvedValue('mock-token');

      await service.register({
        email: '  TEST@GMAIL.COM  ',
        firstName: '  John ',
        lastName: ' Doe  ',
        password: 'test1234',
        passwordConfirm: 'test1234',
      });

      expect(usersService.findByEmail).toHaveBeenCalledWith('test@gmail.com');

      expect(usersService.create).toHaveBeenCalledWith({
        email: 'test@gmail.com',
        firstName: 'John',
        lastName: 'Doe',
        passwordHash: 'hashed-password',
      });
    });

    it('should throw if user already exists', async () => {
      usersService.findByEmail.mockResolvedValue({
        id: 'existing-user',
        email: 'test@gmail.com',
      });

      const promise = service.register({
        email: 'test@gmail.com',
        firstName: 'test',
        lastName: 'user',
        password: 'test1234',
        passwordConfirm: 'test1234',
      });

      await expect(promise).rejects.toThrow(ConflictException);

      await expect(promise).rejects.toThrow('Email is already registered');

      expect(usersService.findByEmail).toHaveBeenCalledTimes(1);

      expect(usersService.create).not.toHaveBeenCalled();

      expect(bcrypt.hash).not.toHaveBeenCalled();

      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const validUser = {
      id: 'user-id',
      email: 'test@gmail.com',
      firstName: 'test',
      lastName: 'user',
      passwordHash: 'hashed-password',
      profileImage: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should login the user with valid credentials', async () => {
      usersService.findByEmail.mockResolvedValue(validUser);

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      jwtService.signAsync.mockResolvedValue('mock-token');

      const result = await service.login({
        email: 'test@gmail.com',
        password: 'test1234',
      });

      expect(usersService.findByEmail).toHaveBeenCalledTimes(1);

      expect(usersService.findByEmail).toHaveBeenCalledWith('test@gmail.com');

      expect(bcrypt.compare).toHaveBeenCalledTimes(1);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'test1234',
        'hashed-password',
      );

      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: 'user-id',
        email: 'test@gmail.com',
      });

      expect(result).toEqual({
        accessToken: 'mock-token',
        user: {
          id: 'user-id',
          email: 'test@gmail.com',
          firstName: 'test',
          lastName: 'user',
          profileImage: null,
          isActive: true,
          createdAt: validUser.createdAt,
          updatedAt: validUser.updatedAt,
        },
      });

      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it('should normalize the email before searching', async () => {
      usersService.findByEmail.mockResolvedValue(validUser);

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      jwtService.signAsync.mockResolvedValue('mock-token');

      await service.login({
        email: '  TEST@GMAIL.COM  ',
        password: 'test1234',
      });

      expect(usersService.findByEmail).toHaveBeenCalledWith('test@gmail.com');
    });

    it('should throw if user does not exist', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      const promise = service.login({
        email: 'test@gmail.com',
        password: 'test1234',
      });

      await expect(promise).rejects.toThrow(UnauthorizedException);

      await expect(promise).rejects.toThrow('Invalid email or password');

      expect(usersService.findByEmail).toHaveBeenCalledTimes(1);

      expect(bcrypt.compare).not.toHaveBeenCalled();

      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should throw if user is inactive', async () => {
      usersService.findByEmail.mockResolvedValue({
        ...validUser,
        isActive: false,
      });

      const promise = service.login({
        email: 'test@gmail.com',
        password: 'test1234',
      });

      await expect(promise).rejects.toThrow(UnauthorizedException);

      await expect(promise).rejects.toThrow('Account is inactive');

      expect(usersService.findByEmail).toHaveBeenCalledTimes(1);

      expect(bcrypt.compare).not.toHaveBeenCalled();

      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should throw if password is incorrect', async () => {
      usersService.findByEmail.mockResolvedValue(validUser);

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const promise = service.login({
        email: 'test@gmail.com',
        password: 'wrong-password',
      });

      await expect(promise).rejects.toThrow(UnauthorizedException);

      await expect(promise).rejects.toThrow('Invalid email or password');

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'wrong-password',
        'hashed-password',
      );

      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
  });

  describe('validateUser', () => {
    it('should return null if user does not exist', async () => {
      usersService.findById.mockResolvedValue(null);

      const result = await service.validateUser('user-id');

      expect(result).toBeNull();

      expect(usersService.findById).toHaveBeenCalledTimes(1);

      expect(usersService.findById).toHaveBeenCalledWith('user-id');
    });

    it('should return null if user is inactive', async () => {
      usersService.findById.mockResolvedValue({
        id: 'user-id',
        email: 'test@gmail.com',
        firstName: 'test',
        lastName: 'user',
        profileImage: null,
        isActive: false,
      });

      const result = await service.validateUser('user-id');

      expect(result).toBeNull();

      expect(usersService.findById).toHaveBeenCalledWith('user-id');
    });

    it('should return the sanitized user if user is active', async () => {
      usersService.findById.mockResolvedValue({
        id: 'user-id',
        email: 'test@gmail.com',
        firstName: 'test',
        lastName: 'user',
        profileImage: 'profile.jpg',
        isActive: true,
        passwordHash: 'secret-hash',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.validateUser('user-id');

      expect(result).toEqual({
        id: 'user-id',
        email: 'test@gmail.com',
        firstName: 'test',
        lastName: 'user',
        profileImage: 'profile.jpg',
      });

      expect(result).not.toHaveProperty('passwordHash');
      expect(result).not.toHaveProperty('isActive');
      expect(result).not.toHaveProperty('createdAt');
      expect(result).not.toHaveProperty('updatedAt');
    });
  });
});
