// The free Spark issue cases. The other 150 live in the private Pro repo.
export const FREE_CASES = {
  'parallel-01': {
    before: { tasks: 1, cores: 16, base: 2400, spread: 0, shuffleGB: 0, gcPct: 4 },
    after: { tasks: 96, cores: 16, base: 26, spread: 0.3, shuffleGB: 0, gcPct: 3 },
    predict: { q: 'A 12 GB file, 16 cores, and the read stage shows 1 task. What is the most likely cause?', options: ['The cluster is too small', 'The file cannot be split, so Spark makes one partition', 'shuffle.partitions is too low', 'The driver is out of memory'], answer: 'The file cannot be split, so Spark makes one partition' },
    cause: 'Spark splits files into partitions of about 128 MB, but only when the format allows it. A single gzip file, or one file read through a single JDBC connection, becomes one partition, one task and one busy core while the other 15 wait.',
    fix: 'Repartition straight after the read so the rest of the job runs in parallel, and fix the source so the next run reads in parallel too: ask for splittable files (Parquet, or bzip2 / uncompressed CSV), or several smaller gzip files.',
    code: `df = spark.read.csv("s3://raw/orders.csv.gz", header=True)
df = df.repartition(96)          # 16 cores x 6 = enough tasks to keep every core busy
# better still: land the data as Parquet once and read that`,
  },
  'parallel-02': {
    before: { tasks: 20000, cores: 16, base: 0.04, spread: 0.4, shuffleGB: 0.8, gcPct: 2 },
    after: { tasks: 64, cores: 16, base: 1.4, spread: 0.3, shuffleGB: 0.8, gcPct: 2 },
    predict: { q: '20,000 tasks of about 40 ms each, and the stage still takes minutes. Why?', options: ['Each task is too slow', 'Per-task overhead (scheduling, start-up) is bigger than the work', 'Not enough memory', 'Data skew'], answer: 'Per-task overhead (scheduling, start-up) is bigger than the work' },
    cause: 'Every task costs scheduling, serialisation and a little start-up time. When the real work per task is a few milliseconds, that overhead dominates. It usually comes from millions of small files, or from shuffle.partitions set far too high for the data size.',
    fix: 'Aim for partitions of about 100 to 200 MB. Compact small files, lower spark.sql.shuffle.partitions, or let AQE coalesce small shuffle partitions.',
    code: `spark.conf.set("spark.sql.adaptive.enabled", "true")
spark.conf.set("spark.sql.adaptive.coalescePartitions.enabled", "true")
spark.conf.set("spark.sql.shuffle.partitions", "64")`,
  },
  'skew-01': {
    before: { tasks: 200, cores: 16, base: 9, spread: 0.3, hot: [[3, 300]], shuffleGB: 180, spillGB: 42, gcPct: 9 },
    after: { tasks: 240, cores: 16, base: 9, spread: 0.3, hot: [[3, 12], [4, 12], [5, 12]], shuffleGB: 180, gcPct: 6 },
    predict: { q: '199 tasks finish in about 10 seconds. One task runs for 45 minutes and spills 42 GB. What is going on?', options: ['A bad executor node', 'One join key holds a huge share of the rows', 'Too many shuffle partitions', 'Garbage collection'], answer: 'One join key holds a huge share of the rows' },
    cause: 'A shuffle sends every row with the same key to the same task. One customer with 40% of the orders makes one partition hundreds of times bigger than the rest. The Spark UI gives it away: the max task time is far above the median, and only that task spills.',
    fix: 'Turn on AQE skew join handling first, which splits oversized partitions automatically. If the key is extremely hot, salt it: add a random number to the key on the big side and explode the small side to match.',
    code: `spark.conf.set("spark.sql.adaptive.skewJoin.enabled", "true")
# manual salting when AQE is not enough
from pyspark.sql import functions as F
N = 16
orders = orders.withColumn("salt", (F.rand() * N).cast("int"))
cust = cust.withColumn("salt", F.explode(F.array([F.lit(i) for i in range(N)])))
joined = orders.join(cust, ["customer_id", "salt"])`,
  },
  'join-02': {
    before: { tasks: 400, cores: 16, base: 6, spread: 0.3, shuffleGB: 900, spillGB: 60, gcPct: 8 },
    after: { tasks: 400, cores: 16, base: 1.6, spread: 0.3, shuffleGB: 0, gcPct: 3 },
    predict: { q: 'A 900 GB orders table joins a 10 MB country lookup and the stage shuffles 900 GB. What should happen instead?', options: ['Add more executors', 'Broadcast the small table so the big one never moves', 'Cache both tables', 'Increase shuffle partitions'], answer: 'Broadcast the small table so the big one never moves' },
    cause: 'A sort-merge join shuffles both sides by the join key. When one side is tiny, it is far cheaper to copy it to every executor and join locally. Spark only does this automatically if it knows the table is small, and missing statistics or a filter it cannot see through hide that.',
    fix: 'Add a broadcast hint, or raise autoBroadcastJoinThreshold if the small table is a little over 10 MB. Only broadcast tables that fit comfortably in executor memory.',
    code: `from pyspark.sql import functions as F
joined = orders.join(F.broadcast(countries), "country_code")`,
  },
  'spill-07': {
    before: { tasks: 200, cores: 16, base: 70, spread: 0.3, shuffleGB: 2000, spillGB: 1400, gcPct: 18 },
    after: { tasks: 2000, cores: 16, base: 4.5, spread: 0.3, shuffleGB: 2000, spillGB: 0, gcPct: 4 },
    predict: { q: 'A 2 TB aggregation runs 200 shuffle tasks, each reading 10 GB, and spills 1.4 TB to disk. Best first move?', options: ['Bigger disks', 'More shuffle partitions so each fits in memory', 'Cache the input', 'Use a UDF'], answer: 'More shuffle partitions so each fits in memory' },
    cause: 'spark.sql.shuffle.partitions defaults to 200, whatever the data size. At 2 TB that is 10 GB per task, far more than execution memory can hold, so Spark sorts and aggregates in chunks and writes them to disk. Spill makes jobs slow and expensive.',
    fix: 'Size shuffle partitions to about 100 to 200 MB each: 2 TB / 1 GB per partition ≈ 2,000. With AQE on, set a high initial number and let it coalesce.',
    code: `spark.conf.set("spark.sql.shuffle.partitions", "2000")
spark.conf.set("spark.sql.adaptive.enabled", "true")`,
  },
  'files-01': {
    before: { tasks: 4800, cores: 16, base: 0.35, spread: 0.5, shuffleGB: 0, gcPct: 3 },
    after: { tasks: 48, cores: 16, base: 5, spread: 0.3, shuffleGB: 0, gcPct: 2 },
    predict: { q: 'A Delta table written by a stream every minute now has 2 million 50 KB files. Reads take forever. What fixes it?', options: ['More executors', 'Compact the files with OPTIMIZE and write bigger batches', 'Turn off Delta', 'Increase shuffle partitions'], answer: 'Compact the files with OPTIMIZE and write bigger batches' },
    cause: 'Each file costs a listing entry, an open, a footer read and often its own task. Millions of tiny files spend all the time on overhead instead of reading data. Frequent streaming triggers and partitionBy on a high-cardinality column are the usual sources.',
    fix: 'Run OPTIMIZE to compact the files into roughly 1 GB ones, turn on optimised writes and auto compaction, and use a longer trigger interval for the stream.',
    code: `OPTIMIZE silver.events;
ALTER TABLE silver.events SET TBLPROPERTIES (
  'delta.autoOptimize.optimizeWrite' = 'true',
  'delta.autoOptimize.autoCompact' = 'true');`,
  },
}
