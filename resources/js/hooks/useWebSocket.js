import { useEffect, useRef } from 'react'
import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

// Singleton Echo instance — shared across all components
let echo = null

function getEcho() {
  if (!echo) {
    echo = new Echo({
      broadcaster: 'reverb',
      key: import.meta.env.VITE_REVERB_APP_KEY || 'tcms_key_secret',
      wsHost: import.meta.env.VITE_REVERB_HOST || 'localhost',
      wsPort: import.meta.env.VITE_REVERB_PORT || 8080,
      wssPort: import.meta.env.VITE_REVERB_PORT || 8080,
      forceTLS: import.meta.env.PROD,
      enabledTransports: ['ws', 'wss'],
    })
  }
  return echo
}

// Subscribe to real-time truck GPS updates
export function useWebSocket(onLocationUpdate) {
  const cb = useRef(onLocationUpdate)
  cb.current = onLocationUpdate

  useEffect(() => {
    const instance = getEcho()
    instance.channel('truck-tracking').listen('TruckLocationUpdated', e => cb.current(e))
    return () => instance.leaveChannel('truck-tracking')
  }, [])
}

// Subscribe to private notification channel for current user
export function useNotifications(userId, onNotification) {
  const cb = useRef(onNotification)
  cb.current = onNotification

  useEffect(() => {
    if (!userId) return
    const instance = getEcho()
    instance.private(`user.${userId}`).notification(n => cb.current(n))
    return () => instance.leaveChannel(`private-user.${userId}`)
  }, [userId])
}
