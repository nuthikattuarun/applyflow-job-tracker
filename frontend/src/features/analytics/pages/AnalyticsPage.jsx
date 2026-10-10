
import { useMemo } from 'react'

const STORAGE_KEY = 'applyflow_applications'

function loadApplications() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

const stages = [
  { name: 'Saved', color: 'bg-slate-400' },
  { name: 'Applied', color: 'bg-indigo-500' },
  { name: 'Screening', color: 'bg-sky-500' },
  { name: 'Interview', color: 'bg-violet-500' },
  { name: 'Offer', color: 'bg-emerald-500' },
  { name: 'Accepted', color: 'bg-green-700' },
  { name: 'Rejected', color: 'bg-red-500' },
  { name: 'Withdrawn', color: 'bg-amber-500' },
]

export default function AnalyticsPage() {
  const applications = useMemo(loadApplications, [])

  const total = applications.length

  const counts = stages.map((stage) => ({
    ...stage,
    count: applications.filter((app) => app.status === stage.name).length,
  }))

  const activeCount = applications.filter((app) =>
    ['Applied', 'Screening', 'Interview', 'Offer'].includes(app.status),
  ).length

  const responseCount = applications.filter((app) =>
    ['Screening', 'Interview', 'Offer', 'Accepted', 'Rejected'].includes(
      app.status,
    ),
  ).length

  const offerCount = applications.filter((app) =>
    ['Offer', 'Accepted'].includes(app.status),
  ).length

  const responseRate = total
    ? Math.round((responseCount / total) * 100)
    : 0

  const offerRate = total
    ? Math.round((offerCount / total) * 100)
    : 0

  const recentApplications = [...applications]
    .sort((a, b) =>
      (b.appliedDate || b.date || '').localeCompare(
        a.appliedDate || a.date || '',
      ),
    )
    .slice(0, 5)

  const cardClass =
    'rounded-xl border border-slate-200 bg-white p-5'

  return (
    <section className="mx-auto max-w-[1500px] space-y-6 p-5 sm:p-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Analytics
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Understand your job search progress using your saved applications.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className={cardClass}>
          <p className="text-sm text-slate-500">Total applications</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{total}</p>
        </div>

        <div className={cardClass}>
          <p className="text-sm text-slate-500">Active pipeline</p>
          <p className="mt-3 text-3xl font-bold text-indigo-600">
            {activeCount}
          </p>
        </div>

        <div className={cardClass}>
          <p className="text-sm text-slate-500">Response rate</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {responseRate}%
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Screening, interview, offer, accepted, or rejected
          </p>
        </div>

        <div className={cardClass}>
          <p className="text-sm text-slate-500">Offer conversion</p>
          <p className="mt-3 text-3xl font-bold text-emerald-600">
            {offerRate}%
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Applications with an offer or acceptance
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Application pipeline
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Distribution of your applications by current status.
          </p>
        </div>

        {total === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">
            Add applications to see your pipeline analytics.
          </p>
        ) : (
          <div className="space-y-5">
            {counts.map((stage) => {
              const percentage = Math.round((stage.count / total) * 100)

              return (
                <div key={stage.name}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-slate-700">
                      {stage.name}
                    </span>
                    <span className="text-sm text-slate-500">
                      {stage.count} · {percentage}%
                    </span>
                  </div>

                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${stage.color}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Recent applications
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Your five most recently dated applications.
          </p>
        </div>

        {recentApplications.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">
            No application data available yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Company / Role</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentApplications.map((app) => (
                  <tr key={app.id}>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">
                        {app.company}
                      </p>
                      <p className="mt-1 text-slate-500">{app.role}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {app.appliedDate || app.date || '—'}
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        {app.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
