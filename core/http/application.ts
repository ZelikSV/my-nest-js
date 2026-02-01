import express, { Express } from 'express';
import { Server } from 'http';
import { container } from '../container';
import {
  Type,
  ModuleMetadata,
  Provider,
  isClassProvider,
  isValueProvider,
  isFactoryProvider,
} from '../types.js';
import { getModuleMetadata, isDynamicModule, DynamicModule } from '../decorators';
import { globalMiddleware } from './execution-pipeline';
import { createRouter } from './router';
import type { INestApplication, CanActivate, PipeTransform, NestInterceptor, ExceptionFilter } from '../interfaces';

export class NestApplication implements INestApplication {
  private app: Express;
  private server: Server | null = null;
  private controllers: Type[] = [];
  private initialized = false;

  constructor(private rootModule: Type) {
    this.app = express();
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  async init(): Promise<this> {
    if (this.initialized) return this;

    await this.processModule(this.rootModule);

    const router = createRouter(this.controllers);
    this.app.use(router);

    this.initialized = true;
    return this;
  }

  private async processModule(
    moduleClass: Type | DynamicModule,
    processedModules = new Set<Type>()
  ): Promise<void> {
    let metadata: ModuleMetadata;
    let actualModule: Type;

    if (isDynamicModule(moduleClass)) {
      metadata = moduleClass;
      actualModule = moduleClass.module;
    } else {
      actualModule = moduleClass;
      metadata = getModuleMetadata(moduleClass) || {};
    }

    if (processedModules.has(actualModule)) {
      return;
    }
    processedModules.add(actualModule);

    console.log(`[Module] Processing ${actualModule.name}`);

    if (metadata.imports) {
      for (const importedModule of metadata.imports) {
        await this.processModule(importedModule, processedModules);
      }
    }

    if (metadata.providers) {
      for (const provider of metadata.providers) {
        this.registerProvider(provider);
      }
    }

    if (metadata.controllers) {
      this.controllers.push(...metadata.controllers);
    }
  }

  private registerProvider(provider: Provider): void {
    if (typeof provider === 'function') {
      if (!container.hasProvider(provider)) {
        container.register(provider);
        console.log(`[Provider] Registered ${provider.name}`);
      }
    } else if (isClassProvider(provider)) {
      container.register(provider);
      console.log(`[Provider] Registered ${String(provider.provide)} -> ${provider.useClass.name}`);
    } else if (isValueProvider(provider)) {
      container.register(provider);
      console.log(`[Provider] Registered ${String(provider.provide)} (value)`);
    } else if (isFactoryProvider(provider)) {
      container.register(provider);
      console.log(`[Provider] Registered ${String(provider.provide)} (factory)`);
    }
  }

  async listen(port: number, callback?: () => void): Promise<void> {
    await this.init();

    return new Promise((resolve) => {
      this.server = this.app.listen(port, () => {
        console.log(`\n[Application] Listening on http://localhost:${port}\n`);
        callback?.();
        resolve();
      });
    });
  }

  get<T>(token: Type<T> | string | symbol): T {
    return container.resolve(token as any);
  }

  useGlobalPipes(...pipes: Array<PipeTransform | Type<PipeTransform>>): void {
    globalMiddleware.pipes.push(...pipes);
    console.log(`[Global] Registered ${pipes.length} pipe(s)`);
  }

  useGlobalGuards(...guards: Array<Type<CanActivate>>): void {
    globalMiddleware.guards.push(...guards);
    console.log(`[Global] Registered ${guards.length} guard(s)`);
  }

  useGlobalInterceptors(
    ...interceptors: Array<NestInterceptor | Type<NestInterceptor>>
  ): void {
    globalMiddleware.interceptors.push(...interceptors);
    console.log(`[Global] Registered ${interceptors.length} interceptor(s)`);
  }

  useGlobalFilters(
    ...filters: Array<ExceptionFilter | Type<ExceptionFilter>>
  ): void {
    globalMiddleware.filters.push(...filters);
    console.log(`[Global] Registered ${filters.length} filter(s)`);
  }

  getHttpAdapter(): Express {
    return this.app;
  }

  async close(): Promise<void> {
    if (this.server) {
      return new Promise((resolve, reject) => {
        this.server!.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
  }
}
