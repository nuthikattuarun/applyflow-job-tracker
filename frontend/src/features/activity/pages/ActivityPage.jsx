
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'applyflow_activity'

const filters = [
  'All activities',
  'Applications',
  'Companies',
  'Interviews',
  'Reminders',
]

function loadActivities() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

function formatDate(date) {
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function ActivityPage() {
  const [activities, setActivities] = useState(loadActivities)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All activities')

  useEffect(() => {
  function refreshActivities() {
    setActivities(loadActivities())
  }

  window.addEventListener(
    'applyflow:activity-updated',
    refreshActivities,
  )

  return () => {
    window.removeEventListener(
      'applyflow:activity-updated',
      refreshActivities,
    )
  }
}, [])

  function clearActivities() {
    if (!activities.length) return

    if (!window.confirm('Clear the entire activity log?')) return

    setActivities([])
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
  }

  const filteredActivities = activities.filter((activity) => {
    const text = [
      activity.action,
      activity.entity,
      activity.description,
      activity.category,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    const matchesSearch = text.includes(search.toLowerCase())
    const matchesFilter =
      filter === 'All activities' || activity.category === filter

    return matchesSearch && matchesFilter
  })

  const inputClass =
    'rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'

  return (
    <section className="mx-auto max-w-[1500px] space-y-6 p-5 sm:p-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Activity Log
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Review recorded actions across your job search.
          </p>
        </div>

        <button
          type="button"
          onClick={clearActivities}
          disabled={!activities.length}
          className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Clear activity log
        </button>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total recorded activities</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {activities.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Matching activities</p>
          <p className="mt-3 text-3xl font-bold text-indigo-600">
            {filteredActivities.length}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search activity..."
            aria-label="Search activity"
            className={`${inputClass} min-w-0 flex-1`}
          />

          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            aria-label="Filter by activity category"
            className={inputClass}
          >
            {filters.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>

        {filteredActivities.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <h2 className="font-semibold text-slate-900">
              No activities recorded
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Activity entries will appear here when other modules record actions.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredActivities.map((activity) => (
              <article
                key={activity.id}
                className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-bold text-indigo-600">
                  {(activity.category || 'A').charAt(0)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-900">
                      {activity.action || 'Activity'}
                    </h3>
                    {activity.category && (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                        {activity.category}
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-sm text-slate-600">
                    {activity.description || activity.entity || 'No additional details'}
                  </p>

                  <p className="mt-2 text-xs text-slate-400">
                    {activity.timestamp ? formatDate(activity.timestamp) : 'Date unavailable'}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
