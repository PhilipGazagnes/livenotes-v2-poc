import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onNeedRefresh() {
    // When new content is available, show a notification
    if (confirm('New content available. Reload?')) {
      updateSW()
    }
  },
  onOfflineReady() {
    console.log('App ready to work offline')
  },
})

// Function to warm up the app by pre-caching data
export async function warmUpApp() {
  try {
    // Force the service worker to update
    await updateSW()
    
    // Wait for the service worker to be ready
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready
      
      // Trigger a fetch of the main data to cache it
      const response = await fetch('/api/songs')
      if (!response.ok) {
        throw new Error('Failed to warm up app')
      }
      
      return true
    }
    return false
  } catch (error) {
    console.error('Error warming up app:', error)
    return false
  }
} 