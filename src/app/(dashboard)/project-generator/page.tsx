'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Wand as Wand2, Loader as Loader2, ChevronRight, Clock, Users, Sparkles, RefreshCw, Lightbulb, Save, ExternalLink } from 'lucide-react'
import { Card, Button } from '@/components/ui'
import { useStore } from '@/store/store'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

interface GeneratedProject {
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  tech_stack: string[]
  estimated_hours: number
  skills: string[]
  milestones: { title: string; description: string }[]
  resources: { title: string; url: string }[]
}

const projectTypes = [
  { id: 'web', label: 'Web Application', icon: '🌐' },
  { id: 'mobile', label: 'Mobile App', icon: '📱' },
  { id: 'api', label: 'API/Backend', icon: '⚡' },
  { id: 'ml', label: 'ML/AI Project', icon: '🤖' },
  { id: 'system', label: 'System Tool', icon: '🔧' },
  { id: 'fullstack', label: 'Full Stack', icon: '🚀' },
]

const generateProject = (type: string, difficulty: string, userProfile: any): GeneratedProject => {
  const projects: Record<string, GeneratedProject[]> = {
    web: [
      {
        title: 'Personal Portfolio Website',
        description: 'Create a stunning personal portfolio to showcase your projects and skills. Include animations, dark mode, and responsive design.',
        difficulty: 'beginner',
        tech_stack: ['React', 'Tailwind CSS', 'Framer Motion'],
        estimated_hours: 15,
        skills: ['Frontend', 'UI/UX', 'Animation'],
        milestones: [
          { title: 'Design & Structure', description: 'Plan layout and create wireframes' },
          { title: 'Core Components', description: 'Build hero, projects, about sections' },
          { title: 'Animations', description: 'Add smooth transitions and interactions' },
          { title: 'Deployment', description: 'Deploy to Vercel/Netlify' },
        ],
        resources: [
          { title: 'Framer Motion Docs', url: '#' },
          { title: 'Portfolio Examples', url: '#' },
        ],
      },
      {
        title: 'E-commerce Dashboard',
        description: 'Build an admin dashboard for managing products, orders, and analytics.',
        difficulty: 'intermediate',
        tech_stack: ['React', 'Chart.js', 'Tailwind CSS'],
        estimated_hours: 30,
        skills: ['Data Visualization', 'State Management', 'Dashboard'],
        milestones: [
          { title: 'Layout & Navigation', description: 'Create sidebar and responsive layout' },
          { title: 'Product Management', description: 'CRUD operations for products' },
          { title: 'Analytics Charts', description: 'Visualize sales and user data' },
          { title: 'Authentication', description: 'Add admin login' },
        ],
        resources: [
          { title: 'Chart.js Guide', url: '#' },
          { title: 'Dashboard UI Kit', url: '#' },
        ],
      },
    ],
    api: [
      {
        title: 'RESTful Task API',
        description: 'Build a production-ready REST API with authentication, validation, and documentation.',
        difficulty: 'intermediate',
        tech_stack: ['Node.js', 'Express', 'PostgreSQL'],
        estimated_hours: 20,
        skills: ['Backend', 'Database', 'API Design'],
        milestones: [
          { title: 'Setup & Models', description: 'Initialize project and create database models' },
          { title: 'CRUD Endpoints', description: 'Implement all REST endpoints' },
          { title: 'Authentication', description: 'Add JWT authentication' },
          { title: 'Documentation', description: 'Create Swagger docs' },
        ],
        resources: [
          { title: 'Express Best Practices', url: '#' },
          { title: 'PostgreSQL Guide', url: '#' },
        ],
      },
    ],
    ml: [
      {
        title: 'Sentiment Analysis Tool',
        description: 'Build a web app that analyzes text sentiment using ML models.',
        difficulty: 'advanced',
        tech_stack: ['Python', 'Flask', 'scikit-learn', 'React'],
        estimated_hours: 25,
        skills: ['ML', 'NLP', 'API Integration'],
        milestones: [
          { title: 'ML Model', description: 'Train sentiment classifier' },
          { title: 'API Backend', description: 'Create Flask API endpoint' },
          { title: 'Frontend', description: 'Build React UI for input' },
          { title: 'Integration', description: 'Connect frontend to backend' },
        ],
        resources: [
          { title: 'NLP Tutorial', url: '#' },
          { title: 'Flask Deployment', url: '#' },
        ],
      },
    ],
    fullstack: [
      {
        title: 'Real-time Chat Application',
        description: 'Build a Slack-like chat app with real-time messaging, channels, and user presence.',
        difficulty: 'advanced',
        tech_stack: ['Next.js', 'Socket.io', 'PostgreSQL', 'Tailwind'],
        estimated_hours: 40,
        skills: ['Full Stack', 'WebSockets', 'Real-time'],
        milestones: [
          { title: 'Auth System', description: 'Implement user registration and login' },
          { title: 'Chat Backend', description: 'Socket.io server with rooms' },
          { title: 'Chat Frontend', description: 'Message UI and channel list' },
          { title: 'Presence System', description: 'Online/offline indicators' },
          { title: 'Deployment', description: 'Deploy to cloud platform' },
        ],
        resources: [
          { title: 'Socket.io Docs', url: '#' },
          { title: 'Next.js Guide', url: '#' },
        ],
      },
    ],
  }

  const available = projects[type] || projects.fullstack
  return available[Math.floor(Math.random() * available.length)]
}

