# Expanded Authorized Audit Scope

The expanded scanner follows the OWASP Web Security Testing Guide as the testing-coverage reference and uses OWASP Top 10 and ASVS concepts for category mapping and remediation language.

## Safe Coverage

The scanner may perform permission-gated, bounded HTTP/TLS requests and benign reflection/error indicators for headers, TLS, cookies, CORS, redirects, CSP quality, clickjacking, MIME sniffing, referrer leakage, permissions policy, SQL injection indicators, XSS reflection indicators, open redirect indicators, SSRF-like URL handling indicators, and path traversal indicators.

## Explicitly Out of Scope

The scanner must not provide destructive exploitation, credential attacks, brute force, data extraction, database dumping, weaponized payload delivery, stealth, persistence, or unrestricted crawling. A finding is an indicator requiring owner validation, not proof of exploitability.

## References

[1]: https://owasp.org/www-project-web-security-testing-guide/ "OWASP Web Security Testing Guide"
[2]: https://owasp.org/Top10/2021/A00_2021-Introduction/ "OWASP Top 10:2021 Introduction"
[3]: https://owasp.org/www-project-application-security-verification-standard/ "OWASP Application Security Verification Standard"
