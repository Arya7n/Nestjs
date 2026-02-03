import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { PaginationResult } from '../common/interfaces/pagination-result.interface';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
    ) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        // Check if email already exists
        const existingUser = await this.userModel
            .findOne({ email: createUserDto.email, isDeleted: false })
            .exec();

        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

        const createdUser = new this.userModel({
            ...createUserDto,
            password: hashedPassword,
        });

        return createdUser.save();
    }

    async findAll(queryDto: QueryUserDto): Promise<PaginationResult<User>> {
        const { page = 1, limit = 10, search, role, isActive } = queryDto;

        // Build filter query
        const filter: any = { isDeleted: false };

        if (search) {
            filter.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }

        if (role) {
            filter.role = role;
        }

        if (isActive !== undefined) {
            filter.isActive = isActive;
        }

        // Execute query with pagination
        const skip = (page - 1) * limit;
        const [data, totalItems] = await Promise.all([
            this.userModel
                .find(filter)
                .select('-password')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .exec(),
            this.userModel.countDocuments(filter).exec(),
        ]);

        const totalPages = Math.ceil(totalItems / limit);

        return {
            data,
            meta: {
                currentPage: page,
                itemsPerPage: limit,
                totalItems,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        };
    }

    async findOne(id: string): Promise<User> {
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            throw new BadRequestException('Invalid ID format');
        }

        const user = await this.userModel
            .findOne({ _id: id, isDeleted: false })
            .select('-password')
            .exec();

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return user;
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            throw new BadRequestException('Invalid ID format');
        }

        const user = await this.userModel
            .findOneAndUpdate(
                { _id: id, isDeleted: false },
                { $set: updateUserDto },
                { new: true },
            )
            .select('-password')
            .exec();

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return user;
    }

    async remove(id: string): Promise<void> {
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            throw new BadRequestException('Invalid ID format');
        }

        // Soft delete
        const result = await this.userModel
            .updateOne(
                { _id: id, isDeleted: false },
                { $set: { isDeleted: true, deletedAt: new Date() } },
            )
            .exec();

        if (result.matchedCount === 0) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
    }

    // Additional useful methods
    async findByEmail(email: string): Promise<User | null> {
        return this.userModel.findOne({ email, isDeleted: false }).exec();
    }

    async count(): Promise<number> {
        return this.userModel.countDocuments({ isDeleted: false }).exec();
    }
}
