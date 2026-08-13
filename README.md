

## Security and deployment notes

Every scan requires an authenticated user and an explicit ownership/permission acknowledgment. The scanner rejects local or private-network destinations, uses bounded request timeouts, does not follow redirects automatically, and limits scan initiation to three attempts per user per minute within a running instance. For multi-instance production deployments, replace the in-memory limiter with a shared Redis or database-backed limiter.

The SQL migration file `drizzle/0001_illegal_scourge.sql` defines the `scans` and `findings` tables. In this environment, applying the migration was blocked by a temporary DNS failure resolving the managed TiDB host; rerun the migration through the project database tooling once connectivity is restored before using persistence-dependent scan history and exports.
