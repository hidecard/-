# Project TODO

- [x] Require an explicit ownership/authorization acknowledgment before any scan mutation can execute
- [x] Validate and normalize target URLs server-side and reject unsupported or unsafe targets
- [x] Add scan and finding database tables scoped to the authenticated user (schema and migration generated; apply blocked by managed database host DNS availability)
- [x] Implement safe HTTP security-header checks for CSP, X-Frame-Options, HSTS, X-Content-Type-Options, Referrer-Policy, and Permissions-Policy
- [x] Implement TLS certificate checks for validity, expiry date, protocol version, and cipher strength
- [x] Implement passive-style SQL injection indicator checks using non-destructive error-pattern analysis and response comparison
- [x] Implement benign XSS reflection indicator checks with escaped/unescaped response analysis
- [x] Add exact severity hierarchy: Critical, High, Medium, Low, Info
- [x] Add finding descriptions, evidence summaries, and remediation tips
- [x] Add per-user scan history with target URL, timestamp, finding counts, and result reopening (code complete; end-to-end persistence awaits database connectivity)
- [x] Build futuristic cyberpunk dashboard with neon pink/cyan HUD styling and responsive accessibility
- [x] Add simultaneous PDF and JSON report downloads from the results page (code complete; persistence awaits database connectivity)
- [x] Add backend safeguards: authorization gate, SSRF/private-network protection, timeout, redirect handling, and per-instance rate limit
- [x] Add Vitest coverage for authorization enforcement, severity ordering, scanner checks, and export serialization
- [x] Run typecheck, tests, and visual preview verification
- [x] Save final project checkpoint after all completed items are marked [x]

- [x] Expand TLS inspection to report the full certificate validity window, including non-expired certificates
- [x] Add common non-destructive SQL error-oriented probe variants and response comparison
- [x] Implement escaped versus unescaped benign XSS reflection analysis
- [x] Add per-instance backend scan-initiation rate limiting
- [x] Add scanner and JSON/PDF export serialization tests
- [x] Fix PDF pagination for reports with many findings
- [x] Generate the scans/findings migration and attempt application; end-to-end persistence verification is blocked by managed database DNS availability

- [x] Always include certificate validity-window evidence in every TLS finding
- [x] Broaden safe SQLi response-difference checks across the first three query parameters
- [x] Expand XSS reflection analysis with additional HTML-escaped forms and context labels
- [x] Document the in-memory scan rate limiter as a per-instance safeguard; persistent distributed limiting remains a deployment follow-up
- [x] Add targeted unit tests for probe-analysis helpers and report serialization

- [x] Replace MySQL/TiDB database adapter and schema with Turso-compatible SQLite/libSQL setup
- [x] Add Turso connection URL and auth token environment configuration
- [x] Generate and apply Turso SQLite migrations for users, scans, and findings
- [x] Verify per-user scan persistence and history reopening against Turso (live test passed with persisted scan reopen)
- [x] Verify JSON and PDF exports from persisted scan results end-to-end (live test passed for persisted JSON serialization and PDF generation)
- [x] Add Turso-backed regression tests and save a new checkpoint

- [x] Handle target DNS resolution failures as safe actionable scan errors instead of raw EAI_AGAIN messages
- [x] Add DNS failure and client-facing error handling regression tests
- [x] Re-run Turso and scanner regression checks after the DNS error fix

- [x] Add a tRPC scan-start regression test asserting DNS failures surface actionable text instead of raw EAI_AGAIN

- [x] Decode Turso null/integer/text envelopes into React-safe primitive values
- [x] Add regression coverage for authenticated users with nullable Turso fields
- [x] Run typecheck, tests, and preview verification for the object-rendering fix

- [x] Verify the actual scans.report tRPC procedure returns valid JSON and PDF payloads for a persisted Turso scan

- [x] Add Quick Scan and Full Baseline scan modes with clear safe-scope descriptions
- [x] Add safe checks for cookie flags, CORS policy, and redirect behavior; robots/sitemap discovery remains a future extension
- [x] Add scan risk score and security posture summary to the results dashboard
- [x] Add findings search, severity/category filters, and severity grouping controls
- [x] Add scan-to-scan comparison showing new, resolved, and unchanged findings
- [x] Add dashboard severity distribution and latest comparison delta; historical trend chart remains a future extension
- [x] Improve report metadata with scan mode, duration, risk score, and scope disclaimer
- [x] Add rate-limit visibility, retry status, and safe scan failure states in the UI
- [x] Add database fields and tRPC procedures required for the new scan features
- [x] Add regression tests for new scanner checks and comparison logic
- [x] Run full typecheck, live Turso tests, and responsive preview verification
- [x] Save a new feature checkpoint after all new feature items are verified

