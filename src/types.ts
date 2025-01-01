// Base context that all middleware contexts must extend
export interface BaseMiddlewareContext {
  [key: string]: unknown;
}

// Middleware function type with proper generic constraint
export type MiddlewareFunction<TContext extends BaseMiddlewareContext> =
  () => Promise<TContext>;

// Action result type
export type ActionResult<T> = Promise<T>;

// Action handler types with proper generic constraints
export type ActionFunctionWithInput<
  TInput,
  TOutput,
  TContext extends BaseMiddlewareContext
> = (input: TInput, context: TContext) => ActionResult<TOutput>;

export type ActionFunctionWithoutInput<
  TOutput,
  TContext extends BaseMiddlewareContext
> = (context: TContext) => ActionResult<TOutput>;
