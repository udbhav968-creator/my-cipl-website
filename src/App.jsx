import { useEffect, useMemo, useState } from 'react'
import './App.css'

const fallbackQuestions = [
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
  {
    id: 6,
    category: 'CSS',
    difficulty: 'Easy',
    question: 'Which CSS property is used to change the background color of an element?',
    options: ['color', 'background-color', 'bgcolor', 'border-color'],
    answer: 'background-color',
    explanation: 'The background-color property sets the background color of an element.',
  },
]

function App() {
  const [questions, setQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [score, setScore] = useState(0)
  const [showExplanation, setShowExplanation] = useState(false)
  const [timeLeft, setTimeLeft] = useState(15)
  const [isFinished, setIsFinished] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const totalQuestions = questions.length
  const activeQuestion = questions[currentQuestion]

  useEffect(() => {
    let isMounted = true

    const loadQuestions = async () => {
      try {
        const response = await fetch('/api/questions')
        if (!response.ok) {
          throw new Error('Failed to load quiz questions')
        }

        const data = await response.json()

        if (isMounted) {
          setQuestions(data)
          setError('')
        }
      } catch (err) {
        if (isMounted) {
          setQuestions(fallbackQuestions)
          setError('')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadQuestions()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!activeQuestion || isFinished || showExplanation) return

    if (timeLeft === 0) {
      setShowExplanation(true)
      return
    }

    const timer = window.setTimeout(() => setTimeLeft((prev) => prev - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [activeQuestion, isFinished, showExplanation, timeLeft])

  useEffect(() => {
    if (!activeQuestion) return

    setTimeLeft(15)
    setSelectedOption(null)
    setShowExplanation(false)
  }, [activeQuestion])

  useEffect(() => {
    if (!isFinished || totalQuestions === 0) return

    const saveResult = async () => {
      try {
        await fetch('/api/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Guest',
            score,
            total: totalQuestions,
          }),
        })
      } catch (err) {
        console.error('Unable to save score:', err)
      }
    }

    saveResult()
  }, [isFinished, score, totalQuestions])

  const progress = useMemo(
    () => (totalQuestions === 0 ? 0 : ((currentQuestion + (showExplanation ? 1 : 0)) / totalQuestions) * 100),
    [currentQuestion, showExplanation, totalQuestions],
  )
  const percentage = totalQuestions === 0 ? 0 : Math.round((score / totalQuestions) * 100)
  const isLastQuestion = currentQuestion === totalQuestions - 1
  const resultsStyle = {
    background: `conic-gradient(#22c55e 0deg, #22c55e ${percentage * 3.6}deg, #1e293b ${percentage * 3.6}deg)`,
  }

  const handleAnswer = (option) => {
    if (!activeQuestion || showExplanation) return

    setSelectedOption(option)
    setShowExplanation(true)

    if (option === activeQuestion.answer) {
      setScore((prev) => prev + 1)
    }
  }

  const handleNext = () => {
    if (!activeQuestion) return

    if (isLastQuestion) {
      setIsFinished(true)
      return
    }

    setCurrentQuestion((prev) => prev + 1)
  }

  const restartQuiz = () => {
    setCurrentQuestion(0)
    setSelectedOption(null)
    setScore(0)
    setShowExplanation(false)
    setTimeLeft(15)
    setIsFinished(false)
  }

  if (isLoading) {
    return (
      <main className="quiz-shell">
        <section className="quiz-panel status-panel">
          <p className="status-text">Loading quiz questions...</p>
        </section>
      </main>
    )
  }

  if (error) {
    return (
      <main className="quiz-shell">
        <section className="quiz-panel status-panel">
          <p className="status-text">{error}</p>
        </section>
      </main>
    )
  }

  if (!activeQuestion) {
    return null
  }

  return (
    <main className="quiz-shell">
      <section className="quiz-panel">
        {!isFinished ? (
          <>
            <header className="quiz-header">
              <div>
                <p className="eyebrow">Developer Skills Quiz</p>
                <h1>Frontend & Product Thinking</h1>
              </div>
              <div className="score-pill">
                <span>{score}</span>
                <small>Score</small>
              </div>
            </header>

            <div className="progress-block">
              <div className="meta-row">
                <span>{activeQuestion.category}</span>
                <span>{activeQuestion.difficulty}</span>
                <span>{currentQuestion + 1}/{totalQuestions}</span>
              </div>
              <div className="progress-bar">
                <span style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className={`timer-row ${timeLeft <= 5 ? 'warning' : ''}`}>
              <span>Time left</span>
              <strong>{timeLeft}s</strong>
            </div>

            <article key={activeQuestion.id} className="question-card">
              <p className="question-text">{activeQuestion.question}</p>
              <div className="options-grid">
                {activeQuestion.options.map((option) => {
                  const isCorrect = option === activeQuestion.answer
                  const isSelected = option === selectedOption
                  const optionClass = showExplanation
                    ? isCorrect
                      ? 'option correct'
                      : isSelected
                        ? 'option wrong'
                        : 'option'
                    : 'option'

                  return (
                    <button
                      key={option}
                      type="button"
                      className={optionClass}
                      onClick={() => handleAnswer(option)}
                      disabled={showExplanation}
                    >
                      {option}
                    </button>
                  )
                })}
              </div>
            </article>

            {showExplanation && (
              <section key={`explanation-${activeQuestion.id}`} className="explanation-card">
                <p>{activeQuestion.explanation}</p>
                <button type="button" className="next-button" onClick={handleNext}>
                  {isLastQuestion ? 'See Results' : 'Next Question'}
                </button>
              </section>
            )}
          </>
        ) : (
          <section className="results-card">
            <p className="eyebrow">Quiz Complete</p>
            <h2>
              You scored {score} out of {totalQuestions}
            </h2>
            <div className="results-ring" style={resultsStyle}>
              <span>{percentage}%</span>
            </div>
            <p className="results-message">
              {score === totalQuestions
                ? 'Outstanding performance. You nailed every question.'
                : score >= Math.floor(totalQuestions / 2)
                  ? 'Strong result. You have solid fundamentals.'
                  : 'Nice effort. Another round will sharpen your skills.'}
            </p>
            <button type="button" className="restart-button" onClick={restartQuiz}>
              Try Again
            </button>
          </section>
        )}
      </section>
    </main>
  )
}

export default App
