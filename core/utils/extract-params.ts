import type { Request } from 'express';

import type { ParamType } from '../types';

export function extractParamValue(
  req: Request,
  type: ParamType,
  key?: string
): any {
  let source: any;

  switch (type) {
    case 'body':
      source = req.body;
      break;
    case 'query':
      source = req.query;
      break;
    case 'param':
      source = req.params;
      break;
    case 'headers':
      source = req.headers;
      break;
    case 'cookies':
      source = req.cookies || {};
      break;
    default:
      throw new Error(`Unknown param type: ${type}`);
  }

  if (key !== undefined) {
    return source?.[key];
  }

  return source;
}
