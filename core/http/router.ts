import express, { Router } from 'express';
import { container } from '../container.js';
import { Type } from '../types.js';
import { getControllerPath } from '../decorators';
import { getRoutes } from '../decorators';
import { executePipeline } from './execution-pipeline';

export function registerController(
  router: Router,
  controllerClass: Type
): void {
  if (!container.hasProvider(controllerClass)) {
    container.register(controllerClass);
  }

  const controllerInstance = container.resolve(controllerClass);

  const prefix = getControllerPath(controllerClass);
  const routes = getRoutes(controllerClass);

  for (const route of routes) {
    const fullPath = prefix + route.path || '/';
    const handler = (controllerInstance as any)[route.handlerName];

    if (typeof handler !== 'function') {
      console.warn(
        `Handler ${route.handlerName} not found on controller ${controllerClass.name}`
      );
      continue;
    }

    const boundHandler = handler.bind(controllerInstance);

    (router as any)[route.method](fullPath, async (req: any, res: any) => {
      await executePipeline(
        controllerClass,
        controllerInstance,
        handler,
        route.handlerName,
        req,
        res
      );
    });

    console.log(
      `[Router] ${route.method.toUpperCase()} ${fullPath} -> ${controllerClass.name}.${route.handlerName}`
    );
  }
}

export function createRouter(controllers: Type[]): Router {
  const router = express.Router();

  for (const controller of controllers) {
    registerController(router, controller);
  }

  return router;
}
