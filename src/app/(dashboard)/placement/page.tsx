'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Target, TrendingUp, TriangleAlert as AlertTriangle, Briefcase, DollarSign, Gauge, Sparkles, Loader as Loader2, CircleCheck as CheckCircle, Circle as XCircle } from 'lucide-react'
import { Card, Button } from '@/components/ui'
import { useStore } from '@/store/store'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

interface PlacementAnalysis {
  overallScore: number
  skillsScore: number
  projectsScore: number
  experienceScore: number
  predictedSalary: { min: number; max: number }
  tier: string
  strengths: string[]
  gaps: string[]
  recommendations: string[]
  companyTypes: string[]
}

const analyzePlacement = async (user: any, userSkills: any[]): Promise<PlacementAnalysis> => {
  const xp = user?.xp || 0
  const level = user?.level || 1
  const year = user?.year || '2nd'
  const branch = user?.branch || 'CSE'

  // Calculate scores based on profile
  const skillsCount = userSkills.length
  const avgProgress = userSkills.length > 0
    ? userSkills.reduce((sum, s) => sum + (s.progress || 0), 0) / userSkills.length
    : 30

  const skillsScore = Math.min(100, skillsCount * 10 + avgProgress / 2)
  const projectsScore = Math.min(100, xp / 3)
  const experienceScore = year === '4th' ? 80 : year === '3rd' ? 60 : year === '2nd' ? 40 : 20
  const overallScore = Math.round((skillsScore + projectsScore + experienceScore) / 3)

  // Predict salary based on scores
  const baseSalary = overallScore * 150 + 300000
  const predictedSalary = {
    min: Math.round(baseSalary * 0.8),
    max: Math.round(baseSalary * 1.3),
  }

  // Determine tier
  let tier = 'Tier 3'
  if (overallScore >= 75) tier = 'Tier 1 (Top Companies)'
  else if (overallScore >= 55) tier = 'Tier 2 (Mid Companies)'

  // Analyze strengths and gaps
  const strengths: string[] = []
  const gaps: string[] = []
  const recommendations: string[] = []

  if (skillsCount >= 5) strengths.push('Strong technical skill coverage')
  else gaps.push('Limited skill set - add more technologies')

  if (avgProgress >= 50) strengths.push('Good practical experience')
  else gaps.push('Need more hands-on practice')

  if (xp >= 200) strengths.push('Active learning streak')
  else recommendations.push('Complete more learning modules for XP')

  if (year === '4th' || year === '3rd') strengths.push('Ready for placement season')
  else recommendations.push('Focus on building a strong foundation')

  recommendations.push('Build at least 3 portfolio projects')
  recommendations.push('Practice DSA problems daily')
  if (!userSkills.find((s: any) => s.skill_name?.includes('System'))) {
    gaps.push('System Design knowledge missing')
  }

  const companyTypes = overallScore >= 70
    ? ['FAANG', 'Product Companies', 'Startups', 'Service Companies']
    : overallScore >= 50
    ? ['Product Companies', 'Startups', 'Service Companies']
    : ['Service Companies', 'Startups']

  return {
    overallScore,
    skillsScore,
    projectsScore,
    experienceScore,
    predictedSalary,
    tier,
    strengths,
    gaps,
    recommendations,
    companyTypes,
  }
}

