'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  TrendingUp, Zap, Target, Flame, Award, ArrowRight, Brain, Rocket,
  Calendar, MessageCircle, FileText, Bell, ChevronRight, Sparkles
} from 'lucide-react'
import { useStore } from '@/store/store'
import { Card } from '@/components/ui'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

const quickActions = [
  { href: '/mentor', label: 'Ask AI Mentor', icon: MessageCircle, color: 'from-primary-500 to-primary-600' },
  { href: '/skills', label: 'Explore Skills', icon: Brain, color: 'from-accent-500 to-accent-600' },
  { href: '/roadmap', label: 'Weekly Plan', icon: Calendar, color: 'from-success-500 to-success-600' },
  { href: '/projects', label: 'New Project', icon: Rocket, color: 'from-warning-500 to-warning-600' },
]

const skillProgress = [
  { name: 'React', progress: 65, level: 3 },
  { name: 'Node.js', progress: 45, level: 2 },
  { name: 'Python', progress: 30, level: 1 },
  { name: 'SQL', progress: 80, level: 4 },
]

const recentActivity = [
  { text: 'Completed React basics module', time: '2h ago', xp: 15 },
  { text: 'Started Node.js learning path', time: '5h ago', xp: 10 },
  { text: '7-day streak achieved!', time: '1d ago', xp: 50 },
  { text: 'Submitted project idea', time: '2d ago', xp: 20 },
]

export default function DashboardPage() {
  const { user } = useStore()

  const careerScore = Math.min(
    Math.floor((user?.xp || 0) / 2 + (user?.level || 1) * 5 + (user?.streak || 0) * 2),
    100
  )

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">
            Welcome back, {user?.name?.split(' ')[0] || 'there'}!
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {user?.year} Year • {user?.branch} • Goal: {user?.goal || 'Not set'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Career Score', value: careerScore, suffix: '/100', icon: Target, color: 'text-primary-500', bg: 'bg-primary-500/10' },
          { label: 'Total XP', value: user?.xp || 0, suffix: '', icon: Zap, color: 'text-warning-500', bg: 'bg-warning-500/10' },
          { label: 'Current Level', value: user?.level || 1, suffix: '', icon: Award, color: 'text-accent-500', bg: 'bg-accent-500/10' },
          { label: 'Day Streak', value: user?.streak || 0, suffix: ' days', icon: Flame, color: 'text-red-500', bg: 'bg-red-500/10' },
        ].map((stat) => (
          <Card key={stat.label} className="p-4 lg:p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mt-1">
                  {stat.value}<span className="text-sm font-normal text-slate-400">{stat.suffix}</span>
                </p>
              </div>
              <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item}>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="p-4 hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer group">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <p className="font-medium text-slate-900 dark:text-white">{action.label}</p>
                <ArrowRight className="w-4 h-4 text-slate-400 mt-2 group-hover:translate-x-1 transition-transform" />
              </Card>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Learning Progress */}
        <motion.div variants={item} className="lg:col-span-2 space-y-6">
          {/* Skill Progress */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">Skill Progress</h3>
              <Link href="/skills" className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-4">
              {skillProgress.map((skill) => (
                <div key={skill.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{skill.name}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Level {skill.level}</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.progress}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Weekly Chart Placeholder */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">Weekly Activity</h3>
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <TrendingUp className="w-4 h-4 text-success-500" />
                +12% this week
              </div>
            </div>
            <div className="flex items-end justify-between h-40 gap-2">
              {[65, 45, 80, 30, 95, 55, 70].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className={`w-full rounded-t-lg bg-gradient-to-t ${
                      i === new Date().getDay() - 1
                        ? 'from-primary-500 to-primary-400'
                        : 'from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-600'
                    }`}
                  />
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Right Column - AI Mentor & Activity */}
        <motion.div variants={item} className="space-y-6">
          {/* AI Mentor Preview */}
          <Card className="p-6 bg-gradient-to-br from-primary-500 to-accent-500 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold">AI Career Mentor</p>
                  <p className="text-sm text-white/70">Always available</p>
                </div>
              </div>
              <p className="text-sm text-white/80 mb-4">
                Your personalized AI mentor is ready to help you with career guidance, skill recommendations, and more.
              </p>
              <Link
                href="/mentor"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-primary-600 text-sm font-semibold rounded-xl hover:bg-white/90 transition-colors"
              >
                Start Chat
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {recentActivity.map((activity, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50"
                >
                  <div className="w-8 h-8 rounded-full bg-success-500/20 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-success-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 dark:text-slate-300">{activity.text}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500 dark:text-slate-400">{activity.time}</span>
                      <span className="text-xs text-success-500 font-medium">+{activity.xp} XP</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Learning Resources */}
      <motion.div variants={item}>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white">Recommended Today</h3>
            <span className="text-sm text-slate-500 dark:text-slate-400">Based on your goals</span>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { title: 'React Hooks Deep Dive', type: 'Tutorial', duration: '45 min', level: 'Intermediate' },
              { title: 'System Design Principles', type: 'Video', duration: '1.5 hrs', level: 'Advanced' },
              { title: 'SQL Optimization Tips', type: 'Article', duration: '20 min', level: 'Beginner' },
            ].map((resource) => (
              <div
                key={resource.title}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-600 cursor-pointer transition-colors"
              >
                <span className="inline-block px-2 py-1 text-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-500/20 rounded mb-2">
                  {resource.type}
                </span>
                <h4 className="font-medium text-slate-900 dark:text-white mb-2">{resource.title}</h4>
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span>{resource.duration}</span>
                  <span>{resource.level}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}
