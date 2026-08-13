import React from "react";
import { describe, expect, it } from "vitest";
import { getPosture, getScanProgressStep, getUserLabel, normalizeTargetUrl, scanProgressSteps } from "./Home";
import { getCachedUser, shouldShowAuthLoading } from "@/_core/hooks/useAuth";
import { renderToStaticMarkup } from "react-dom/server";
import { ScanProgressPanel } from "./Home";

describe("Home user display", () => {
  it("uses cached auth data while auth.me is still loading", () => { const cached = getCachedUser('{"id":1,"name":"YHA Computer"}'); expect(cached.name).toBe("YHA Computer"); expect(shouldShowAuthLoading(true, cached)).toBe(false); expect(shouldShowAuthLoading(true, undefined)).toBe(true); expect(getCachedUser("not-json")).toBeUndefined(); });
  it("normalizes pasted domains into public HTTPS targets", () => { expect(normalizeTargetUrl("example.com")).toBe("https://example.com/"); expect(normalizeTargetUrl(" https://example.com/path ")).toBe("https://example.com/path"); expect(normalizeTargetUrl("https://")).toBeNull(); expect(normalizeTargetUrl("javascript:alert(1)")).toBeNull(); });
  it("derives a visible posture from scanner risk", () => { expect(getPosture(80, [])).toBe("HIGH EXPOSURE"); expect(getPosture(40, [])).toBe("HARDENING ADVISED"); expect(getPosture(10, [])).toBe("BASELINE STABLE"); });
  it("maps scan progress to deterministic cyberpunk status stages", () => { expect(scanProgressSteps).toHaveLength(5); expect(getScanProgressStep(0)).toBe("QUEUING SAFE REQUESTS"); expect(getScanProgressStep(51)).toBe("INSPECTING HTTP + TLS"); expect(getScanProgressStep(100)).toBe("ASSEMBLING FINDINGS"); });
  it("renders the in-flight progress panel with accessible status feedback", () => { const markup = renderToStaticMarkup(React.createElement(ScanProgressPanel, { progress: 51 })); expect(markup).toContain('role="status"'); expect(markup).toContain("51%"); expect(markup).toContain("INSPECTING HTTP + TLS"); expect(markup).toContain("PASSIVE MODE / NO DESTRUCTIVE PAYLOADS"); });
  it("never returns a nullable Turso envelope object as a React child", () => {
    expect(getUserLabel({ name: { type: "null" }, email: { type: "null" } })).toBe("AUTHORIZED OPERATOR");
    expect(getUserLabel({ name: null, email: "yhacomputer@gmail.com" })).toBe("yhacomputer@gmail.com");
    expect(getUserLabel({ name: "YHA Computer", email: null })).toBe("YHA Computer");
  });
});
