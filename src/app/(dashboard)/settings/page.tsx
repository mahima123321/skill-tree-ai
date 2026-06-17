'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings, User, Bell, Palette, Save, Moon, Sun, Check } from 'lucide-react'
import { Card, Button, Input } from '@/components/ui'
import { useStore } from '@/store/store'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

const themeOptions = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'system', label: 'System', icon: Palette },
]

export default function SettingsPage() {
  const { user, setUser } = useStore()
  const [name, setName] = useState(user?.name || '')
  const [goal, setGoal] = useState(user?.goal || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    setName(user?.name || '')
    setGoal(user?.goal || '')
  }, [user])

  const handleSave = async () => {
    if (!user?.id) return

    setSaving(true)
    try {
      const { data } = await supabase
        .from('profiles')
        .update({ name, goal, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single()

      if (data) {
        setUser({ ...user, name, goal } as any)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const toggleTheme = (themeId: string) => {
    setTheme(themeId)
    if (themeId === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-slate-500 to-slate-600">
          <Settings className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage your account preferences
          </p>
        </div>
      </div>

      {/* Profile Section */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-5 h-5 text-slate-500" />
          <h2 className="font-semibold text-slate-900 dark:text-white">Profile</h2>
        </div>

        <div className="space-y-4">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-500 dark:text-slate-400 cursor-not-allowed"
            />
          </div>
          <Input
            label="Goal"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g., job, internship, masters"
          />

          <div className="pt-4">
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : saved ? (
                <>
                  <Check className="w-4 h-4" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Theme Section */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Palette className="w-5 h-5 text-slate-500" />
          <h2 className="font-semibold text-slate-900 dark:text-white">Appearance</h2>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {themeOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => toggleTheme(option.id)}
              className={cn(
                'p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2',
                theme === option.id
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
                  : 'border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-600'
              )}
            >
              <option.icon
                className={cn(
                  'w-6 h-6',
                  theme === option.id ? 'text-primary-500' : 'text-slate-400'
                )}
              />
              <span
                className={cn(
                  'text-sm font-medium',
                  theme === option.id ? 'text-primary-600 dark:text-primary-400' : 'text-slate-600 dark:text-slate-400'
                )}
              >
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </Card>

      {/* Stats Summary */}
      <Card className="p-6">
        <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Your Progress</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total XP', value: user?.xp || 0 },
            { label: 'Level', value: user?.level || 1 },
            { label: 'Streak', value: user?.streak || 0 },
            { label: 'Year', value: user?.year || '1st' },
          ].map((stat) => (
            <div key={stat.label} className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl text-center">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  )
}
