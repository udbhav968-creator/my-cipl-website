import express from 'express'
import cors from 'cors'
import sqlite3 from 'sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

const db = new sqlite3.Database(path.join(__dirname, 'quiz.db'))

const seedQuestions = [
  {
    id: 1,
    category: 'Frontend',
    difficulty: 'Easy',
    question: 'What hook is used to manage local state in a React component?',
    options: ['useEffect', 'useState', 'useMemo', 'useContext'],
    answer: 'useState',
    explanation: 'useState lets components store and update values between renders.',
  },
  {
    id: 2,
    category: 'Performance',
    difficulty: 'Medium',
    question: 'Which method prevents unnecessary re-renders by memoizing a computed value?',
    options: ['useCallback', 'useMemo', 'useRef', 'useReducer'],
    answer: 'useMemo',
    explanation: 'useMemo caches expensive computations so they are not repeated on every render.',
  },
  {
    id: 3,
    category: 'Security',
    difficulty: 'Medium',
    question: 'Which practice helps prevent XSS attacks in web applications?',
    options: [
      'Rendering user input as raw HTML',
      'Escaping and encoding output',
      'Using global variables everywhere',
      'Ignoring input validation',
    ],
    answer: 'Escaping and encoding output',
    explanation: 'Encoding output ensures special characters are not interpreted as HTML or script.',
  },
  {
    id: 4,
    category: 'Architecture',
    difficulty: 'Hard',
    question: 'What is the main benefit of separating UI state from business logic?',
    options: [
      'It makes the code slower',
      'It improves maintainability and testability',
      'It removes all reusability',
      'It forces all code into one file',
    ],
    answer: 'It improves maintainability and testability',
    explanation: 'A clean separation makes features easier to reason about, debug, and scale.',
  },
  {
    id: 5,
    category: 'APIs',
    difficulty: 'Easy',
    question: 'Which HTTP method is typically used to create a resource on a server?',
    options: ['GET', 'POST', 'PUT', 'DELETE'],
    answer: 'POST',
    explanation: 'POST is commonly used to submit new data to create a resource.',
  },
]

const initializeDb = () => {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY,
        category TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        question TEXT NOT NULL,
        options TEXT NOT NULL,
        answer TEXT NOT NULL,
        explanation TEXT NOT NULL
      )
    `)

    db.run(`
      CREATE TABLE IF NOT EXISTS scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        score INTEGER NOT NULL,
        total INTEGER NOT NULL,
        submitted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)

    db.get('SELECT COUNT(*) AS count FROM questions', (err, row) => {
      if (err) {
        console.error('Error checking questions table:', err)
        return
      }

      if (row.count === 0) {
        const insert = db.prepare(`
          INSERT INTO questions (id, category, difficulty, question, options, answer, explanation)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `)

        seedQuestions.forEach((question) => {
          insert.run(
            question.id,
            question.category,
            question.difficulty,
            question.question,
            JSON.stringify(question.options),
            question.answer,
            question.explanation,
          )
        })

        insert.finalize()
        console.log('Seeded quiz questions into the database.')
      }
    })
  })
}

initializeDb()

app.get('/api/questions', (req, res) => {
  db.all(
    'SELECT id, category, difficulty, question, options, answer, explanation FROM questions ORDER BY id ASC',
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: 'Failed to load questions' })
        return
      }

      const questions = rows.map((row) => ({
        ...row,
        options: JSON.parse(row.options),
      }))

      res.json(questions)
    },
  )
})

app.post('/api/submit', (req, res) => {
  const { name = 'Guest', score, total } = req.body

  if (typeof score !== 'number' || typeof total !== 'number') {
    res.status(400).json({ error: 'score and total must be numbers' })
    return
  }

  db.run(
    'INSERT INTO scores (name, score, total) VALUES (?, ?, ?)',
    [name, score, total],
    function (err) {
      if (err) {
        res.status(500).json({ error: 'Failed to save score' })
        return
      }

      res.status(201).json({ id: this.lastID })
    },
  )
})

app.get('/api/scores', (req, res) => {
  db.all(
    'SELECT name, score, total, submitted_at FROM scores ORDER BY id DESC LIMIT 10',
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: 'Failed to load scores' })
        return
      }

      res.json(rows)
    },
  )
})

app.listen(PORT, () => {
  console.log(`Quiz API running on http://localhost:${PORT}`)
})
