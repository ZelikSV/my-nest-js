import 'reflect-metadata';
import { NestFactory } from './core';
import { AppModule } from './demo/app.module';
import { HttpExceptionFilter } from './demo/common/filters/http-exception.filter';

/**
 * Bootstrap the application
 *
 * Demonstrates the full Mini-Nest framework:
 *
 * Execution order for each request:
 * 1. Global Pipes → Controller Pipes → Method Pipes → Param Pipes
 * 2. Guard (canActivate)
 * 3. Interceptor (before)
 * 4. Handler
 * 5. Interceptor (after)
 * 6. Filter (on error)
 *
 * Test with:
 * # GET all books (requires x-role: admin or user)
 * curl -H "x-role: admin" http://localhost:3000/books
 *
 * # GET book by id (ParseIntPipe transforms string to number)
 * curl -H "x-role: user" http://localhost:3000/books/1
 *
 * # POST create book (requires x-role: admin, ZodValidationPipe validates body)
 * curl -X POST -H "Content-Type: application/json" -H "x-role: admin" \
 *   -d '{"title": "New Book", "author": "Author"}' \
 *   http://localhost:3000/books
 *
 * # POST with invalid data (400 Bad Request)
 * curl -X POST -H "Content-Type: application/json" -H "x-role: admin" \
 *   -d '{}' \
 *   http://localhost:3000/books
 *
 * # GET without role (403 Forbidden)
 * curl http://localhost:3000/books
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Register global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Get port from config or use default
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3002;

  await app.listen(port, () => {
    console.log(`
=== Mini-Nest Demo ===

Available endpoints:
  GET    /books      - List all books (role: admin, user)
  GET    /books/:id  - Get book by ID (role: admin, user)
  POST   /books      - Create book (role: admin)
  PUT    /books/:id  - Update book (role: admin)
  DELETE /books/:id  - Delete book (role: admin)

Required header: x-role: admin|user

Example requests:
  curl -H "x-role: admin" http://localhost:${port}/books
  curl -H "x-role: user" http://localhost:${port}/books/1
  curl -X POST -H "Content-Type: application/json" -H "x-role: admin" \\
    -d '{"title": "New Book"}' http://localhost:${port}/books
`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
