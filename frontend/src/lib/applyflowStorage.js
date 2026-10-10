
const STORAGE_EVENT = 'applyflow:storage-updated'

export function readStorage(key, fallback = []) {
  try {
    const data = JSON.parse(localStorage.getItem(key) || 'null')
    return data ?? fallback
  } catch {
    return fallback
  }
}

export function writeStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data))

  window.dispatchEvent(
    new CustomEvent(STORAGE_EVENT, {
      detail: { key },
    }),
  )
}

export function subscribeStorage(key, callback) {
  function handleCustomEvent(event) {
    if (event.detail?.key === key) {
      callback(readStorage(key))
    }
  }

  function handleBrowserStorage(event) {
    if (event.key === key) {
      callback(readStorage(key))
    }
  }

  window.addEventListener(STORAGE_EVENT, handleCustomEvent)
  window.addEventListener('storage', handleBrowserStorage)

  return () => {
    window.removeEventListener(STORAGE_EVENT, handleCustomEvent)
    window.removeEventListener('storage', handleBrowserStorage)
  }
}
