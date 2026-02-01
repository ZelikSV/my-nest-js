import { METADATA_KEYS } from '../constants';

export function Inject(token: string): ParameterDecorator {
  return function (
      target: Object,
      _propertyKey: string | symbol | undefined,
      parameterIndex: number
  ) {
    const existingTokens: Map<number, string> =
        Reflect.getOwnMetadata(METADATA_KEYS.INJECT_TOKENS, target) || new Map();

    existingTokens.set(parameterIndex, token);

    Reflect.defineMetadata(METADATA_KEYS.INJECT_TOKENS, existingTokens, target);
  };
}
