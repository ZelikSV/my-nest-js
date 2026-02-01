import { Type } from './types';
import { NestApplication } from './http';
import type { INestApplication } from './interfaces';

export class NestFactory {
  static async create(module: Type): Promise<INestApplication> {
    console.log('\n=== Mini-Nest Framework ===\n');
    console.log(`[NestFactory] Creating application with ${module.name}\n`);

    const app = new NestApplication(module);
    return app;
  }
}
