// Study lists: short, ordered sets of SQL Lab problems with one goal each.
export const LISTS = [
  { id: 'first-week', icon: '🌱', name: 'SQL in 7 days', blurb: 'From your first SELECT to window functions. About five problems a day.',
    qs: [3, 4, 5, 8, 11, 13, 14, 15, 16, 22, 23, 9, 1, 2, 17, 19, 18, 27, 25, 28, 10, 29, 31, 33, 39, 34, 44, 52, 40, 70, 71, 72, 73, 74, 75] },
  { id: 'de-top', icon: '🏗️', name: 'Top 40 for data engineer interviews', blurb: 'The problems DE rounds keep coming back to: dedup, SCD, incremental loads, quality checks and the classic window questions.',
    qs: [10, 28, 34, 67, 6, 5, 25, 38, 41, 47, 49, 43, 60, 61, 62, 63, 64, 65, 66, 79, 80, 81, 82, 83, 84, 85, 86, 87, 92, 93, 95, 96, 100, 105, 106, 107, 108, 94, 69, 78] },
  { id: 'windows', icon: '🪟', name: 'Window functions sprint', blurb: 'Every window pattern in one sitting: ranking, running totals, LAG and LEAD, frames and streaks.',
    qs: [27, 10, 28, 25, 26, 29, 30, 31, 32, 33, 35, 36, 37, 38, 39, 40, 41, 42, 47, 49, 51] },
  { id: 'analyst', icon: '📊', name: 'Analyst classics', blurb: 'Business questions from product and analytics rounds: growth, retention, funnels and shares.',
    qs: [16, 17, 20, 23, 29, 30, 36, 37, 44, 45, 46, 50, 53, 57, 58, 90, 102] },
  { id: 'pipelines', icon: '🔁', name: 'Pipeline SQL', blurb: 'The SQL you write on the job: CDC, MERGE, late data, watermarks, reconciliation and data quality.',
    qs: [60, 61, 62, 63, 64, 65, 66, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 91, 92, 93, 95, 96, 99, 100, 101, 104, 106, 107, 108, 109] },
  { id: 'traps', icon: '🪤', name: 'Trap questions', blurb: 'Short questions where a confident wrong answer costs the round. NULLs, NOT IN, COUNT and join row counts.',
    qs: [7, 27, 70, 71, 72, 73, 74, 75, 76, 77, 78] },
]
export const LIST_BY_ID = Object.fromEntries(LISTS.map((l) => [l.id, l]))
