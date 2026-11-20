// Prints the SQL that lives in JS data files as JSON, for scripts/qa/check_answers.py.
import path from 'node:path'
const imp = (f) => import(path.resolve(f))
const { DRILLS } = await imp('src/data/drills.js')
const { bigSetupSql, BIG_EXAMPLES } = await imp('src/data/bigdata.js')
const { DAILY } = await imp('src/data/daily.js')
console.log(JSON.stringify({ drills: DRILLS, bigSetup: bigSetupSql(), bigExamples: BIG_EXAMPLES, daily: DAILY }))
