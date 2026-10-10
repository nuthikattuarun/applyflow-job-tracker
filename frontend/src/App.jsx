
import { BrowserRouter, NavLink, Navigate, Route, Routes } from 'react-router-dom'
import ApplicationsPage from './features/applications/pages/ApplicationsPage.jsx'
import CompaniesPage from './features/companies/pages/CompaniesPage.jsx'
import InterviewsPage from './features/interviews/pages/InterviewsPage.jsx'
import RemindersPage from './features/reminders/pages/RemindersPage.jsx'
import AnalyticsPage from './features/analytics/pages/AnalyticsPage.jsx'
import ActivityPage from './features/activity/pages/ActivityPage.jsx'     
import './App.css'

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
  const stats = [
    ['Total Applications', '0', 'Jobs you are tracking'],
    ['Interviews', '0', 'Upcoming interviews'],
    ['Offers Received', '0', 'Offers from employers'],
    ['Response Rate', '0%', 'Employer responses'],
  ]

  const stages = ['Saved', 'Applied', 'Screening', 'Interview', 'Offer', 'Accepted']

  return (
    <div className="dashboard">
      <div className="page-heading">
        <div>
          <h1>Dashboard</h1>
          <p>Keep your job search organized and moving forward.</p>
        </div>
        <NavLink to="/applications" className="primary-button">
          + Add application
        </NavLink>
      </div>

      <div className="stats-grid">
        {stats.map(([label, value, note]) => (
          <article className="stat-card" key={label}>
            <p>{label}</p>
            <strong>{value}</strong>
            <span>{note}</span>
          </article>
        ))}
      </div>

      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>Application pipeline</h2>
            <p>Track your progress through each stage.</p>
          </div>
        </div>
        <div className="pipeline-grid">
          {stages.map((stage) => (
            <div className="pipeline-stage" key={stage}>
              <span>{stage}</span>
              <strong>0</strong>
            </div>
          ))}
        </div>
      </section>

      <div className="dashboard-columns">
        <section className="panel">
          <h2>Upcoming interviews</h2>
          <p className="empty-message">No interviews scheduled yet.</p>
        </section>
        <section className="panel">
          <h2>Follow-up reminders</h2>
          <p className="empty-message">No reminders added yet.</p>
        </section>
      </div>

      <section className="panel">
        <h2>Recent activity</h2>
        <p className="empty-message">
          Your job search activity will appear here.
        </p>
      </section>
    </div>
  )
}

function FeaturePage({ title }) {
  return (
    <div className="dashboard">
      <div className="page-heading">
        <div>
          <h1>{title}</h1>
          <p>Manage your {title.toLowerCase()} in one place.</p>
        </div>
      </div>
      <section className="panel">
        <p className="empty-message">No data available yet.</p>
      </section>
    </div>
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

          <Route path="/activity" element={<FeaturePage title="Activity Log" />} />
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
