# Mini-NestJS

A minimalist implementation of NestJS core functionality with decorators, IoC container, module system, and Express adapter.

## Installation

```bash
pnpm install
```

or

```bash
npm install
```

## Running the Demo Project

### Development Mode

```bash
npm run dev
```

Server will start on `http://localhost:3002`

### Production Build

```bash
npm run build
```

Compiled files will be in the `dist/` directory

## API Usage Examples

### Get All Books

```bash
curl -H "x-role: admin" http://localhost:3002/books
```

or

```bash
curl -H "x-role: user" http://localhost:3002/books
```

### Get Book by ID

```bash
curl -H "x-role: user" http://localhost:3002/books/1
```

### Create a New Book

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "x-role: admin" \
  -d '{"title": "New Book", "author": "Author Name"}' \
  http://localhost:3002/books
```

### Update a Book

```bash
curl -X PUT \
  -H "Content-Type: application/json" \
  -H "x-role: admin" \
  -d '{"title": "Updated Book", "author": "Updated Author"}' \
  http://localhost:3002/books/1
```

### Delete a Book

```bash
curl -X DELETE \
  -H "x-role: admin" \
  http://localhost:3002/books/1
```

## Access Roles

- **admin** - full access (GET, POST, PUT, DELETE)
- **user** - read-only access (GET)

Without the `x-role` header, you will receive a `403 Forbidden` error

## Project Structure

```
my-nest-js/
├── core/                    # Framework core
│   ├── decorators/          # Decorators (@Controller, @Get, @Injectable, etc.)
│   ├── exceptions/          # HTTP exceptions
│   ├── http/                # HTTP application and router
│   ├── interfaces/          # TypeScript interfaces
│   ├── providers/           # Reflector and other providers
│   ├── utils/               # Utilities
│   ├── constants.ts         # Metadata constants
│   ├── container.ts         # IoC container
│   ├── nest-factory.ts      # Application factory
│   └── types.ts             # Common types
├── demo/                    # Demo application
│   ├── books/               # Books module
│   ├── common/              # Guards, Filters, Interceptors, Pipes
│   ├── config/              # Configuration
│   └── app.module.ts        # Main module
├── main.ts                  # Entry point
└── package.json
```

## Key Features

- **Decorators**: @Controller, @Get, @Post, @Put, @Delete, @Injectable, @Module
- **Dependency Injection**: IoC container with automatic dependency resolution
- **Guards**: Route protection (RolesGuard)
- **Interceptors**: Request/response logging
- **Pipes**: Data validation and transformation (ZodValidationPipe, ParseIntPipe)
- **Exception Filters**: Error handling
- **Module System**: Code organization into modules

## Request Execution Order

1. Global Pipes → Controller Pipes → Method Pipes → Param Pipes
2. Guard (canActivate)
3. Interceptor (before)
4. Handler
5. Interceptor (after)
6. Filter (on error)

## Technologies

- TypeScript
- Express.js
- Reflect Metadata
- Zod (validation)

## Port Configuration

The port can be changed via the `PORT` environment variable in the `.env` file:

```bash
PORT=3002
```

Default port is `3002`
