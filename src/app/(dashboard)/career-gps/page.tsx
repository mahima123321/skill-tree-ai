'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapPin, ChevronRight, Target, Briefcase, TrendingUp, Clock, Sparkles, Loader as Loader2 } from 'lucide-react'
import { Card, Button } from '@/components/ui'
import { useStore } from '@/store/store'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

interface Milestone {
  id: string
  title: string
  description: string
  timeline: string
  status: 'completed' | 'current' | 'upcoming'
  skills: string[]
}

const generateCareerPath = (userProfile: any): Milestone[] => {
  const year = userProfile?.year || '2nd'
  const goal = userProfile?.goal || 'job'

  const paths: Record<string, Milestone[]> = {
    'job': [
      {
        id: '1',
        title: 'Build Foundation',
        description: 'Master DSA fundamentals and core CS concepts',
        timeline: 'Month 1-2',
        status: year === '1st' || year === '2nd' ? 'current' : 'completed',
        skills: ['Data Structures', 'Algorithms', 'OOP'],
      },
      {
        id: '2',
        title: 'Skill Deep Dive',
        description: 'Specialize in one tech stack (Frontend/Backend/Full Stack)',
        timeline: 'Month 3-4',
        status: year === '3rd' ? 'current' : year === '4th' ? 'completed' : 'upcoming',
        skills: ['React', 'Node.js', 'Databases'],
      },
      {
        id: '3',
        title: 'Build Portfolio',
        description: 'Create 3-5 impressive projects showcasing your skills',
        timeline: 'Month 5-6',
        status: year === '4th' ? 'current' : 'upcoming',
        skills: ['Full Stack', 'System Design', 'Deployment'],
      },
      {
        id: '4',
        title: 'Interview Prep',
        description: 'Practice mock interviews, solve 200+ DSA problems',
        timeline: 'Month 7-8',
        status: 'upcoming',
        skills: ['Problem Solving', 'Communication', 'System Design'],
      },
      {
        id: '5',
        title: 'Get Placed',
        description: 'Apply to companies, clear interviews, land your dream job',
        timeline: 'Month 8+',
        status: 'upcoming',
        skills: ['AllSkills'],
      },
    ],
    'internship': [
      {
        id: '1',
        title: 'Learn Basics',
        description: 'Build strong programming fundamentals',
        timeline: 'Week 1-4',
        status: 'current',
        skills: ['Python', 'Git', 'Linux'],
      },
      {
        id: '2',
        title: 'Build Projects',
        description: 'Create 2-3 mini projects for portfolio',
        timeline: 'Week 5-8',
        status: 'upcoming',
        skills: ['Web Development', 'APIs'],
      },
      {
        id: '3',
        title: 'Apply & Interview',
        description: 'Apply to internships, prepare for interviews',
        timeline: 'Week 9-12',
        status: 'upcoming',
        skills: ['Resume', 'Interview Skills'],
      },
    ],
    'masters': [
      {
        id: '1',
        title: 'Research & Planning',
        description: 'Research universities and programs',
        timeline: 'Month 1-3',
        status: 'current',
        skills: ['Research', 'Planning'],
      },
      {
        id: '2',
        title: 'Exam Preparation',
        description: 'Prepare for GRE/GMAT/TOEFL/IELTS',
        timeline: 'Month 4-6',
        status: 'upcoming',
        skills: ['Quantitative', 'Verbal'],
      },
      {
        id: '3',
        title: 'Applications',
        description: 'Prepare SOP, LOR and apply to universities',
        timeline: 'Month 7-9',
        status: 'upcoming',
        skills: ['Writing', 'Documentation'],
      },
      {
        id: '4',
        title: 'Get Admit',
        description: 'Receive admits and decide',
        timeline: 'Month 10-12',
        status: 'upcoming',
        skills: ['Decision Making'],
      },
    ],
  }

  return paths[goal] || paths['job']
}

const careerOptions = [
  { id: 'frontend', title: 'Frontend Developer', salary: '6-15 LPA', growth: 'High', icon: '⚛️' },
  { id: 'backend', title: 'Backend Developer', salary: '8-20 LPA', growth: 'High', icon: '🔧' },
  { id: 'fullstack', title: 'Full Stack Developer', salary: '10-25 LPA', growth: 'Very High', icon: '🚀' },
  { id: 'data', title: 'Data Scientist', salary: '12-30 LPA', growth: 'Very High', icon: '📊' },
  { id: 'devops', title: 'DevOps Engineer', salary: '10-25 LPA', growth: 'High', icon: '☁️' },
  { id: 'ml', title: 'ML Engineer', salary: '15-40 LPA', growth: 'Very High', icon: '🤖' },
]

