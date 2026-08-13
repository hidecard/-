import fs from "node:fs/promises";

const url = process.env.TURSO_DATABASE_URL;
const token = process.env.TURSO_AUTH_TOKEN;
if (!url || !token) throw new Error("TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are required");
const endpoint = url.replace(/^libsql:/, "https:").replace(/\/$/, "") + "/v2/pipeline";
const migrationFile = process.env.TURSO_MIGRATION_FILE || "../drizzle/0002_turso.sql";
const sql = await fs.readFile(new URL(migrationFile, import.meta.url), "utf8");
const statements = sql.split(";").map(statement => statement.trim()).filter(Boolean);
const requestBody = JSON.stringify({ requests: [...statements.map(statement => ({ type: "execute", stmt: { sql: statement } })), { type: "close" }] });
let lastError;
for (let attempt = 1; attempt <= 5; attempt++) {
  try {
    const response = await fetch(endpoint, { method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": "application/json" }, body: requestBody });
    const body = await response.text();
    if (!response.ok) throw new Error(`Turso migration failed (${response.status}): ${body}`);
    console.log(`Applied ${statements.length} Turso statements.`);
    process.exit(0);
  } catch (error) {
    lastError = error;
    if (attempt < 5) await new Promise(resolve => setTimeout(resolve, attempt * 2000));
  }
}
throw lastError;
