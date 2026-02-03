import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';

describe('UsersController (e2e)', () => {
    let app: INestApplication;
    let createdUserId: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();

        // Apply same configuration as main.ts
        app.setGlobalPrefix('api');
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
                transformOptions: {
                    enableImplicitConversion: true,
                },
            }),
        );
        app.useGlobalFilters(new HttpExceptionFilter());
        app.useGlobalInterceptors(new TransformInterceptor());

        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('/api/users (POST)', () => {
        it('should create a new user', () => {
            return request(app.getHttpServer())
                .post('/api/users')
                .send({
                    email: 'e2e@example.com',
                    password: 'password123',
                    firstName: 'E2E',
                    lastName: 'Test',
                })
                .expect(201)
                .then((response) => {
                    expect(response.body.success).toBe(true);
                    expect(response.body.data).toHaveProperty('_id');
                    expect(response.body.data.email).toBe('e2e@example.com');
                    expect(response.body.data).not.toHaveProperty('password');
                    createdUserId = response.body.data._id;
                });
        });

        it('should return 409 for duplicate email', () => {
            return request(app.getHttpServer())
                .post('/api/users')
                .send({
                    email: 'e2e@example.com',
                    password: 'password123',
                    firstName: 'E2E',
                    lastName: 'Test',
                })
                .expect(409);
        });

        it('should return 400 for invalid email', () => {
            return request(app.getHttpServer())
                .post('/api/users')
                .send({
                    email: 'invalid-email',
                    password: 'password123',
                    firstName: 'E2E',
                    lastName: 'Test',
                })
                .expect(400);
        });

        it('should return 400 for short password', () => {
            return request(app.getHttpServer())
                .post('/api/users')
                .send({
                    email: 'short@example.com',
                    password: '123',
                    firstName: 'E2E',
                    lastName: 'Test',
                })
                .expect(400);
        });
    });

    describe('/api/users (GET)', () => {
        it('should return paginated users', () => {
            return request(app.getHttpServer())
                .get('/api/users')
                .expect(200)
                .then((response) => {
                    expect(response.body.success).toBe(true);
                    expect(response.body.data).toHaveProperty('data');
                    expect(response.body.data).toHaveProperty('meta');
                    expect(Array.isArray(response.body.data.data)).toBe(true);
                });
        });

        it('should filter users by search', () => {
            return request(app.getHttpServer())
                .get('/api/users?search=e2e')
                .expect(200)
                .then((response) => {
                    expect(response.body.success).toBe(true);
                    expect(response.body.data.data).toEqual(
                        expect.arrayContaining([
                            expect.objectContaining({ email: 'e2e@example.com' }),
                        ]),
                    );
                });
        });

        it('should paginate results', () => {
            return request(app.getHttpServer())
                .get('/api/users?page=1&limit=5')
                .expect(200)
                .then((response) => {
                    expect(response.body.data.meta.currentPage).toBe(1);
                    expect(response.body.data.meta.itemsPerPage).toBe(5);
                });
        });
    });

    describe('/api/users/:id (GET)', () => {
        it('should return a single user', () => {
            return request(app.getHttpServer())
                .get(`/api/users/${createdUserId}`)
                .expect(200)
                .then((response) => {
                    expect(response.body.success).toBe(true);
                    expect(response.body.data._id).toBe(createdUserId);
                    expect(response.body.data).not.toHaveProperty('password');
                });
        });

        it('should return 400 for invalid ID format', () => {
            return request(app.getHttpServer())
                .get('/api/users/invalid-id')
                .expect(400);
        });

        it('should return 404 for non-existent user', () => {
            return request(app.getHttpServer())
                .get('/api/users/507f1f77bcf86cd799439999')
                .expect(404);
        });
    });

    describe('/api/users/:id (PATCH)', () => {
        it('should update a user', () => {
            return request(app.getHttpServer())
                .patch(`/api/users/${createdUserId}`)
                .send({ firstName: 'Updated' })
                .expect(200)
                .then((response) => {
                    expect(response.body.success).toBe(true);
                    expect(response.body.data.firstName).toBe('Updated');
                });
        });

        it('should return 404 for non-existent user', () => {
            return request(app.getHttpServer())
                .patch('/api/users/507f1f77bcf86cd799439999')
                .send({ firstName: 'Updated' })
                .expect(404);
        });
    });

    describe('/api/users/:id (DELETE)', () => {
        it('should delete a user', () => {
            return request(app.getHttpServer())
                .delete(`/api/users/${createdUserId}`)
                .expect(204);
        });

        it('should return 404 for already deleted user', () => {
            return request(app.getHttpServer())
                .delete(`/api/users/${createdUserId}`)
                .expect(404);
        });

        it('should return 404 for non-existent user', () => {
            return request(app.getHttpServer())
                .delete('/api/users/507f1f77bcf86cd799439999')
                .expect(404);
        });
    });
});
