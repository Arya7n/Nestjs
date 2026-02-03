import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../schemas/user.schema';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserResponseDto {
    @Expose()
    @ApiProperty()
    _id: string;

    @Expose()
    @ApiProperty()
    email: string;

    @Expose()
    @ApiProperty()
    firstName: string;

    @Expose()
    @ApiProperty()
    lastName: string;

    @Expose()
    @ApiProperty({ enum: UserRole })
    role: UserRole;

    @Expose()
    @ApiProperty()
    isActive: boolean;

    @Expose()
    @ApiProperty()
    createdAt: Date;

    @Expose()
    @ApiProperty()
    updatedAt: Date;

    // Password is automatically excluded due to @Exclude() decorator on class
}
