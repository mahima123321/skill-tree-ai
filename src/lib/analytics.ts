import { supabase } from './supabase'

let sessionId: string | null = null

export const initAnalytics = () => {
  if (typeof window === 'undefined') return

  // Generate or retrieve session ID
  sessionId = sessionStorage.getItem('analytics_session_id')
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    sessionStorage.setItem('analytics_session_id', sessionId)
  }

  // Track session start
  trackEvent('session', 'start', { referrer: document.referrer })

  // Track page visibility changes
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      trackEvent('session', 'hidden')
    } else {
      trackEvent('session', 'visible')
    }
  })

  // Track before unload
  window.addEventListener('beforeunload', () => {
    trackEvent('session', 'end')
  })
}

export const trackEvent = async (
  eventType: string,
  eventName: string,
  eventData: Record<string, any> = {}
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from('analytics_events').insert({
      user_id: user?.id || null,
      event_type: eventType,
      event_name: eventName,
      event_data: eventData,
      session_id: sessionId,
      page_path: typeof window !== 'undefined' ? window.location.pathname : '',
    })
  } catch (err) {
    // Silently fail - don't disrupt user experience
    console.debug('Analytics tracking failed:', err)
  }
}

export const trackPageView = (pageName: string) => {
  trackEvent('page_view', pageName)
}

export const trackFeatureUsage = (featureName: string, action: string = 'click') => {
  trackEvent('feature_usage', featureName, { action })
}

export const trackDropOff = (stepName: string, reason?: string) => {
  trackEvent('drop_off', stepName, { reason })
}

export const trackSignUp = (method: string = 'email') => {
  trackEvent('signup', 'completed', { method })
}

export const trackLogin = (method: string = 'email') => {
  trackEvent('login', 'completed', { method })
}
