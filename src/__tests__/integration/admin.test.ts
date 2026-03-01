import request from "supertest";
import app from "../../app";
import { createObjectId, clearTestCollections, createUniqueSuffix } from "../utils/db";
import { createTestUserAndToken } from "../utils/auth";

describe("Admin API Integration Tests", () => {
  const runMarker = `admin-suite-${Date.now()}`;

  afterEach(async () => {
    await clearTestCollections(runMarker);
  });

  afterAll(async () => {
    await clearTestCollections(runMarker);
  });

  describe("POST /api/admin/users", () => {
    it("should return 401 without token", async () => {
      const response = await request(app).post("/api/admin/users").send({
        email: `${createUniqueSuffix(runMarker)}@example.com`,
        username: `${createUniqueSuffix(runMarker)}-user`,
        password: "password123",
        role: "user",
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should return 403 with non-admin token", async () => {
      const normalUser = await createTestUserAndToken({ runMarker });

      const response = await request(app)
        .post("/api/admin/users")
        .set("Authorization", `Bearer ${normalUser.token}`)
        .send({
          email: `${createUniqueSuffix(runMarker)}@example.com`,
          username: `${createUniqueSuffix(runMarker)}-user`,
          password: "password123",
          role: "user",
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it("should return 201 with admin token", async () => {
      const admin = await createTestUserAndToken({ runMarker, admin: true });
      const username = `${createUniqueSuffix(runMarker)}-created`;

      const response = await request(app)
        .post("/api/admin/users")
        .set("Authorization", `Bearer ${admin.token}`)
        .send({
          firstName: "Created",
          lastName: "User",
          email: `${createUniqueSuffix(runMarker)}@example.com`,
          username,
          password: "password123",
          role: "user",
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.username).toBe(username);
    });

    it("should return 400 for invalid payload", async () => {
      const admin = await createTestUserAndToken({ runMarker, admin: true });

      const response = await request(app)
        .post("/api/admin/users")
        .set("Authorization", `Bearer ${admin.token}`)
        .send({
          username: `${createUniqueSuffix(runMarker)}-missing-email`,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/admin/users", () => {
    it("should return 401 without token", async () => {
      const response = await request(app).get("/api/admin/users");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should return 403 with non-admin token", async () => {
      const normalUser = await createTestUserAndToken({ runMarker });
      const response = await request(app)
        .get("/api/admin/users")
        .set("Authorization", `Bearer ${normalUser.token}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it("should return 200 and users array with admin token", async () => {
      const admin = await createTestUserAndToken({ runMarker, admin: true });
      const response = await request(app)
        .get("/api/admin/users")
        .set("Authorization", `Bearer ${admin.token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(typeof response.body.count).toBe("number");
    });
  });

  describe("GET /api/admin/users/:id", () => {
    it("should return 400 for invalid id", async () => {
      const admin = await createTestUserAndToken({ runMarker, admin: true });
      const response = await request(app)
        .get("/api/admin/users/not-a-valid-id")
        .set("Authorization", `Bearer ${admin.token}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should return 404 for nonexistent id", async () => {
      const admin = await createTestUserAndToken({ runMarker, admin: true });
      const response = await request(app)
        .get(`/api/admin/users/${createObjectId().toString()}`)
        .set("Authorization", `Bearer ${admin.token}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it("should return 200 for existing user", async () => {
      const admin = await createTestUserAndToken({ runMarker, admin: true });
      const target = await createTestUserAndToken({ runMarker });

      const response = await request(app)
        .get(`/api/admin/users/${target.user._id.toString()}`)
        .set("Authorization", `Bearer ${admin.token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(target.credentials.email);
    });
  });

  describe("PUT /api/admin/users/:id", () => {
    it("should return 400 for invalid id", async () => {
      const admin = await createTestUserAndToken({ runMarker, admin: true });
      const response = await request(app)
        .put("/api/admin/users/not-valid")
        .set("Authorization", `Bearer ${admin.token}`)
        .send({ firstName: "Updated" });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should return 404 for nonexistent id", async () => {
      const admin = await createTestUserAndToken({ runMarker, admin: true });
      const response = await request(app)
        .put(`/api/admin/users/${createObjectId().toString()}`)
        .set("Authorization", `Bearer ${admin.token}`)
        .send({ firstName: "Updated" });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it("should return 200 for successful update", async () => {
      const admin = await createTestUserAndToken({ runMarker, admin: true });
      const target = await createTestUserAndToken({ runMarker });
      const updatedName = `Updated-${createUniqueSuffix(runMarker)}`;

      const response = await request(app)
        .put(`/api/admin/users/${target.user._id.toString()}`)
        .set("Authorization", `Bearer ${admin.token}`)
        .send({ firstName: updatedName });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.firstName).toBe(updatedName);
    });
  });

  describe("DELETE /api/admin/users/:id", () => {
    it("should return 400 for invalid id", async () => {
      const admin = await createTestUserAndToken({ runMarker, admin: true });
      const response = await request(app)
        .delete("/api/admin/users/not-valid")
        .set("Authorization", `Bearer ${admin.token}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should return 404 for nonexistent id", async () => {
      const admin = await createTestUserAndToken({ runMarker, admin: true });
      const response = await request(app)
        .delete(`/api/admin/users/${createObjectId().toString()}`)
        .set("Authorization", `Bearer ${admin.token}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it("should return 200 for successful delete", async () => {
      const admin = await createTestUserAndToken({ runMarker, admin: true });
      const target = await createTestUserAndToken({ runMarker });

      const response = await request(app)
        .delete(`/api/admin/users/${target.user._id.toString()}`)
        .set("Authorization", `Bearer ${admin.token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("User deleted successfully");
    });
  });
});