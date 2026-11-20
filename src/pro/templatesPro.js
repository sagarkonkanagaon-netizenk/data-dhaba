// Titles and summaries of the 15 Pro production templates. The files live in Pro storage (templates.json),
// built from the private repo (templates/NN-slug/). Generated: do not edit by hand.
export const TEMPLATES = [
 {
  "slug": "pyspark-job",
  "n": 1,
  "title": "PySpark job package",
  "stack": [
   "PySpark",
   "pytest",
   "ruff",
   "GitHub Actions"
  ],
  "summary": "A batch Spark job laid out like a real team's repo: pure transform functions, a thin entry point with config per environment, explicit schemas, unit tests on a local SparkSession, lint and CI.",
  "files": 14
 },
 {
  "slug": "delta-medallion",
  "n": 2,
  "title": "Delta Lake medallion pipeline",
  "stack": [
   "PySpark",
   "Delta Lake",
   "pytest"
  ],
  "summary": "Bronze, silver and gold Delta tables with ingestion metadata, an idempotent MERGE upsert into silver, gold rebuilt per date with replaceWhere, table maintenance, and tests that rerun every step twice.",
  "files": 9
 },
 {
  "slug": "dbt-project",
  "n": 3,
  "title": "dbt project with CI",
  "stack": [
   "dbt Core",
   "DuckDB (swap for Snowflake, BigQuery or Databricks)",
   "GitHub Actions"
  ],
  "summary": "Staging, intermediate and mart layers with naming rules, sources with freshness, an incremental model, a snapshot, generic and singular tests, unit tests, docs, and slim CI that builds only what a PR changed.",
  "files": 19
 },
 {
  "slug": "airflow-dags",
  "n": 4,
  "title": "Airflow DAG repository",
  "stack": [
   "Apache Airflow 3",
   "TaskFlow API",
   "pytest",
   "GitHub Actions"
  ],
  "summary": "A DAG repo with shared defaults, failure alerts, idempotent daily partitions keyed on the logical date, asset-based downstream triggering, logic kept out of DAG files, and DAG integrity tests that run in CI.",
  "files": 14
 },
 {
  "slug": "databricks-asset-bundle",
  "n": 5,
  "title": "Databricks Asset Bundle",
  "stack": [
   "Databricks Asset Bundles",
   "PySpark",
   "Unity Catalog",
   "GitHub Actions"
  ],
  "summary": "A bundle with dev, staging and prod targets, a multi-task job built from a Python wheel, catalog and schema as variables, job clusters, local unit tests, and a CI/CD workflow that validates on PRs and deploys on merge with a service principal.",
  "files": 11
 },
 {
  "slug": "terraform-azure-data-platform",
  "n": 6,
  "title": "Terraform: Azure data platform",
  "stack": [
   "Terraform",
   "azurerm 4.x",
   "ADLS Gen2",
   "Key Vault",
   "Data Factory",
   "Databricks",
   "GitHub Actions"
  ],
  "summary": "Infrastructure for a lakehouse on Azure: a resource group, ADLS Gen2 with bronze/silver/gold containers, Key Vault, Data Factory and a Databricks workspace with managed identities and least-privilege role assignments, one tfvars file per environment, remote state, and a plan-on-PR, apply-on-merge pipeline.",
  "files": 11
 },
 {
  "slug": "docker-compose-data-stack",
  "n": 7,
  "title": "Docker Compose local data stack",
  "stack": [
   "Docker Compose",
   "PostgreSQL",
   "Kafka (KRaft)",
   "SeaweedFS (S3 API)",
   "Apache Spark"
  ],
  "summary": "A laptop data platform in one command: Postgres as the source, Kafka without ZooKeeper, an S3-compatible store with buckets created on start, a Spark master and worker, health checks and start order, pinned images, a .env file for every setting, and a CI job that boots the stack and runs a smoke test.",
  "files": 9
 },
 {
  "slug": "data-contracts",
  "n": 8,
  "title": "Data contracts with CI enforcement",
  "stack": [
   "YAML contracts",
   "Python",
   "DuckDB",
   "GitHub Actions"
  ],
  "summary": "Contracts as YAML (owner, schema, keys, allowed values, freshness SLA, semantic version), a checker that validates real data against them in DuckDB, and a CI gate that blocks breaking changes unless the major version is bumped.",
  "files": 12
 },
 {
  "slug": "kafka-python-services",
  "n": 9,
  "title": "Kafka producer and consumer services",
  "stack": [
   "Apache Kafka",
   "confluent-kafka (Python)",
   "SQLite sink",
   "pytest"
  ],
  "summary": "An idempotent producer with keys and delivery checks, and a consumer that commits offsets only after its write, sends poison messages to a dead-letter topic, dedupes by event id, and shuts down cleanly, with unit tests and an integration test against a real broker.",
  "files": 11
 },
 {
  "slug": "spark-streaming-kafka-delta",
  "n": 10,
  "title": "Spark Structured Streaming: Kafka to Delta",
  "stack": [
   "Spark Structured Streaming",
   "Kafka",
   "Delta Lake",
   "pytest"
  ],
  "summary": "A streaming job that parses Kafka JSON with an explicit schema, routes bad records to a quarantine table, upserts the latest state per key with foreachBatch MERGE (idempotent on replay), runs continuously or as an availableNow batch, and is tested both as pure functions and end to end against a broker.",
  "files": 11
 },
 {
  "slug": "data-quality-wap",
  "n": 11,
  "title": "Data quality checks with write-audit-publish",
  "stack": [
   "Python",
   "DuckDB (any SQL engine)",
   "YAML",
   "pytest"
  ],
  "summary": "Checks declared in YAML per table (row count, uniqueness, nulls, accepted values, freshness, custom SQL, reconciliation, volume anomaly against history), run on a staging copy, stored as results, and a publish step that swaps staging into production only when no blocking check fails.",
  "files": 9
 },
 {
  "slug": "adf-metadata-driven-ingestion",
  "n": 12,
  "title": "Azure Data Factory: metadata-driven ingestion",
  "stack": [
   "Azure Data Factory",
   "Azure SQL",
   "ADLS Gen2",
   "Key Vault",
   "Python validator",
   "GitHub Actions"
  ],
  "summary": "One generic ADF pipeline that copies any number of tables, driven by a control table: Lookup, ForEach, incremental copy with a watermark, watermark update, run logging, managed identity and Key Vault for credentials, plus a validator that checks every reference, parameter and secret rule before deployment.",
  "files": 15
 },
 {
  "slug": "api-ingestion",
  "n": 13,
  "title": "REST API ingestion to the lake",
  "stack": [
   "Python",
   "requests",
   "DuckDB",
   "pytest"
  ],
  "summary": "An incremental API extractor with cursor pagination, retries with backoff and Retry-After for 429s, a stored watermark that only moves after a successful write, raw JSON kept as received, Parquet output by load date, atomic file writes, and tests against a local fake API that fails on purpose.",
  "files": 10
 },
 {
  "slug": "github-actions-data-cicd",
  "n": 14,
  "title": "GitHub Actions CI/CD for data teams",
  "stack": [
   "GitHub Actions",
   "reusable workflows",
   "pre-commit",
   "SQLFluff",
   "OIDC"
  ],
  "summary": "Reusable workflows every data repo can call (Python lint and tests, SQL lint, dbt slim CI, Terraform plan/apply, Databricks bundle deploy), with least-privilege permissions, OIDC instead of stored cloud keys, environment approvals for prod, concurrency guards, plus pre-commit, CODEOWNERS and a PR template, all checked by tests.",
  "files": 14
 },
 {
  "slug": "cdc-debezium-apply",
  "n": 15,
  "title": "CDC with Debezium: capture and apply",
  "stack": [
   "PostgreSQL",
   "Debezium",
   "Kafka Connect",
   "Python",
   "DuckDB"
  ],
  "summary": "Database setup and a Debezium Postgres connector config (pgoutput, publication, heartbeat, snapshot, tombstones), plus an apply job that turns change events into an exact replica: ordered by LSN per key, inserts, updates and deletes, snapshot reads, idempotent on redelivery, and a reconciliation check against the source.",
  "files": 13
 }
]
