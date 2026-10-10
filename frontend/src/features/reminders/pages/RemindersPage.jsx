
import { useState } from 'react'
import { recordActivity } from '../../../lib/activityLog.js'

const STORAGE_KEY = 'applyflow_reminders'

const reminderTypes = [
    'Follow-up',
    'Submit application',
    'Interview preparation',
    'Thank you email',
    'Other',
]

const filters = ['All', 'Pending', 'Completed']

const emptyForm = {
    title: '',
    type: 'Follow-up',
    dueDate: '',
    dueTime: '',
    notes: '',
}

function loadReminders() {
    try {
        const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
        return Array.isArray(data) ? data : []
    } catch {
        return []
    }
}

function getDueDateTime(reminder) {
    return `${reminder.dueDate}T${reminder.dueTime || '23:59'}`
}

export default function RemindersPage() {
    const [reminders, setReminders] = useState(loadReminders)
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState('All')
    const [showForm, setShowForm] = useState(false)
    const [editingReminder, setEditingReminder] = useState(null)
    const [form, setForm] = useState(emptyForm)

    function openForm(reminder = null) {
        setEditingReminder(reminder)
        setForm(reminder ? { ...emptyForm, ...reminder } : { ...emptyForm })
        setShowForm(true)
    }

    function closeForm() {
        setShowForm(false)
        setEditingReminder(null)
        setForm({ ...emptyForm })
    }

    function handleSubmit(event) {
        event.preventDefault()

        const data = {
            ...form,
            title: form.title.trim(),
            notes: form.notes.trim(),
        }

        const updated = editingReminder
            ? reminders.map((reminder) =>
                reminder.id === editingReminder.id
                    ? { ...data, id: reminder.id, completed: reminder.completed }
                    : reminder,
            )
            : [
                {
                    ...data,
                    id: crypto.randomUUID(),
                    completed: false,
                },
                ...reminders,
            ]

        setReminders(updated)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        closeForm()

        recordActivity(
            editingReminder ? 'Reminder updated' : 'Reminder created',
            'Reminders',
            form.title,
        )
    }

    function toggleComplete(id) {
        const updated = reminders.map((reminder) =>
            reminder.id === id
                ? { ...reminder, completed: !reminder.completed }
                : reminder,


        )

        const changedReminder = reminders.find((item) => item.id === id)

        if (changedReminder) {
            recordActivity(
                changedReminder.completed ? 'Reminder reopened' : 'Reminder completed',
                'Reminders',
                changedReminder.title,
            )
        }

        setReminders(updated)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    }

    function handleDelete(id) {
        if (!window.confirm('Delete this reminder?')) return

        const updated = reminders.filter((reminder) => reminder.id !== id)
        setReminders(updated)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    }

    const filteredReminders = reminders
        .filter((reminder) => {
            const matchesSearch = `${reminder.title} ${reminder.type} ${reminder.notes}`
                .toLowerCase()
                .includes(search.toLowerCase())

            const matchesFilter =
                filter === 'All' ||
                (filter === 'Pending' && !reminder.completed) ||
                (filter === 'Completed' && reminder.completed)

            return matchesSearch && matchesFilter
        })
        .sort((a, b) =>
            getDueDateTime(a).localeCompare(getDueDateTime(b)),
        )

    const overdueCount = reminders.filter(
        (reminder) =>
            !reminder.completed &&
            reminder.dueDate &&
            getDueDateTime(reminder) < new Date().toISOString(),
    ).length

    const completedCount = reminders.filter(
        (reminder) => reminder.completed,
    ).length

    const inputClass =
        'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'

    return (
        <section className="mx-auto max-w-[1500px] space-y-6 p-5 sm:p-8">
            <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        Reminders
                    </h1>
                    <p className="mt-2 text-sm text-slate-500">
                        Stay on top of applications, follow-ups, and interview preparation.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => openForm()}
                    className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                    + Add reminder
                </button>
            </header>

            <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                    <p className="text-sm text-slate-500">Total reminders</p>
                    <p className="mt-3 text-3xl font-bold text-slate-900">
                        {reminders.length}
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5">
                    <p className="text-sm text-slate-500">Overdue</p>
                    <p className="mt-3 text-3xl font-bold text-red-600">
                        {overdueCount}
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5">
                    <p className="text-sm text-slate-500">Completed</p>
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
                        placeholder="Search reminders..."
                        aria-label="Search reminders"
                        className={`${inputClass} flex-1`}
                    />

                    <select
                        value={filter}
                        onChange={(event) => setFilter(event.target.value)}
                        aria-label="Filter reminders"
                        className={inputClass}
                    >
                        {filters.map((item) => (
                            <option key={item}>{item}</option>
                        ))}
                    </select>
                </div>

                {filteredReminders.length === 0 ? (
                    <div className="px-6 py-16 text-center">
                        <h2 className="font-semibold text-slate-900">
                            No reminders found
                        </h2>
                        <p className="mt-2 text-sm text-slate-500">
                            Add a reminder to keep your job search organized.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {filteredReminders.map((reminder) => {
                            const overdue =
                                !reminder.completed &&
                                getDueDateTime(reminder) < new Date().toISOString()

                            return (
                                <article
                                    key={reminder.id}
                                    className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start"
                                >
                                    <input
                                        type="checkbox"
                                        checked={Boolean(reminder.completed)}
                                        onChange={() => toggleComplete(reminder.id)}
                                        aria-label={`Mark ${reminder.title} complete`}
                                        className="mt-1 h-4 w-4 accent-indigo-600"
                                    />

                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3
                                                className={`font-semibold ${reminder.completed
                                                        ? 'text-slate-400 line-through'
                                                        : 'text-slate-900'
                                                    }`}
                                            >
                                                {reminder.title}
                                            </h3>

                                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                                                {reminder.type}
                                            </span>

                                            {overdue && (
                                                <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
                                                    Overdue
                                                </span>
                                            )}
                                        </div>

                                        <p className="mt-2 text-sm text-slate-500">
                                            Due: {reminder.dueDate}
                                            {reminder.dueTime ? ` at ${reminder.dueTime}` : ''}
                                        </p>

                                        {reminder.notes && (
                                            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
                                                {reminder.notes}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => openForm(reminder)}
                                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleDelete(reminder.id)}
                                            className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </article>
                            )
                        })}
                    </div>
                )}
            </div>

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/40 p-4">
                    <form
                        onSubmit={handleSubmit}
                        className="my-auto w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-xl"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900">
                                {editingReminder ? 'Edit reminder' : 'Add reminder'}
                            </h2>

                            <button
                                type="button"
                                onClick={closeForm}
                                aria-label="Close form"
                                className="rounded-lg px-3 py-1 text-slate-500 hover:bg-slate-100"
                            >
                                ✕
                            </button>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Reminder title *
                            </label>
                            <input
                                required
                                autoFocus
                                value={form.title}
                                onChange={(event) =>
                                    setForm({ ...form, title: event.target.value })
                                }
                                placeholder="e.g. Follow up with recruiter"
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Reminder type
                            </label>
                            <select
                                value={form.type}
                                onChange={(event) =>
                                    setForm({ ...form, type: event.target.value })
                                }
                                className={inputClass}
                            >
                                {reminderTypes.map((type) => (
                                    <option key={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Due date *
                                </label>
                                <input
                                    required
                                    type="date"
                                    value={form.dueDate}
                                    onChange={(event) =>
                                        setForm({ ...form, dueDate: event.target.value })
                                    }
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Due time
                                </label>
                                <input
                                    type="time"
                                    value={form.dueTime}
                                    onChange={(event) =>
                                        setForm({ ...form, dueTime: event.target.value })
                                    }
                                    className={inputClass}
                                />
                            </div>
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
                                placeholder="Add any details..."
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
                                {editingReminder ? 'Save changes' : 'Save reminder'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </section>
    )
}
