
import { useState } from 'react'

const STORAGE_KEY = 'applyflow_interviews'
const APPLICATIONS_KEY = 'applyflow_applications'

const interviewStatuses = [
  'Scheduled',
  'Completed',
  'Rescheduled',
  'Cancelled',
]

const interviewTypes = [
  'Phone',
  'Video',
  'In-person',
  'Technical',
  'HR',
  'Other',
]

function loadData(key) {
  try {
    const data = JSON.parse(localStorage.getItem(key) || '[]')
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

const emptyForm = {
  applicationId: '',
  date: '',
  time: '',
  type: 'Video',
  status: 'Scheduled',
  meetingLink: '',
  notes: '',
}

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState(() =>
    loadData(STORAGE_KEY),
  )
  const [applications] = useState(() => loadData(APPLICATIONS_KEY))
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All statuses')
  const [showForm, setShowForm] = useState(false)
  const [editingInterview, setEditingInterview] = useState(null)
  const [form, setForm] = useState(emptyForm)

  function openForm(interview = null) {
    setEditingInterview(interview)
    setForm(interview ? { ...emptyForm, ...interview } : { ...emptyForm })
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingInterview(null)
    setForm({ ...emptyForm })
  }

  function handleSubmit(event) {
    event.preventDefault()

    const data = {
      ...form,
      notes: form.notes.trim(),
      meetingLink: form.meetingLink.trim(),
    }

    let updated

    if (editingInterview) {
      updated = interviews.map((item) =>
        item.id === editingInterview.id
          ? { ...data, id: item.id }
          : item,
      )
    } else {
      updated = [
        { ...data, id: crypto.randomUUID() },
        ...interviews,
      ]
    }

    setInterviews(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    closeForm()
  }

  function handleDelete(id) {
    if (!window.confirm('Delete this interview?')) return

    const updated = interviews.filter((item) => item.id !== id)
    setInterviews(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  function getApplicationLabel(applicationId) {
    const application = applications.find(
      (item) => item.id === applicationId,
    )

    if (!application) return 'Application not linked'

    return `${application.role} — ${application.company}`
  }

  const filteredInterviews = interviews
    .filter((interview) => {
      const application = applications.find(
        (item) => item.id === interview.applicationId,
      )

      const searchableText = [
        application?.company,
        application?.role,
        interview.type,
        interview.status,
        interview.notes,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      const matchesSearch = searchableText.includes(
        search.toLowerCase(),
      )
      const matchesStatus =
        statusFilter === 'All statuses' ||
        interview.status === statusFilter

      return matchesSearch && matchesStatus
    })
    .sort((a, b) =>
      `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`),
    )

  const inputClass =
    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'

  const upcomingCount = interviews.filter(
    (item) =>
      item.date >= new Date().toISOString().slice(0, 10) &&
      ['Scheduled', 'Rescheduled'].includes(item.status),
  ).length

  const completedCount = interviews.filter(
    (item) => item.status === 'Completed',
  ).length

  return (
    <section className="mx-auto max-w-[1500px] space-y-6 p-5 sm:p-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Interviews
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Schedule interviews and track every stage of your job search.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openForm()}
          className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          + Schedule interview
        </button>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total interviews</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {interviews.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Upcoming interviews</p>
          <p className="mt-3 text-3xl font-bold text-indigo-600">
            {upcomingCount}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Completed interviews</p>
          <p className="mt-3 text-3xl font-bold text-emerald-600">
            {completedCount}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search company, role, or interview type..."
            aria-label="Search interviews"
            className={`${inputClass} flex-1`}
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter interviews by status"
            className={inputClass}
          >
            <option>All statuses</option>
            {interviewStatuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </div>

        {filteredInterviews.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <h2 className="font-semibold text-slate-900">
              No interviews found
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Schedule your first interview to start tracking it here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Company / Role</th>
                  <th className="px-5 py-3 font-semibold">Date / Time</th>
                  <th className="px-5 py-3 font-semibold">Type</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Meeting</th>
                  <th className="px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredInterviews.map((interview) => (
                  <tr key={interview.id}>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">
                        {getApplicationLabel(interview.applicationId)}
                      </p>
                      {interview.notes && (
                        <p className="mt-1 max-w-xs truncate text-slate-500">
                          {interview.notes}
                        </p>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                      <p>{interview.date}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {interview.time}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {interview.type}
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                        {interview.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {interview.meetingLink ? (
                        <a
                          href={interview.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-indigo-600 hover:underline"
                        >
                          Join link
                        </a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openForm(interview)}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-indigo-600 hover:bg-indigo-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(interview.id)}
                          className="rounded-lg border border-red-200 px-3 py-1.5 font-medium text-red-600 hover:bg-red-50"
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

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/40 p-4">
          <form
            onSubmit={handleSubmit}
            className="my-auto w-full max-w-xl space-y-4 rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                {editingInterview ? 'Edit interview' : 'Schedule interview'}
              </h2>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg px-3 py-1 text-slate-500 hover:bg-slate-100"
                aria-label="Close form"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Job application
              </label>
              <select
                value={form.applicationId}
                onChange={(event) =>
                  setForm({ ...form, applicationId: event.target.value })
                }
                className={inputClass}
              >
                <option value="">Not linked to an application</option>
                {applications.map((application) => (
                  <option key={application.id} value={application.id}>
                    {application.company} — {application.role}
                  </option>
                ))}
              </select>
              {applications.length === 0 && (
                <p className="mt-1 text-xs text-amber-600">
                  Add a job application first to link it to this interview.
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Date *
                </label>
                <input
                  required
                  type="date"
                  value={form.date}
                  onChange={(event) =>
                    setForm({ ...form, date: event.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Time *
                </label>
                <input
                  required
                  type="time"
                  value={form.time}
                  onChange={(event) =>
                    setForm({ ...form, time: event.target.value })
                  }
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Interview type
                </label>
                <select
                  value={form.type}
                  onChange={(event) =>
                    setForm({ ...form, type: event.target.value })
                  }
                  className={inputClass}
                >
                  {interviewTypes.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm({ ...form, status: event.target.value })
                  }
                  className={inputClass}
                >
                  {interviewStatuses.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Meeting link
              </label>
              <input
                type="url"
                value={form.meetingLink}
                onChange={(event) =>
                  setForm({ ...form, meetingLink: event.target.value })
                }
                placeholder="https://meet.example.com/..."
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Notes
              </label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(event) =>
                  setForm({ ...form, notes: event.target.value })
                }
                placeholder="Interview preparation, contact person, or other notes..."
                className={inputClass}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                {editingInterview ? 'Save changes' : 'Schedule interview'}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  )
}
