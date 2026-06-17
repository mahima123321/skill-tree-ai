'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Check, Clock, Sparkles, ChevronRight, RotateCcw } from 'lucide-react'
import { Card } from '@/components/ui'
import { useStore } from '@/store/store'
import { cn } from '@/lib/utils'

interface DayTask {
  id: string
  title: string
  type: 'learning' | 'practice' | 'project'
  duration: string
  completed: boolean
}

const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const generateWeeklyRoadmap = (userProfile: any): DayTask[][] => {
  const baseTasks: DayTask[][] = [
    // Monday
    [
      { id: '1', title: 'DSA: Arrays & Two Pointers', type: 'learning', duration: '2h', completed: false },
      { id: '2', title: 'React Hooks Deep Dive', type: 'learning', duration: '1.5h', completed: false },
      { id: '3', title: 'Code 2 LeetCode problems', type: 'practice', duration: '1h', completed: false },
    ],
    // Tuesday
    [
      { id: '4', title: 'Node.js Fundamentals', type: 'learning', duration: '2h', completed: false },
      { id: '5', title: 'SQL Joins Practice', type: 'practice', duration: '1h', completed: false },
      { id: '6', title: 'Build mini project: Todo API', type: 'project', duration: '2h', completed: false },
    ],
    // Wednesday
    [
      { id: '7', title: 'DSA: Sliding Window Pattern', type: 'learning', duration: '1.5h', completed: false },
      { id: '8', title: 'System Design Intro', type: 'learning', duration: '1h', completed: false },
      { id: '9', title: 'Code 3 LeetCode problems', type: 'practice', duration: '1.5h', completed: false },
    ],
    // Thursday
    [
      { id: '10', title: 'React State Management', type: 'learning', duration: '2h', completed: false },
      { id: '11', title: 'REST API Design', type: 'learning', duration: '1h', completed: false },
      { id: '12', title: 'Continue Todo project', type: 'project', duration: '2h', completed: false },
    ],
    // Friday
    [
      { id: '13', title: 'DSA: Binary Search', type: 'learning', duration: '1.5h', completed: false },
      { id: '14', title: 'Git Advanced Commands', type: 'learning', duration: '1h', completed: false },
      { id: '15', title: 'Project polish & documentation', type: 'project', duration: '2h', completed: false },
    ],
    // Saturday
    [
      { id: '16', title: 'DSA: Trees & Graphs Intro', type: 'learning', duration: '2h', completed: false },
      { id: '17', title: 'Mock Interview Practice', type: 'practice', duration: '1.5h', completed: false },
      { id: '18', title: 'Weekly Revision', type: 'practice', duration: '1h', completed: false },
    ],
    // Sunday
    [
      { id: '19', title: 'System Design: Scalability Basics', type: 'learning', duration: '1.5h', completed: false },
      { id: '20', title: 'Portfolio Update', type: 'project', duration: '1h', completed: false },
      { id: '21', title: 'Plan next week', type: 'practice', duration: '30m', completed: false },
    ],
  ]

  return baseTasks
}

const typeColors = {
  learning: 'bg-primary-100 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400',
  practice: 'bg-warning-100 text-warning-600 dark:bg-warning-500/20 dark:text-warning-400',
  project: 'bg-success-100 text-success-600 dark:bg-success-500/20 dark:text-success-400',
}

export default function RoadmapPage() {
  const { user, addXP } = useStore()
  const [roadmap, setRoadmap] = useState<DayTask[][]>(() => generateWeeklyRoadmap(user))
  const [activeDay, setActiveDay] = useState(new Date().getDay() - 1 || 6)

  const toggleTask = (dayIndex: number, taskId: string) => {
    setRoadmap((prev) => {
      const newRoadmap = [...prev]
      const dayTasks = [...newRoadmap[dayIndex]]
      const taskIndex = dayTasks.findIndex((t) => t.id === taskId)

      if (taskIndex !== -1) {
        const wasCompleted = dayTasks[taskIndex].completed
        dayTasks[taskIndex] = { ...dayTasks[taskIndex], completed: !wasCompleted }
        newRoadmap[dayIndex] = dayTasks

        if (!wasCompleted) {
          addXP(5)
        }
      }

      return newRoadmap
    })
  }

  const regenerateRoadmap = () => {
    setRoadmap(generateWeeklyRoadmap(user))
    setActiveDay(0)
  }

  const totalTasks = roadmap.flat()
  const completedTasks = totalTasks.filter((t) => t.completed).length
  const progress = Math.round((completedTasks / totalTasks.length) * 100)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-success-500 to-emerald-500">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Weekly Roadmap</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              AI-generated learning plan
            </p>
          </div>
        </div>

        <button
          onClick={regenerateRoadmap}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors text-sm font-medium"
        >
          <RotateCcw className="w-4 h-4" />
          Regenerate
        </button>
      </div>

      {/* Progress Overview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">Weekly Progress</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {completedTasks} of {totalTasks.length} tasks completed
            </p>
          </div>
          <div className="text-3xl font-bold text-primary-500">{progress}%</div>
        </div>
        <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8 }}
            className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
          />
        </div>
      </Card>

      {/* Days Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {weekDays.map((day, index) => {
          const dayTasks = roadmap[index]
          const dayCompleted = dayTasks.filter((t) => t.completed).length
          const isToday = index === activeDay

          return (
            <button
              key={day}
              onClick={() => setActiveDay(index)}
              className={cn(
                'flex-shrink-0 px-4 py-2.5 rounded-xl transition-all text-center min-w-[100px]',
                isToday
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
              )}
            >
              <p className="text-sm font-medium">{day.slice(0, 3)}</p>
              <p className={cn('text-xs', isToday ? 'text-white/70' : 'text-slate-500')}>
                {dayCompleted}/{dayTasks.length} done
              </p>
            </button>
          )
        })}
      </div>

      {/* Day Tasks */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-white">{weekDays[activeDay]}'s Plan</h3>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {roadmap[activeDay].filter((t) => t.completed).length} completed
          </span>
        </div>

        <div className="space-y-3">
          {roadmap[activeDay].map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                'flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer',
                task.completed
                  ? 'border-success-500 bg-success-50 dark:bg-success-500/10'
                  : 'border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-600'
              )}
              onClick={() => toggleTask(activeDay, task.id)}
            >
              <div
                className={cn(
                  'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
                  task.completed
                    ? 'border-success-500 bg-success-500'
                    : 'border-slate-300 dark:border-slate-600'
                )}
              >
                {task.completed && <Check className="w-4 h-4 text-white" />}
              </div>

              <div className="flex-1">
                <p
                  className={cn(
                    'font-medium',
                    task.completed
                      ? 'text-success-600 dark:text-success-400 line-through'
                      : 'text-slate-900 dark:text-white'
                  )}
                >
                  {task.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full', typeColors[task.type])}>
                    {task.type}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {task.duration}
                  </span>
                </div>
              </div>

              <ChevronRight
                className={cn(
                  'w-5 h-5',
                  task.completed ? 'text-success-500' : 'text-slate-400'
                )}
              />
            </motion.div>
          ))}
        </div>
      </Card>

      {/* AI Tip */}
      <Card className="p-6 bg-gradient-to-r from-primary-500/10 to-accent-500/10 border-primary-500/20">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-primary-500/20">
            <Sparkles className="w-5 h-5 text-primary-500" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-1">AI Tip</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Based on your progress, consider spending more time on DSA this week. Your React skills are progressing well!
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
