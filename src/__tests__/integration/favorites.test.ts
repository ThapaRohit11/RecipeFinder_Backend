import request from "supertest";
import app from "../../app";
import { createObjectId, clearTestCollections, createUniqueSuffix } from "../utils/db";
import { createTestUserAndToken } from "../utils/auth";

describe("Favorites API Integration Tests", () => {
  const runMarker = `favorites-suite-${Date.now()}`;

  const createRecipeForFavorites = async (token: string) => {
    return request(app)
      .post("/api/recipes")
      .set("Authorization", `Bearer ${token}`)
      .field("title", `Fav Recipe ${createUniqueSuffix(runMarker)}`)
      .field("description", `Fav Desc ${createUniqueSuffix(runMarker)}`)
      .attach("image", Buffer.from("fake-image"), {
        filename: `${createUniqueSuffix(runMarker)}.jpg`,
        contentType: "image/jpeg",
      });
  };

  afterEach(async () => {
    await clearTestCollections(runMarker);
  });

  afterAll(async () => {
    await clearTestCollections(runMarker);
  });

  it("POST /api/favorites/:recipeId without token should return 401", async () => {
    const response = await request(app).post(`/api/favorites/${createObjectId().toString()}`);

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("POST /api/favorites/:recipeId with nonexistent recipe should return 404", async () => {
    const user = await createTestUserAndToken({ runMarker });
    const response = await request(app)
      .post(`/api/favorites/${createObjectId().toString()}`)
      .set("Authorization", `Bearer ${user.token}`);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it("POST /api/favorites/:recipeId should add favorite", async () => {
    const owner = await createTestUserAndToken({ runMarker });
    const user = await createTestUserAndToken({ runMarker });
    const recipe = await createRecipeForFavorites(owner.token);
    const recipeId = recipe.body.data.id;

    const response = await request(app)
      .post(`/api/favorites/${recipeId}`)
      .set("Authorization", `Bearer ${user.token}`);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });

  it("POST /api/favorites/:recipeId duplicate should return 400", async () => {
    const owner = await createTestUserAndToken({ runMarker });
    const user = await createTestUserAndToken({ runMarker });
    const recipe = await createRecipeForFavorites(owner.token);
    const recipeId = recipe.body.data.id;

    await request(app)
      .post(`/api/favorites/${recipeId}`)
      .set("Authorization", `Bearer ${user.token}`);

    const second = await request(app)
      .post(`/api/favorites/${recipeId}`)
      .set("Authorization", `Bearer ${user.token}`);

    expect(second.status).toBe(400);
    expect(second.body.success).toBe(false);
  });

  it("GET /api/favorites without token should return 401", async () => {
    const response = await request(app).get("/api/favorites");

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("GET /api/favorites with token should return 200 and array", async () => {
    const owner = await createTestUserAndToken({ runMarker });
    const user = await createTestUserAndToken({ runMarker });
    const recipe = await createRecipeForFavorites(owner.token);
    const recipeId = recipe.body.data.id;

    await request(app)
      .post(`/api/favorites/${recipeId}`)
      .set("Authorization", `Bearer ${user.token}`);

    const response = await request(app)
      .get("/api/favorites")
      .set("Authorization", `Bearer ${user.token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it("GET /api/favorites/:recipeId/status without token should return 401", async () => {
    const response = await request(app).get(`/api/favorites/${createObjectId().toString()}/status`);

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("GET /api/favorites/:recipeId/status should return true when favorited", async () => {
    const owner = await createTestUserAndToken({ runMarker });
    const user = await createTestUserAndToken({ runMarker });
    const recipe = await createRecipeForFavorites(owner.token);
    const recipeId = recipe.body.data.id;

    await request(app)
      .post(`/api/favorites/${recipeId}`)
      .set("Authorization", `Bearer ${user.token}`);

    const response = await request(app)
      .get(`/api/favorites/${recipeId}/status`)
      .set("Authorization", `Bearer ${user.token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.isFavorited).toBe(true);
  });

  it("GET /api/favorites/:recipeId/status should return false when not favorited", async () => {
    const owner = await createTestUserAndToken({ runMarker });
    const user = await createTestUserAndToken({ runMarker });
    const recipe = await createRecipeForFavorites(owner.token);
    const recipeId = recipe.body.data.id;

    const response = await request(app)
      .get(`/api/favorites/${recipeId}/status`)
      .set("Authorization", `Bearer ${user.token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.isFavorited).toBe(false);
  });

  it("DELETE /api/favorites/:recipeId without token should return 401", async () => {
    const response = await request(app).delete(`/api/favorites/${createObjectId().toString()}`);

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("DELETE /api/favorites/:recipeId nonexistent recipe should return 404", async () => {
    const user = await createTestUserAndToken({ runMarker });
    const response = await request(app)
      .delete(`/api/favorites/${createObjectId().toString()}`)
      .set("Authorization", `Bearer ${user.token}`);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it("DELETE /api/favorites/:recipeId not favorited should return 400", async () => {
    const owner = await createTestUserAndToken({ runMarker });
    const user = await createTestUserAndToken({ runMarker });
    const recipe = await createRecipeForFavorites(owner.token);
    const recipeId = recipe.body.data.id;

    const response = await request(app)
      .delete(`/api/favorites/${recipeId}`)
      .set("Authorization", `Bearer ${user.token}`);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("DELETE /api/favorites/:recipeId should remove favorite successfully", async () => {
    const owner = await createTestUserAndToken({ runMarker });
    const user = await createTestUserAndToken({ runMarker });
    const recipe = await createRecipeForFavorites(owner.token);
    const recipeId = recipe.body.data.id;

    await request(app)
      .post(`/api/favorites/${recipeId}`)
      .set("Authorization", `Bearer ${user.token}`);

    const response = await request(app)
      .delete(`/api/favorites/${recipeId}`)
      .set("Authorization", `Bearer ${user.token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Recipe removed from favorites");
  });

  it("GET /api/favorites should return empty array after removal", async () => {
    const owner = await createTestUserAndToken({ runMarker });
    const user = await createTestUserAndToken({ runMarker });
    const recipe = await createRecipeForFavorites(owner.token);
    const recipeId = recipe.body.data.id;

    await request(app)
      .post(`/api/favorites/${recipeId}`)
      .set("Authorization", `Bearer ${user.token}`);

    await request(app)
      .delete(`/api/favorites/${recipeId}`)
      .set("Authorization", `Bearer ${user.token}`);

    const response = await request(app)
      .get("/api/favorites")
      .set("Authorization", `Bearer ${user.token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBe(0);
  });
});