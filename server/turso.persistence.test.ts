import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { createScan, getScan, listScans } from "./db";
import { appRouter, buildPdfFindingLines, makePdf, serializeJsonReport } from "./routers";
import type { TrpcContext } from "./_core/context";
import { tursoExecute } from "./turso";

describe("Turso scan persistence and exports", () => {
  it.skipIf(process.env.TURSO_LIVE_TEST !== "1")("persists a scan, reopens history, and serializes JSON/PDF reports", async () => {
    const userId = 987654321;
    const marker = `https://turso-e2e-${Date.now()}.example.com/?probe=1`;
    const id = await createScan(userId, marker, { mode: "baseline", durationMs: 1234, riskScore: 17, findings: [{ category: "Headers", severity: "Low", title: "E2E test finding", description: "Persistence verification", remediation: "Remove after verification", evidence: "test", owasp: "A05:2021 Security Misconfiguration", location: "HTTP response", endpoint: "/account", method: "GET", priority: "P3", verification: "Re-run the header audit." }] });
    try {
      const history = await listScans(userId);
      expect(history.some(scan => scan.id === id && scan.targetUrl === marker)).toBe(true);
      const reopened = await getScan(userId, id);
      expect(reopened?.findings[0]?.title).toBe("E2E test finding"); expect(reopened?.findings[0]?.owasp).toBe("A05:2021 Security Misconfiguration"); expect(reopened?.findings[0]?.verification).toBe("Re-run the header audit.");
      expect(serializeJsonReport(reopened)).toContain("E2E test finding");
      const pdf = await makePdf(reopened!);
      expect(Buffer.from(pdf, "base64").subarray(0, 5).toString()).toBe("%PDF-"); expect(buildPdfFindingLines(reopened!.findings[0]).some(line => line.includes("/account"))).toBe(true);
      const caller = appRouter.createCaller({ user: { id: userId, openId: "turso-e2e-user", name: "Turso E2E", email: null, loginMethod: "test", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] });
      const jsonReport = await caller.scans.report({ id, format: "json" });
      expect(jsonReport.filename).toBe(`vibe-scan-${id}.json`);
      expect(jsonReport.mime).toBe("application/json");
      expect(jsonReport.content).toContain("E2E test finding"); expect(jsonReport.content).toContain("A05:2021 Security Misconfiguration"); expect(jsonReport.content).toContain("/account");
      const pdfReport = await caller.scans.report({ id, format: "pdf" });
      expect(pdfReport.filename).toBe(`vibe-scan-${id}.pdf`);
      expect(pdfReport.mime).toBe("application/pdf");
      expect(Buffer.from(pdfReport.content, "base64").subarray(0, 5).toString()).toBe("%PDF-"); const pdfDocument = await PDFDocument.load(Buffer.from(pdfReport.content, "base64")); expect(pdfDocument.getKeywords()).toContain("/account");
    } finally {
      await tursoExecute("DELETE FROM findings WHERE scanId=?", [id]);
      await tursoExecute("DELETE FROM scans WHERE id=?", [id]);
    }
  }, 90000);
});
