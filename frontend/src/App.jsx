
import { BrowserRouter, NavLink, Navigate, Route, Routes } from 'react-router-dom'
import ApplicationsPage from './features/applications/pages/ApplicationsPage.jsx'
import CompaniesPage from './features/companies/pages/CompaniesPage.jsx'
import InterviewsPage from './features/interviews/pages/InterviewsPage.jsx'
import RemindersPage from './features/reminders/pages/RemindersPage.jsx'
import AnalyticsPage from './features/analytics/pages/AnalyticsPage.jsx'
import ActivityPage from './features/activity/pages/ActivityPage.jsx'     
import './App.css'
import { useEffect, useState } from 'react'
import {readStorage,subscribeStorage} from './lib/applyflowStorage.js'

const menu = [
  { path: '/dashboard', label: 'Dashboard', icon: '⌂' },
  { path: '/applications', label: 'Applications', icon: '▤' },
  { path: '/companies', label: 'Companies', icon: '▣' },
  { path: '/interviews', label: 'Interviews', icon: '◷' },
  { path: '/reminders', label: 'Reminders', icon: '♧' },
  { path: '/analytics', label: 'Analytics', icon: '▥' },
  { path: '/activity', label: 'Activity Log', icon: '↻' },
]


function Dashboard() {
  const [applications, setApplications] = useState(() =>
    readStorage('applyflow_applications'),
  )

  const [interviews, setInterviews] = useState(() =>
    readStorage('applyflow_interviews'),
  )

  const [reminders, setReminders] = useState(() =>
    readStorage('applyflow_reminders'),
  )

  const [activities, setActivities] = useState(() =>
    readStorage('applyflow_activity'),
  )

  useEffect(() => {
    const unsubscribeApplications = subscribeStorage(
      'applyflow_applications',
      setApplications,
    )

    const unsubscribeInterviews = subscribeStorage(
      'applyflow_interviews',
      setInterviews,
    )

    const unsubscribeReminders = subscribeStorage(
      'applyflow_reminders',
      setReminders,
    )

    const unsubscribeActivities = subscribeStorage(
      'applyflow_activity',
      setActivities,
    )

    return () => {
      unsubscribeApplications()
      unsubscribeInterviews()
      unsubscribeReminders()
      unsubscribeActivities()
    }
  }, [])

  const activeApplications = applications.filter((app) =>
    ['Applied', 'Screening', 'Interview', 'Offer'].includes(app.status),
  ).length

  const upcomingInterviews = interviews.filter(
    (interview) =>
      interview.date >= new Date().toISOString().slice(0, 10) &&
      ['Scheduled', 'Rescheduled'].includes(interview.status),
  ).length

  const pendingReminders = reminders.filter(
    (reminder) => !reminder.completed,
  ).length

  const recentActivities = activities.slice(0, 5)

  const cardClass =
    'rounded-xl border border-slate-200 bg-white p-5'

  return (
    <section className="mx-auto max-w-[1500px] space-y-6 p-5 sm:p-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Your job search overview, based on your saved data.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className={cardClass}>
          <p className="text-sm text-slate-500">Total applications</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {applications.length}
          </p>
        </div>

        <div className={cardClass}>
          <p className="text-sm text-slate-500">Active applications</p>
          <p className="mt-3 text-3xl font-bold text-indigo-600">
            {activeApplications}
          </p>
        </div>

        <div className={cardClass}>
          <p className="text-sm text-slate-500">Upcoming interviews</p>
          <p className="mt-3 text-3xl font-bold text-violet-600">
            {upcomingInterviews}
          </p>
        </div>

        <div className={cardClass}>
          <p className="text-sm text-slate-500">Pending reminders</p>
          <p className="mt-3 text-3xl font-bold text-amber-600">
            {pendingReminders}
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-5">
            <h2 className="font-semibold text-slate-900">
              Recent applications
            </h2>
          </div>

          {applications.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">
              Your applications will appear here when you add them.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {applications.slice(0, 5).map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between gap-4 p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">
                      {app.company}
                    </p>
                    <p className="mt-1 truncate text-sm text-slate-500">
                      {app.role}
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-5">
            <h2 className="font-semibold text-slate-900">
              Recent activity
            </h2>
          </div>

          {recentActivities.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">
              Your recorded activities will appear here.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="p-4">
                  <p className="font-medium text-slate-900">
                    {activity.action}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {activity.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}


function AppLayout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">A</span>
          <span>ApplyFlow</span>
        </div>

        <p className="nav-label">WORKSPACE</p>

        <nav className="sidebar-nav">
          {menu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-item${isActive ? ' active' : ''}`
              }
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="avatar">A</div>
          <div>
            <strong>My Profile</strong>
            <span>Job seeker</span>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div>
            <span className="breadcrumb">ApplyFlow / Workspace</span>
            <p className="topbar-title">Your career workspace</p>
          </div>
          <span className="user-chip">A</span>
        </header>

        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/applications" element={<ApplicationsPage />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/interviews" element={<InterviewsPage />} />
          <Route path="/reminders" element={<RemindersPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />

          <Route path="/activity" element={<ActivityPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}
