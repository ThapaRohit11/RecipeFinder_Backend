import request from "supertest";
import app from "../../app";
import { clearTestCollections, createUniqueSuffix } from "../utils/db";

describe("Auth API Integration Tests", () => {
  const runMarker = `auth-suite-${Date.now()}`;

  const buildUser = (overrides: Record<string, unknown> = {}) => {
    const suffix = createUniqueSuffix(runMarker);
    return {
      firstName: "Test",
      lastName: "User",
      email: `${suffix}@example.com`,
      username: `${suffix}-user`,
      password: "password123",
      confirmPassword: "password123",
      ...overrides,
    };
  };

  afterEach(async () => {
    await clearTestCollections(runMarker);
  });

  afterAll(async () => {
    await clearTestCollections(runMarker);
  });

  describe("POST /api/auth/register", () => {
    it("missing firstName should still register (firstName is optional)", async () => {
      const payload = buildUser();
      delete (payload as any).firstName;

      const response = await request(app).post("/api/auth/register").send(payload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it("missing lastName should still register (lastName is optional)", async () => {
      const payload = buildUser();
      delete (payload as any).lastName;

      const response = await request(app).post("/api/auth/register").send(payload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it("missing email should return 400", async () => {
      const payload = buildUser();
      delete (payload as any).email;

      const response = await request(app).post("/api/auth/register").send(payload);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("missing username should return 400", async () => {
      const payload = buildUser();
      delete (payload as any).username;

      const response = await request(app).post("/api/auth/register").send(payload);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("missing password should return 400", async () => {
      const payload = buildUser();
      delete (payload as any).password;

      const response = await request(app).post("/api/auth/register").send(payload);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("missing confirmPassword should return 400", async () => {
      const payload = buildUser();
      delete (payload as any).confirmPassword;

      const response = await request(app).post("/api/auth/register").send(payload);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("password mismatch should return 400", async () => {
      const payload = buildUser({ confirmPassword: "different123" });

      const response = await request(app).post("/api/auth/register").send(payload);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("invalid email format should return 400", async () => {
      const payload = buildUser({ email: "invalid-email" });

      const response = await request(app).post("/api/auth/register").send(payload);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("duplicate email should return 409", async () => {
      const payload = buildUser();
      const secondPayload = {
        ...buildUser(),
        email: payload.email,
      };

      const first = await request(app).post("/api/auth/register").send(payload);
      const second = await request(app).post("/api/auth/register").send(secondPayload);

      expect(first.status).toBe(201);
      expect(second.status).toBe(409);
      expect(second.body.success).toBe(false);
    });

    it("duplicate username should return 409", async () => {
      const payload = buildUser();
      const secondPayload = {
        ...buildUser(),
        username: payload.username,
      };

      const first = await request(app).post("/api/auth/register").send(payload);
      const second = await request(app).post("/api/auth/register").send(secondPayload);

      expect(first.status).toBe(201);
      expect(second.status).toBe(409);
      expect(second.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/login", () => {
    it("missing email should return 400", async () => {
      const response = await request(app).post("/api/auth/login").send({
        password: "password123",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("missing password should return 400", async () => {
      const payload = buildUser();
      await request(app).post("/api/auth/register").send(payload);

      const response = await request(app).post("/api/auth/login").send({
        email: payload.email,
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("wrong password should return 401", async () => {
      const payload = buildUser();
      await request(app).post("/api/auth/register").send(payload);

      const response = await request(app).post("/api/auth/login").send({
        email: payload.email,
        password: "wrong-password",
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("wrong email should return 404", async () => {
      const payload = buildUser();
      await request(app).post("/api/auth/register").send(payload);

      const response = await request(app).post("/api/auth/login").send({
        email: `missing-${createUniqueSuffix(runMarker)}@example.com`,
        password: payload.password,
      });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it("successful login should return token and expected shape", async () => {
      const payload = buildUser();
      await request(app).post("/api/auth/register").send(payload);

      const response = await request(app).post("/api/auth/login").send({
        email: payload.email,
        password: payload.password,
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.data).toBeDefined();
      expect(response.body.data.email).toBe(payload.email);
    });

    it("token should be a string", async () => {
      const payload = buildUser();
      await request(app).post("/api/auth/register").send(payload);

      const response = await request(app).post("/api/auth/login").send({
        email: payload.email,
        password: payload.password,
      });

      expect(response.status).toBe(200);
      expect(typeof response.body.token).toBe("string");
    });
  });
});
