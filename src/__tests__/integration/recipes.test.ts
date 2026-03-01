import request from "supertest";
import app from "../../app";
import { createObjectId, clearTestCollections, createUniqueSuffix } from "../utils/db";
import { createTestUserAndToken } from "../utils/auth";

describe("Recipes API Integration Tests", () => {
  const runMarker = `recipes-suite-${Date.now()}`;

  const createRecipe = async (
    token: string,
    overrides: { title?: string; description?: string; withImage?: boolean } = {},
  ) => {
    const title = overrides.title ?? `Title ${createUniqueSuffix(runMarker)}`;
    const description = overrides.description ?? `Description ${createUniqueSuffix(runMarker)}`;
    const withImage = overrides.withImage ?? true;

    let req = request(app)
      .post("/api/recipes")
      .set("Authorization", `Bearer ${token}`)
      .field("title", title)
      .field("description", description);

    if (withImage) {
      req = req.attach("image", Buffer.from("fake-image"), {
        filename: `${createUniqueSuffix(runMarker)}.jpg`,
        contentType: "image/jpeg",
      });
    }

    return req;
  };

  afterEach(async () => {
    await clearTestCollections(runMarker);
  });

  afterAll(async () => {
    await clearTestCollections(runMarker);
  });

  it("GET /api/recipes should return 200 and array", async () => {
    const response = await request(app).get("/api/recipes");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it("GET /api/recipes/:id with invalid id should return 400", async () => {
    const response = await request(app).get("/api/recipes/not-a-valid-id");

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("GET /api/recipes/:id with nonexistent id should return 404", async () => {
    const response = await request(app).get(`/api/recipes/${createObjectId().toString()}`);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it("GET /api/recipes/my without token should return 401", async () => {
    const response = await request(app).get("/api/recipes/my");

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("GET /api/recipes/my with token should return 200 and array", async () => {
    const user = await createTestUserAndToken({ runMarker });
    await createRecipe(user.token);

    const response = await request(app)
      .get("/api/recipes/my")
      .set("Authorization", `Bearer ${user.token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it("POST /api/recipes without token should return 401", async () => {
    const response = await request(app).post("/api/recipes").send({
      title: "No token",
      description: "Should fail",
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("POST /api/recipes missing title should return 400", async () => {
    const user = await createTestUserAndToken({ runMarker });

    const response = await request(app)
      .post("/api/recipes")
      .set("Authorization", `Bearer ${user.token}`)
      .field("description", `Desc ${createUniqueSuffix(runMarker)}`)
      .attach("image", Buffer.from("fake-image"), {
        filename: `${createUniqueSuffix(runMarker)}.jpg`,
        contentType: "image/jpeg",
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("POST /api/recipes missing description should return 400", async () => {
    const user = await createTestUserAndToken({ runMarker });

    const response = await request(app)
      .post("/api/recipes")
      .set("Authorization", `Bearer ${user.token}`)
      .field("title", `Title ${createUniqueSuffix(runMarker)}`)
      .attach("image", Buffer.from("fake-image"), {
        filename: `${createUniqueSuffix(runMarker)}.jpg`,
        contentType: "image/jpeg",
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("POST /api/recipes missing image should return 400", async () => {
    const user = await createTestUserAndToken({ runMarker });

    const response = await createRecipe(user.token, { withImage: false });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Recipe image is required");
  });

  it("POST /api/recipes valid payload should return 201", async () => {
    const user = await createTestUserAndToken({ runMarker });

    const response = await createRecipe(user.token);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBeDefined();
  });

  it("PATCH /api/recipes/:id without token should return 401", async () => {
    const response = await request(app).patch(`/api/recipes/${createObjectId().toString()}`).send({
      title: "Updated",
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("PATCH /api/recipes/:id invalid id should return 400", async () => {
    const user = await createTestUserAndToken({ runMarker });

    const response = await request(app)
      .patch("/api/recipes/not-valid")
      .set("Authorization", `Bearer ${user.token}`)
      .send({ title: "Updated" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("PATCH /api/recipes/:id nonexistent id should return 404", async () => {
    const user = await createTestUserAndToken({ runMarker });

    const response = await request(app)
      .patch(`/api/recipes/${createObjectId().toString()}`)
      .set("Authorization", `Bearer ${user.token}`)
      .send({ title: "Updated" });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it("PATCH /api/recipes/:id with no fields should return 400", async () => {
    const user = await createTestUserAndToken({ runMarker });
    const created = await createRecipe(user.token);
    const recipeId = created.body.data.id;

    const response = await request(app)
      .patch(`/api/recipes/${recipeId}`)
      .set("Authorization", `Bearer ${user.token}`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("PATCH /api/recipes/:id by non-owner should return 403", async () => {
    const owner = await createTestUserAndToken({ runMarker });
    const otherUser = await createTestUserAndToken({ runMarker });
    const created = await createRecipe(owner.token);
    const recipeId = created.body.data.id;

    const response = await request(app)
      .patch(`/api/recipes/${recipeId}`)
      .set("Authorization", `Bearer ${otherUser.token}`)
      .send({ title: "Hacked" });

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });

  it("PATCH /api/recipes/:id by owner should return 200", async () => {
    const owner = await createTestUserAndToken({ runMarker });
    const created = await createRecipe(owner.token);
    const recipeId = created.body.data.id;
    const newTitle = `Updated ${createUniqueSuffix(runMarker)}`;

    const response = await request(app)
      .patch(`/api/recipes/${recipeId}`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ title: newTitle });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe(newTitle);
  });

  it("DELETE /api/recipes/:id without token should return 401", async () => {
    const response = await request(app).delete(`/api/recipes/${createObjectId().toString()}`);

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("DELETE /api/recipes/:id invalid id should return 400", async () => {
    const user = await createTestUserAndToken({ runMarker });

    const response = await request(app)
      .delete("/api/recipes/invalid-id")
      .set("Authorization", `Bearer ${user.token}`);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("DELETE /api/recipes/:id nonexistent id should return 404", async () => {
    const user = await createTestUserAndToken({ runMarker });

    const response = await request(app)
      .delete(`/api/recipes/${createObjectId().toString()}`)
      .set("Authorization", `Bearer ${user.token}`);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it("DELETE /api/recipes/:id by non-owner should return 403", async () => {
    const owner = await createTestUserAndToken({ runMarker });
    const otherUser = await createTestUserAndToken({ runMarker });
    const created = await createRecipe(owner.token);
    const recipeId = created.body.data.id;

    const response = await request(app)
      .delete(`/api/recipes/${recipeId}`)
      .set("Authorization", `Bearer ${otherUser.token}`);

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });

  it("DELETE /api/recipes/:id by owner should return 200", async () => {
    const owner = await createTestUserAndToken({ runMarker });
    const created = await createRecipe(owner.token);
    const recipeId = created.body.data.id;

    const response = await request(app)
      .delete(`/api/recipes/${recipeId}`)
      .set("Authorization", `Bearer ${owner.token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Recipe deleted successfully");
  });
});