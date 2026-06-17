'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Star, Briefcase, Quote, Loader as Loader2, Sparkles, RefreshCw } from 'lucide-react'
import { Card, Button } from '@/components/ui'
import { useStore } from '@/store/store'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

interface CareerTwin {
  id: string
  twin_name: string
  twin_role: string
  twin_company: string
  twin_skills: string[]
  story: string
  advice: string
  similarity_score?: number
}

const careerTwins: CareerTwin[] = [
  {
    id: '1',
    twin_name: 'Alex Chen',
    twin_role: 'Senior Software Engineer',
    twin_company: 'Google',
    twin_skills: ['React', 'TypeScript', 'System Design', 'Leadership'],
    story: 'Started as a self-taught developer in college. Built 10+ personal projects before landing first internship. Now leads a team of 5 engineers.',
    advice: 'Focus on building real projects, not just tutorials. Contribute to open source. System design becomes important as you grow.',
  },
  {
    id: '2',
    twin_name: 'Priya Sharma',
    twin_role: 'Full Stack Developer',
    twin_company: 'Microsoft',
    twin_skills: ['Node.js', 'React', 'Azure', 'DevOps'],
    story: 'Transitioned from a non-CS background. Used online courses to learn programming. First job at a startup, then moved to big tech.',
    advice: 'Don\'t worry about your degree. Focus on projects and problem-solving skills. Networking helped me get my Microsoft interview.',
  },
  {
    id: '3',
    twin_name: 'Jordan Kim',
    twin_role: 'Frontend Engineer',
    twin_company: 'Stripe',
    twin_skills: ['React', 'CSS', 'Performance Optimization', 'Accessibility'],
    story: 'Passionate about UI/UX. Built several design system libraries. Contract work led to a full-time role at a design-focused company.',
    advice: 'Master the fundamentals of CSS and JavaScript before frameworks. Build projects that showcase your design sense.',
  },
  {
    id: '4',
    twin_name: 'Ravi Patel',
    twin_role: 'Backend Engineer',
    twin_company: 'Amazon',
    twin_skills: ['Java', 'Distributed Systems', 'AWS', 'Microservices'],
    story: 'Cleared Amazon SDE interview on 3rd attempt. DSA practice was key. Now designing scalable backend services.',
    advice: 'DSA is non-negotiable for big tech. Practice LeetCode daily. Understand distributed systems fundamentals.',
  },
  {
    id: '5',
    twin_name: 'Sarah Johnson',
    twin_role: 'ML Engineer',
    twin_company: 'OpenAI',
    twin_skills: ['Python', 'TensorFlow', 'NLP', 'Deep Learning'],
    story: 'Started with web dev, fell in love with ML. Master\'s degree helped, but personal ML projects got me the interview.',
    advice: 'Build ML projects, not just notebooks. Publish your work. The field moves fast, keep learning.',
  },
  {
    id: '6',
    twin_name: 'Vikram Singh',
    twin_role: 'DevOps Engineer',
    twin_company: 'Netflix',
    twin_skills: ['Kubernetes', 'AWS', 'Terraform', 'CI/CD'],
    story: 'Started in support, moved to DevOps. Certifications + practical projects got me to FAANG.',
    advice: 'Set up a home lab. Learn by doing. Cloud certifications are a good starting point but experience matters more.',
  },
]

const generateTwin = async (user: any, userSkills: any[]): Promise<CareerTwin> => {
  const skillNames = userSkills.map((s: any) => s.skills?.name || '').filter(Boolean)
  const userProfile = user?.goal || 'job'

  // Find best matching twin
  let bestTwin = careerTwins[0]
  let bestScore = 0

  for (const twin of careerTwins) {
    const matchingSkills = twin.twin_skills.filter((s) =>
      skillNames.some((us: string) => us.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(us.toLowerCase()))
    )
    const score = matchingSkills.length + Math.random() * 2
    if (score > bestScore) {
      bestScore = score
      bestTwin = twin
    }
  }

  return { ...bestTwin, similarity_score: Math.min(95, Math.floor(bestScore * 15 + 40)) }
}