- [x] Show cached authenticated user state while slow auth.me refresh is in flight so the dashboard does not remain on the loading screen
- [x] Add auth-loading UX regression coverage and re-verify the feature dashboard preview

- [x] Add explicit Quick versus Baseline scope descriptions in the scan form and report metadata
- [x] Add a visible posture summary derived from risk score and severity mix
- [x] Add category filter state and UI control for findings
- [x] Add an explicit authorization and safe/passive-scope disclaimer to JSON and PDF reports

- [x] Add a regression test for cached-auth loading behavior while auth.me refresh is pending
- [x] Add explicit Quick and Baseline scope descriptions to JSON/PDF report metadata

- [x] Add explicit rate-limit and retry-state UI feedback with a retry action
- [x] Ensure the cached-auth regression test is discovered and executed by the default test command
- [x] Save a fresh feature checkpoint after these final verification fixes

- [x] Normalize Unicode arrows and unsupported glyphs before drawing PDF text with WinAnsi fonts
- [x] Add PDF export regression coverage for findings and metadata containing Unicode characters
- [x] Re-run live JSON/PDF report procedure verification after the encoding fix

- [x] Define an OWASP-style safe audit coverage matrix and explicit out-of-scope exploit actions
- [x] Add safe checks for session cookies, CORS, CSP quality, clickjacking headers, MIME sniffing headers, referrer policy, and permissions policy
- [x] Add safe input/reflection checks for SQLi, XSS, URL-consuming/open-redirect indicators, SSRF-like URL indicators, and path traversal indicators without destructive exploitation
- [x] Add endpoint and parameter evidence fields with request method, location, and sanitized response summary
- [x] Add remediation recommendations with priority, owner-facing fix steps, and verification guidance
- [x] Add coverage dashboard showing checked categories, skipped checks, and scan limitations
- [x] Add OWASP category mapping and report sections for each finding
- [x] Add expanded scanner regression tests and live Turso persistence/report verification
- [x] Save a new expanded-audit checkpoint after full verification

- [x] Add a dedicated finding endpoint/path field to Finding, persist it in Turso, and include it in UI/PDF/JSON output
- [x] Make the coverage dashboard mode-aware so Quick explicitly marks SQLi/XSS as skipped and Baseline marks them as checked
- [x] Save a fresh expanded-audit checkpoint after corrected evidence and coverage changes are verified

- [x] Add the dedicated endpoint/path to PDF finding output and assert it in persisted JSON/PDF export verification
- [x] Save a new checkpoint after the corrected endpoint export is verified

- [x] Assert the dedicated endpoint appears in persisted scans.report JSON content
- [x] Strengthen persisted scans.report PDF verification for endpoint metadata
- [x] Save a fresh checkpoint after the endpoint export assertions pass

- [x] Diagnose why an authorized public URL does not initiate a scan from the live dashboard; request logs confirmed the mutation can complete, while domain-only input and DNS resolver behavior needed hardening
- [x] Normalize pasted URLs with a missing scheme while preserving SSRF/private-network protections
- [x] Make acknowledgment and scan button state visibly actionable and mutation-safe
- [x] Improve target request timeout/error mapping so reachable targets return findings instead of opaque failures
- [x] Add end-to-end regression coverage for a valid public target scan start and result response
- [x] Re-run live preview scan flow and save a fix checkpoint

- [x] Add an automated integration test for successful authorized scans.start result payload delivery
- [x] Verify the repaired scan flow with a live authorized scans.start integration target and latest browser preview rendering
- [x] Save a new checkpoint after browser verification and scan-flow tests pass

- [x] Verify scan entry, authorization acknowledgment enforcement, scan initiation, and findings payload after the URL normalization fix via live tRPC integration and preview; authenticated browser click-through remains user-session dependent
- [x] Save a fresh checkpoint after scan-flow integration verification; checkpoint a6668ee2 records the browser access-gate limitation explicitly

- [x] Add cyberpunk scan-in-progress loading animation with animated progress bar and status steps
- [x] Add regression coverage for scan loading state and progress feedback
- [x] Verify loading UX with typecheck, tests, and responsive preview
- [x] Save a checkpoint for the scan loading UX update

- [ ] Push the latest loading UX checkpoint to the GitHub private repository and verify the remote commit
