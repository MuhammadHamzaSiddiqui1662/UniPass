import { leadSchema, createUserSchema } from "../lib/validations/schemas";

describe("Lead Validation", () => {
  test("validates a correct lead submission", () => {
    const validLead = {
      fullName: "Ahmed Khan",
      whatsappNumber: "+92 300 1234567",
      city: "Karachi",
      levelOfStudy: "Bachelor's",
      bestTimeToReach: "Morning (9 AM - 12 PM)",
    };

    const result = leadSchema.safeParse(validLead);
    expect(result.success).toBe(true);
  });

  test("rejects a lead with invalid WhatsApp number", () => {
    const invalidLead = {
      fullName: "Ahmed Khan",
      whatsappNumber: "invalid",
      city: "Karachi",
      levelOfStudy: "Bachelor's",
    };

    const result = leadSchema.safeParse(invalidLead);
    expect(result.success).toBe(false);
  });

  test("rejects a lead with missing required fields", () => {
    const invalidLead = {
      fullName: "Ahmed Khan",
    };

    const result = leadSchema.safeParse(invalidLead);
    expect(result.success).toBe(false);
  });
});

describe("User Validation", () => {
  test("validates a correct user", () => {
    const validUser = {
      email: "admin@example.com",
      password: "SecurePass123!",
      name: "Admin User",
      role: "admin" as const,
    };

    const result = createUserSchema.safeParse(validUser);
    expect(result.success).toBe(true);
  });

  test("rejects a user with invalid email", () => {
    const invalidUser = {
      email: "notanemail",
      password: "SecurePass123!",
      name: "Admin User",
      role: "admin" as const,
    };

    const result = createUserSchema.safeParse(invalidUser);
    expect(result.success).toBe(false);
  });

  test("rejects a user with short password", () => {
    const invalidUser = {
      email: "admin@example.com",
      password: "short",
      name: "Admin User",
      role: "admin" as const,
    };

    const result = createUserSchema.safeParse(invalidUser);
    expect(result.success).toBe(false);
  });
});

// Note: These are basic validation tests. Full integration tests would require
// a running MongoDB instance and would test the API routes, database operations,
// and end-to-end workflows.
