import { z } from "zod";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { createScan, getScan, listScans } from "./db";
import { compareFindings, runScan } from "./scanner";

const normalizedTargetInput = z.preprocess(value => { if (typeof value !== "string") return value; const trimmed = value.trim(); return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`; }, z.string().trim().url().max(2048));
const scanInput = z.object({ targetUrl: normalizedTargetInput, mode: z.enum(["quick", "baseline"]).default("baseline"), acknowledged: z.literal(true) });
const scanRate = new Map<number, number[]>();
function enforceScanRate(userId: number) { const now = Date.now(); const recent = (scanRate.get(userId) || []).filter(ts => now - ts < 60_000); if (recent.length >= 3) throw new Error("Scan rate limit reached. Please wait before starting another scan."); recent.push(now); scanRate.set(userId, recent); }

export const scopeDisclaimer = "This report is generated only for an authorized target. Checks are safe/passive-style indicators and are not proof of exploitability.";
export const scanModeScope = { quick: "Quick mode: headers, TLS, cookies, CORS, and redirect checks only; no SQL or XSS probes.", baseline: "Baseline mode: Quick checks plus safe SQL error indicators and benign XSS reflection probes." } as const;
export function serializeJsonReport(result: unknown) { if (result && typeof result === "object") { const record = result as Record<string, any>; const mode = record.scan?.mode === "quick" ? "quick" : "baseline"; return JSON.stringify({ ...record, scopeDisclaimer, scanModeScope: scanModeScope[mode] }, null, 2); } return JSON.stringify({ result, scopeDisclaimer, scanModeScope: scanModeScope.baseline }, null, 2); }

export function pdfSafeText(value: string) { return value.normalize("NFKD").replace(/[→➜]/g, "->").replace(/[—–−]/g, "-").replace(/[…]/g, "...").replace(/[×]/g, "x").replace(/[^\x20-\x7E]/g, "?"); }

export function buildPdfFindingLines(finding: any) { return [`${finding.category}: ${finding.description}`, `OWASP: ${finding.owasp || "Unmapped"} | Priority: ${finding.priority || "P2"}`, `Location: ${finding.method || "GET"} ${finding.endpoint || "/"} ${finding.location || "HTTP response"}${finding.parameter ? `; parameter=${finding.parameter}` : ""}`, `Fix: ${finding.remediation}`, `Verify: ${finding.verification || "Re-run the authorized check after remediation."}`, finding.evidence ? `Evidence: ${finding.evidence}` : ""]; }

export async function makePdf(result: NonNullable<Awaited<ReturnType<typeof getScan>>>) {
  const pdf = await PDFDocument.create(); pdf.setKeywords(result.findings.map(finding => finding.endpoint || "/")); const font = await pdf.embedFont(StandardFonts.Helvetica); const bold = await pdf.embedFont(StandardFonts.HelveticaBold); let page = pdf.addPage([612, 792]); let y = 744;
  const newPage = () => { page = pdf.addPage([612, 792]); y = 744; page.drawText("VIBE SECURE SCANNER", { x: 48, y, size: 18, font: bold, color: rgb(0.95, 0.1, 0.65) }); y -= 28; };
  page.drawText("VIBE SECURE SCANNER", { x: 48, y, size: 18, font: bold, color: rgb(0.95, 0.1, 0.65) }); y -= 27; page.drawText(pdfSafeText(`Authorized audit report - ${result.scan.targetUrl}`).slice(0, 110), { x: 48, y, size: 9, font, color: rgb(0.1, 0.85, 0.95) }); y -= 15; page.drawText(pdfSafeText(`Mode: ${result.scan.mode || "baseline"}   Risk score: ${result.scan.riskScore ?? 0}/100   Duration: ${result.scan.durationMs ?? 0}ms`), { x: 48, y, size: 8, font, color: rgb(0.35, 0.35, 0.42) }); y -= 14; page.drawText(pdfSafeText("AUTHORIZED TARGET ONLY - SAFE/PASSIVE INDICATORS; NOT PROOF OF EXPLOITABILITY"), { x: 48, y, size: 6.5, font, color: rgb(0.55, 0.1, 0.35) }); y -= 12; page.drawText(pdfSafeText(`Scope: ${result.scan.mode === "quick" ? scanModeScope.quick : scanModeScope.baseline}`).slice(0, 125), { x: 48, y, size: 6.5, font, color: rgb(0.35, 0.35, 0.42) }); y -= 18;
  for (const finding of result.findings) {
    if (y < 135) newPage();
    page.drawText(pdfSafeText(`[${finding.severity}] ${finding.title}`).slice(0, 105), { x: 48, y, size: 10, font: bold, color: rgb(0.12, 0.12, 0.16) }); y -= 15;
    for (const line of buildPdfFindingLines(finding)) { if (!line) continue; const chunks = line.match(/.{1,110}(?:\s|$)/g) || [line]; for (const chunk of chunks) { if (y < 55) newPage(); page.drawText(pdfSafeText(chunk.trim()), { x: 58, y, size: 8, font, color: rgb(0.25, 0.25, 0.3) }); y -= 12; } } y -= 10;
  }
  return Buffer.from(await pdf.save()).toString("base64");
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => { const cookieOptions = getSessionCookieOptions(ctx.req); ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 }); return { success: true } as const; }),
  }),
  scans: router({
    start: protectedProcedure.input(scanInput).mutation(async ({ ctx, input }) => { if (input.acknowledged !== true) throw new Error("Authorization acknowledgment is required."); enforceScanRate(ctx.user.id); const result = await runScan(input.targetUrl, input.mode); const id = await createScan(ctx.user.id, result.targetUrl, result); return { id, ...result }; }),
    history: protectedProcedure.query(({ ctx }) => listScans(ctx.user.id)),
    get: protectedProcedure.input(z.object({ id: z.number().int().positive() })).query(async ({ ctx, input }) => { const result = await getScan(ctx.user.id, input.id); if (!result) throw new Error("Scan not found."); return result; }),
    report: protectedProcedure.input(z.object({ id: z.number().int().positive(), format: z.enum(["json", "pdf"]) })).query(async ({ ctx, input }) => { const result = await getScan(ctx.user.id, input.id); if (!result) throw new Error("Scan not found."); if (input.format === "json") return { filename: `vibe-scan-${input.id}.json`, mime: "application/json", content: serializeJsonReport(result) }; return { filename: `vibe-scan-${input.id}.pdf`, mime: "application/pdf", content: await makePdf(result), encoding: "base64" as const }; }),
    compare: protectedProcedure.input(z.object({ beforeId: z.number().int().positive(), afterId: z.number().int().positive() })).query(async ({ ctx, input }) => { const before = await getScan(ctx.user.id, input.beforeId); const after = await getScan(ctx.user.id, input.afterId); if (!before || !after) throw new Error("Both scans must belong to your account."); return { before: before.scan, after: after.scan, ...compareFindings(before.findings.map(finding => ({ ...finding, evidence: finding.evidence ?? undefined, owasp: finding.owasp ?? undefined, location: finding.location ?? undefined, endpoint: finding.endpoint ?? undefined, parameter: finding.parameter ?? undefined, method: finding.method ?? undefined, priority: finding.priority ?? undefined, verification: finding.verification ?? undefined })), after.findings.map(finding => ({ ...finding, evidence: finding.evidence ?? undefined, owasp: finding.owasp ?? undefined, location: finding.location ?? undefined, endpoint: finding.endpoint ?? undefined, parameter: finding.parameter ?? undefined, method: finding.method ?? undefined, priority: finding.priority ?? undefined, verification: finding.verification ?? undefined }))) }; }),
  }),
});
export type AppRouter = typeof appRouter;
