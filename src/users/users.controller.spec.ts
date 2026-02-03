import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserRole } from './schemas/user.schema';

describe('UsersController', () => {
    let controller: UsersController;
    let service: UsersService;

    const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.USER,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockUsersService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [
                {
                    provide: UsersService,
                    useValue: mockUsersService,
                },
            ],
        }).compile();

        controller = module.get<UsersController>(UsersController);
        service = module.get<UsersService>(UsersService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should create a user', async () => {
            const createUserDto = {
                email: 'test@example.com',
                password: 'password123',
                firstName: 'John',
                lastName: 'Doe',
            };

            jest.spyOn(service, 'create').mockResolvedValue(mockUser as any);

            const result = await controller.create(createUserDto);

            expect(result).toEqual(mockUser);
            expect(service.create).toHaveBeenCalledWith(createUserDto);
        });
    });

    describe('findAll', () => {
        it('should return paginated users', async () => {
            const queryDto = { page: 1, limit: 10 };
            const paginatedResult = {
                data: [mockUser],
                meta: {
                    currentPage: 1,
                    itemsPerPage: 10,
                    totalItems: 1,
                    totalPages: 1,
                    hasNextPage: false,
                    hasPreviousPage: false,
                },
            };

            jest.spyOn(service, 'findAll').mockResolvedValue(paginatedResult as any);

            const result = await controller.findAll(queryDto);

            expect(result).toEqual(paginatedResult);
            expect(service.findAll).toHaveBeenCalledWith(queryDto);
        });
    });

    describe('findOne', () => {
        it('should return a single user', async () => {
            jest.spyOn(service, 'findOne').mockResolvedValue(mockUser as any);

            const result = await controller.findOne('507f1f77bcf86cd799439011');

            expect(result).toEqual(mockUser);
            expect(service.findOne).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
        });
    });

    describe('update', () => {
        it('should update a user', async () => {
            const updateDto = { firstName: 'Jane' };
            const updatedUser = { ...mockUser, firstName: 'Jane' };

            jest.spyOn(service, 'update').mockResolvedValue(updatedUser as any);

            const result = await controller.update('507f1f77bcf86cd799439011', updateDto);

            expect(result).toEqual(updatedUser);
            expect(service.update).toHaveBeenCalledWith('507f1f77bcf86cd799439011', updateDto);
        });
    });

    describe('remove', () => {
        it('should delete a user', async () => {
            jest.spyOn(service, 'remove').mockResolvedValue(undefined);

            const result = await controller.remove('507f1f77bcf86cd799439011');

            expect(result).toBeUndefined();
            expect(service.remove).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
        });
    });
});
