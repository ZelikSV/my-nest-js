import { z } from 'zod';
import { Module } from '../core';
import { BooksModule } from './books/books.module';
import { ConfigModule } from './config/config.module';

const configSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      schema: configSchema,
      isGlobal: true,
    }),
    BooksModule,
  ],
})
export class AppModule {}
