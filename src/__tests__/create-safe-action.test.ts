import { z } from "zod";
import { createSafeAction, SafeActionBuilder } from "../create-safe-action";

describe("SafeActionBuilder", () => {
  let authenticatedAction = createSafeAction.setMiddleware(async () => ({
    userId: "test-user",
    role: "admin",
  }));

  describe("with input validation", () => {
    const schema = z.object({
      name: z.string(),
      email: z.string().email(),
    });

    it("should validate and process valid input", async () => {
      const action = authenticatedAction.create(
        schema,
        async (input, context) => ({
          success: true,
          data: { ...input, userId: context.userId },
        })
      );

      const result = await action({
        name: "John",
        email: "john@example.com",
      });

      expect(result).toEqual({
        success: true,
        data: {
          name: "John",
          email: "john@example.com",
          userId: "test-user",
        },
      });
    });

    it("should throw error for invalid input", async () => {
      const action = authenticatedAction.create(schema, async (input) => input);

      await expect(
        action({
          name: "John",
          email: "invalid-email",
        })
      ).rejects.toThrow("Validation failed");
    });
  });

  describe("without input", () => {
    it("should process action without input", async () => {
      const action = authenticatedAction.create(async (context) => ({
        userId: context.userId,
        role: context.role,
      }));

      const result = await action();
      expect(result).toEqual({
        userId: "test-user",
        role: "admin",
      });
    });
  });

  describe("error cases", () => {
    it("should throw error when middleware is not configured", async () => {
      const unconfiguredAction = new SafeActionBuilder();

      const action = () =>
        unconfiguredAction.create(async (context) => context);

      expect(action).toThrow("Middleware not configured");
    });
  });
});
