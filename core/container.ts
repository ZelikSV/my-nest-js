import 'reflect-metadata';

import { METADATA_KEYS } from './constants';
import {
  Type,
  Provider,
  isClassProvider,
  isValueProvider,
  isFactoryProvider,
} from './types';

export class Container {
  private providers = new Map<any, Provider>();
  private singletons = new Map<any, any>();
  private resolutionStack = new Set<any>();

  register(provider: Provider): void {
    const isProviderFunction = typeof provider === 'function';
    const token = isProviderFunction ? provider : provider.provide;

    if (this.hasProvider(token)) {
      const tokenName = typeof token === 'function' ? token.name : String(token);

      throw new Error(`Token "${tokenName}" is already registered in the container.`);
    }

    this.providers.set(token, provider);
  }

  hasProvider(token: any) {
    return this.providers.has(token);
  }

  resolve<T>(token: Type<T> | string | symbol): T {
    if (this.singletons.has(token)) {
      return this.singletons.get(token);
    }

    if (this.resolutionStack.has(token)) {
      const tokenName = typeof token === 'function' ? token.name : String(token);

      throw new Error(`Circular dependency detected for token: ${tokenName}`);
    }

    const provider = this.providers.get(token);

    if (!provider) {
      const tokenName = typeof token === 'function' ? token.name : String(token);
      throw new Error(`Token not registered: ${tokenName}`);
    }

    this.resolutionStack.add(token);

    try {
      let instance: T;

      if (typeof provider === 'function') {
        instance = this.instantiate(provider);
      } else if (isValueProvider(provider)) {
        instance = provider.useValue;
      } else if (isClassProvider(provider)) {
        instance = this.instantiate(provider.useClass);
      } else if (isFactoryProvider(provider)) {
        const deps = (provider.inject || []).map((dep) => this.resolve(dep));
        instance = provider.useFactory(...deps);
      } else {
        throw new Error(`Invalid provider configuration for token: ${String(token)}`);
      }

      this.singletons.set(token, instance);

      return instance;
    } finally {
      this.resolutionStack.delete(token);
    }
  }

  private instantiate<T>(target: Type<T>): T {
    const paramTypes: Type[] =
      Reflect.getOwnMetadata(METADATA_KEYS.DESIGN_METADATA, target) || [];

    const injectTokens: Map<number, any> =
      Reflect.getOwnMetadata(METADATA_KEYS.INJECT_TOKENS, target) || new Map();

    const dependencies = paramTypes.map((paramType, index) => {
      const token = injectTokens.get(index) ?? paramType;
      return this.resolve(token);
    });

    return new target(...dependencies);
  }

  clear(): void {
    this.providers.clear();
    this.singletons.clear();
    this.resolutionStack.clear();
  }
}

export const container = new Container();
