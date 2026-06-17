'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TreeDeciduous, Lock, CheckCircle, Clock, Zap, Star, ChevronRight, Filter, Search
} from 'lucide-react'
import { Card } from '@/components/ui'
import { useStore } from '@/store/store'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

interface Skill {
  id: string
  name: string
  category: string
  description: string
  difficulty: string
  icon: string
}

interface UserSkill {
  skill_id: string
  level: number
  progress: number
}

const categoryColors: Record<string, string> = {
  'Frontend': 'from-blue-500 to-cyan-500',
  'Backend': 'from-green-500 to-emerald-500',
  'Database': 'from-orange-500 to-amber-500',
  'DevOps': 'from-purple-500 to-violet-500',
  'AI/ML': 'from-pink-500 to-rose-500',
  'Fundamentals': 'from-slate-500 to-gray-500',
  'Programming': 'from-yellow-500 to-orange-500',
  'Architecture': 'from-red-500 to-orange-500',
  'Full Stack': 'from-primary-500 to-accent-500',
  'Cloud': 'from-sky-500 to-blue-500',
  'Tools': 'from-lime-500 to-green-500',
}

const difficultyOrder = { beginner: 0, intermediate: 1, advanced: 2 }

export default function SkillsPage() {
  const { user, addXP } = useStore()
  const [skills, setSkills] = useState<Skill[]>([])
  const [userSkills, setUserSkills] = useState<UserSkill[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    if (!user?.id) return

    try {
      const { data: skillsData } = await supabase.from('skills').select('*')
      const { data: userSkillsData } = await supabase
        .from('user_skills')
        .select('skill_id, level, progress')
        .eq('user_id', user.id)

      setSkills(skillsData || [])
      setUserSkills(userSkillsData || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSkillStart = async (skill: Skill) => {
    if (!user?.id) return

    const existing = userSkills.find((us) => us.skill_id === skill.id)
    if (existing) return

    try {
      await supabase.from('user_skills').insert({
        user_id: user.id,
        skill_id: skill.id,
        level: 1,
        progress: 0,
      })

      setUserSkills([
        ...userSkills,
        { skill_id: skill.id, level: 1, progress: 0 },
      ])
      addXP(10)
    } catch (err) {
      console.error(err)
    }
  }

  const categories = [...new Set(skills.map((s) => s.category))]

  const filteredSkills = skills.filter((skill) => {
    const matchesCategory = !selectedCategory || skill.category === selectedCategory
    const matchesSearch =
      !searchQuery ||
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const sortedSkills = [...filteredSkills].sort((a, b) => {
    const aProgress = userSkills.find((us) => us.skill_id === a.id)?.progress || 0
    const bProgress = userSkills.find((us) => us.skill_id === b.id)?.progress || 0
    if (aProgress > 0 && bProgress === 0) return -1
    if (bProgress > 0 && aProgress === 0) return 1
    return difficultyOrder[a.difficulty as keyof typeof difficultyOrder] - difficultyOrder[b.difficulty as keyof typeof difficultyOrder]
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500">
            <TreeDeciduous className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Skill Tree</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {userSkills.length} of {skills.length} skills started
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Categories Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedCategory(null)}
          className={cn(
            'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
            !selectedCategory
              ? 'bg-primary-500 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          )}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
              selectedCategory === cat
                ? 'bg-primary-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Skills Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedSkills.map((skill, index) => {
          const userSkill = userSkills.find((us) => us.skill_id === skill.id)
          const progress = userSkill?.progress || 0
          const level = userSkill?.level || 0
          const isStarted = !!userSkill
          const isCompleted = progress >= 100

          return (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Card
                className={cn(
                  'p-5 transition-all cursor-pointer group hover:shadow-xl',
                  isCompleted && 'ring-2 ring-success-500',
                  !isStarted && 'hover:scale-[1.02]'
                )}
                onClick={() => !isStarted && handleSkillStart(skill)}
              >
                {/* Skill Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg',
                        `bg-gradient-to-br ${categoryColors[skill.category] || 'from-slate-500 to-slate-600'}`
                      )}
                    >
                      {skill.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{skill.name}</h3>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{skill.category}</span>
                    </div>
                  </div>
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-success-500" />
                  ) : isStarted ? (
                    <Clock className="w-5 h-5 text-warning-500" />
                  ) : (
                    <Lock className="w-5 h-5 text-slate-400" />
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                  {skill.description}
                </p>

                {/* Progress */}
                {isStarted && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-500 dark:text-slate-400">Level {level}</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{progress}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.8 }}
                        className={cn(
                          'h-full rounded-full',
                          isCompleted
                            ? 'bg-success-500'
                            : `bg-gradient-to-r ${categoryColors[skill.category] || 'from-primary-500 to-accent-500'}`
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Difficulty Badge */}
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      'px-2 py-1 text-xs font-medium rounded-full',
                      skill.difficulty === 'beginner'
                        ? 'bg-success-100 text-success-600 dark:bg-success-500/20 dark:text-success-400'
                        : skill.difficulty === 'intermediate'
                        ? 'bg-warning-100 text-warning-600 dark:bg-warning-500/20 dark:text-warning-400'
                        : 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400'
                    )}
                  >
                    {skill.difficulty}
                  </span>
                  {!isStarted && (
                    <span className="text-xs text-primary-500 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Start Learning <ChevronRight className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
