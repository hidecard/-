import { runScan } from "../server/scanner.ts";

const target = process.argv[2] || "https://yha-edu.tech/";
const mode = process.argv[3] || "quick";
const result = await runScan(target, mode);
console.log(JSON.stringify({ targetUrl: result.targetUrl, mode: result.mode, riskScore: result.riskScore, findingCount: result.findings.length, categories: [...new Set(result.findings.map(finding => finding.category))] }, null, 2));