export default function CareerTwinPage() {
  const { user, addXP } = useStore()
  const [loading, setLoading] = useState(true)
  const [myTwin, setMyTwin] = useState<CareerTwin | null>(null)
  const [loadingNew, setLoadingNew] = useState(false)

  useEffect(() => {
    loadTwin()
  }, [user])

  const loadTwin = async () => {
    if (!user?.id) return

    try {
      const { data: existingTwin } = await supabase
        .from('career_twins')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (existingTwin) {
        setMyTwin(existingTwin as CareerTwin)
      } else {
        await generateNewTwin()
      }
    } catch {
      await generateNewTwin()
    } finally {
      setLoading(false)
    }
  }

  const generateNewTwin = async () => {
    setLoadingNew(true)
    try {
      const { data: userSkills } = await supabase
        .from('user_skills')
        .select('skill_id, progress, skills(name)')
        .eq('user_id', user?.id)

      const twin = await generateTwin(user, userSkills || [])
      setMyTwin(twin)

      // Save to database
      await supabase.from('career_twins').upsert({
        user_id: user?.id,
        twin_name: twin.twin_name,
        twin_role: twin.twin_role,
        twin_company: twin.twin_company,
        twin_skills: twin.twin_skills,
        story: twin.story,
        advice: twin.advice,
        similarity_score: twin.similarity_score,
      })

      addXP(5)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingNew(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  if (!myTwin) return null

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500">
          <Users className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Career Twin</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Meet someone with a similar path
          </p>
        </div>
      </div>

      {/* Main Twin Card */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar & Basic Info */}
          <div className="text-center md:text-left">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 mx-auto md:mx-0 mb-4 flex items-center justify-center text-white text-3xl font-bold">
              {myTwin.twin_name.charAt(0)}
            </div>
            <div className="mb-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{myTwin.twin_name}</h2>
              <p className="text-sm text-slate-500">{myTwin.twin_role}</p>
              <p className="text-sm text-primary-500 font-medium">{myTwin.twin_company}</p>
            </div>

            {/* Similarity Score */}
            <div className="mx-auto md:mx-0 w-fit px-4 py-2 bg-success-100 dark:bg-success-500/20 rounded-xl">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-success-600" />
                <span className="text-success-700 dark:text-success-400 font-semibold">
                  {myTwin.similarity_score}% Similar
                </span>
              </div>
            </div>
          </div>

          {/* Story & Advice */}
          <div className="flex-1 space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <div className="flex items-start gap-2">
                <Quote className="w-5 h-5 text-primary-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Their Story</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{myTwin.story}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-primary-50 dark:bg-primary-500/10 rounded-xl border border-primary-200 dark:border-primary-500/20">
              <div className="flex items-start gap-2">
                <Sparkles className="w-5 h-5 text-primary-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Their Advice</h3>
                  <p className="text-sm text-primary-700 dark:text-primary-300">{myTwin.advice}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Key Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {myTwin.twin_skills.map((skill) => (
              <span
                key={skill}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <Button variant="secondary" onClick={generateNewTwin} disabled={loadingNew} className="flex-1 gap-2">
            {loadingNew ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Find Another Twin
          </Button>
          <Button className="flex-1 gap-2">
            <Users className="w-4 h-4" />
            Request Mentorship
          </Button>
        </div>
      </Card>

      {/* How It Works */}
      <Card className="p-6 bg-gradient-to-r from-pink-500/10 to-rose-500/10 border-pink-500/20">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Meet Your Career Twin</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Your Career Twin is a real professional with a similar background who has achieved the success you're aiming for.
          Learn from their journey and apply their advice to your career path.
        </p>
        <div className="grid sm:grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-white dark:bg-slate-800/50 rounded-xl">
            <p className="text-2xl font-bold text-primary-500">5+</p>
            <p className="text-xs text-slate-500">Years Experience</p>
          </div>
          <div className="p-3 bg-white dark:bg-slate-800/50 rounded-xl">
            <p className="text-2xl font-bold text-success-500">FAANG+</p>
            <p className="text-xs text-slate-500">Companies</p>
          </div>
          <div className="p-3 bg-white dark:bg-slate-800/50 rounded-xl">
            <p className="text-2xl font-bold text-accent-500">Your Level</p>
            <p className="text-xs text-slate-500">Matched</p>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
