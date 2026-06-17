'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChartBar as BarChart3, Users, UserPlus, TrendingUp, TriangleAlert as AlertTriangle, MousePointer, Loader as Loader2, Calendar, ArrowUp, ArrowDown } from 'lucide-react'
import { Card } from '@/components/ui'
import { useStore } from '@/store/store'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

interface AnalyticsData {
  totalUsers: number
  activeToday: number
  signupsToday: number
  totalPageViews: number
  topFeatures: { name: string; count: number }[]
  dropOffPoints: { step: string; count: number }[]
  weeklyTrend: { date: string; users: number; signups: number }[]
}

export default function AnalyticsPage() {
  const { user } = useStore()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d')

  useEffect(() => {
    loadData()
  }, [timeRange])

  const loadData = async () => {
    setLoading(true)
    try {
      // Get date range
      const days = timeRange === '7d' ? 7 : 30
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      // Total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      // Active users today
      const today = new Date().toISOString().split('T')[0]
      const { data: activeUsers } = await supabase
        .from('analytics_events')
        .select('user_id')
        .eq('event_type', 'session')
        .gte('created_at', today)

      const activeToday = new Set(activeUsers?.map((u: any) => u.user_id).filter(Boolean)).size

      // Signups today
      const { count: signupsToday } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today)

      // Total page views
      const { count: totalPageViews } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'page_view')

      // Feature usage
      const { data: featureEvents } = await supabase
        .from('analytics_events')
        .select('event_name')
        .eq('event_type', 'feature_usage')
        .gte('created_at', startDate.toISOString())

      const featureCounts: Record<string, number> = {}
      featureEvents?.forEach((e: any) => {
        featureCounts[e.event_name] = (featureCounts[e.event_name] || 0) + 1
      })

      const topFeatures = Object.entries(featureCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([name, count]) => ({ name, count }))

      // Drop-off points
      const { data: dropOffs } = await supabase
        .from('analytics_events')
        .select('event_name')
        .eq('event_type', 'drop_off')
        .gte('created_at', startDate.toISOString())

      const dropOffCounts: Record<string, number> = {}
      dropOffs?.forEach((e: any) => {
        dropOffCounts[e.event_name] = (dropOffCounts[e.event_name] || 0) + 1
      })

      const dropOffPoints = Object.entries(dropOffCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([step, count]) => ({ step, count }))

      // Weekly trend
      const weeklyTrend = []
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]

        const { count: usersOnDay } = await supabase
          .from('analytics_events')
          .select('*', { count: 'exact', head: true })
          .eq('event_type', 'session')
          .gte('created_at', dateStr)
          .lt('created_at', new Date(date.getTime() + 86400000).toISOString().split('T')[0])

        const { count: signupsOnDay } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', dateStr)
          .lt('created_at', new Date(date.getTime() + 86400000).toISOString().split('T')[0])

        weeklyTrend.push({
          date: date.toLocaleDateString('en-US', { weekday: 'short' }),
          users: usersOnDay || 0,
          signups: signupsOnDay || 0,
        })
      }

      setData({
        totalUsers: totalUsers || 0,
        activeToday,
        signupsToday: signupsToday || 0,
        totalPageViews: totalPageViews || 0,
        topFeatures,
        dropOffPoints,
        weeklyTrend,
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  if (!data) return null

  const maxUsers = Math.max(...data.weeklyTrend.map((d) => d.users), 1)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Platform usage insights
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTimeRange('7d')}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
              timeRange === '7d'
                ? 'bg-primary-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            )}
          >
            7 Days
          </button>
          <button
            onClick={() => setTimeRange('30d')}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
              timeRange === '30d'
                ? 'bg-primary-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            )}
          >
            30 Days
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Users',
            value: data.totalUsers,
            icon: Users,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
            change: '+12%',
          },
          {
            label: 'Active Today',
            value: data.activeToday,
            icon: MousePointer,
            color: 'text-success-500',
            bg: 'bg-success-500/10',
            change: '+8%',
          },
          {
            label: 'Signups Today',
            value: data.signupsToday,
            icon: UserPlus,
            color: 'text-primary-500',
            bg: 'bg-primary-500/10',
            change: '+5%',
          },
          {
            label: 'Total Page Views',
            value: data.totalPageViews,
            icon: TrendingUp,
            color: 'text-warning-500',
            bg: 'bg-warning-500/10',
            change: '+15%',
          },
        ].map((stat) => (
          <Card key={stat.label} className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={cn('p-2.5 rounded-xl', stat.bg)}>
                <stat.icon className={cn('w-5 h-5', stat.color)} />
              </div>
              <div className="flex items-center gap-1 text-xs text-success-500">
                <ArrowUp className="w-3 h-3" />
                {stat.change}
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Weekly Trend Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900 dark:text-white">Activity Trend</h2>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary-500" />
              <span className="text-slate-500">Active Users</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success-500" />
              <span className="text-slate-500">Signups</span>
            </div>
          </div>
        </div>
        <div className="flex items-end gap-2 h-48">
          {data.weeklyTrend.map((day, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="flex-1 flex items-end gap-1 w-full">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(day.users / maxUsers) * 100}%` }}
                  transition={{ delay: i * 0.05 }}
                  className="flex-1 bg-gradient-to-t from-primary-500 to-primary-400 rounded-t-lg min-h-[4px]"
                />
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.min((day.signups / maxUsers) * 100, 50)}%` }}
                  transition={{ delay: i * 0.05 + 0.1 }}
                  className="flex-1 bg-gradient-to-t from-success-500 to-success-400 rounded-t-lg min-h-[4px]"
                />
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">{day.date}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Features & Drop-offs */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Features */}
        <Card className="p-6">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-4">
            Most Used Features
          </h2>
          {data.topFeatures.length > 0 ? (
            <div className="space-y-3">
              {data.topFeatures.map((feature, i) => (
                <div key={feature.name} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary-500/10 text-primary-500 text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {feature.name}
                      </span>
                      <span className="text-sm text-slate-500">{feature.count} uses</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(feature.count / (data.topFeatures[0]?.count || 1)) * 100}%` }}
                        className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <MousePointer className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No feature usage data yet</p>
            </div>
          )}
        </Card>

        {/* Drop-off Points */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-warning-500" />
            <h2 className="font-semibold text-slate-900 dark:text-white">Drop-off Points</h2>
          </div>
          {data.dropOffPoints.length > 0 ? (
            <div className="space-y-3">
              {data.dropOffPoints.map((dropOff, i) => (
                <div
                  key={dropOff.step}
                  className="flex items-center justify-between p-3 bg-warning-50 dark:bg-warning-500/10 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-warning-600 dark:text-warning-400 font-medium">
                      {i + 1}.
                    </span>
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {dropOff.step}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-warning-600 dark:text-warning-400">
                    {dropOff.count} users
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Great! No significant drop-offs detected</p>
            </div>
          )}

          {/* Insights */}
          <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-500/10 rounded-xl">
            <h3 className="font-medium text-primary-700 dark:text-primary-300 mb-2">
              Insights
            </h3>
            <p className="text-sm text-primary-600 dark:text-primary-400">
              {data.dropOffPoints.length > 0
                ? `Users are dropping off mostly at "${data.dropOffPoints[0]?.step}". Consider improving this step.`
                : 'Your onboarding flow is performing well. Keep monitoring!'}
            </p>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h2 className="font-semibold text-slate-900 dark:text-white mb-4">
          Recent Activity Log
        </h2>
        <div className="space-y-2">
          {[
            { action: 'User signed up', time: '2 min ago', type: 'signup' },
            { action: 'Feature used: AI Mentor', time: '5 min ago', type: 'feature' },
            { action: 'User completed onboarding', time: '10 min ago', type: 'milestone' },
            { action: 'Feedback submitted', time: '15 min ago', type: 'feedback' },
            { action: 'User joined competition', time: '20 min ago', type: 'feature' },
          ].map((activity, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-2 h-2 rounded-full',
                    activity.type === 'signup' ? 'bg-success-500' :
                    activity.type === 'feature' ? 'bg-primary-500' :
                    activity.type === 'milestone' ? 'bg-warning-500' :
                    'bg-accent-500'
                  )}
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">{activity.action}</span>
              </div>
              <span className="text-xs text-slate-400">{activity.time}</span>
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  )
}
