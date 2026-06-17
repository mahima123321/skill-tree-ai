'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, Sparkles, RefreshCw, Lightbulb, Target, BookOpen } from 'lucide-react'
import { Card } from '@/components/ui'
import { useStore } from '@/store/store'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const suggestions = [
  'What skills should I learn for a software developer role?',
  'How do I prepare for technical interviews?',
  'Suggest a learning roadmap for this month',
  'What projects should I build to improve my portfolio?',
]

const aiResponses: Record<string, string[]> = {
  skills: [
    "Based on your profile as a {year} year {branch} student, here are the key skills I recommend:\n\n**Priority Skills:**\n1. **Data Structures & Algorithms** - Essential for interviews\n2. **React or Vue.js** - Most demanded frontend frameworks\n3. **Node.js/Python** - Backend development\n4. **SQL** - Database fundamentals\n5. **Git** - Version control mastery\n\n**For your goal of getting a job:**\nFocus on DSA and one full-stack framework. Build 2-3 projects showcasing your skills.\n\nWould you like a detailed roadmap for any of these?",
  "Great question! For someone in your position, I'd suggest a layered approach:\n\n**Foundation Layer (Weeks 1-4):**\n- Solidify DSA fundamentals\n- Master Git and basic system design concepts\n\n**Skill Layer (Weeks 5-12):**\n- Pick one frontend (React) and one backend (Node.js) technology\n- Build real projects, not just tutorials\n\nI can create a personalized weekly plan. Shall I?",
  "Looking at industry trends and your background:\n\n**High Demand Skills 2024:**\n1. Full Stack Development (React + Node.js/Python)\n2. Cloud Computing (AWS/GCP basics)\n3. System Design fundamentals\n4. API Development (REST/GraphQL)\n\n**Your Action Plan:**\n- Start with the fundamentals (you can't go wrong with DSA)\n- Pick a specialization based on your interest\n- Build a portfolio of 4-5 solid projects\n\nWant me to elaborate on any particular area?",
  ],
  interview: [
    "Here's a strategic interview preparation plan:\n\n**Technical Interview Prep:**\n1. **DSA Practice:** 2-3 problems daily on LeetCode/HackerRank\n2. **System Design:** Learn basics of scalable architecture\n3. **CS Fundamentals:** OS, DBMS, Computer Networks\n\n**HR/Behavioral:**\n- Prepare STAR method stories\n- Practice explaining your projects confidently\n\n**Timeline:**\n- Weeks 1-4: DSA intensive\n- Weeks 5-8: System Design + Mock interviews\n\nShall I schedule some mock interview sessions for you?",
    "For technical interviews, focus on these patterns:\n\n**Most Common DSA Patterns:**\n- Arrays & Two Pointers\n- Sliding Window\n- Binary Search\n- Trees & Graphs\n- Dynamic Programming basics\n\n**Interview Tips:**\n1. Think out loud while solving\n2. Clarify requirements before coding\n3. Start with brute force, then optimize\n4. Test with edge cases\n\nI can give you practice problems for each pattern. Which one would you like to start with?",
  ],
  roadmap: [
    "Here's your personalized weekly roadmap:\n\n**Week 1-2: Foundation Boost**\n- Day 1-3: Arrays & Two Pointers (DSA)\n- Day 4-5: Git & GitHub mastery\n- Day 6: React fundamentals start\n- Day 7: Revision + Mini project\n\n**Week 3-4: Frontend Deep Dive**\n- React hooks, state management\n- 2 small projects\n- Continue DSA (2 problems/day)\n\nWould you like me to generate detailed daily tasks?",
    "Based on your goal and current progress:\n\n**Monthly Milestones:**\n\n**Month 1:**\n- Complete DSA foundations\n- Build 2 React projects\n- Learn REST APIs\n\n**Month 2:**\n- Advanced DSA (Graphs, DP)\n- Node.js backend development\n- Full-stack project\n\n**Month 3:**\n- System design basics\n- Portfolio polish\n- Interview preparation\n\nShall I break down Month 1 week by week?",
  ],
  projects: [
    "Here are project ideas tailored for your skill level:\n\n**Beginner Projects:**\n1. **Task Manager App** - React + Local Storage\n2. **Weather Dashboard** - API integration + CSS styling\n3. **Portfolio Website** - Next.js + Tailwind\n\n**Intermediate Projects:**\n1. **E-commerce Platform** - Full stack with payments\n2. **Social Media Dashboard** - Real-time features\n3. **Blog Platform** - Authentication + CRUD\n\n**Advanced Projects:**\n1. **SaaS Application** - Subscription model\n2. **Real-time Collaboration Tool** - WebSockets\n\nWhich type interests you? I can provide detailed specs.",
    "For a standout portfolio, include these portfolio projects:\n\n**Must-Have Portfolio Projects:**\n\n1. **Full-Stack CRUD App**\n   - Tech: React, Node.js, MongoDB/PostgreSQL\n   - Features: Auth, CRUD, search, filters\n\n2. **API-Based Project**\n   - Integrate a public API meaningfully\n   - Show data handling skills\n\n3. **System Design Demo**\n   - Show you understand scalability\n   - Document your architecture decisions\n\nWant detailed specs for any of these?",
  ],
  default: [
    "I understand. Let me help you with that.\n\nBased on your profile as a {year} year {branch} student aiming for {goal}, here's my advice:\n\n1. Focus on building strong fundamentals first\n2. Practice consistently rather than cramming\n3. Build real projects to apply your learning\n4. Stay updated with industry trends\n\nHow can I help you specifically today? I can assist with:\n- Career guidance\n- Skill recommendations\n- Learning roadmaps\n- Project ideas\n- Interview preparation",
    "Great question! I'm here to help guide your career journey.\n\n**Quick Recommendations for You:**\n\n1. Set clear weekly learning goals\n2. Spend at least 1-2 hours on skill development daily\n3. Build projects parallelly while learning\n4. Practice DSA regularly for interviews\n\nWhat specific area would you like to dive deeper into?",
  ],
}

