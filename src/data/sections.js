// The site in four doors: Today, Learn, Practice, Career. Menus, footer, breadcrumbs and page colours all come from this list.
export const SECTIONS = [
  {
    id: 'daily', label: 'Today', icon: '☀️', blurb: 'Your day',
    lead: 'Your one next step, today\'s challenge and your streak, in one place.',
    items: [
      { to: '/today', icon: '☀️', label: 'Today', desc: 'Your next step and today\'s plan' },
      { to: '/daily', icon: '🔥', label: 'Daily SQL challenge', desc: 'A new question every midnight' },
      { to: '/profile', icon: '🪪', label: 'My profile', desc: 'Your rank card, skill radar and badge case' },
      { to: '/progress', icon: '📈', label: 'My progress', desc: 'XP, badges and backups' },
    ],
  },
  {
    id: 'learn', label: 'Learn', icon: '🎓', blurb: 'Understand it',
    lead: 'A 24-week path, handbooks, every tool on one map and animated SQL and Spark.',
    items: [
      { to: '/learn', icon: '📚', label: 'Overview', desc: 'Handbooks and where to start' },
      { to: '/path', icon: '🗺️', label: '24-week path', desc: '5½ months, SQL to job offer' },
      { to: '/atlas', icon: '🧭', label: 'Tech Stack Atlas', desc: 'Every DE tool by job and cloud' },
      { to: '/visual', icon: '✨', label: 'Visual SQL', desc: 'Joins and window functions, animated' },
      { to: '/spark-visual', icon: '⚡', label: 'Spark Visualizer', desc: 'Watch partitions, shuffles and skew' },
      { to: '/notes', icon: '📝', label: 'Notes', desc: 'Short notes from real pipelines' },
      { to: '/resources', icon: '🔗', label: 'Resources', desc: 'Certifications and free platforms' },
    ],
  },
  {
    id: 'practice', label: 'Practice', icon: '🛠️', blurb: 'Do it',
    lead: 'Real SQL and Python running in your browser, plus broken pipelines to fix.',
    items: [
      { to: '/practice', icon: '🛠️', label: 'Overview', desc: 'Pick what to practise' },
      { to: '/practice/sql', icon: '🗄️', label: 'SQL Lab', desc: '109 questions, checked instantly' },
      { to: '/practice/mock', icon: '⏱️', label: 'Mock rounds', desc: 'Timed SQL interviews with a scorecard' },
      { to: '/playground', icon: '🧪', label: 'SQL Playground', desc: 'Any query on 2.6M rows' },
      { to: '/practice/tables', icon: '📋', label: 'Practice tables', desc: 'Every table and column, explained' },
      { to: '/practice/python', icon: '🐍', label: 'Python Lab', desc: 'Coding problems with auto-checks' },
      { to: '/drills', icon: '🚨', label: 'Incident drills', desc: 'Fix a pipeline that broke at 3 AM' },
    ],
  },
  {
    id: 'interview', label: 'Career', icon: '🎤', blurb: 'Get hired',
    lead: 'Portfolio projects, quizzes, flashcards and model answers for the rounds that decide offers.',
    items: [
      { to: '/interview', icon: '🎯', label: 'Overview', desc: 'Everything for interview day' },
      { to: '/projects', icon: '🏗️', label: 'Projects', desc: 'Portfolio builds you can show' },
      { to: '/interview/quiz', icon: '🧠', label: 'Quiz', desc: '102 questions on Azure, AWS and GCP' },
      { to: '/interview/flashcards', icon: '🃏', label: 'Flashcards', desc: 'Five minutes of spaced repetition' },
      { to: '/interview/scenarios', icon: '🔥', label: 'Scenario questions', desc: 'Model answers and push-backs' },
      { to: '/interview/pyspark', icon: '⚡', label: 'PySpark questions', desc: 'Think first, then compare' },
      { to: '/interview/playbook', icon: '🎙️', label: 'Tell me about yourself', desc: 'The six-beat intro' },
      { to: '/interview/kit', icon: '🎯', label: 'Interview kit', desc: 'Pro: 300 questions with model answers and follow-ups' },
      { to: '/interview/job-kit', icon: '🧳', label: 'Job kit', desc: 'Pro: Naukri, LinkedIn, resume, referrals, interview kit' },
    ],
  },
]

const PREFIX = [
  ['/today', 'daily'], ['/daily', 'daily'], ['/progress', 'daily'], ['/profile', 'daily'],
  ['/interview', 'interview'], ['/quiz', 'interview'], ['/projects', 'interview'],
  ['/practice', 'practice'], ['/datasets', 'practice'], ['/playground', 'practice'], ['/drills', 'practice'],
  ['/path', 'learn'], ['/learn', 'learn'], ['/visual', 'learn'], ['/spark-visual', 'learn'], ['/atlas', 'learn'], ['/notes', 'learn'], ['/resources', 'learn'],
]

export function sectionOf(pathname) {
  const hit = PREFIX.find(([p]) => pathname === p || pathname.startsWith(p + '/'))
  return hit ? SECTIONS.find((s) => s.id === hit[1]) : null
}

// The most specific menu item for a path, used for the breadcrumb.
export function itemOf(pathname, sec) {
  if (!sec) return null
  return [...sec.items].sort((a, b) => b.to.length - a.to.length).find((i) => pathname === i.to || pathname.startsWith(i.to + '/')) || null
}

// Where each top-menu link goes.
export const HOME_OF = { daily: '/today', learn: '/learn', practice: '/practice', interview: '/interview' }
