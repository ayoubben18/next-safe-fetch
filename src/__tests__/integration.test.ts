import { z } from "zod";
import { createSafeAction } from "../create-safe-action";

describe("Integration", () => {
  it("should work in a typical usage scenario", async () => {
    // 1. Set up authenticated action builder
    const authenticatedAction = createSafeAction.setMiddleware(async () => ({
      userId: "user_123",
      timestamp: Date.now(),
    }));

    // 2. Create an action with validation
    const createUser = authenticatedAction.create(
      z.object({
        name: z.string(),
        email: z.string().email(),
      }),
      async (input, context) => ({
        ...input,
        id: "generated_id",
        createdBy: context.userId,
        createdAt: context.timestamp,
      })
    );

    // 3. Execute the action
    const result = await createUser({
      name: "John Doe",
      email: "john@example.com",
    });

    // 4. Verify the result
    expect(result).toMatchObject({
      name: "John Doe",
      email: "john@example.com",
      id: "generated_id",
      createdBy: "user_123",
    });
    expect(result.createdAt).toBeDefined();
    expect(typeof result.createdAt).toBe("number");
  });

  it("should handle multiple actions with the same middleware", async () => {
    const authenticatedAction = createSafeAction.setMiddleware(async () => ({
      userId: "user_123",
      timestamp: Date.now(),
    }));

    const getUser = authenticatedAction.create(async (context) => ({
      id: context.userId,
      timestamp: context.timestamp,
    }));

    const updateUser = authenticatedAction.create(
      z.object({ name: z.string() }),
      async (input, context) => ({
        ...input,
        id: context.userId,
        updatedAt: context.timestamp,
      })
    );

    const [getUserResult, updateUserResult] = await Promise.all([
      getUser(),
      updateUser({ name: "John" }),
    ]);

    expect(getUserResult.id).toBe("user_123");
    expect(updateUserResult).toMatchObject({
      name: "John",
      id: "user_123",
    });
  });
});
