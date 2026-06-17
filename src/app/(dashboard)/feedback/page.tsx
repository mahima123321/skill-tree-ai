'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Star, Send, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Lightbulb, ThumbsUp, ChevronRight, Loader as Loader2 } from 'lucide-react'
import { Card, Button } from '@/components/ui'
import { useStore } from '@/store/store'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

const features = [
  'AI Career Mentor',
  'Skill Tree',
  'Career GPS',
  'Placement Predictor',
  'Mock Interview',
  'Project Generator',
  'Team Finder',
  'Competitions',
  'Weekly Roadmap',
  'Dashboard',
]

const commonProblems = [
  'App is slow/laggy',
  'Confusing navigation',
  'Features not working',
  'Too many notifications',
  'Not enough personalization',
  'Missing documentation',
  'Mobile experience issues',
  'Other',
]

export default function FeedbackPage() {
  const { user, addXP } = useStore()
  const [step, setStep] = useState(1)
  const [mostUseful, setMostUseful] = useState<string[]>([])
  const [problemAreas, setProblemAreas] = useState<string[]>([])
  const [missingFeatures, setMissingFeatures] = useState('')
  const [rating, setRating] = useState(0)
  const [comments, setComments] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const toggleFeature = (feature: string) => {
    setMostUseful((prev) =>
      prev.includes(feature) ? prev.filter((f) => f !== feature) : [...prev, feature]
    )
  }

  const toggleProblem = (problem: string) => {
    setProblemAreas((prev) =>
      prev.includes(problem) ? prev.filter((p) => p !== problem) : [...prev, problem]
    )
  }

  const handleSubmit = async () => {
    if (mostUseful.length === 0) return
    setSubmitting(true)

    try {
      await supabase.from('feedback').insert({
        user_id: user?.id,
        most_useful_feature: mostUseful.join(', '),
        problem_areas: problemAreas.join(', '),
        missing_features: missingFeatures,
        overall_rating: rating,
        additional_comments: comments,
      })
      addXP(15)
      setSubmitted(true)
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setStep(1)
    setMostUseful([])
    setProblemAreas([])
    setMissingFeatures('')
    setRating(0)
    setComments('')
    setSubmitted(false)
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl mx-auto"
      >
        <Card className="p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-success-100 dark:bg-success-500/20 mx-auto mb-6 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-success-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Thank You!
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Your feedback helps us improve SkillTree AI. We appreciate you taking the time!
          </p>
          <div className="p-4 bg-primary-50 dark:bg-primary-500/10 rounded-xl mb-6">
            <p className="text-primary-600 dark:text-primary-400 font-medium">
              +15 XP earned for your feedback!
            </p>
          </div>
          <Button onClick={resetForm} className="gap-2">
            <MessageSquare className="w-4 h-4" />
            Submit Another Response
          </Button>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500">
          <MessageSquare className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Feedback</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Help us make SkillTree AI better
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={cn(
              'flex-1 h-2 rounded-full transition-colors',
              s <= step ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-700'
            )}
          />
        ))}
      </div>

      {/* Step 1: Most Useful Features */}
      {step === 1 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <ThumbsUp className="w-5 h-5 text-success-500" />
            <h2 className="font-semibold text-slate-900 dark:text-white">
              What features do you find most useful?
            </h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Select all that apply
          </p>
          <div className="grid grid-cols-2 gap-2">
            {features.map((feature) => (
              <button
                key={feature}
                onClick={() => toggleFeature(feature)}
                className={cn(
                  'px-4 py-3 rounded-xl border-2 text-left transition-all',
                  mostUseful.includes(feature)
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
                    : 'border-slate-200 dark:border-slate-700 hover:border-primary-300'
                )}
              >
                <span className={cn(
                  'text-sm font-medium',
                  mostUseful.includes(feature)
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-slate-700 dark:text-slate-300'
                )}>
                  {feature}
                </span>
              </button>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <Button
              onClick={() => setStep(2)}
              disabled={mostUseful.length === 0}
              className="gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2: Problems */}
      {step === 2 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-warning-500" />
            <h2 className="font-semibold text-slate-900 dark:text-white">
              Have you encountered any problems?
            </h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Select any issues you've faced (optional)
          </p>
          <div className="space-y-2">
            {commonProblems.map((problem) => (
              <button
                key={problem}
                onClick={() => toggleProblem(problem)}
                className={cn(
                  'w-full px-4 py-3 rounded-xl border-2 text-left transition-all',
                  problemAreas.includes(problem)
                    ? 'border-warning-500 bg-warning-50 dark:bg-warning-500/10'
                    : 'border-slate-200 dark:border-slate-700 hover:border-warning-300'
                )}
              >
                <span className={cn(
                  'text-sm',
                  problemAreas.includes(problem)
                    ? 'text-warning-700 dark:text-warning-400'
                    : 'text-slate-700 dark:text-slate-300'
                )}>
                  {problem}
                </span>
              </button>
            ))}
          </div>
          <div className="mt-6 flex justify-between">
            <Button variant="secondary" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button onClick={() => setStep(3)} className="gap-2">
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Missing Features */}
      {step === 3 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-primary-500" />
            <h2 className="font-semibold text-slate-900 dark:text-white">
              What features are missing?
            </h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Tell us what would make this app more useful for you
          </p>
          <textarea
            value={missingFeatures}
            onChange={(e) => setMissingFeatures(e.target.value)}
            placeholder="e.g., I wish there was a mobile app, dark mode improvements, more project templates..."
            className="w-full h-32 px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/50"
          />
          <div className="mt-6 flex justify-between">
            <Button variant="secondary" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button onClick={() => setStep(4)} className="gap-2">
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 4: Rating & Final */}
      {step === 4 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-yellow-500" />
            <h2 className="font-semibold text-slate-900 dark:text-white">
              How would you rate your overall experience?
            </h2>
          </div>

          {/* Star Rating */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={cn(
                    'w-10 h-10 transition-colors',
                    star <= rating
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-slate-300 dark:text-slate-600'
                  )}
                />
              </button>
            ))}
          </div>

          {/* Additional Comments */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Any additional comments?
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Share any other thoughts..."
              className="w-full h-24 px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            />
          </div>

          <div className="flex justify-between">
            <Button variant="secondary" onClick={() => setStep(3)}>
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={rating === 0 || submitting}
              className="gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Feedback
                </>
              )}
            </Button>
          </div>
        </Card>
      )}
    </motion.div>
  )
}
