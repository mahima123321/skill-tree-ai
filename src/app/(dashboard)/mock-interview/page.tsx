'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, Video, FileText, MessageCircle, ChevronRight, Clock, Star, Loader as Loader2, CircleCheck as CheckCircle, Circle as XCircle, Sparkles, RotateCcw, Send } from 'lucide-react'
import { Card, Button } from '@/components/ui'
import { useStore } from '@/store/store'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

interface InterviewQuestion {
  id: string
  question: string
  type: 'technical' | 'behavioral' | 'system'
  difficulty: 'easy' | 'medium' | 'hard'
  expectedKeyPoints?: string[]
}

const interviewTypes = [
  { id: 'technical', label: 'Technical DSA', icon: FileText, desc: 'Data structures & algorithms' },
  { id: 'behavioral', label: 'Behavioral', icon: MessageCircle, desc: 'HR & soft skills' },
  { id: 'system', label: 'System Design', icon: Video, desc: 'Architecture & design' },
]

const questionBank: Record<string, InterviewQuestion[]> = {
  technical: [
    { id: 't1', question: 'Explain the difference between an array and a linked list. When would you use each?', type: 'technical', difficulty: 'easy', expectedKeyPoints: ['Memory allocation', 'Access time', 'Insertion/Deletion'] },
    { id: 't2', question: 'How would you detect a cycle in a linked list? Explain your approach.', type: 'technical', difficulty: 'medium', expectedKeyPoints: ['Floyd\'s algorithm', 'Two pointers', 'Time complexity O(n)'] },
    { id: 't3', question: 'Design a LRU Cache. What data structures would you use?', type: 'technical', difficulty: 'hard', expectedKeyPoints: ['HashMap', 'Doubly linked list', 'O(1) operations'] },
    { id: 't4', question: 'Explain the concept of dynamic programming with an example.', type: 'technical', difficulty: 'medium', expectedKeyPoints: ['Overlapping subproblems', 'Optimal substructure', 'Memoization/Tabulation'] },
    { id: 't5', question: 'How would you find the kth largest element in an unsorted array?', type: 'technical', difficulty: 'medium', expectedKeyPoints: ['QuickSelect', 'Heap', 'Time complexity'] },
  ],
  behavioral: [
    { id: 'b1', question: 'Tell me about a time you faced a challenging bug. How did you solve it?', type: 'behavioral', difficulty: 'easy' },
    { id: 'b2', question: 'Describe a situation where you had to work with a difficult team member.', type: 'behavioral', difficulty: 'medium' },
    { id: 'b3', question: 'What motivates you to become a software developer?', type: 'behavioral', difficulty: 'easy' },
    { id: 'b4', question: 'How do you handle tight deadlines and pressure?', type: 'behavioral', difficulty: 'medium' },
    { id: 'b5', question: 'Tell me about a project you\'re proud of. What was your role?', type: 'behavioral', difficulty: 'easy' },
  ],
  system: [
    { id: 's1', question: 'Design a URL shortening service like bit.ly.', type: 'system', difficulty: 'medium', expectedKeyPoints: ['Hashing', 'Database schema', 'Scalability'] },
    { id: 's2', question: 'How would you design a real-time chat application?', type: 'system', difficulty: 'hard', expectedKeyPoints: ['WebSockets', 'Message queuing', 'Presence detection'] },
    { id: 's3', question: 'Design a distributed cache system.', type: 'system', difficulty: 'hard', expectedKeyPoints: ['Consistent hashing', 'Replication', 'Eviction policies'] },
    { id: 's4', question: 'How would you scale a web application to handle 1 million users?', type: 'system', difficulty: 'hard', expectedKeyPoints: ['Load balancing', 'CDN', 'Database sharding'] },
  ],
}

type InterviewState = 'setup' | 'question' | 'answering' | 'feedback' | 'complete'

interface Answer {
  questionId: string
  answer: string
  score: number
  feedback: string
}

