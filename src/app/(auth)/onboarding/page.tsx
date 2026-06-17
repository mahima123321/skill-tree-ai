'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Target, GraduationCap, Brain, Rocket, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui'
import { useStore } from '@/store/store'

const YEARS = ['1st Year', '2nd Year', '3rd Year', 'Final Year']
const BRANCHES = ['CSE', 'IT', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Other']
const GOALS = [
  { id: 'job', label: 'Get a Job', icon: Target, desc: 'Prepare for placements' },
  { id: 'internship', label: 'Internship', icon: GraduationCap, desc: 'Gain experience' },
  { id: 'startup', label: 'Startup', icon: Rocket, desc: 'Build your own product' },
  { id: 'masters', label: 'Higher Studies', icon: Brain, desc: 'MS/M.Tech abroad or India' },
]
const SKILL_OPTIONS = [
  'React', 'Node.js', 'Python', 'Machine Learning', 'System Design',
  'Data Structures', 'Algorithms', 'SQL', 'Docker', 'Git',
  'TypeScript', 'Next.js', 'AWS', 'REST APIs', 'GraphQL'
]

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [year, setYear] = useState('')
  const [branch, setBranch] = useState('')
  const [goal, setGoal] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { user, setUser, addXP } = useStore()

  const toggleSkill = (skill: string) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    )
  }

  const handleComplete = async () => {
    if (!user?.id) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          year: year.replace(' Year', ''),
          branch,
          goal,
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      // Add selected skills
      if (skills.length > 0) {
        const { data: skillsData } = await supabase
          .from('skills')
          .select('id, name')
          .in('name', skills)

        if (skillsData) {
          const userSkills = skillsData.map((s) => ({
            user_id: user.id,
            skill_id: s.id,
            progress: Math.floor(Math.random() * 30),
          }))

          await supabase.from('user_skills').insert(userSkills)
        }
      }

      setUser({ ...user, year, branch, goal } as any)
      addXP(50) // Bonus XP for completing onboarding
      router.push('/dashboard')
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1: return year !== ''
      case 2: return branch !== ''
      case 3: return goal !== ''
      case 4: return skills.length >= 3
      default: return true
    }
  }

  const steps = [
    { label: 'Year', icon: GraduationCap },
    { label: 'Branch', icon: Target },
    { label: 'Goal', icon: Rocket },
    { label: 'Skills', icon: Brain },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-950 to-slate-900 flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl relative z-10"
      >
        <div className="p-8 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl shadow-xl">
          {/* Progress indicators */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {steps.map((s, i) => (
              <div key={s.label} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    step > i + 1
                      ? 'bg-primary-500 text-white'
                      : step === i + 1
                      ? 'bg-primary-500/20 text-primary-500 border-2 border-primary-500'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                  }`}
                >
                  {step > i + 1 ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`w-8 h-0.5 mx-1 transition-colors ${
                      step > i + 1 ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: Year */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    What year are you in?
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    This helps us personalize your roadmap
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {YEARS.map((y) => (
                    <button
                      key={y}
                      onClick={() => setYear(y)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        year === y
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400'
                          : 'border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-600'
                      }`}
                    >
                      <span className="font-semibold text-lg">{y}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Branch */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    What's your branch?
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    We'll tailor career suggestions accordingly
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {BRANCHES.map((b) => (
                    <button
                      key={b}
                      onClick={() => setBranch(b)}
                      className={`p-4 rounded-xl border-2 transition-all text-center ${
                        branch === b
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400'
                          : 'border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-600'
                      }`}
                    >
                      <span className="font-semibold">{b}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3: Goal */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    What's your primary goal?
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    We'll create a personalized path to help you achieve it
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {GOALS.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setGoal(g.id)}
                      className={`p-6 rounded-xl border-2 transition-all text-left ${
                        goal === g.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
                          : 'border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-600'
                      }`}
                    >
                      <g.icon className={`w-8 h-8 mb-3 ${
                        goal === g.id
                          ? 'text-primary-500'
                          : 'text-slate-400'
                      }`} />
                      <h3 className={`font-semibold text-lg mb-1 ${
                        goal === g.id
                          ? 'text-primary-600 dark:text-primary-400'
                          : 'text-slate-900 dark:text-white'
                      }`}>
                        {g.label}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{g.desc}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 4: Skills */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Select skills to learn
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    Choose at least 3 skills you want to master ({skills.length}/3 selected)
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 justify-center">
                  {SKILL_OPTIONS.map((skill) => (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`px-4 py-2 rounded-full border-2 transition-all text-sm font-medium ${
                        skills.includes(skill)
                          ? 'border-primary-500 bg-primary-500 text-white'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-primary-300 dark:hover:border-primary-600'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 1}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>

            {step < 4 ? (
              <Button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canProceed()}
                className="gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={!canProceed() || loading}
                className="gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Start Learning
                    <Rocket className="w-4 h-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