export default function CareerGPSPage() {
  const { user } = useStore()
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null)

  useEffect(() => {
    loadPath()
  }, [user])

  const loadPath = async () => {
    try {
      if (user?.id) {
        const { data } = await supabase
          .from('career_paths')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (data?.milestones) {
          setMilestones(data.milestones as Milestone[])
        } else {
          const generated = generateCareerPath(user)
          setMilestones(generated)
          await supabase.from('career_paths').insert({
            user_id: user.id,
            present_role: `${user.year || '2nd'} Year Student`,
            target_role: user.goal === 'job' ? 'Software Developer' : user.goal,
            milestones: generated,
          })
        }
      }
    } catch {
      setMilestones(generateCareerPath(user))
    } finally {
      setLoading(false)
    }
  }

  const currentMilestone = milestones.find((m) => m.status === 'current')
  const progress = milestones.filter((m) => m.status === 'completed').length / milestones.length * 100

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
          <MapPin className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Career GPS</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Your personalized career roadmap
          </p>
        </div>
      </div>

      {/* Progress Overview */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white mb-1">Journey Progress</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {Math.round(progress)}% complete
            </p>
          </div>
          <div className="flex items-center gap-2">
            {['completed', 'current', 'upcoming'].map((status) => (
              <div key={status} className="flex items-center gap-1.5">
                <div className={cn(
                  'w-3 h-3 rounded-full',
                  status === 'completed' ? 'bg-success-500' :
                  status === 'current' ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-600'
                )} />
                <span className="text-xs text-slate-500 capitalize">{status}</span>
              </div>
            ))}
          </div>
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

      {/* Milestone Timeline */}
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-6">Career Milestones</h3>
        <div className="space-y-6">
          {milestones.map((milestone, index) => (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {/* Connector line */}
              {index < milestones.length - 1 && (
                <div className="absolute left-5 top-12 w-0.5 h-full bg-slate-200 dark:bg-slate-700" />
              )}

              <div className="flex gap-4">
                {/* Status indicator */}
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center z-10',
                  milestone.status === 'completed' ? 'bg-success-500 text-white' :
                  milestone.status === 'current' ? 'bg-primary-500 text-white ring-4 ring-primary-500/20' :
                  'bg-slate-200 dark:bg-slate-700 text-slate-500'
                )}>
                  {milestone.status === 'completed' ? (
                    <span>✓</span>
                  ) : milestone.status === 'current' ? (
                    <Target className="w-4 h-4" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>

                {/* Content */}
                <div className={cn(
                  'flex-1 p-4 rounded-xl border-2 transition-colors',
                  milestone.status === 'current'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
                    : 'border-slate-200 dark:border-slate-700'
                )}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <h4 className="font-semibold text-slate-900 dark:text-white">{milestone.title}</h4>
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {milestone.timeline}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{milestone.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {milestone.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Career Options */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary-500" />
          <h3 className="font-semibold text-slate-900 dark:text-white">AI-Recommended Career Paths</h3>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Based on your skills and goals, here are the best career options
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {careerOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedCareer(option.id)}
              className={cn(
                'p-4 rounded-xl border-2 text-left transition-all',
                selectedCareer === option.id
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
                  : 'border-slate-200 dark:border-slate-700 hover:border-primary-300'
              )}
            >
              <div className="text-2xl mb-2">{option.icon}</div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-1">{option.title}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Salary: {option.salary}</p>
              <div className="flex items-center gap-1 text-xs text-success-600 dark:text-success-400">
                <TrendingUp className="w-3 h-3" />
                {option.growth} Growth
              </div>
            </button>
          ))}
        </div>
        {selectedCareer && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-primary-50 dark:bg-primary-500/10 rounded-xl border border-primary-200 dark:border-primary-500/20"
          >
            <p className="text-sm text-primary-700 dark:text-primary-300">
              Great choice! {careerOptions.find(c => c.id === selectedCareer)?.title} is in high demand.
              Focus on building projects and gaining practical experience to stand out.
            </p>
          </motion.div>
        )}
      </Card>

      {/* Current Focus */}
      {currentMilestone && (
        <Card className="p-6 bg-gradient-to-r from-primary-500 to-accent-500 text-white">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Current Focus: {currentMilestone.title}</h3>
              <p className="text-sm text-white/80">{currentMilestone.description}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {currentMilestone.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 text-xs bg-white/20 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </motion.div>
  )
}
