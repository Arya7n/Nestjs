# NestJS CRUD System - Best Practices Implementation

A production-ready CRUD API built with NestJS, MongoDB, and following all industry best practices.

## 🚀 Features

- ✅ **Complete CRUD Operations** (Create, Read, Update, Delete)
- ✅ **MongoDB with Mongoose** for data persistence
- ✅ **Input Validation** with class-validator
- ✅ **Swagger/OpenAPI Documentation**
- ✅ **Global Exception Handling**
- ✅ **Response Transformation Interceptor**
- ✅ **Pagination, Search & Filtering**
- ✅ **Soft Delete** implementation
- ✅ **Password Hashing** with bcrypt
- ✅ **Unit & E2E Tests**
- ✅ **Clean Architecture** with layered structure
- ✅ **TypeScript** with strict typing
- ✅ **CORS** enabled
- ✅ **Environment Configuration**

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance like MongoDB Atlas)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository** (if applicable)
   ```bash
   cd nestjs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Update the `.env` file with your MongoDB connection string:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/nestjs-crud
   ```

   For MongoDB Atlas (cloud):
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nestjs-crud
   ```

## 🏃 Running the Application

### Development Mode
```bash
npm run start:dev
```

The application will be available at:
- **API**: http://localhost:3000/api
- **Swagger Docs**: http://localhost:3000/api/docs

### Production Mode
```bash
npm run build
npm run start:prod
```

## 📚 API Endpoints

All endpoints are prefixed with `/api`

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users` | Create a new user |
| GET | `/api/users` | Get all users (paginated) |
| GET | `/api/users/:id` | Get user by ID |
| PATCH | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user (soft delete) |

### Query Parameters for GET /api/users

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `search` - Search in firstName, lastName, email
- `role` - Filter by role (admin, user, moderator)
- `isActive` - Filter by active status (true/false)

## 🔍 API Examples

### Create User
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user"
  }'
```

### Get All Users (with pagination)
```bash
curl http://localhost:3000/api/users?page=1&limit=10&search=john
```

### Get User by ID
```bash
curl http://localhost:3000/api/users/507f1f77bcf86cd799439011
```

### Update User
```bash
curl -X PATCH http://localhost:3000/api/users/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{"firstName": "Jane"}'
```

### Delete User
```bash
curl -X DELETE http://localhost:3000/api/users/507f1f77bcf86cd799439011
```

## 🧪 Testing

### Run Unit Tests
```bash
npm run test
```

### Run E2E Tests
```bash
npm run test:e2e
```

### Test Coverage
```bash
npm run test:cov
```

## 🏗️ Project Structure

```
src/
├── common/
│   ├── dto/
│   │   └── pagination.dto.ts          # Reusable pagination DTO
│   ├── filters/
│   │   └── http-exception.filter.ts   # Global exception filter
│   ├── interceptors/
│   │   └── transform.interceptor.ts   # Response transformation
│   ├── interfaces/
│   │   └── pagination-result.interface.ts
│   └── schemas/
│       └── base.schema.ts             # Base schema with common fields
├── users/
│   ├── dto/
│   │   ├── create-user.dto.ts         # Create user validation
│   │   ├── update-user.dto.ts         # Update user validation
│   │   ├── query-user.dto.ts          # Query filters
│   │   └── user-response.dto.ts       # Response DTO (excludes password)
│   ├── schemas/
│   │   └── user.schema.ts             # Mongoose schema
│   ├── users.controller.spec.ts       # Controller unit tests
│   ├── users.controller.ts            # REST endpoints
│   ├── users.module.ts                # Module configuration
│   ├── users.service.spec.ts          # Service unit tests
│   └── users.service.ts               # Business logic
├── app.module.ts                      # Root module
└── main.ts                            # Application entry point

test/
└── users.e2e-spec.ts                  # E2E tests
```

## 🎯 Best Practices Implemented

### 1. **Layered Architecture**
- **Controller**: Handles HTTP requests/responses
- **Service**: Contains business logic
- **Schema**: Defines data structure and validation

### 2. **Data Transfer Objects (DTOs)**
- Input validation with class-validator
- Separate DTOs for create, update, and query operations
- Response DTOs to exclude sensitive data

### 3. **Error Handling**
- Global exception filter
- Consistent error response format
- Proper HTTP status codes

### 4. **Security**
- Password hashing with bcrypt
- Input validation and sanitization
- Password excluded from all responses

### 5. **Database Best Practices**
- Indexes for performance
- Soft delete instead of hard delete
- Proper query optimization

### 6. **API Design**
- RESTful endpoints
- Pagination for list endpoints
- Search and filtering capabilities
- Proper HTTP methods and status codes

### 7. **Documentation**
- Swagger/OpenAPI integration
- Detailed API documentation
- Example requests and responses

### 8. **Testing**
- Unit tests for services and controllers
- E2E tests for complete workflows
- Mocked dependencies

## 🔒 Security Considerations

- Passwords are hashed using bcrypt (10 rounds)
- Passwords never returned in API responses
- Input validation on all endpoints
- CORS enabled for cross-origin requests
- Environment variables for sensitive data

## 📝 Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Response
```json
{
  "statusCode": 404,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/users/123",
  "method": "GET",
  "message": "User with ID 123 not found",
  "error": "Not Found"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": {
    "data": [...],
    "meta": {
      "currentPage": 1,
      "itemsPerPage": 10,
      "totalItems": 100,
      "totalPages": 10,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🚀 Extending the System

To add a new CRUD resource (e.g., Products):

1. **Generate the module**:
   ```bash
   nest g module products
   nest g controller products
   nest g service products
   ```

2. **Create the schema** in `products/schemas/product.schema.ts`

3. **Create DTOs** following the same pattern as Users

4. **Implement service methods** similar to UsersService

5. **Add controller endpoints** with Swagger documentation

6. **Write tests**

## 📦 Dependencies

### Production
- `@nestjs/common` - Core NestJS framework
- `@nestjs/mongoose` - MongoDB integration
- `mongoose` - MongoDB ODM
- `@nestjs/config` - Configuration management
- `@nestjs/swagger` - API documentation
- `class-validator` - DTO validation
- `class-transformer` - Object transformation
- `bcrypt` - Password hashing

### Development
- `@nestjs/testing` - Testing utilities
- `jest` - Testing framework
- `supertest` - HTTP testing

## 📄 License

This project is UNLICENSED (private).

## 🤝 Contributing

Feel free to extend this CRUD system with additional features like:
- JWT Authentication
- Role-based Authorization
- File Upload
- Email Notifications
- Caching with Redis
- Rate Limiting
- Logging with Winston

---

**Built with ❤️ using NestJS**
