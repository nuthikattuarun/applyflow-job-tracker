
import { useState } from 'react'

const initialForm = {
    company: '',
    role: '',
    location: '',
    appliedDate: new Date().toISOString().slice(0, 10),
    status: 'Applied',
    jobUrl: '',
}

const statuses = [
    'Saved',
    'Applied',
    'Screening',
    'Interview',
    'Offer',
    'Accepted',
    'Rejected',
    'Withdrawn',
]

export default function ApplicationForm({ initialData, onClose, onSubmit }) {
    const [form, setForm] = useState(initialData || initialForm)

    function handleChange(event) {
        setForm((current) => ({
            ...current,
            [event.target.name]: event.target.value,
        }))
    }

    function handleSubmit(event) {
        event.preventDefault()
        onSubmit(form)
    }

    const inputClass =
        'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose()
            }}
        >
            <form
                onSubmit={handleSubmit}
                className="my-auto w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8"
            >
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            {initialData ? 'Edit application' : 'Add application'}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            {initialData
                                ? 'Update the details of this job opportunity.'
                                : 'Enter the details of the job opportunity.'}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close form"
                        className="rounded-lg px-3 py-1 text-xl text-slate-500 hover:bg-slate-100"
                    >
                        ×
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <label className="space-y-2 text-sm font-medium text-slate-700">
                        Company name *
                        <input
                            className={inputClass}
                            name="company"
                            value={form.company}
                            onChange={handleChange}
                            placeholder="e.g. Infosys"
                            required
                            maxLength={150}
                        />
                    </label>

                    <label className="space-y-2 text-sm font-medium text-slate-700">
                        Job title *
                        <input
                            className={inputClass}
                            name="role"
                            value={form.role}
                            onChange={handleChange}
                            placeholder="e.g. Frontend Developer"
                            required
                            maxLength={150}
                        />
                    </label>

                    <label className="space-y-2 text-sm font-medium text-slate-700">
                        Location
                        <input
                            className={inputClass}
                            name="location"
                            value={form.location}
                            onChange={handleChange}
                            placeholder="e.g. Hyderabad"
                            maxLength={150}
                        />
                    </label>

                    <label className="space-y-2 text-sm font-medium text-slate-700">
                        Application date *
                        <input
                            className={inputClass}
                            type="date"
                            name="appliedDate"
                            value={form.appliedDate}
                            onChange={handleChange}
                            required
                        />
                    </label>

                    <label className="space-y-2 text-sm font-medium text-slate-700">
                        Status
                        <select
                            className={inputClass}
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                        >
                            {statuses.map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="space-y-2 text-sm font-medium text-slate-700">
                        Job URL
                        <input
                            className={inputClass}
                            type="url"
                            name="jobUrl"
                            value={form.jobUrl}
                            onChange={handleChange}
                            placeholder="https://..."
                        />
                    </label>
                </div>

                <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-5">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                    >
                        {initialData ? 'Save changes' : 'Save application'}
                    </button>
                </div>
            </form>
        </div>
    )
}
