import { describe, expect, it } from "vitest";

const databaseUrl = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

describe("Turso connection", () => {
  it("has a valid configured URL and token shape", () => {
    expect(databaseUrl, "TURSO_DATABASE_URL is required").toMatch(/^libsql:\/\//);
    expect(authToken, "TURSO_AUTH_TOKEN is required").toMatch(/^eyJ/);
  });

  it.skipIf(process.env.TURSO_LIVE_TEST !== "1")("authenticates and executes a lightweight query", async () => {
    const endpoint = databaseUrl!.replace(/^libsql:/, "https:").replace(/\/$/, "") + "/v2/pipeline";
    let lastError: unknown;
    for (let attempt = 1; attempt <= 3; attempt++) { const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 12000); try { const response = await fetch(endpoint, { method: "POST", headers: { authorization: `Bearer ${authToken}`, "content-type": "application/json" }, body: JSON.stringify({ requests: [{ type: "execute", stmt: { sql: "SELECT 1 AS ok" } }, { type: "close" }] }), signal: controller.signal }); const body = await response.text(); if (!response.ok) throw new Error(body); expect(response.ok).toBe(true); return; } catch (error) { lastError = error; if (attempt < 3) await new Promise(resolve => setTimeout(resolve, attempt * 1500)); } finally { clearTimeout(timer); } } throw lastError;
  }, 45000);
});
