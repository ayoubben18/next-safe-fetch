# next-safe-fetch

Type-safe actions with middleware support for TypeScript applications.

## Installation

```bash
npm install next-safe-fetch
```

## Usage

1. Define your middleware context type:

```typescript
import { BaseMiddlewareContext } from "next-safe-fetch";

interface MyContext extends BaseMiddlewareContext {
  userId: string;
  role: string;
}
```

2. Create an authenticated action builder:

```typescript
import { createSafeAction } from "next-safe-fetch";
import { z } from "zod";

// Configure middleware once
const authenticatedAction = createSafeAction.setMiddleware<MyContext>(
  async () => {
    return {
      userId: "user_123",
      role: "admin",
    };
  }
);

// Use it to create actions
const getUsers = authenticatedAction.create(
  z.object({
    page: z.number(),
    itemsPerPage: z.number(),
  }),
  async ({ page, itemsPerPage }, { userId }) => {
    // Type-safe input and context
    return { users: [], total: 0 };
  }
);

// Action without input
const getCurrentUser = authenticatedAction.create(async (context) => {
  return {
    id: context.userId,
    role: context.role,
  };
});
```

## Usage with Next.js + React Query

```typescript
const { data, isLoading } = useQuery({
  queryKey: ["users", page, itemsPerPage],
  queryFn: () => getUsers({ page, itemsPerPage }),
});

// You can also use it with `useMutation` from `@tanstack/react-query` to create and update data.

("use server");

export const deletePost = authenticatedAction.create(
  z.object({ id: z.string() }),
  async ({ id }, { userId }) => {
    // This way you can use the context to get the userId and validate the request.
    await db
      .delete(posts)
      .where(and(eq(posts.id, id), eq(posts.userId, userId)));
  }
);

const { mutateAsync: deletePost, isPending } = useMutation({
  mutationFn: deletePost,
});

const handleDeletePost = async () => {
  await deletePost({ id: "1" });
};
```

## Features

- Fluent API for creating authenticated actions
- Full TypeScript support with generic context types
- Type-safe middleware context
- Input validation with Zod
- Flexible and extensible design

## License

MIT
