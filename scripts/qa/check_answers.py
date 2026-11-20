"""Runs every SQL Lab answer, checker reference, incident drill and Playground example through DuckDB.
Fails if an answer errors, the shown answer and the checker disagree, or a drill's broken query already passes.
    pip install duckdb && node scripts/qa/export_sql.mjs > /tmp/sql.json && python3 scripts/qa/check_answers.py /tmp/sql.json
"""
import json, sys, duckdb

def norm(rows):
    out = []
    for r in rows:
        out.append(tuple('NULL' if v is None else (round(float(v), 4) if isinstance(v, (int, float)) or type(v).__name__ == 'Decimal' else str(v)) for v in r))
    return sorted(out, key=str)

def run(setup, sql):
    con = duckdb.connect()
    if setup:
        con.execute(setup)
    return con.execute(sql).fetchall()

data = json.load(open(sys.argv[1]))
bugs = []
for q in json.load(open('src/content/sql-questions.json'))['questions']:
    if q.get('mode') != 'check':
        continue
    try:
        ref = run(q['setup'], q['ref'])
        shown = run(q['setup'], q['answer'])
        if norm(ref) != norm(shown):
            bugs.append(f"SQL Lab #{q['n']}: the shown answer and the checker give different results")
        if not ref:
            bugs.append(f"SQL Lab #{q['n']}: the checker query returns no rows")
    except Exception as e:
        bugs.append(f"SQL Lab #{q['n']}: {str(e).splitlines()[0]}")
for d in data['drills']:
    try:
        ref = run(d['setup'], d['ref'])
    except Exception as e:
        bugs.append(f"Drill {d['id']}: fix errors: {str(e).splitlines()[0]}"); continue
    try:
        if norm(run(d['setup'], d['starter'])) == norm(ref):
            bugs.append(f"Drill {d['id']}: the broken query already gives the right answer")
    except Exception:
        pass  # a broken query that errors is fine
con = duckdb.connect()
for s in data['bigSetup']:
    con.execute(s)
for name, sql in data['bigExamples']:
    try:
        con.execute(sql).fetchall()
    except Exception as e:
        bugs.append(f'Playground example "{name}": {str(e).splitlines()[0]}')
for d in data['daily']:
    try:
        if not con.execute(d['ref']).fetchall():
            bugs.append(f"Daily #{d['id']}: returns no rows")
    except Exception as e:
        bugs.append(f"Daily #{d['id']}: {str(e).splitlines()[0]}")
print('\n'.join(bugs) or 'All SQL answers OK.')
sys.exit(1 if bugs else 0)