function getAIResponse(message: string, userProfile: any): string {
  const lowerMessage = message.toLowerCase()
  let category = 'default'

  if (lowerMessage.includes('skill') || lowerMessage.includes('learn') || lowerMessage.includes('technology')) {
    category = 'skills'
  } else if (lowerMessage.includes('interview') || lowerMessage.includes('prepare') || lowerMessage.includes('placement')) {
    category = 'interview'
  } else if (lowerMessage.includes('roadmap') || lowerMessage.includes('plan') || lowerMessage.includes('schedule') || lowerMessage.includes('week')) {
    category = 'roadmap'
  } else if (lowerMessage.includes('project') || lowerMessage.includes('build') || lowerMessage.includes('portfolio')) {
    category = 'projects'
  }

  const responses = aiResponses[category]
  const response = responses[Math.floor(Math.random() * responses.length)]

  return response
    .replace('{year}', userProfile?.year || '2nd')
    .replace('{branch}', userProfile?.branch || 'CSE')
    .replace('{goal}', userProfile?.goal === 'job' ? 'getting a job' : userProfile?.goal || 'career growth')
}

export default function MentorPage() {
  const { user, addXP } = useStore()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hello ${user?.name?.split(' ')[0] || 'there'}! I'm your AI Career Mentor. I'm here to help you with:\n\n- Career guidance and planning\n- Skill recommendations\n- Learning roadmaps\n- Project ideas\n- Interview preparation\n\nWhat would you like to discuss today?`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim()
    if (!messageText) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // Simulate AI thinking
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000))

    const response = getAIResponse(messageText, user)

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, aiMessage])
    setIsTyping(false)
    addXP(5) // Reward for engaging with AI mentor
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-120px)] flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col"
      >
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">AI Career Mentor</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Your personal career guide</p>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'flex gap-3',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={cn(
                      'max-w-[80%] rounded-2xl px-4 py-3',
                      message.role === 'user'
                        ? 'bg-primary-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100'
                    )}
                  >
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content.split('\n').map((line, i) => {
                        // Handle markdown-like formatting
                        if (line.startsWith('**') && line.endsWith('**')) {
                          return (
                            <p key={i} className="font-semibold my-1">
                              {line.replace(/\*\*/g, '')}
                            </p>
                          )
                        }
                        if (line.startsWith('- ')) {
                          return (
                            <p key={i} className="pl-2">
                              {line}
                            </p>
                          )
                        }
                        return <p key={i}>{line}</p>
                      })}
                    </div>
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length === 1 && (
            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Suggested questions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSend(suggestion)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your career..."
                className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
                disabled={isTyping}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
