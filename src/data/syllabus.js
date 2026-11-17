import { MORE, MORE2, MORE3 } from './syllabusMore.js'

// Full syllabus for every Atlas tool: modules from first steps to production and interviews.
// Topic titles are public so learners can see the whole road; every explanation is Pro.
// Format: 'Module: topic; topic; topic'.

const RAW = {
  // ───────────── Ingest
  adf: [
    'Foundations: What ADF is and where it sits in an Azure platform; Workspaces, ADF Studio and Git mode; Linked services, datasets and integration runtimes; Azure IR vs self-hosted IR vs Azure-SSIS IR; Pricing: activity runs, DIU hours and data flow cores',
    'Copy activity: Copy from SQL Server to ADLS as Parquet; Source and sink settings that matter; Staged copy and PolyBase/COPY into Synapse; Fault tolerance and skipping bad rows; Parallel copies and DIU tuning',
    'Pipelines and control flow: Parameters, variables and system variables; Expression language and dynamic content; Lookup, ForEach, If, Switch, Until; Get Metadata and Filter for file-driven loads; Execute Pipeline and parent/child design',
    'Patterns: Metadata-driven framework from a control table; Incremental load with watermarks; Change tracking and CDC from Azure SQL; Upserts into Delta and SQL; Handling late and reprocessed files',
    'Mapping data flows: When to use data flows vs Databricks; Joins, derived columns, aggregates and windows; Schema drift and late binding; Debug clusters and partitioning; Data flow cost control',
    'Operations: Triggers: schedule, tumbling window, storage and custom events; Monitoring, alerts and Log Analytics; Retries, timeouts and failure paths; CI/CD with ARM templates and Azure DevOps; Managed identity, Key Vault and private endpoints',
    'Interview level: Design a 500-table ingestion framework; Why is my copy slow; Tumbling window vs schedule trigger; Self-hosted IR high availability; ADF vs Fabric Data Factory vs Airflow',
  ],
  'fabric-pipelines': [
    'Foundations: Fabric workspaces, capacities and items; Data pipelines vs Dataflow Gen2; Connections and the on-premises gateway; How it differs from classic ADF',
    'Building pipelines: Copy job and Copy activity into a Lakehouse; Parameters and dynamic content; Notebook and stored procedure activities; Incremental copy patterns',
    'Dataflow Gen2: Power Query transforms at scale; Staging and fast copy; Output destinations; When Dataflow Gen2 is the wrong tool',
    'Operations: Scheduling and event triggers; Monitoring hub and run history; Deployment pipelines and Git integration; Capacity units and throttling',
    'Interview level: Migrate ADF pipelines to Fabric; Lakehouse vs Warehouse as the target; Cost and capacity planning questions',
  ],
  glue: [
    'Foundations: Glue as serverless Spark; Jobs, crawlers, catalog and connections; DPUs, worker types and pricing; Glue versions and Spark versions',
    'Data Catalog: Databases, tables and partitions; Crawlers: when to use and when to avoid; Partition projection for Athena; Schema versions and classifiers',
    'Writing jobs: GlueContext, DynamicFrame and DataFrame; Reading from S3, JDBC and Kinesis; Job bookmarks for incremental loads; Pushdown predicates and partition pruning; Writing Parquet, Iceberg, Hudi and Delta',
    'Performance: Small files and groupFiles; Worker sizing and auto scaling; Spark UI and metrics in CloudWatch; Skew and shuffle in Glue jobs',
    'Operations: Workflows and triggers; Glue Data Quality rules; IAM roles, Lake Formation and encryption; CI/CD with CloudFormation or Terraform; Interactive sessions and notebooks',
    'Interview level: Glue vs EMR vs EMR Serverless; How job bookmarks work and fail; Design a raw-to-curated lake on S3; Cutting a Glue bill in half',
  ],
  dms: [
    'Foundations: Replication instances, endpoints and tasks; Full load, CDC and full load plus CDC; Supported sources and targets',
    'CDC in depth: Binlog, WAL and redo log prerequisites; LOB handling modes; Table mappings and transformation rules; Writing CDC to S3 as Parquet',
    'Operations: Validation and table statistics; Monitoring latency and CloudWatch metrics; Sizing and Multi-AZ; Serverless DMS',
    'Interview level: Migrate an Oracle database with near-zero downtime; DMS vs Debezium vs Glue; Merge CDC files into an Iceberg table',
  ],
  datastream: [
    'Foundations: Streams, connection profiles and private connectivity; MySQL, PostgreSQL and Oracle sources; Backfill vs CDC',
    'Targets: Direct to BigQuery with merge or append; Writing to Cloud Storage; Staleness settings and cost',
    'Interview level: Datastream vs Dataflow templates; Handling schema changes from the source',
  ],
  autoloader: [
    'Foundations: cloudFiles source and how it finds new files; Directory listing vs file notification mode; Checkpoints and exactly-once',
    'Schema handling: Schema inference and schema location; Schema evolution modes; Rescued data column; Schema hints',
    'Patterns: Bronze ingestion with Auto Loader; Trigger availableNow for batch-style runs; Backfills and reprocessing; Auto Loader in declarative pipelines',
    'Operations: Monitoring backlog and file counts; Cloud permissions for notification mode; Cost of listing at scale',
    'Interview level: Auto Loader vs COPY INTO; What happens when a file is re-uploaded; Recover from a corrupted checkpoint',
  ],
  fivetran: [
    'Foundations: Connectors, destinations and sync frequency; MAR pricing; Schema and column selection',
    'Data behaviour: History mode and soft deletes; Re-syncs and backfills; Fivetran system columns',
    'Operations: Transformations and dbt integration; Alerts, logs and lineage; Security and SSH tunnels',
    'Interview level: Build vs buy for connectors; Controlling Fivetran cost; Fivetran vs Airbyte',
  ],
  airbyte: [
    'Foundations: Sources, destinations and connections; Self-hosted vs cloud; Sync modes: full refresh, incremental, dedup',
    'Building: Connector Builder for custom APIs; Normalisation and typing; State and cursor fields',
    'Interview level: Running Airbyte with Airflow; Handling API rate limits',
  ],
  debezium: [
    'Foundations: Log-based CDC explained; Debezium on Kafka Connect; Change event format: before, after, op, source',
    'Connectors: PostgreSQL logical replication and slots; MySQL binlog setup; SQL Server and Oracle notes; Snapshots: initial, incremental and blocking',
    'Pipelines: Topic routing and SMTs; Schema registry and Avro; Outbox pattern; Applying changes to Delta or Iceberg with MERGE',
    'Operations: Replication slot growth and WAL bloat; Restarts, offsets and duplicates; Monitoring lag; Schema changes at the source',
    'Interview level: Exactly-once from CDC to the lake; Debezium vs DMS vs Fivetran; Handle deletes in SCD2',
  ],

  // ───────────── Storage
  adls: [
    'Foundations: Storage accounts, containers and the hierarchical namespace; Blob vs ADLS Gen2; Access tiers and lifecycle rules; Redundancy options',
    'Lake layout: Raw, bronze, silver and gold zones; Folder and partition naming; File formats and sizes; Separating environments',
    'Security: RBAC vs ACLs; Managed identities and service principals; SAS tokens and when not to use them; Private endpoints and firewalls; Encryption and customer-managed keys',
    'Access from tools: Mounting vs abfss paths in Databricks; Unity Catalog external locations; Synapse and ADF access; AzCopy and Storage Explorer',
    'Operations: Monitoring and cost analysis; Soft delete and versioning; Small file problems',
    'Interview level: Design a secure multi-team lake; ACL vs RBAC scenarios; Why is my listing slow',
  ],
  onelake: [
    'Foundations: OneLake as one lake per tenant; Workspaces, Lakehouses and folders; Delta as the default format',
    'Shortcuts and mirroring: Shortcuts to ADLS, S3 and GCS; Database mirroring; OneLake file explorer',
    'Security: Workspace roles and OneLake data access roles; Sharing across workspaces',
    'Interview level: OneLake vs ADLS Gen2; Designing medallion in Fabric',
  ],
  s3: [
    'Foundations: Buckets, prefixes and objects; Storage classes and lifecycle; Consistency model; Request pricing',
    'Lake layout: Prefix design and partitioning; File sizes and formats; Raw, staged and curated buckets',
    'Security: IAM policies vs bucket policies; Encryption SSE-S3, SSE-KMS; Block public access; Access points and VPC endpoints; Lake Formation on top of S3',
    'Operations: Versioning and replication; Event notifications to Lambda and SQS; S3 Inventory and Storage Lens; Request rate limits',
    'Interview level: Design a cost-efficient lake; Why Athena scans too much; Prevent accidental deletes',
  ],
  gcs: [
    'Foundations: Buckets, objects and storage classes; Location types; Lifecycle and retention',
    'Security: IAM and uniform bucket-level access; Signed URLs; CMEK',
    'Lake use: External tables in BigQuery; BigLake; Notifications to Pub/Sub',
    'Interview level: GCS vs S3 vs ADLS; Cost control at scale',
  ],
  'delta-lake': [
    'Foundations: Why plain Parquet lakes break; The transaction log explained; ACID on object storage; Creating and reading Delta tables',
    'Writing: Append, overwrite and replaceWhere; MERGE for upserts; Schema enforcement and evolution; Generated and identity columns; Constraints',
    'Reading the past: Time travel and versions; RESTORE; Change data feed; Table history and audit',
    'Performance: OPTIMIZE and compaction; Z-ORDER vs liquid clustering; Data skipping and statistics; Deletion vectors; Partitioning rules of thumb',
    'Maintenance: VACUUM and retention; Checkpoints and log cleanup; Concurrency and conflict errors; Table properties that matter',
    'Patterns: SCD Type 1 and Type 2 with MERGE; Streaming into and out of Delta; Medallion architecture; UniForm for Iceberg readers',
    'Interview level: How Delta gives ACID; MERGE is slow, what do you do; VACUUM broke time travel; Delta vs Iceberg vs Hudi',
  ],
  iceberg: [
    'Foundations: Table format vs file format; Metadata, manifests and snapshots; Catalogs: REST, Glue, Hive, Nessie, JDBC',
    'Features: Hidden partitioning and partition evolution; Schema evolution by ID; Time travel and branching; Row-level deletes: copy-on-write vs merge-on-read',
    'Engines: Iceberg with Spark; Iceberg with Trino and Athena; Iceberg with Flink; Snowflake and BigQuery Iceberg tables',
    'Maintenance: Expire snapshots; Rewrite data files and manifests; Remove orphan files',
    'Interview level: Why Iceberg won the format war; Iceberg vs Delta in practice; Design a multi-engine lake',
  ],
  hudi: [
    'Foundations: Copy-on-write vs merge-on-read tables; Timeline and instants; Record keys and precombine fields',
    'Operations: Upserts and incremental queries; Compaction and clustering; Cleaning',
    'Interview level: Where Hudi fits best; Hudi vs Delta for CDC',
  ],
  parquet: [
    'Foundations: Row vs columnar storage; Row groups, column chunks and pages; Encodings: dictionary, RLE, delta',
    'Performance: Compression codecs; Predicate pushdown and statistics; Column pruning; Ideal file and row-group sizes',
    'Schema: Logical types, decimals and timestamps; Nested data; Schema evolution limits',
    'Interview level: Parquet vs ORC vs Avro; Why small Parquet files hurt; Reading a Parquet footer',
  ],

  // ───────────── Process
  'synapse-spark': [
    'Foundations: Spark pools, nodes and autoscale; Notebooks and Spark job definitions; Lake databases and shared metadata',
    'Working: Reading ADLS with linked services; Writing Delta; Calling from Synapse pipelines; Libraries and packages',
    'Operations: Session sizing and cost; Monitoring with Spark UI; Security and managed private endpoints',
    'Interview level: Synapse Spark vs Databricks; Migrating Synapse to Fabric',
  ],
  emr: [
    'Foundations: Clusters, nodes and instance groups; EMR on EC2 vs EMR on EKS vs EMR Serverless; Release labels and applications',
    'Running jobs: Steps and spark-submit; EMRFS and S3 access; Hive metastore vs Glue catalog; Bootstrap actions',
    'Cost and scale: Spot instances and instance fleets; Managed scaling; Transient vs long-running clusters',
    'Operations: Logs, Spark history server and CloudWatch; Security configurations and Kerberos; Orchestrating with Airflow or Step Functions',
    'Interview level: EMR vs Glue; Make a nightly EMR job 60% cheaper; Debug a failed step',
  ],
  dataproc: [
    'Foundations: Clusters, Serverless Spark and workflow templates; Images and initialization actions',
    'Working: Submitting jobs; BigQuery and GCS connectors; Autoscaling policies; Preemptible workers',
    'Interview level: Dataproc vs Dataflow; Migrating on-prem Hadoop to Dataproc',
  ],
  dataflow: [
    'Foundations: Apache Beam model: PCollections, transforms, pipelines; Runners and why Dataflow; Batch and streaming in one API',
    'Building: ParDo, GroupByKey, CoGroupByKey and Combine; Windowing, triggers and watermarks; Side inputs and outputs; I/O connectors for Pub/Sub, BigQuery and GCS',
    'Operations: Templates and Flex templates; Autoscaling and Streaming Engine; Monitoring, lag and stuck pipelines; Updating and draining jobs',
    'Interview level: Exactly-once in Dataflow; Late data handling; Dataflow vs Spark Structured Streaming',
  ],
  databricks: [
    'Foundations: Workspace, control plane and data plane; Clusters, pools and serverless compute; Notebooks, repos and files; DBUs and how the bill works',
    'Data engineering: Reading and writing Delta; Auto Loader for ingestion; Medallion pipelines in notebooks; Lakeflow Declarative Pipelines; Lakeflow Jobs and task graphs',
    'Governance: Unity Catalog: metastore, catalogs, schemas; Grants, row filters and column masks; External locations and volumes; Lineage and system tables',
    'Performance: Photon; Cluster sizing and autoscaling; Liquid clustering and OPTIMIZE; Caching layers; Reading the Spark UI in Databricks',
    'Platform: Databricks SQL warehouses; Asset Bundles and CI/CD; Secrets and service principals; Cost control with policies and tags',
    'ML and AI touchpoints: Feature tables; Model serving basics for data engineers; Vector search and AI functions',
    'Interview level: Design a lakehouse on Databricks; Job cluster vs all-purpose cluster; Job is slow, walk me through it; Databricks vs Snowflake vs Fabric',
  ],
  spark: [
    'Foundations: Why distributed processing; Driver, executors, cores and memory; Jobs, stages and tasks; Lazy evaluation and the DAG; RDD vs DataFrame vs Dataset',
    'DataFrame API: Reading CSV, JSON, Parquet and Delta; select, filter, withColumn and expressions; Joins of every kind; groupBy and aggregations; Window functions; Complex types: arrays, maps, structs, explode',
    'Spark SQL: Temp views and the catalog; SQL vs DataFrame API; UDFs vs pandas UDFs vs built-ins; Higher-order functions',
    'Internals: Catalyst optimizer and physical plans; Reading explain output; Tungsten and whole-stage codegen; Partitions and how they are created; Shuffle explained; Memory model: execution vs storage',
    'Performance: Partition sizing and repartition vs coalesce; Broadcast joins and thresholds; Data skew and salting; Adaptive Query Execution; Caching and persistence levels; Spill and OOM; Small files on read and write; Dynamic partition pruning',
    'Production: spark-submit and deploy modes; Cluster managers: YARN, Kubernetes, standalone; Configuration that matters; Testing PySpark code; Logging and the Spark UI',
    'Interview level: Explain a shuffle on a whiteboard; Why one task runs forever; Executor OOM vs driver OOM; Narrow vs wide transformations; Tune a 2-hour job to 20 minutes',
  ],
  pandas: [
    'Foundations: Series and DataFrames; Reading files and databases; Indexing with loc and iloc; Dtypes and memory',
    'Transform: Filtering, assign and query; groupby, agg and transform; merge and join; pivot, melt and reshape; Dates and time series',
    'Polars: Lazy vs eager; Expressions API; Why Polars is fast; Migrating pandas code',
    'Performance: Vectorise, do not loop; Chunked reading; Arrow and Parquet; When to move to Spark or DuckDB',
    'Interview level: pandas vs Polars vs Spark; Out-of-memory on a 10 GB file',
  ],
  duckdb: [
    'Foundations: In-process OLAP explained; Querying Parquet, CSV and JSON directly; Persistent vs in-memory databases',
    'Working: SQL extensions that save time; Python and pandas integration; Reading S3 and HTTP; Extensions: httpfs, json, iceberg, delta',
    'Use cases: Local development for pipelines; dbt-duckdb; Data quality checks in CI',
    'Interview level: When DuckDB beats Spark; Limits of a single node',
  ],

  // ───────────── Warehouse
  'synapse-sql': [
    'Foundations: Dedicated vs serverless SQL pools; DWUs and pausing; Control node and 60 distributions',
    'Design: Hash, round-robin and replicated tables; Choosing the distribution key; Clustered columnstore and partitions; Statistics',
    'Loading: COPY INTO and PolyBase; CETAS and external tables; Serverless OPENROWSET over the lake',
    'Operations: Workload management and resource classes; Data movement and skew diagnosis; Result set caching and materialised views',
    'Interview level: Fix data skew in a dedicated pool; Serverless vs dedicated cost; Migrating Synapse to Fabric Warehouse',
  ],
  'fabric-wh': [
    'Foundations: Warehouse vs Lakehouse SQL endpoint; Delta under the hood; Capacity units',
    'Working: T-SQL support and limits; Loading with COPY and pipelines; Cross-database queries',
    'Operations: Security and row-level security; Query insights; Zero-copy clones and time travel',
    'Interview level: Lakehouse or Warehouse for gold; Fabric Warehouse vs Synapse dedicated',
  ],
  redshift: [
    'Foundations: Leader and compute nodes; RA3 and managed storage; Redshift Serverless; Columnar storage and compression',
    'Design: Distribution styles: KEY, EVEN, ALL, AUTO; Sort keys; Choosing keys for joins',
    'Loading: COPY from S3 and manifests; UPSERT patterns with staging tables; Redshift Spectrum; Zero-ETL integrations',
    'Operations: WLM and concurrency scaling; VACUUM and ANALYZE; System tables for slow queries; Materialised views',
    'Interview level: Query is slow, find out why; Redshift vs Snowflake; Distribution key mistakes',
  ],
  athena: [
    'Foundations: Serverless SQL on S3; Trino engine; Pricing per TB scanned',
    'Performance: Partitioning and partition projection; Parquet and compression; CTAS and INSERT INTO; Iceberg tables in Athena',
    'Operations: Workgroups and limits; Federated queries; Saved queries and results',
    'Interview level: Cut Athena cost by 90%; Athena vs Redshift Spectrum',
  ],
  bigquery: [
    'Foundations: Serverless architecture: Dremel, Colossus, slots; Projects, datasets and tables; On-demand vs capacity pricing',
    'Design: Partitioned tables; Clustering; Nested and repeated fields; Choosing between them',
    'Loading: Load jobs vs streaming vs Storage Write API; External tables and BigLake; Scheduled queries; Data transfer service',
    'SQL: Standard SQL features; MERGE and DML limits; Scripting and stored procedures; UDFs and remote functions',
    'Operations: INFORMATION_SCHEMA for cost and jobs; Slot reservations and editions; Row-level and column-level security; Materialised views and BI Engine',
    'Interview level: Query costs too much, fix it; Partition vs cluster; Designing for a 10 TB daily load',
  ],
  snowflake: [
    'Foundations: Storage, compute and cloud services layers; Virtual warehouses and credits; Databases, schemas and stages; Editions and pricing',
    'Loading: Stages and file formats; COPY INTO; Snowpipe and Snowpipe Streaming; External tables and Iceberg tables',
    'Data engineering: Streams and tasks for CDC; Dynamic tables; MERGE patterns; Stored procedures and Snowpark',
    'Performance: Micro-partitions and pruning; Clustering keys; Result, local disk and remote caches; Query profile reading; Search optimisation and materialised views',
    'Platform: Time travel and fail-safe; Zero-copy cloning; Data sharing and marketplace; Roles, RBAC and masking policies; Resource monitors and cost control',
    'Interview level: Why is my warehouse burning credits; Streams vs dynamic tables; Snowflake vs Databricks; Design multi-env with clones',
  ],
  dbsql: [
    'Foundations: SQL warehouses: classic, pro, serverless; Photon; Query editor and dashboards',
    'Working: Querying Unity Catalog tables; Materialised views and streaming tables; Query history and profile',
    'Interview level: Sizing a SQL warehouse; Databricks SQL vs Snowflake for BI',
  ],
  postgres: [
    'Foundations: Tables, schemas and roles; Data types that matter; Transactions and MVCC',
    'Performance: Indexes: B-tree, GIN, BRIN; Reading EXPLAIN ANALYZE; VACUUM and bloat; Partitioning',
    'As a source: Logical replication and slots; Read replicas for extraction; Extracting large tables safely',
    'Features: JSONB; CTEs and window functions; Extensions; Foreign data wrappers',
    'Interview level: Postgres as a warehouse, yes or no; Slow query diagnosis; Replication slot filled the disk',
  ],
  trino: [
    'Foundations: Coordinator and workers; Connectors and catalogs; Federated queries',
    'Working: Querying Iceberg and Hive; Cost-based optimizer; Memory limits and spill',
    'Interview level: Trino vs Spark SQL; Running Trino for ad hoc lake queries',
  ],
  clickhouse: [
    'Foundations: MergeTree family; Primary key and ordering; Columnar compression',
    'Working: Materialised views for real-time rollups; Ingesting from Kafka; Distributed tables',
    'Interview level: ClickHouse vs BigQuery for real-time analytics',
  ],

  // ───────────── Stream
  eventhubs: [
    'Foundations: Namespaces, event hubs, partitions and consumer groups; Throughput and processing units; Retention and Capture',
    'Producers and consumers: SDKs and the Kafka endpoint; Partition keys and ordering; Checkpointing',
    'Integrations: Capture to ADLS; Spark Structured Streaming with Event Hubs; Stream Analytics and Fabric eventstreams',
    'Operations: Throttling and scaling; Monitoring lag; Security with managed identity and private endpoints',
    'Interview level: Event Hubs vs Kafka; Design an IoT ingestion path; Replay events after a bug',
  ],
  asa: [
    'Foundations: Inputs, query, outputs; Streaming units; Windowing functions',
    'Working: Reference data joins; Late arrival and out-of-order policies; Output to Synapse, Power BI and ADLS',
    'Interview level: Stream Analytics vs Spark streaming',
  ],
  kinesis: [
    'Foundations: Data Streams, Firehose and Analytics; Shards and capacity modes; Retention',
    'Working: Producers, KPL and partition keys; Consumers, KCL and enhanced fan-out; Firehose to S3 with transforms',
    'Interview level: Kinesis vs MSK; Hot shards and resharding',
  ],
  msk: [
    'Foundations: Provisioned vs serverless; Brokers, storage and networking; MSK Connect',
    'Operations: IAM auth and TLS; Monitoring and scaling; Tiered storage',
    'Interview level: Running Kafka yourself vs MSK',
  ],
  pubsub: [
    'Foundations: Topics, subscriptions and messages; Push vs pull; Ordering keys',
    'Working: Acks, retries and dead-letter topics; Exactly-once delivery; BigQuery subscriptions',
    'Interview level: Pub/Sub vs Kafka; Handling duplicates downstream',
  ],
  sss: [
    'Foundations: Micro-batch model; Sources and sinks; Output modes: append, update, complete; Triggers: processingTime, availableNow, continuous',
    'Stateful processing: Watermarks and late data; Windowed aggregations; Stream-stream and stream-static joins; dropDuplicates and dropDuplicatesWithinWatermark; Arbitrary state with transformWithState',
    'Reliability: Checkpoints and what they store; Exactly-once with Delta; foreachBatch and idempotent writes; Recovery after failures and code changes',
    'Operations: Monitoring progress and lag; State store size and RocksDB; Small files from streaming; Scaling streaming jobs',
    'Interview level: Exactly-once end to end; Watermark set wrong, what happens; Streaming vs batch with availableNow; Upgrade a streaming job safely',
  ],
  kafka: [
    'Foundations: Topics, partitions and offsets; Brokers, replication and ISR; Producers and consumers; Consumer groups and rebalancing; KRaft vs ZooKeeper',
    'Producers: Acks, retries and idempotence; Batching, linger and compression; Keys and partitioning; Transactions',
    'Consumers: Offset commits: auto vs manual; At-most, at-least and exactly-once; Rebalance protocols; Lag and how to read it',
    'Ecosystem: Kafka Connect and connectors; Schema Registry with Avro and Protobuf; Kafka Streams and ksqlDB; MirrorMaker and multi-cluster',
    'Operations: Retention and compaction; Partition count planning; Monitoring brokers and lag; Security: TLS, SASL and ACLs',
    'Interview level: How Kafka guarantees ordering; Exactly-once semantics explained; Consumer lag is growing, fix it; Kafka vs Event Hubs vs Kinesis',
  ],
  flink: [
    'Foundations: Streams, operators and parallelism; JobManager and TaskManagers; DataStream API vs Table API and SQL',
    'Time and state: Event time and watermarks; Keyed state and timers; State backends and RocksDB; Windows and late data',
    'Reliability: Checkpoints and savepoints; Exactly-once sinks; Restart strategies',
    'Operations: Deploying on Kubernetes; Backpressure diagnosis; Scaling and rescaling state',
    'Interview level: Flink vs Spark Structured Streaming; Real-time fraud detection design',
  ],

  // ───────────── Orchestrate
  'adf-orch': [
    'Foundations: Pipelines as the unit of orchestration; Activities and dependencies: success, failure, completion, skipped; Triggers and their types',
    'Patterns: Parent/child pipelines; Calling Databricks notebooks and jobs; Web and Azure Function activities; Restartability and rerun from failure',
    'Operations: Alerts and Logic Apps notifications; Concurrency and queueing; SLA monitoring',
    'Interview level: Build a dependency between two pipelines; ADF orchestration vs Airflow',
  ],
  mwaa: [
    'Foundations: Environments, workers and schedulers; DAGs in S3; requirements and plugins',
    'Operations: Scaling and worker classes; Secrets Manager backend; Logging to CloudWatch; Upgrading Airflow versions',
    'Interview level: MWAA vs self-hosted Airflow',
  ],
  stepfn: [
    'Foundations: State machines and Amazon States Language; Standard vs Express workflows; Task, Choice, Map and Parallel states',
    'Working: Calling Glue, EMR and Lambda; Retries and catch; Distributed Map for large fan-out',
    'Interview level: Step Functions vs Airflow',
  ],
  composer: [
    'Foundations: Composer environments and versions; GKE under the hood; DAG bucket',
    'Operations: Scaling and workloads config; Google operators for BigQuery and Dataflow; Cost control',
    'Interview level: Composer vs Workflows vs Dataform schedules',
  ],
  'dbx-jobs': [
    'Foundations: Jobs, tasks and task graphs; Job clusters vs serverless; Task types',
    'Working: Parameters and task values; Conditional and for-each tasks; Retries, timeouts and repair runs; File arrival and table triggers',
    'Operations: Notifications and system tables; Deploying with Asset Bundles',
    'Interview level: Lakeflow Jobs vs Airflow for a Databricks shop',
  ],
  airflow: [
    'Foundations: DAGs, tasks and operators; Scheduler, executor, workers, metadata DB; Logical date and data intervals; Airflow 3 changes',
    'Building DAGs: TaskFlow API; Dependencies and trigger rules; XComs and their limits; Templating and macros; Dynamic task mapping',
    'Scheduling: Cron, timetables and assets; Catchup and backfill; Sensors, deferrable operators and triggers; Pools, priority and concurrency',
    'Integrations: Providers for AWS, Azure, GCP, Databricks, Snowflake; Connections and secrets backends; Running dbt and Spark from Airflow',
    'Operations: Executors: Local, Celery, Kubernetes; Idempotent tasks and retries; SLAs, alerts and callbacks; Testing DAGs and CI',
    'Interview level: Backfill a month safely; Why tasks are stuck in queued; Design a DAG for 200 tables; Airflow vs Dagster vs ADF',
  ],
  dagster: [
    'Foundations: Software-defined assets; Ops, jobs and graphs; Resources and IO managers',
    'Working: Partitions and backfills; Sensors and schedules; Asset checks; dbt integration',
    'Interview level: Assets vs tasks thinking; Dagster vs Airflow',
  ],

  // ───────────── Transform
  dbt: [
    'Foundations: What dbt does and does not do; Projects, profiles and adapters; Models, sources and ref; dbt Core vs dbt Cloud',
    'Modelling: Staging, intermediate and marts layers; Materialisations: view, table, incremental, ephemeral; Incremental strategies: append, merge, delete+insert, microbatch; Snapshots for SCD2; Seeds',
    'Quality: Generic and singular tests; Unit tests; Source freshness; Contracts and constraints',
    'Jinja and packages: Macros; Variables and target; dbt_utils and other packages; Hooks and operations',
    'Production: Selectors and state: slim CI; Environments and deployment; Docs and lineage; Semantic layer and metrics; Exposures',
    'Interview level: Incremental model is duplicating rows; Design a dbt project for 300 models; dbt vs stored procedures; How slim CI works',
  ],
  'dlt-pipes': [
    'Foundations: Declarative tables vs imperative code; Streaming tables and materialised views; Pipelines and targets',
    'Working: Expectations; APPLY CHANGES / AUTO CDC for SCD1 and SCD2; Flows and append flows',
    'Operations: Event log; Serverless vs classic compute; Development vs production mode',
    'Interview level: Declarative pipelines vs notebooks plus jobs',
  ],
  dataform: [
    'Foundations: SQLX files, workflows and repositories; ref and dependencies',
    'Working: Incremental tables; Assertions; Release and workflow configs',
    'Interview level: Dataform vs dbt on BigQuery',
  ],
  sqlmesh: [
    'Foundations: Models and plans; Virtual data environments',
    'Working: Incremental by time range; Audits and tests; dbt compatibility',
    'Interview level: SQLMesh vs dbt',
  ],

  // ───────────── Quality
  'purview-dq': [
    'Foundations: Data quality in Purview Unified Catalog; Rules and scores; Connections',
    'Interview level: Where Purview DQ fits next to pipeline checks',
  ],
  'glue-dq': [
    'Foundations: DQDL rules; Recommendations; Catalog vs ETL checks',
    'Working: Acting on failures; Anomaly detection',
    'Interview level: Glue DQ vs Great Expectations',
  ],
  'dataplex-dq': [
    'Foundations: Auto data quality scans; Rule types; Publishing results',
    'Interview level: Data profiling vs quality scans',
  ],
  expectations: [
    'Foundations: expect, expect or drop, expect or fail; Where expectations run',
    'Working: Quarantine patterns; Reading quality metrics from the event log',
    'Interview level: Fail the pipeline or drop the rows',
  ],
  gx: [
    'Foundations: Data contexts, data sources and batches; Expectations and suites; Checkpoints and actions',
    'Working: Running GX inside Spark and Airflow; Critical vs warning checks; Data Docs',
    'Interview level: Where to put data tests; GX vs dbt tests vs Soda',
  ],
  soda: [
    'Foundations: SodaCL checks; Data sources; Scans',
    'Working: Thresholds and anomaly checks; Running in pipelines',
    'Interview level: Soda vs Great Expectations',
  ],

  // ───────────── Govern
  purview: [
    'Foundations: Data Map, scans and collections; Unified Catalog; Classification and sensitivity labels',
    'Lineage: Lineage from ADF, Synapse and Databricks; Custom lineage',
    'Governance: Glossary and data products; Access policies',
    'Interview level: Rolling out Purview in a large company',
  ],
  lakeformation: [
    'Foundations: Glue Data Catalog as the metastore; Lake Formation permissions model; LF-tags',
    'Working: Column, row and cell-level security; Cross-account sharing; Governed access from Athena, EMR and Redshift',
    'Interview level: IAM vs Lake Formation permissions',
  ],
  dataplex: [
    'Foundations: Lakes, zones and assets; Universal catalog; Data profiling',
    'Interview level: Governance across BigQuery and GCS',
  ],
  unity: [
    'Foundations: Metastore, catalogs, schemas and tables; Managed vs external tables; Volumes',
    'Security: Privileges and inheritance; Row filters and column masks; Groups and service principals; External locations and storage credentials',
    'Lineage and audit: Table and column lineage; System tables for audit and billing; Tags and discovery',
    'Sharing: Delta Sharing; Lakehouse Federation',
    'Interview level: Migrate from Hive metastore to Unity Catalog; Design catalogs per environment or per domain',
  ],
  openlineage: [
    'Foundations: Runs, jobs and datasets; Facets; Integrations for Spark, Airflow and dbt',
    'Interview level: Why lineage matters in an incident',
  ],
  datahub: [
    'Foundations: Metadata model; Ingestion recipes; Search and ownership',
    'Interview level: DataHub vs a cloud catalog',
  ],

  // ───────────── BI
  powerbi: [
    'Foundations: Desktop, Service and Fabric; Power Query for shaping data; Import vs DirectQuery vs Direct Lake',
    'Modelling: Star schema in Power BI; Relationships and cardinality; Date tables; Calculated columns vs measures',
    'DAX: CALCULATE and filter context; Row context and iterators; Time intelligence; Variables and performance',
    'Service: Workspaces and apps; Refresh, gateways and incremental refresh; Row-level security; Deployment pipelines',
    'For data engineers: Building gold tables Power BI loves; Query folding; Large models and aggregations',
    'Interview level: Report is slow, where do you look; Import vs DirectQuery trade-offs',
  ],
  quicksight: [
    'Foundations: Datasets, analyses and dashboards; SPICE vs direct query',
    'Working: Row-level security; Embedding',
    'Interview level: QuickSight vs Power BI',
  ],
  looker: [
    'Foundations: LookML models, views and explores; Dimensions and measures',
    'Working: PDTs and caching; Access filters',
    'Interview level: Semantic layer in Looker vs dbt',
  ],
  tableau: [
    'Foundations: Live vs extract; Data sources and relationships; Calculated fields and LOD expressions',
    'Working: Publishing and refresh; Performance recorder',
    'Interview level: Tableau vs Power BI for an enterprise',
  ],
  superset: [
    'Foundations: Databases, datasets and charts; SQL Lab',
    'Interview level: Running Superset on a lakehouse',
  ],
  metabase: [
    'Foundations: Questions, models and dashboards; Permissions',
    'Interview level: When Metabase is enough',
  ],

  // ───────────── DevOps
  azdo: [
    'Foundations: Repos, boards and pipelines; YAML pipelines; Service connections',
    'For data: CI for ADF ARM templates; Deploying Databricks with bundles; Variable groups and Key Vault; Environments and approvals',
    'Interview level: Promote a data platform from dev to prod',
  ],
  bicep: [
    'Foundations: ARM vs Bicep; Resources, parameters and modules',
    'Working: Deploying storage, ADF and Databricks; What-if deployments',
    'Interview level: Bicep vs Terraform for Azure',
  ],
  cfn: [
    'Foundations: Stacks and templates; CDK constructs',
    'Working: Deploying Glue, S3 and IAM; Change sets and drift',
    'Interview level: CDK vs Terraform',
  ],
  cloudbuild: [
    'Foundations: Builds, steps and triggers',
    'Working: Deploying Dataflow templates and Composer DAGs',
    'Interview level: CI/CD for a GCP data platform',
  ],
  dabs: [
    'Foundations: Bundle structure and databricks.yml; Targets and variables',
    'Working: Deploying jobs and pipelines; CI with GitHub Actions or Azure DevOps',
    'Interview level: Bundles vs Terraform for Databricks',
  ],
  git: [
    'Foundations: Commits, branches and merges; Remote repos and pull requests; Resolving conflicts',
    'Workflows: GitHub Flow vs Git Flow; Code review for data code; Tags and releases',
    'GitHub Actions: Workflows, jobs and steps; Testing PySpark and dbt in CI; Secrets and environments; Deploying pipelines',
    'Interview level: Undo a bad commit on main; Branching for a data team',
  ],
  terraform: [
    'Foundations: Providers, resources and data sources; State and remote backends; Plan and apply',
    'Working: Variables, outputs and modules; Workspaces and environments; Importing existing resources',
    'For data: Provisioning a lake, warehouse and Databricks workspace; Managing grants as code',
    'Interview level: State got corrupted, what now; Terraform vs Bicep vs CDK',
  ],
  docker: [
    'Foundations: Images, containers and layers; Dockerfile best practices; Volumes and networks; Docker Compose',
    'Kubernetes: Pods, deployments and services; ConfigMaps and secrets; Jobs and CronJobs; Spark and Airflow on Kubernetes',
    'Interview level: Why containerise a pipeline; Debug a CrashLoopBackOff',
  ],
}

const parse = (m) => { const i = m.indexOf(': '); return { name: m.slice(0, i), topics: m.slice(i + 2).split('; ').map((x) => x.trim()) } }

// MORE deepens a syllabus: a module with the same name gets extra topics, a new module goes in before
// the interview module, so every syllabus still ends at interview level.
function build(id) {
  const mods = (RAW[id] || []).map(parse)
  for (const extra of [...(MORE[id] || []), ...(MORE2[id] || []), ...(MORE3[id] || [])].map(parse)) {
    const same = mods.find((m) => m.name === extra.name)
    if (same) same.topics.push(...extra.topics.filter((x) => !same.topics.includes(x)))
    else {
      const at = mods.findIndex((m) => m.name === 'Interview level')
      mods.splice(at < 0 ? mods.length : at, 0, extra)
    }
  }
  return mods
}

export const SYLLABUS = Object.fromEntries(Object.keys(RAW).map((id) => [id, build(id)]))

export const topicCount = (id) => (SYLLABUS[id] || []).reduce((a, m) => a + m.topics.length, 0)
export const TOTAL_TOPICS = Object.keys(SYLLABUS).reduce((a, id) => a + topicCount(id), 0)
