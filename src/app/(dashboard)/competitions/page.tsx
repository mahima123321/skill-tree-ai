'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Clock, Users, Star, Zap, Target, ChevronRight, Medal, Crown, Loader as Loader2 } from 'lucide-react'
import { Card, Button } from '@/components/ui'
import { useStore } from '@/store/store'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

interface Competition {
  id: string
  title: string
  description: string
  type: 'skill' | 'project' | 'quiz'
  start_date: string
  end_date: string
  prize: string
  is_active: boolean
  participants: string[]
  leaderboard: { user_id: string; name: string; score: number }[]
}

export default function CompetitionsPage() {
  const { user, addXP } = useStore()
  const [loading, setLoading] = useState(true)
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [activeTab, setActiveTab] = useState<'active' | 'upcoming'>('active')
  const [joinedCompetitions, setJoinedCompetitions] = useState<string[]>([])
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null)

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    if (!user?.id) return

    try {
      const { data: comps } = await supabase
        .from('competitions')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      setCompetitions(comps || [])

      // Check which competitions user has joined
      const { data: entries } = await supabase
        .from('competition_entries')
        .select('competition_id')
        .eq('user_id', user.id)

      setJoinedCompetitions((entries || []).map((e: any) => e.competition_id))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const joinCompetition = async (compId: string) => {
    if (!user?.id || joinedCompetitions.includes(compId)) return

    try {
      await supabase.from('competition_entries').insert({
        competition_id: compId,
        user_id: user.id,
        score: 0,
        xp_earned: 0,
      })

      setJoinedCompetitions([...joinedCompetitions, compId])
      addXP(10)
    } catch (err) {
      console.error(err)
    }
  }

  const submitScore = async (compId: string, score: number) => {
    if (!user?.id) return

    try {
      await supabase
        .from('competition_entries')
        .update({ score, submitted_at: new Date().toISOString() })
        .eq('competition_id', compId)
        .eq('user_id', user.id)

      addXP(score)
    } catch (err) {
      console.error(err)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'skill': return Target
      case 'project': return Trophy
      case 'quiz': return Zap
      default: return Target
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'skill': return 'from-primary-500 to-blue-500'
      case 'project': return 'from-warning-500 to-orange-500'
      case 'quiz': return 'from-accent-500 to-pink-500'
      default: return 'from-primary-500 to-accent-500'
    }
  }

  const getDaysLeft = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : 0
  }

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
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500">
          <Trophy className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Competitions</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Compete, learn, and win prizes
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <Trophy className="w-6 h-6 mx-auto mb-2 text-warning-500" />
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{competitions.length}</p>
          <p className="text-xs text-slate-500">Active</p>
        </Card>
        <Card className="p-4 text-center">
          <Medal className="w-6 h-6 mx-auto mb-2 text-primary-500" />
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{joinedCompetitions.length}</p>
          <p className="text-xs text-slate-500">Joined</p>
        </Card>
        <Card className="p-4 text-center">
          <Star className="w-6 h-6 mx-auto mb-2 text-accent-500" />
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {joinedCompetitions.length > 0 ? '+' : '0'}{joinedCompetitions.length * 10} XP
          </p>
          <p className="text-xs text-slate-500">Earned</p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('active')}
          className={cn(
            'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
            activeTab === 'active'
              ? 'bg-primary-500 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          )}
        >
          Active Competitions
        </button>
        <button
          onClick={() => setActiveTab('upcoming')}
          className={cn(
            'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
            activeTab === 'upcoming'
              ? 'bg-primary-500 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          )}
        >
          My Entries
        </button>
      </div>

      {/* Competitions List */}
      <div className="space-y-4">
        {competitions.map((comp, index) => {
          const TypeIcon = getTypeIcon(comp.type)
          const daysLeft = getDaysLeft(comp.end_date)
          const isJoined = joinedCompetitions.includes(comp.id)

          return (
            <motion.div
              key={comp.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-5">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Icon */}
                  <div className={cn(
                    'w-14 h-14 rounded-xl flex items-center justify-center',
                    `bg-gradient-to-br ${getTypeColor(comp.type)}`
                  )}>
                    <TypeIcon className="w-7 h-7 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{comp.title}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{comp.description}</p>
                      </div>
                      {isJoined && (
                        <span className="px-2 py-1 bg-success-100 dark:bg-success-500/20 text-success-600 dark:text-success-400 text-xs rounded-full">
                          Joined
                        </span>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {(comp.participants as string[])?.length || 0} participants
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {daysLeft} days left
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-warning-500" />
                        {comp.prize}
                      </div>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="md:text-right">
                    {!isJoined ? (
                      <Button onClick={() => joinCompetition(comp.id)} className="gap-2">
                        Join Now
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        onClick={() => setSelectedCompetition(comp)}
                        className="gap-2"
                      >
                        View Details
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Leaderboard Preview */}
                {isJoined && comp.leaderboard && comp.leaderboard.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Top 3</p>
                    <div className="flex gap-2">
                      {comp.leaderboard.slice(0, 3).map((entry, i) => (
                        <div
                          key={entry.user_id}
                          className={cn(
                            'flex-1 p-2 rounded-lg text-center text-sm',
                            i === 0 ? 'bg-warning-100 dark:bg-warning-500/20' :
                            i === 1 ? 'bg-slate-100 dark:bg-slate-700' :
                            'bg-orange-100 dark:bg-orange-500/20'
                          )}
                        >
                          <div className="flex items-center justify-center gap-1 mb-1">
                            {i === 0 && <Crown className="w-3 h-3 text-warning-500" />}
                            {i === 1 && <Medal className="w-3 h-3 text-slate-400" />}
                            {i === 2 && <Medal className="w-3 h-3 text-orange-400" />}
                            <span className="font-medium text-slate-900 dark:text-white truncate">
                              {entry.name}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500">{entry.score} pts</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Competition Details Modal */}
      {selectedCompetition && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl p-6"
          >
            <div className="text-center mb-6">
              <div className={cn(
                'w-16 h-16 rounded-xl mx-auto mb-4 flex items-center justify-center',
                `bg-gradient-to-br ${getTypeColor(selectedCompetition.type)}`
              )}>
                {(() => {
                  const Icon = getTypeIcon(selectedCompetition.type)
                  return <Icon className="w-8 h-8 text-white" />
                })()}
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {selectedCompetition.title}
              </h2>
              <p className="text-sm text-slate-500 mt-1">{selectedCompetition.prize}</p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl mb-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">{selectedCompetition.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl text-center">
                <p className="text-2xl font-bold text-primary-500">{getDaysLeft(selectedCompetition.end_date)}</p>
                <p className="text-xs text-slate-500">Days Left</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl text-center">
                <p className="text-2xl font-bold text-success-500">
                  {(selectedCompetition.participants as string[])?.length || 0}
                </p>
                <p className="text-xs text-slate-500">Participants</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setSelectedCompetition(null)} className="flex-1">
                Close
              </Button>
              <Button
                onClick={() => {
                  submitScore(selectedCompetition.id, Math.floor(Math.random() * 100))
                  setSelectedCompetition(null)
                }}
                className="flex-1"
              >
                Submit Entry
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