export default function ProjectGeneratorPage() {
  const { user, addXP } = useStore()
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate')
  const [generating, setGenerating] = useState(false)
  const [generatedProject, setGeneratedProject] = useState<GeneratedProject | null>(null)
  const [saved, setSaved] = useState(false)

  const handleGenerate = () => {
    if (!selectedType) return
    setGenerating(true)
    setGeneratedProject(null)
    setSaved(false)

    setTimeout(() => {
      const project = generateProject(selectedType, difficulty, user)
      setGeneratedProject(project)
      setGenerating(false)
    }, 1500)
  }

  const saveProject = async () => {
    if (!generatedProject || !user?.id) return

    try {
      await supabase.from('ai_projects').insert({
        user_id: user.id,
        title: generatedProject.title,
        description: generatedProject.description,
        difficulty: difficulty,
        tech_stack: generatedProject.tech_stack,
        milestones: generatedProject.milestones,
        estimated_hours: generatedProject.estimated_hours,
        skills_required: generatedProject.skills,
      })
      addXP(10)
      setSaved(true)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500">
          <Wand2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">AI Project Generator</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Get personalized project ideas
          </p>
        </div>
      </div>

      {/* Project Type Selection */}
      <Card className="p-6">
        <h2 className="font-semibold text-slate-900 dark:text-white mb-4">What type of project?</h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {projectTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={cn(
                'p-4 rounded-xl border-2 text-center transition-all',
                selectedType === type.id
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
                  : 'border-slate-200 dark:border-slate-700 hover:border-primary-300'
              )}
            >
              <span className="text-2xl mb-2 block">{type.icon}</span>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{type.label}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Difficulty Selection */}
      <Card className="p-6">
        <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Difficulty level</h2>
        <div className="flex gap-3">
          {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
            <button
              key={level}
              onClick={() => setDifficulty(level)}
              className={cn(
                'flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all capitalize',
                difficulty === level
                  ? level === 'beginner' ? 'border-success-500 bg-success-50 dark:bg-success-500/10 text-success-700 dark:text-success-300' :
                    level === 'intermediate' ? 'border-warning-500 bg-warning-50 dark:bg-warning-500/10 text-warning-700 dark:text-warning-300' :
                    'border-red-500 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary-300'
              )}
            >
              {level}
            </button>
          ))}
        </div>
      </Card>

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={!selectedType || generating}
        size="lg"
        className="w-full gap-2"
      >
        {generating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generating Project...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Generate Project Idea
          </>
        )}
      </Button>

      {/* Generated Project */}
      {generatedProject && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className={cn(
                  'px-2 py-1 text-xs rounded-full',
                  difficulty === 'beginner' ? 'bg-success-100 text-success-600' :
                  difficulty === 'intermediate' ? 'bg-warning-100 text-warning-600' :
                  'bg-red-100 text-red-600'
                )}>
                  {difficulty}
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-2">
                  {generatedProject.title}
                </h2>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Clock className="w-4 h-4" />
                {generatedProject.estimated_hours}h
              </div>
            </div>

            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {generatedProject.description}
            </p>

            {/* Tech Stack */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tech Stack</h4>
              <div className="flex flex-wrap gap-2">
                {generatedProject.tech_stack.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 bg-primary-100 dark:bg-primary-500/20 text-primary-700 dark:text-primary-300 rounded-lg text-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Skills You'll Learn</h4>
              <div className="flex flex-wrap gap-2">
                {generatedProject.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Milestones */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Project Milestones</h4>
              <div className="space-y-2">
                {generatedProject.milestones.map((milestone, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                  >
                    <span className="w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{milestone.title}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{milestone.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={handleGenerate} className="flex-1 gap-2">
                <RefreshCw className="w-4 h-4" />
                Generate Another
              </Button>
              <Button
                onClick={saveProject}
                disabled={saved}
                className="flex-1 gap-2"
              >
                {saved ? (
                  <>
                    <Save className="w-4 h-4" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Project
                  </>
                )}
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}
