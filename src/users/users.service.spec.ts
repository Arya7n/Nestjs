import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User, UserRole } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
    let service: UsersService;
    let model: Model<User>;

    const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.USER,
        isActive: true,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockUserModel = {
        new: jest.fn().mockResolvedValue(mockUser),
        constructor: jest.fn().mockResolvedValue(mockUser),
        find: jest.fn(),
        findOne: jest.fn(),
        findOneAndUpdate: jest.fn(),
        updateOne: jest.fn(),
        create: jest.fn(),
        countDocuments: jest.fn(),
        exec: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: getModelToken(User.name),
                    useValue: mockUserModel,
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        model = module.get<Model<User>>(getModelToken(User.name));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a new user', async () => {
            const createUserDto = {
                email: 'test@example.com',
                password: 'password123',
                firstName: 'John',
                lastName: 'Doe',
            };

            jest.spyOn(mockUserModel, 'findOne').mockReturnValueOnce({
                exec: jest.fn().mockResolvedValueOnce(null),
            } as any);

            jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('hashedPassword'));

            const saveMock = jest.fn().mockResolvedValue(mockUser);
            mockUserModel.constructor.mockImplementation(() => ({
                save: saveMock,
            }));

            const result = await service.create(createUserDto);

            expect(result).toBeDefined();
            expect(saveMock).toHaveBeenCalled();
        });

        it('should throw ConflictException if email exists', async () => {
            const createUserDto = {
                email: 'test@example.com',
                password: 'password123',
                firstName: 'John',
                lastName: 'Doe',
            };

            jest.spyOn(mockUserModel, 'findOne').mockReturnValueOnce({
                exec: jest.fn().mockResolvedValueOnce(mockUser),
            } as any);

            await expect(service.create(createUserDto)).rejects.toThrow(
                ConflictException,
            );
        });
    });

    describe('findAll', () => {
        it('should return paginated users', async () => {
            const queryDto = { page: 1, limit: 10 };
            const users = [mockUser];

            jest.spyOn(mockUserModel, 'find').mockReturnValueOnce({
                select: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValueOnce(users),
            } as any);

            jest.spyOn(mockUserModel, 'countDocuments').mockReturnValueOnce({
                exec: jest.fn().mockResolvedValueOnce(1),
            } as any);

            const result = await service.findAll(queryDto);

            expect(result).toHaveProperty('data');
            expect(result).toHaveProperty('meta');
            expect(result.data).toEqual(users);
            expect(result.meta.totalItems).toBe(1);
        });
    });

    describe('findOne', () => {
        it('should return a user by id', async () => {
            jest.spyOn(mockUserModel, 'findOne').mockReturnValueOnce({
                select: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValueOnce(mockUser),
            } as any);

            const result = await service.findOne('507f1f77bcf86cd799439011');

            expect(result).toEqual(mockUser);
        });

        it('should throw NotFoundException if user not found', async () => {
            jest.spyOn(mockUserModel, 'findOne').mockReturnValueOnce({
                select: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValueOnce(null),
            } as any);

            await expect(service.findOne('507f1f77bcf86cd799439011')).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('update', () => {
        it('should update a user', async () => {
            const updateDto = { firstName: 'Jane' };

            jest.spyOn(mockUserModel, 'findOneAndUpdate').mockReturnValueOnce({
                select: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValueOnce({ ...mockUser, ...updateDto }),
            } as any);

            const result = await service.update('507f1f77bcf86cd799439011', updateDto);

            expect(result.firstName).toBe('Jane');
        });

        it('should throw NotFoundException if user not found', async () => {
            jest.spyOn(mockUserModel, 'findOneAndUpdate').mockReturnValueOnce({
                select: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValueOnce(null),
            } as any);

            await expect(
                service.update('507f1f77bcf86cd799439011', {}),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('should soft delete a user', async () => {
            jest.spyOn(mockUserModel, 'updateOne').mockReturnValueOnce({
                exec: jest.fn().mockResolvedValueOnce({ matchedCount: 1 }),
            } as any);

            await expect(
                service.remove('507f1f77bcf86cd799439011'),
            ).resolves.not.toThrow();
        });

        it('should throw NotFoundException if user not found', async () => {
            jest.spyOn(mockUserModel, 'updateOne').mockReturnValueOnce({
                exec: jest.fn().mockResolvedValueOnce({ matchedCount: 0 }),
            } as any);

            await expect(service.remove('507f1f77bcf86cd799439011')).rejects.toThrow(
                NotFoundException,
            );
        });
    });
});
