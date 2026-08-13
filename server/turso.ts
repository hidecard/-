type TursoValue = string | number | null | boolean;
type TursoArg = { type: "null" | "integer" | "float" | "text" | "blob"; value?: string };

function endpoint() {
  const url = process.env.TURSO_DATABASE_URL;
  const token = process.env.TURSO_AUTH_TOKEN;
  if (!url || !token) throw new Error("Turso database configuration is missing.");
  return { url: url.replace(/^libsql:/, "https:").replace(/\/$/, "") + "/v2/pipeline", token };
}
function arg(value: TursoValue): TursoArg { if (value === null) return { type: "null" }; if (typeof value === "number") return { type: Number.isInteger(value) ? "integer" : "float", value: String(value) }; if (typeof value === "boolean") return { type: "integer", value: value ? "1" : "0" }; return { type: "text", value }; }
export function decodeTursoValue(value: unknown): TursoValue { if (!value || typeof value !== "object") return value as TursoValue; const envelope = value as { type?: string; value?: unknown }; if (envelope.type === "null") return null; if (envelope.type === "integer") return Number(envelope.value ?? 0); if (envelope.type === "float") return Number(envelope.value ?? 0); if (envelope.type === "text" || envelope.type === "blob") return envelope.value == null ? null : String(envelope.value); if ("value" in envelope) return envelope.value as TursoValue; return value as unknown as TursoValue; }

export async function tursoQuery<T extends Record<string, TursoValue> = Record<string, TursoValue>>(sql: string, values: TursoValue[] = []): Promise<T[]> {
  const { url, token } = endpoint();
  const requestBody = JSON.stringify({ requests: [{ type: "execute", stmt: { sql, args: values.map(arg) } }, { type: "close" }] });
  let lastError: unknown;
  for (let attempt = 1; attempt <= 5; attempt++) {
    const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(url, { method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": "application/json" }, body: requestBody, signal: controller.signal });
      if (!response.ok) throw new Error(`Turso request failed with HTTP ${response.status}.`);
      const payload = await response.json() as { results?: Array<{ type?: string; response?: { result?: { cols?: Array<{ name: string }>; rows?: unknown[][] } } }> };
      const result = payload.results?.[0]?.response?.result;
      const cols = result?.cols || []; const rows = result?.rows || [];
      return rows.map(row => Object.fromEntries(cols.map((col, index) => [col.name, decodeTursoValue(row[index])])) as T);
    } catch (error) { lastError = error; if (attempt < 5) await new Promise(resolve => setTimeout(resolve, attempt * 1000)); }
    finally { clearTimeout(timer); }
  }
  throw lastError;
}
export async function tursoExecute(sql: string, values: TursoValue[] = []) { await tursoQuery(sql, values); }
