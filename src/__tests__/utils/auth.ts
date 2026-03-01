import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";
import { createUniqueSuffix } from "./db";

type RegisterBody = {
  firstName?: string;
  lastName?: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
};

type CreateUserOptions = {
  runMarker: string;
  admin?: boolean;
  overrides?: Partial<RegisterBody>;
};

export const createTestUserAndToken = async ({
  runMarker,
  admin = false,
  overrides = {},
}: CreateUserOptions) => {
  const suffix = createUniqueSuffix(runMarker);
  const password = overrides.password ?? "password123";

  const payload: RegisterBody = {
    firstName: "Test",
    lastName: "User",
    email: `${suffix}@example.com`,
    username: `${suffix}-user`,
    password,
    confirmPassword: overrides.confirmPassword ?? password,
    ...overrides,
  };

  const registerRes = await request(app).post("/api/auth/register").send(payload);
  if (registerRes.status !== 201) {
    throw new Error(`Failed to register test user: ${registerRes.status} ${JSON.stringify(registerRes.body)}`);
  }

  let user = await UserModel.findOne({ email: payload.email });
  if (!user) {
    throw new Error("Registered test user was not found in database");
  }

  if (admin) {
    user.role = "admin";
    await user.save();
  }

  const loginRes = await request(app).post("/api/auth/login").send({
    email: payload.email,
    password,
  });

  if (loginRes.status !== 200 || !loginRes.body?.token) {
    throw new Error(`Failed to login test user: ${loginRes.status} ${JSON.stringify(loginRes.body)}`);
  }

  user = await UserModel.findOne({ email: payload.email });
  if (!user) {
    throw new Error("Test user disappeared after login");
  }

  return {
    token: loginRes.body.token as string,
    user,
    credentials: {
      email: payload.email,
      password,
      username: payload.username,
    },
    payload,
  };
};