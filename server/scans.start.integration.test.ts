import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { tursoExecute } from "./turso";
import type { TrpcContext } from "./_core/context";

describe("scans.start integration", () => {
  it.skipIf(process.env.TURSO_LIVE_TEST !== "1")("starts an authorized public Quick scan and returns findings", async () => {
    const userId = 987654322;
    const caller = appRouter.createCaller({
      user: { id: userId, openId: "scan-start-e2e", name: "Scan Start E2E", email: null, loginMethod: "test", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
      req: {} as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    });
    let scanId: number | undefined;
    try {
      const result = await caller.scans.start({ targetUrl: "example.com", mode: "quick", acknowledged: true });
      scanId = result.id;
      expect(result.id).toBeGreaterThan(0);
      expect(result.targetUrl).toBe("https://example.com/");
      expect(result.mode).toBe("quick");
      expect(result.findings.length).toBeGreaterThan(0);
      expect(typeof result.riskScore).toBe("number");
    } finally {
      if (scanId) {
        await tursoExecute("DELETE FROM findings WHERE scanId=?", [scanId]);
        await tursoExecute("DELETE FROM scans WHERE id=?", [scanId]);
      }
    }
  }, 120000);
});