export default function MockInterviewPage() {
  const { user, addXP } = useStore()
  const [state, setState] = useState<InterviewState>('setup')
  const [interviewType, setInterviewType] = useState<string | null>(null)
  const [questions, setQuestions] = useState<InterviewQuestion[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [answers, setAnswers] = useState<Answer[]>([])
  const [currentFeedback, setCurrentFeedback] = useState<Answer | null>(null)
  const [loading, setLoading] = useState(false)

  const startInterview = (type: string) => {
    setInterviewType(type)
    const selectedQuestions = questionBank[type] || questionBank.technical
    setQuestions(selectedQuestions.sort(() => Math.random() - 0.5).slice(0, 3))
    setCurrentQuestion(0)
    setAnswers([])
    setState('question')
  }

  const submitAnswer = () => {
    if (!userAnswer.trim()) return
    setState('answering')
    setLoading(true)

    // Simulate AI evaluation
    setTimeout(() => {
      const question = questions[currentQuestion]
      const score = Math.floor(Math.random() * 40) + 60 // 60-100 score
      const feedback = generateFeedback(question, userAnswer, score)
      const answer: Answer = {
        questionId: question.id,
        answer: userAnswer,
        score,
        feedback,
      }
      setCurrentFeedback(answer)
      setAnswers([...answers, answer])
      setLoading(false)
      setState('feedback')
    }, 1500)
  }

  const generateFeedback = (question: InterviewQuestion, answer: string, score: number): string => {
    const lengthScore = answer.length > 200 ? 20 : answer.length > 100 ? 15 : 10
    const keywordScore = question.expectedKeyPoints
      ? question.expectedKeyPoints.filter(k => answer.toLowerCase().includes(k.toLowerCase())).length * 10
      : 20

    const feedbacks = [
      score >= 85 ? 'Excellent answer! You covered the key points well.' :
      score >= 70 ? 'Good answer! Consider elaborating more on the implementation details.' :
      'Your answer needs more depth. Focus on the core concepts.'
    ]

    if (question.type === 'technical' && answer.includes('time complexity')) {
      feedbacks.push('Great mention of time complexity!')
    }

    return feedbacks.join(' ')
  }

  const nextQuestion = async () => {
    setUserAnswer('')
    setCurrentFeedback(null)

    if (currentQuestion + 1 >= questions.length) {
      // Save interview to database
      const totalScore = answers.reduce((sum, a) => sum + a.score, 0) / answers.length
      await supabase.from('mock_interviews').insert({
        user_id: user?.id,
        type: interviewType,
        status: 'completed',
        score: Math.round(totalScore),
        questions: questions,
        answers: answers,
        feedback: `Average score: ${Math.round(totalScore)}%`,
      })
      addXP(30)
      setState('complete')
    } else {
      setCurrentQuestion(currentQuestion + 1)
      setState('question')
    }
  }

  const resetInterview = () => {
    setState('setup')
    setInterviewType(null)
    setCurrentQuestion(0)
    setUserAnswer('')
    setAnswers([])
    setCurrentFeedback(null)
  }

  const totalScore = answers.length > 0
    ? Math.round(answers.reduce((sum, a) => sum + a.score, 0) / answers.length)
    : 0

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-500 to-orange-500">
          <Mic className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Mock Interview</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Practice with AI interviewer
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Setup Screen */}
        {state === 'setup' && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="p-6">
              <h2 className="font-semibold text-slate-900 dark:text-white mb-2">
                Choose Interview Type
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                Each session has 3 questions with AI evaluation
              </p>
              <div className="grid sm:grid-cols-3 gap-4">
                {interviewTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => startInterview(type.id)}
                    className="p-6 border-2 border-slate-200 dark:border-slate-700 hover:border-primary-500 rounded-xl text-left transition-colors group"
                  >
                    <type.icon className="w-8 h-8 text-primary-500 mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold text-slate-900 dark:text-white">{type.label}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{type.desc}</p>
                  </button>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Question Screen */}
        {state === 'question' && (
          <motion.div
            key="question"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 rounded-full text-sm font-medium">
                    Question {currentQuestion + 1} of {questions.length}
                  </span>
                  <span className={cn(
                    'px-2 py-1 text-xs rounded-full',
                    questions[currentQuestion].difficulty === 'easy' ? 'bg-success-100 text-success-600' :
                    questions[currentQuestion].difficulty === 'medium' ? 'bg-warning-100 text-warning-600' :
                    'bg-red-100 text-red-600'
                  )}>
                    {questions[currentQuestion].difficulty}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-slate-500">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">~5 min</span>
                </div>
              </div>

              <div className="p-5 bg-slate-50 dark:bg-slate-700/50 rounded-xl mb-6">
                <Sparkles className="w-5 h-5 text-primary-500 mb-3" />
                <p className="text-lg text-slate-900 dark:text-white font-medium">
                  {questions[currentQuestion].question}
                </p>
                {questions[currentQuestion].expectedKeyPoints && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Key points to cover:</p>
                    <div className="flex flex-wrap gap-2">
                      {questions[currentQuestion].expectedKeyPoints?.map((point) => (
                        <span key={point} className="px-2 py-1 text-xs bg-white dark:bg-slate-600 rounded text-slate-600 dark:text-slate-300">
                          {point}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your answer here. Take your time to think..."
                  className="w-full h-40 px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">{userAnswer.length} characters</span>
                  <Button onClick={submitAnswer} disabled={!userAnswer.trim()}>
                    Submit Answer
                    <Send className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Answering Screen */}
        {state === 'answering' && (
          <motion.div
            key="answering"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-80"
          >
            <Loader2 className="w-12 h-12 animate-spin text-primary-500 mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Evaluating your answer...</p>
          </motion.div>
        )}

        {/* Feedback Screen */}
        {state === 'feedback' && currentFeedback && (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="p-6">
              <div className="text-center mb-6">
                <div className={cn(
                  'w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center',
                  currentFeedback.score >= 80 ? 'bg-success-100 dark:bg-success-500/20' :
                  currentFeedback.score >= 60 ? 'bg-warning-100 dark:bg-warning-500/20' :
                  'bg-red-100 dark:bg-red-500/20'
                )}>
                  {currentFeedback.score >= 80 ? (
                    <CheckCircle className="w-10 h-10 text-success-500" />
                  ) : currentFeedback.score >= 60 ? (
                    <Star className="w-10 h-10 text-warning-500" />
                  ) : (
                    <XCircle className="w-10 h-10 text-red-500" />
                  )}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Score: {currentFeedback.score}/100
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {currentFeedback.feedback}
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl mb-6">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Your answer:</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">{currentFeedback.answer}</p>
              </div>

              <Button onClick={nextQuestion} className="w-full">
                {currentQuestion + 1 >= questions.length ? 'See Results' : 'Next Question'}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Card>
          </motion.div>
        )}

        {/* Complete Screen */}
        {state === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="p-8 text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 mx-auto mb-6 flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Interview Complete!
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Great job on completing the mock interview
              </p>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-2xl font-bold text-primary-500">{totalScore}%</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Average Score</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-2xl font-bold text-success-500">{answers.length}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Questions</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-2xl font-bold text-warning-500">+30 XP</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Earned</p>
                </div>
              </div>

              {/* Per-question breakdown */}
              <div className="text-left mb-6">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Question Breakdown</h3>
                <div className="space-y-2">
                  {answers.map((a, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <span className="text-sm text-slate-700 dark:text-slate-300">Question {i + 1}</span>
                      <span className={cn(
                        'font-medium',
                        a.score >= 80 ? 'text-success-600' :
                        a.score >= 60 ? 'text-warning-600' :
                        'text-red-600'
                      )}>
                        {a.score}/100
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="secondary" onClick={resetInterview} className="flex-1 gap-2">
                  <RotateCcw className="w-4 h-4" />
                  New Interview
                </Button>
                <Button onClick={resetInterview} className="flex-1">
                  Practice Again
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tips */}
      {state === 'setup' && (
        <Card className="p-6 bg-gradient-to-r from-primary-500/10 to-accent-500/10 border-primary-500/20">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Interview Tips</h3>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li>• Take your time to understand the question before answering</li>
            <li>• Structure your answer: Introduction, Approach, Implementation, Complexity</li>
            <li>• Use concrete examples to illustrate your points</li>
            <li>• Mention time and space complexity for technical questions</li>
            <li>• Use the STAR method for behavioral questions</li>
          </ul>
        </Card>
      )}
    </motion.div>
  )
}
