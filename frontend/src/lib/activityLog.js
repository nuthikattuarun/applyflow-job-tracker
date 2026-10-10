import { writeStorage } from './applyflowStorage.js'

const STORAGE_KEY = 'applyflow_activity'

export function recordActivity(action, category, description) {
  try {
    const stored = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || '[]',
    )

    const activities = Array.isArray(stored) ? stored : []

    const newActivity = {
      id: crypto.randomUUID(),
      action,
      category,
      description,
      timestamp: new Date().toISOString(),
    }

    writeStorage(STORAGE_KEY, [newActivity, ...activities])

    // Notify other ApplyFlow components in the same browser tab.
    window.dispatchEvent(new Event('applyflow:activity-updated'))
  } catch (error) {
    console.error('Failed to record activity:', error)
  }
}
