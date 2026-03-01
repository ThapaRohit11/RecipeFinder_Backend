import request from "supertest";
import app from "../../app";

describe("Health API Integration Tests", () => {
  it("GET / should return 200, success true, message Welcome to the API", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "Welcome to the API",
    });
  });

  it("GET /random-unknown-route should return 404, success false, message Route not found", async () => {
    const response = await request(app).get("/random-unknown-route");

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Route not found");
  });
});