export default function PlacementPredictorPage() {
  const { user } = useStore()
  const [analysis, setAnalysis] = useState<PlacementAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [userSkills, setUserSkills] = useState<any[]>([])

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    if (!user?.id) return

    try {
      const { data: skills } = await supabase
        .from('user_skills')
        .select('skill_id, level, progress, skills(name)')
        .eq('user_id', user.id)

      setUserSkills(skills || [])
      const result = await analyzePlacement(user, skills || [])
      setAnalysis(result)
    } catch (err) {
      console.error(err)
      const result = await analyzePlacement(user, [])
      setAnalysis(result)
    } finally {
      setLoading(false)
    }
  }

  const formatSalary = (amount: number) => {
    if (amount >= 100000) return `${(amount / 100000).toFixed(1)} LPA`
    return `${(amount / 1000).toFixed(0)} K`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  if (!analysis) return null

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-success-500 to-emerald-500">
          <Target className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Placement Predictor</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            AI-powered placement analysis
          </p>
        </div>
      </div>

      {/* Main Score */}
      <Card className="p-8 text-center">
        <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4">
          Your Placement Readiness Score
        </h2>
        <div className="relative inline-flex items-center justify-center mb-6">
          <svg className="w-48 h-48 transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              className="text-slate-200 dark:text-slate-700"
            />
            <motion.circle
              cx="96"
              cy="96"
              r="88"
              stroke="url(#gradient)"
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              initial={{ strokeDasharray: '0 553' }}
              animate={{ strokeDasharray: `${analysis.overallScore * 5.53} 553` }}
              transition={{ duration: 1.5 }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#d946ef" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-5xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent"
            >
              {analysis.overallScore}
            </motion.span>
            <span className="text-lg text-slate-400">/100</span>
          </div>
        </div>
        <div className={cn(
          'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium',
          analysis.overallScore >= 70 ? 'bg-success-100 text-success-700 dark:bg-success-500/20 dark:text-success-400' :
          analysis.overallScore >= 50 ? 'bg-warning-100 text-warning-700 dark:bg-warning-500/20 dark:text-warning-400' :
          'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
        )}>
          {analysis.overallScore >= 70 ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {analysis.tier}
        </div>
      </Card>

      {/* Detailed Scores */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Technical Skills', score: analysis.skillsScore, icon: Sparkles },
          { label: 'Project Portfolio', score: analysis.projectsScore, icon: Briefcase },
          { label: 'Experience Level', score: analysis.experienceScore, icon: TrendingUp },
        ].map((item) => (
          <Card key={item.label} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-500 dark:text-slate-400">{item.label}</span>
              <item.icon className="w-4 h-4 text-primary-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{item.score}%</div>
            <div className="mt-2 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.score}%` }}
                transition={{ duration: 0.8 }}
                className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
              />
            </div>
          </Card>
        ))}
      </div>

      {/* Salary Prediction */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-success-100 dark:bg-success-500/20 rounded-lg">
            <DollarSign className="w-5 h-5 text-success-600 dark:text-success-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Predicted Salary Range</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Based on your current profile</p>
          </div>
        </div>
        <div className="text-center py-4">
          <div className="text-3xl font-bold text-slate-900 dark:text-white">
            {formatSalary(analysis.predictedSalary.min)} - {formatSalary(analysis.predictedSalary.max)}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            For {user?.branch || 'CSE'} graduates with your experience level
          </p>
        </div>
      </Card>

      {/* Analysis Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Strengths */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-success-500" />
            <h3 className="font-semibold text-slate-900 dark:text-white">Strengths</h3>
          </div>
          <div className="space-y-3">
            {analysis.strengths.length > 0 ? analysis.strengths.map((s, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-success-50 dark:bg-success-500/10 rounded-lg">
                <div className="w-5 h-5 rounded-full bg-success-500 text-white flex items-center justify-center text-xs">
                  ✓
                </div>
                <span className="text-sm text-success-700 dark:text-success-300">{s}</span>
              </div>
            )) : (
              <p className="text-sm text-slate-500">Complete more activities to identify strengths</p>
            )}
          </div>
        </Card>

        {/* Gaps */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-warning-500" />
            <h3 className="font-semibold text-slate-900 dark:text-white">Skill Gaps</h3>
          </div>
          <div className="space-y-3">
            {analysis.gaps.length > 0 ? analysis.gaps.map((g, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-warning-50 dark:bg-warning-500/10 rounded-lg">
                <div className="w-5 h-5 rounded-full bg-warning-500 text-white flex items-center justify-center text-xs">
                  !
                </div>
                <span className="text-sm text-warning-700 dark:text-warning-300">{g}</span>
              </div>
            )) : (
              <p className="text-sm text-slate-500">No major gaps identified</p>
            )}
          </div>
        </Card>
      </div>

      {/* Recommendations */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Gauge className="w-5 h-5 text-primary-500" />
          <h3 className="font-semibold text-slate-900 dark:text-white">AI Recommendations</h3>
        </div>
        <div className="space-y-2">
          {analysis.recommendations.map((r, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <span className="text-primary-500 font-medium">{i + 1}.</span>
              <span className="text-sm text-slate-700 dark:text-slate-300">{r}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Target Companies */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="w-5 h-5 text-primary-500" />
          <h3 className="font-semibold text-slate-900 dark:text-white">Suitable Company Types</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {analysis.companyTypes.map((type) => (
            <span
              key={type}
              className="px-4 py-2 bg-primary-100 dark:bg-primary-500/20 text-primary-700 dark:text-primary-300 rounded-lg text-sm font-medium"
            >
              {type}
            </span>
          ))}
        </div>
      </Card>
    </motion.div>
  )
}
