// The SQL patterns behind almost every interview and pipeline question.
// Learn the pattern once and a new question becomes "which pattern is this?".
// `spot` = how to recognise it in a question; `recipe` = the reusable shape.

export const PATTERNS = [
  { id: 'top-n-per-group', name: 'Top N per group', spot: '"highest / top 3 / latest ... in each department, customer, day"', recipe: `SELECT * FROM (
  SELECT t.*, DENSE_RANK() OVER (PARTITION BY grp ORDER BY metric DESC) AS rk
  FROM t) x
WHERE rk <= 3;   -- RANK/DENSE_RANK keep ties, ROW_NUMBER cuts them`, qs: [10, 28, 9] },
  { id: 'nth-value', name: 'Nth highest value', spot: '"second highest", "Nth", "return NULL if none"', recipe: `SELECT (SELECT DISTINCT salary FROM emp
        ORDER BY salary DESC LIMIT 1 OFFSET 1) AS second_highest;  -- outer SELECT turns "no row" into NULL`, qs: [1, 2, 32] },
  { id: 'anti-join', name: 'Anti join (no match)', spot: '"never", "without", "no orders", "missing from"', recipe: `SELECT a.* FROM a
LEFT JOIN b ON b.a_id = a.id
WHERE b.a_id IS NULL;      -- or NOT EXISTS; avoid NOT IN when b can hold NULL`, qs: [4, 8, 44, 63, 75] },
  { id: 'self-join', name: 'Self join', spot: 'compare a row with another row of the same table: manager, friend, pair', recipe: `SELECT e.name
FROM emp e JOIN emp m ON m.id = e.manager_id
WHERE e.salary > m.salary;`, qs: [3, 54, 58] },
  { id: 'dedupe', name: 'Find and remove duplicates', spot: '"duplicate", "keep one", "primary key check"', recipe: `SELECT key, COUNT(*) FROM t GROUP BY key HAVING COUNT(*) > 1;
-- keep the first: ROW_NUMBER() OVER (PARTITION BY key ORDER BY id) = 1`, qs: [5, 6, 65] },
  { id: 'latest-per-key', name: 'Latest row per key', spot: '"current state", "latest version", CDC or snapshot tables', recipe: `SELECT * FROM t
QUALIFY ROW_NUMBER() OVER (PARTITION BY id ORDER BY updated_at DESC) = 1;`, qs: [34, 67, 31] },
  { id: 'group-having', name: 'Group, then filter groups', spot: '"at least 5", "more than 3", a condition on a count or sum', recipe: `SELECT manager_id, COUNT(*) AS reports
FROM emp GROUP BY manager_id
HAVING COUNT(*) >= 5;      -- WHERE filters rows, HAVING filters groups`, qs: [14, 22, 71] },
  { id: 'row-vs-group', name: 'Row compared with its group', spot: '"above the average", "vs department average", "share of"', recipe: `SELECT name, salary,
       AVG(salary) OVER (PARTITION BY dept_id) AS dept_avg
FROM emp;                   -- window keeps every row, GROUP BY would collapse them`, qs: [13, 39, 17] },
  { id: 'conditional-agg', name: 'Conditional aggregation', spot: 'several counts or sums in one row, rates, "per status"', recipe: `SELECT COUNT(*) FILTER (WHERE status = 'done')      AS done,
       SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled
FROM orders;`, qs: [23, 53, 57, 66] },
  { id: 'pivot', name: 'Reshape: pivot, unpivot, explode', spot: '"a column per quarter", the reverse, or one row per array item', recipe: `SELECT yr,
       SUM(amount) FILTER (WHERE qtr = 1) AS q1,
       SUM(amount) FILTER (WHERE qtr = 2) AS q2
FROM sales GROUP BY yr;     -- unpivot: UNION ALL one SELECT per column; explode: UNNEST(arr)`, qs: [20, 21, 68] },
  { id: 'relational-division', name: 'Has all of a set', spot: '"bought every product", "A and B but not C"', recipe: `SELECT customer_id FROM orders
GROUP BY customer_id
HAVING COUNT(DISTINCT product_id) = (SELECT COUNT(*) FROM products);`, qs: [18, 19] },
  { id: 'percentiles', name: 'Median, percentiles, buckets', spot: '"median", "top 10%", "quartiles"', recipe: `SELECT MEDIAN(salary) FROM emp;
SELECT *, NTILE(4) OVER (ORDER BY spend DESC) AS quartile FROM c;`, qs: [24, 36, 37] },
  { id: 'running-total', name: 'Running total', spot: '"cumulative", "running", "to date", "resets every month"', recipe: `SELECT d, amount,
       SUM(amount) OVER (PARTITION BY month ORDER BY d
                         ROWS UNBOUNDED PRECEDING) AS running
FROM sales;`, qs: [25, 38] },
  { id: 'moving-window', name: 'Moving window', spot: '"7-day average", "rolling", "last N rows"', recipe: `AVG(revenue) OVER (ORDER BY d ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)`, qs: [26] },
  { id: 'ranking', name: 'Ranking functions', spot: 'ties matter: ROW_NUMBER vs RANK vs DENSE_RANK', recipe: `ROW_NUMBER() -- 1,2,3 (cuts ties)
RANK()       -- 1,1,3 (gaps)
DENSE_RANK() -- 1,1,2 (no gaps)`, qs: [27] },
  { id: 'previous-row', name: 'Compare with the previous row', spot: '"day over day", "growth %", "changed from", "warmer than yesterday", "every year"', recipe: `SELECT d, revenue,
       revenue - LAG(revenue) OVER (ORDER BY d) AS change
FROM daily;`, qs: [29, 30, 33, 35, 40, 52, 55] },
  { id: 'gaps-islands', name: 'Gaps and islands (streaks)', spot: '"consecutive", "streak", "in a row", "collapse into ranges"', recipe: `-- same group when value - row_number stays constant
SELECT user_id, MIN(d) AS start, MAX(d) AS stop, COUNT(*) AS len FROM (
  SELECT user_id, d, d - INTERVAL (ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY d)) DAY AS grp
  FROM logins) x
GROUP BY user_id, grp;`, qs: [41, 42, 49, 51] },
  { id: 'date-spine', name: 'Date spine', spot: '"missing dates", "every day", "active on each day", zero-filled reports', recipe: `SELECT d FROM generate_series(DATE '2026-01-01', DATE '2026-01-31', INTERVAL 1 DAY) g(d)
LEFT JOIN facts f ON f.day = g.d;`, qs: [43, 50, 16, 11] },
  { id: 'cohort-retention', name: 'Cohorts and retention', spot: '"come back", "retention", "churned", "day after first login"', recipe: `WITH first AS (SELECT user_id, MIN(d) AS d0 FROM events GROUP BY user_id)
SELECT COUNT(DISTINCT e.user_id) * 1.0 / COUNT(DISTINCT f.user_id)
FROM first f LEFT JOIN events e ON e.user_id = f.user_id AND e.d = f.d0 + 1;`, qs: [45, 46, 44] },
  { id: 'sessionize', name: 'Sessionize events', spot: '"new session after 30 minutes", "visits", "trips"', recipe: `SUM(CASE WHEN ts - LAG(ts) OVER w > INTERVAL 30 MINUTE THEN 1 ELSE 0 END)
  OVER (w ROWS UNBOUNDED PRECEDING) AS session_id`, qs: [47] },
  { id: 'overlap', name: 'Overlapping intervals', spot: '"overlapping bookings", "double booked", "concurrent"', recipe: `SELECT a.id, b.id FROM bookings a JOIN bookings b
  ON a.room = b.room AND a.id < b.id
 AND a.start_at < b.end_at AND b.start_at < a.end_at;`, qs: [48] },
  { id: 'hierarchy', name: 'Trees and hierarchies', spot: '"all reports at any level", "root / leaf", org charts', recipe: `WITH RECURSIVE r AS (
  SELECT id, manager_id, 1 AS lvl FROM emp WHERE id = 1
  UNION ALL
  SELECT e.id, e.manager_id, r.lvl + 1 FROM emp e JOIN r ON e.manager_id = r.id)
SELECT * FROM r;`, qs: [59, 56] },
  { id: 'merge-scd', name: 'Upserts, SCD and incremental loads', spot: '"upsert", "keep history", "only changed rows", "since last load"', recipe: `MERGE INTO target t USING source s ON t.id = s.id
WHEN MATCHED AND t.city <> s.city THEN UPDATE SET city = s.city
WHEN NOT MATCHED THEN INSERT VALUES (s.id, s.city);`, qs: [60, 61, 62, 64, 12] },
  { id: 'null-traps', name: 'Traps and concepts', spot: 'results "miss" rows, NOT IN returns nothing, counts disagree', recipe: `WHERE city IS DISTINCT FROM 'Delhi'   -- keeps NULL cities
COUNT(*) vs COUNT(col) vs COUNT(DISTINCT col)
NOT EXISTS instead of NOT IN`, qs: [72, 74, 75, 7, 15, 70, 73, 76, 77] },
  { id: 'performance', name: 'Performance and scans', spot: '"slow", "scans the whole table", partitions', recipe: `-- filter on the raw column so partitions/zone maps prune
WHERE order_date >= DATE '2026-01-01'      -- not YEAR(order_date) = 2026
EXPLAIN ANALYZE SELECT ...;`, qs: [69, 78] },
]

export const PATTERN_OF = {}
for (const p of PATTERNS) for (const n of p.qs) if (!PATTERN_OF[n]) PATTERN_OF[n] = p
