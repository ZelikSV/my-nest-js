import { config as loadEnv } from 'dotenv';
import { ZodSchema } from 'zod';
import { CONFIG_TOKEN, Module, DynamicModule  } from '../../core';

export interface ConfigModuleOptions {
  envFilePath?: string;
  schema?: ZodSchema;
  isGlobal?: boolean;
}

@Module({})
export class ConfigModule {
  static forRoot(options: ConfigModuleOptions = {}): DynamicModule {
    const { envFilePath = '.env', schema } = options;

    loadEnv({ path: envFilePath });

    let config: any = { ...process.env };

    if (schema) {
      const result = schema.safeParse(config);

      if (!result.success) {
        const errors = result.error.issues
          .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
          .join('\n');

        throw new Error(
          `Configuration validation failed:\n${errors}`
        );
      }

      config = result.data;
    }

    console.log('[ConfigModule] Configuration loaded and validated');

    return {
      module: ConfigModule,
      providers: [
        {
          provide: CONFIG_TOKEN,
          useValue: config,
        },
      ],
      exports: [CONFIG_TOKEN],
      global: options.isGlobal,
    };
  }
}
