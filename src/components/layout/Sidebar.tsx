'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Brain, TreeDeciduous, Rocket, Calendar, FileText,
  Settings, LogOut, Sparkles, Moon, Sun, Menu, X, ChevronRight,
  Zap, Target, MessageCircle, TrendingUp, Users, Trophy
} from 'lucide-react'
import { useStore } from '@/store/store'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/skills', label: 'Skill Tree', icon: TreeDeciduous },
  { href: '/mentor', label: 'AI Mentor', icon: MessageCircle },
  { href: '/career-gps', label: 'Career GPS', icon: Target },
  { href: '/placement', label: 'Placement Predictor', icon: TrendingUp },
  { href: '/roadmap', label: 'Roadmap', icon: Calendar },
  { href: '/mock-interview', label: 'Mock Interview', icon: Zap },
  { href: '/project-generator', label: 'Project Generator', icon: Rocket },
  { href: '/projects', label: 'My Projects', icon: FileText },
  { href: '/career-twin', label: 'Career Twin', icon: Users },
  { href: '/team-finder', label: 'Team Finder', icon: Users },
  { href: '/competitions', label: 'Competitions', icon: Trophy },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const [isDark, setIsDark] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useStore()

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle('dark')
  }

  const handleLogout = async () => {
    await logout()
    window.location.href = '/login'
  }

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="relative">
            <Sparkles className="w-8 h-8 text-primary-500" />
            <div className="absolute inset-0 bg-primary-500 blur-lg opacity-30" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
            SkillTree
          </span>
        </Link>
      </div>

      {/* User Card */}
      <div className="px-4 mb-6">
        <div className="p-4 bg-gradient-to-r from-primary-500/10 to-accent-500/10 rounded-xl border border-primary-500/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 dark:text-white truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Level {user?.level || 1}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all"
                style={{ width: `${Math.min(((user?.xp || 0) % 100), 100)}%` }}
              />
            </div>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
              {user?.xp || 0} XP
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all group',
                isActive
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
              {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
            </Link>
          )
        })}
      </nav>

      {/* Bottom actions */}
      <div className="p-4 space-y-2">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          <span className="font-medium">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Log Out</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg"
      >
        <Menu className="w-6 h-6 text-slate-700 dark:text-slate-200" />
      </button>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-slate-900 z-50 lg:hidden"
            >
              <button
                onClick={() => setIsMobileOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-30">
        <SidebarContent />
      </aside>
    </>
  )
}
