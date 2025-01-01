import { z } from "zod";
import {
  BaseMiddlewareContext,
  MiddlewareFunction,
  ActionFunctionWithInput,
  ActionFunctionWithoutInput,
} from "./types";

export class SafeActionBuilder<
  TContext extends BaseMiddlewareContext = BaseMiddlewareContext
> {
  private middleware?: MiddlewareFunction<TContext>;

  setMiddleware<T extends BaseMiddlewareContext>(
    middleware: MiddlewareFunction<T>
  ): SafeActionBuilder<T> {
    const builder = new SafeActionBuilder<T>();
    builder.middleware = middleware;
    return builder;
  }

  create<TInput, TOutput>(
    schema: z.Schema<TInput>,
    handler: ActionFunctionWithInput<TInput, TOutput, TContext>
  ): (data: TInput) => Promise<TOutput>;
  create<TOutput>(
    handler: ActionFunctionWithoutInput<TOutput, TContext>
  ): () => Promise<TOutput>;
  create<TInput, TOutput>(
    schemaOrHandler:
      | z.Schema<TInput>
      | ActionFunctionWithoutInput<TOutput, TContext>,
    handler?: ActionFunctionWithInput<TInput, TOutput, TContext>
  ) {
    if (!this.middleware) {
      throw new Error(
        "Middleware not configured. Call setMiddleware() before creating actions."
      );
    }

    if (typeof schemaOrHandler === "function") {
      return async () => {
        const context = await this.middleware!();
        return schemaOrHandler(context);
      };
    }

    return async (data: TInput) => {
      const validated = schemaOrHandler.safeParse(data);

      if (!validated.success) {
        throw new Error(
          "Validation failed: " + JSON.stringify(validated.error)
        );
      }

      const context = await this.middleware!();
      return handler!(validated.data, context);
    };
  }
}

export const createSafeAction = new SafeActionBuilder();
