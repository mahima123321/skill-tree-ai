'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Plus, X, Send, Check, MessageSquare, MapPin, Clock, Star, Search, Loader as Loader2 } from 'lucide-react'
import { Card, Button } from '@/components/ui'
import { useStore } from '@/store/store'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

interface TeamMember {
  id: string
  name: string
  branch: string
  year: string
  skills: string[]
  interests: string[]
  availability: string
  profile_id: string
}

const skillsList = ['React', 'Node.js', 'Python', 'ML/AI', 'UI/UX', 'Mobile Dev', 'DevOps', 'Backend', 'Frontend', 'Database', 'System Design']
const interestsList = ['Startups', 'Open Source', 'Hackathons', 'Research', 'Freelancing', 'Competitive Programming']
const availabilities = ['Full-time', 'Part-time', 'Weekends', 'Flexible']

export default function TeamFinderPage() {
  const { user, addXP } = useStore()
  const [loading, setLoading] = useState(true)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [myProfile, setMyProfile] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [profileForm, setProfileForm] = useState({
    skills: [] as string[],
    interests: [] as string[],
    availability: 'flexible',
    looking_for: '',
  })
  const [searchSkill, setSearchSkill] = useState('')
  const [sentRequests, setSentRequests] = useState<string[]>([])

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    if (!user?.id) return

    try {
      // Load all team profiles
      const { data: profiles } = await supabase
        .from('team_profiles')
        .select('*, profiles(name, branch, year)')
        .neq('user_id', user.id)

      const formatted: TeamMember[] = (profiles || []).map((p: any) => ({
        id: p.id,
        name: p.profiles?.name || 'Anonymous',
        branch: p.profiles?.branch || 'CSE',
        year: p.profiles?.year || '2nd',
        skills: p.skills || [],
        interests: p.interests || [],
        availability: p.availability,
        profile_id: p.user_id,
      }))
      setMembers(formatted)

      // Load my profile
      const { data: myProf } = await supabase
        .from('team_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (myProf) {
        setMyProfile(myProf)
        setProfileForm({
          skills: myProf.skills || [],
          interests: myProf.interests || [],
          availability: myProf.availability || 'flexible',
          looking_for: myProf.looking_for || '',
        })
      }

      // Load sent requests
      const { data: requests } = await supabase
        .from('team_requests')
        .select('receiver_id')
        .eq('sender_id', user.id)
        .eq('status', 'pending')

      setSentRequests((requests || []).map((r: any) => r.receiver_id))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async () => {
    if (!user?.id) return

    try {
      const payload = {
        user_id: user.id,
        skills: profileForm.skills,
        interests: profileForm.interests,
        availability: profileForm.availability,
        looking_for: profileForm.looking_for,
      }

      if (myProfile) {
        await supabase.from('team_profiles').update(payload).eq('user_id', user.id)
      } else {
        await supabase.from('team_profiles').insert(payload)
      }

      setMyProfile(payload)
      setShowModal(false)
      addXP(5)
    } catch (err) {
      console.error(err)
    }
  }

  const sendRequest = async (receiverId: string) => {
    if (!user?.id || sentRequests.includes(receiverId)) return

    try {
      await supabase.from('team_requests').insert({
        sender_id: user.id,
        receiver_id: receiverId,
        message: 'Let\'s collaborate on a project together!',
        status: 'pending',
      })
      setSentRequests([...sentRequests, receiverId])
      addXP(3)
    } catch (err) {
      console.error(err)
    }
  }

  const toggleSkill = (skill: string) => {
    setProfileForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }))
  }

  const toggleInterest = (interest: string) => {
    setProfileForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }))
  }

  const filteredMembers = searchSkill
    ? members.filter((m) => m.skills.some((s) => s.toLowerCase().includes(searchSkill.toLowerCase())))
    : members

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Team Finder</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Find teammates for your projects
            </p>
          </div>
        </div>

        <Button onClick={() => setShowModal(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          {myProfile ? 'Update Profile' : 'Create Profile'}
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search by skill (e.g., React, Python...)"
          value={searchSkill}
          onChange={(e) => setSearchSkill(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
        />
      </div>

      {/* My Profile Card */}
      {myProfile && (
        <Card className="p-6 bg-gradient-to-r from-primary-500/10 to-accent-500/10 border-primary-500/20">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Your Team Profile</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                {profileForm.skills.length} skills • {profileForm.interests.length} interests
              </p>
              <div className="flex flex-wrap gap-2">
                {profileForm.skills.slice(0, 3).map((skill) => (
                  <span key={skill} className="px-2 py-1 bg-white dark:bg-slate-800 rounded text-xs">
                    {skill}
                  </span>
                ))}
                {profileForm.skills.length > 3 && (
                  <span className="px-2 py-1 bg-white dark:bg-slate-800 rounded text-xs">
                    +{profileForm.skills.length - 3} more
                  </span>
                )}
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setShowModal(true)}>
              Edit
            </Button>
          </div>
        </Card>
      )}

      {/* Team Members Grid */}
      {filteredMembers.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-5 h-full flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{member.name}</h3>
                      <p className="text-sm text-slate-500">{member.year} Year • {member.branch}</p>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div className="mb-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {member.skills.slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 rounded text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Interests */}
                <div className="mb-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Interests</p>
                  <div className="flex flex-wrap gap-1">
                    {member.interests.slice(0, 3).map((interest) => (
                      <span
                        key={interest}
                        className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded text-xs"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Availability */}
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                  <Clock className="w-4 h-4" />
                  {member.availability}
                </div>

                {/* Connect Button */}
                <div className="mt-auto">
                  {sentRequests.includes(member.profile_id) ? (
                    <div className="flex items-center justify-center gap-2 py-2 bg-success-100 dark:bg-success-500/20 text-success-700 dark:text-success-400 rounded-lg text-sm font-medium">
                      <Check className="w-4 h-4" />
                      Request Sent
                    </div>
                  ) : (
                    <Button
                      variant="secondary"
                      className="w-full gap-2"
                      onClick={() => sendRequest(member.profile_id)}
                    >
                      <Send className="w-4 h-4" />
                      Connect
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <Users className="w-12 h-12 mx-auto mb-4 text-slate-400" />
          <h3 className="font-semibold text-slate-900 dark:text-white mb-2">No teammates found</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            {searchSkill ? 'Try a different skill search' : 'Be the first to create a team profile!'}
          </p>
          {!myProfile && (
            <Button onClick={() => setShowModal(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Your Profile
            </Button>
          )}
        </Card>
      )}

      {/* Profile Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Team Profile</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Your Skills
                </label>
                <div className="flex flex-wrap gap-2">
                  {skillsList.map((skill) => (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-sm border-2 transition-colors',
                        profileForm.skills.includes(skill)
                          ? 'border-primary-500 bg-primary-500 text-white'
                          : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300'
                      )}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Your Interests
                </label>
                <div className="flex flex-wrap gap-2">
                  {interestsList.map((interest) => (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-sm border-2 transition-colors',
                        profileForm.interests.includes(interest)
                          ? 'border-accent-500 bg-accent-500 text-white'
                          : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300'
                      )}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Availability
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {availabilities.map((avail) => (
                    <button
                      key={avail}
                      onClick={() => setProfileForm({ ...profileForm, availability: avail })}
                      className={cn(
                        'px-4 py-2 rounded-xl border-2 text-sm transition-colors',
                        profileForm.availability === avail
                          ? 'border-success-500 bg-success-50 dark:bg-success-500/10 text-success-700'
                          : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300'
                      )}
                    >
                      {avail}
                    </button>
                  ))}
                </div>
              </div>

              {/* Looking For */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  What are you looking for?
                </label>
                <textarea
                  value={profileForm.looking_for}
                  onChange={(e) => setProfileForm({ ...profileForm, looking_for: e.target.value })}
                  placeholder="e.g., Looking for a frontend developer to build a SaaS product together..."
                  className="w-full h-24 px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                />
              </div>

              <Button onClick={saveProfile} className="w-full">
                Save Profile
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
