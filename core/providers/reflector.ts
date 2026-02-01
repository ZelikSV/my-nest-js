import { Injectable } from '../decorators';
import { METADATA_KEYS } from '../constants';
import type { Type } from '../types';

@Injectable()
export class Reflector {
  get<TResult = any, TKey = any>(
    metadataKey: TKey,
    target: Type | Function
  ): TResult | undefined {
    const key =
      typeof metadataKey === 'object' && metadataKey !== null
        ? (metadataKey as any).KEY ?? metadataKey
        : metadataKey;

    const finalKey =
      typeof key === 'string' && !key.startsWith('mini:')
        ? `${METADATA_KEYS.CUSTOM_METADATA}${key}`
        : key;

    return Reflect.getMetadata(finalKey, target);
  }

  getAllAndOverride<TResult = any, TKey = any>(
    metadataKey: TKey,
    targets: Array<Type | Function>
  ): TResult | undefined {
    for (const target of targets) {
      const result = this.get<TResult, TKey>(metadataKey, target);
      if (result !== undefined) {
        return result;
      }
    }
    return undefined;
  }

  getAllAndMerge<TResult extends any[] = any[], TKey = any>(
    metadataKey: TKey,
    targets: Array<Type | Function>
  ): TResult {
    const result: any[] = [];

    for (const target of targets) {
      const value = this.get<TResult, TKey>(metadataKey, target);
      if (Array.isArray(value)) {
        result.push(...value);
      } else if (value !== undefined) {
        result.push(value);
      }
    }

    return result as TResult;
  }
}
