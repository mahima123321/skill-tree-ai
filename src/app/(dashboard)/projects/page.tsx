'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Rocket, Plus, Lightbulb, Loader as Loader2, CircleCheck as CheckCircle, Clock, Sparkles, X, ChevronRight } from 'lucide-react'
import { Card, Button } from '@/components/ui'
import { useStore } from '@/store/store'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

interface Project {
  id: string
  title: string
  description: string
  tech_stack: string[]
  status: 'idea' | 'in_progress' | 'completed'
  progress: number
}

const projectIdeas = [
  {
    title: 'AI-Powered Task Manager',
    description: 'Build a task management app with AI-powered prioritization and scheduling suggestions.',
    tech_stack: ['React', 'Node.js', 'OpenAI API'],
  },
  {
    title: 'Real-time Chat Application',
    description: 'Create a Slack-like messaging app with real-time updates using WebSockets.',
    tech_stack: ['Next.js', 'Socket.io', 'MongoDB'],
  },
  {
    title: 'Personal Finance Dashboard',
    description: 'Track expenses, income, and investments with beautiful visualizations.',
    tech_stack: ['React', 'Python', 'PostgreSQL', 'Chart.js'],
  },
  {
    title: 'Code Snippet Manager',
    description: 'Store, organize, and search code snippets with syntax highlighting.',
    tech_stack: ['Next.js', 'Supabase', 'Monaco Editor'],
  },
]

const statusConfig = {
  idea: { label: 'Idea', color: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' },
  in_progress: { label: 'In Progress', color: 'bg-warning-100 text-warning-600 dark:bg-warning-500/20 dark:text-warning-400' },
  completed: { label: 'Completed', color: 'bg-success-100 text-success-600 dark:bg-success-500/20 dark:text-success-400' },
}

export default function ProjectsPage() {
  const { user, addXP } = useStore()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newProject, setNewProject] = useState({ title: '', description: '', tech_stack: '' })

  useEffect(() => {
    loadProjects()
  }, [user])

  const loadProjects = async () => {
    if (!user?.id) return

    try {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setProjects(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const createProject = async () => {
    if (!user?.id || !newProject.title) return

    try {
      const { data } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          title: newProject.title,
          description: newProject.description,
          tech_stack: newProject.tech_stack.split(',').map((t) => t.trim()).filter(Boolean),
          status: 'idea',
          progress: 0,
        })
        .select()
        .single()

      if (data) {
        setProjects([data, ...projects])
        setShowModal(false)
        setNewProject({ title: '', description: '', tech_stack: '' })
        addXP(10)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const updateProjectStatus = async (projectId: string, newStatus: Project['status']) => {
    try {
      const progress = newStatus === 'completed' ? 100 : newStatus === 'in_progress' ? 50 : 0

      await supabase
        .from('projects')
        .update({ status: newStatus, progress })
        .eq('id', projectId)

      setProjects(
        projects.map((p) =>
          p.id === projectId ? { ...p, status: newStatus, progress } : p
        )
      )

      if (newStatus === 'completed') {
        addXP(25)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const deleteProject = async (projectId: string) => {
    try {
      await supabase.from('projects').delete().eq('id', projectId)
      setProjects(projects.filter((p) => p.id !== projectId))
    } catch (err) {
      console.error(err)
    }
  }

  const useSuggestedIdea = (idea: typeof projectIdeas[0]) => {
    setNewProject({
      title: idea.title,
      description: idea.description,
      tech_stack: idea.tech_stack.join(', '),
    })
    setShowModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-warning-500 to-orange-500">
            <Rocket className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Project Workspace</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Track and manage your projects
            </p>
          </div>
        </div>

        <Button onClick={() => setShowModal(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Project
        </Button>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Ideas', count: projects.filter((p) => p.status === 'idea').length, icon: Lightbulb },
          { label: 'In Progress', count: projects.filter((p) => p.status === 'in_progress').length, icon: Loader2 },
          { label: 'Completed', count: projects.filter((p) => p.status === 'completed').length, icon: CheckCircle },
        ].map((stat) => (
          <Card key={stat.label} className="p-4 text-center">
            <stat.icon className="w-6 h-6 mx-auto mb-2 text-primary-500" />
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.count}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Projects List */}
      {projects.length > 0 ? (
        <div className="space-y-4">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-slate-900 dark:text-white">{project.title}</h3>
                      <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full', statusConfig[project.status].color)}>
                        {statusConfig[project.status].label}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{project.description}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {project.tech_stack?.map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* Progress Bar */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${project.progress}%` }}
                          transition={{ duration: 0.5 }}
                          className={cn(
                            'h-full rounded-full',
                            project.status === 'completed'
                              ? 'bg-success-500'
                              : 'bg-gradient-to-r from-primary-500 to-accent-500'
                          )}
                        />
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{project.progress}%</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col gap-2">
                    {project.status === 'idea' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => updateProjectStatus(project.id, 'in_progress')}
                      >
                        Start
                      </Button>
                    )}
                    {project.status === 'in_progress' && (
                      <Button
                        size="sm"
                        onClick={() => updateProjectStatus(project.id, 'completed')}
                      >
                        Complete
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteProject(project.id)}
                      className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <Rocket className="w-12 h-12 mx-auto mb-4 text-slate-400" />
          <h3 className="font-semibold text-slate-900 dark:text-white mb-2">No projects yet</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Start tracking your learning projects here
          </p>
          <Button onClick={() => setShowModal(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Your First Project
          </Button>
        </Card>
      )}

      {/* AI Project Suggestions */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary-500" />
          <h3 className="font-semibold text-slate-900 dark:text-white">AI-Suggested Projects</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {projectIdeas.map((idea) => (
            <div
              key={idea.title}
              className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-primary-300 dark:hover:border-primary-600 cursor-pointer transition-all"
              onClick={() => useSuggestedIdea(idea)}
            >
              <h4 className="font-medium text-slate-900 dark:text-white mb-1">{idea.title}</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{idea.description}</p>
              <div className="flex flex-wrap gap-1">
                {idea.tech_stack.map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-0.5 text-xs bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 rounded"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* New Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg text-slate-900 dark:text-white">New Project</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Project Title
                </label>
                <input
                  type="text"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  placeholder="e.g., E-commerce Platform"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Description
                </label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none"
                  rows={3}
                  placeholder="What will this project do?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Tech Stack (comma-separated)
                </label>
                <input
                  type="text"
                  value={newProject.tech_stack}
                  onChange={(e) => setNewProject({ ...newProject, tech_stack: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  placeholder="e.g., React, Node.js, MongoDB"
                />
              </div>
              <Button onClick={createProject} className="w-full" disabled={!newProject.title}>
                Create Project
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
