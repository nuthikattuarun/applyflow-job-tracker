
import { useState } from 'react'
import ApplicationForm from '../components/ApplicationForm.jsx'
import { recordActivity } from '../../../lib/activityLog.js'
import { writeStorage } from '../../../lib/applyflowStorage.js'

const STORAGE_KEY = 'applyflow_applications'

const statuses = [
  'All statuses',
  'Saved',
  'Applied',
  'Screening',
  'Interview',
  'Offer',
  'Accepted',
  'Rejected',
  'Withdrawn',
]

function loadApplications() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState(loadApplications)
  const [showForm, setShowForm] = useState(false)
  const [editingApplication, setEditingApplication] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All statuses')

  function handleSaveApplication(formData) {
    let updatedApplications

    if (editingApplication) {
      updatedApplications = applications.map((application) =>
        application.id === editingApplication.id
          ? { ...application, ...formData, id: application.id }
          : application,
      )
    } else {
      updatedApplications = [
        { ...formData, id: crypto.randomUUID() },
        ...applications,
      ]
    }

    setApplications(updatedApplications)
   writeStorage(STORAGE_KEY, updatedApplications)

    recordActivity(
      editingApplication ? 'Application updated' : 'Application created',
      'Applications',
      `${formData.role} at ${formData.company}`,
    )

    setShowForm(false)
    setEditingApplication(null)
  }

  function handleDeleteApplication(id) {
    const deletedApplication = applications.find(
      (application) => application.id === id,
    )

    if (!window.confirm('Are you sure you want to delete this application?')) {
      return
    }

    const updatedApplications = applications.filter(
      (application) => application.id !== id,
    )

    setApplications(updatedApplications)
    writeStorage(STORAGE_KEY, updatedApplications)

    if (deletedApplication) {
      recordActivity(
        'Application deleted',
        'Applications',
        `${deletedApplication.role} at ${deletedApplication.company}`,
      )
    }
  }

  function closeForm() {
    setShowForm(false)
    setEditingApplication(null)
  }

  const filteredApplications = applications.filter((application) => {
    const matchesSearch = [
      application.company,
      application.role,
      application.location,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase())

    const matchesStatus =
      statusFilter === 'All statuses' ||
      application.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <section className="mx-auto max-w-[1500px] space-y-6 p-5 sm:p-8">
      {showForm && (
        <ApplicationForm
          initialData={editingApplication}
          onClose={closeForm}
          onSubmit={handleSaveApplication}
        />
      )}

      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Applications
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage and track your job opportunities.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingApplication(null)
            setShowForm(true)
          }}
          className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          + Add application
        </button>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total applications</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {applications.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">In progress</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {
              applications.filter((app) =>
                ['Applied', 'Screening', 'Interview'].includes(app.status),
              ).length
            }
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Offers received</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {applications.filter((app) => app.status === 'Offer').length}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search company, job title, or location..."
            aria-label="Search applications"
            className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter by status"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {filteredApplications.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <h2 className="font-semibold text-slate-900">
              No applications found
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Add your first job application to start tracking your progress.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Company / Role</th>
                  <th className="px-5 py-3 font-semibold">Applied date</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredApplications.map((application) => (
                  <tr key={application.id}>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">
                        {application.company}
                      </p>
                      <p className="mt-1 text-slate-500">
                        {application.role}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {application.appliedDate || application.date || '—'}
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                        {application.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingApplication(application)
                            setShowForm(true)
                          }}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteApplication(application.id)}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
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
