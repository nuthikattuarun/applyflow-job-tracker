import { useState } from 'react'

const STORAGE_KEY = 'applyflow_companies'

function loadCompanies() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState(loadCompanies)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingCompany, setEditingCompany] = useState(null)

  const [form, setForm] = useState({
    name: '',
    website: '',
    industry: '',
    location: '',
    notes: '',
  })

  function openForm(company = null) {
    setEditingCompany(company)
    setForm({
      name: company?.name || '',
      website: company?.website || '',
      industry: company?.industry || '',
      location: company?.location || '',
      notes: company?.notes || '',
    })
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingCompany(null)
  }

  function handleSubmit(event) {
    event.preventDefault()

    const companyData = {
      ...form,
      website: form.website.trim(),
      name: form.name.trim(),
    }

    if (!companyData.name) return

    const updatedCompanies = editingCompany
      ? companies.map((company) =>
          company.id === editingCompany.id
            ? { ...companyData, id: company.id }
            : company,
        )
      : [{ ...companyData, id: crypto.randomUUID() }, ...companies]

    setCompanies(updatedCompanies)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCompanies))
    closeForm()
  }

  function handleDelete(id) {
    if (!window.confirm('Delete this company?')) return

    const updatedCompanies = companies.filter(
      (company) => company.id !== id,
    )

    setCompanies(updatedCompanies)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCompanies))
  }

  const filteredCompanies = companies.filter((company) =>
    `${company.name} ${company.industry} ${company.location}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  )

  const inputClass =
    'w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'

  return (
    <section className="mx-auto max-w-[1500px] space-y-6 p-5 sm:p-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Companies
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Organize the companies you are applying to.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openForm()}
          className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          + Add company
        </button>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total companies</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {companies.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Matching companies</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {filteredCompanies.length}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-4">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by company, industry, or location..."
            aria-label="Search companies"
            className={inputClass}
          />
        </div>

        {filteredCompanies.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <h2 className="font-semibold text-slate-900">
              No companies found
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Add a company to start organizing your job search.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Company</th>
                  <th className="px-5 py-3 font-semibold">Industry</th>
                  <th className="px-5 py-3 font-semibold">Location</th>
                  <th className="px-5 py-3 font-semibold">Website</th>
                  <th className="px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredCompanies.map((company) => (
                  <tr key={company.id}>
                    <td className="px-5 py-4 font-semibold text-slate-900">
                      <div>{company.name}</div>
                      {company.notes && (
                        <p className="mt-1 max-w-xs truncate font-normal text-slate-500">
                          {company.notes}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {company.industry || '—'}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {company.location || '—'}
                    </td>
                    <td className="px-5 py-4">
                      {company.website ? (
                        <a
                          href={
                            /^https?:\/\//i.test(company.website)
                              ? company.website
                              : `https://${company.website}`
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 hover:underline"
                        >
                          Visit website
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openForm(company)}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-indigo-600 hover:bg-indigo-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(company.id)}
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
            className="my-auto w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                {editingCompany ? 'Edit company' : 'Add company'}
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
                Company name *
              </label>
              <input
                required
                autoFocus
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                placeholder="e.g. Infosys"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Website
              </label>
              <input
                type="text"
                value={form.website}
                onChange={(event) =>
                  setForm({ ...form, website: event.target.value })
                }
                placeholder="www.example.com"
                className={inputClass}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Industry
                </label>
                <input
                  value={form.industry}
                  onChange={(event) =>
                    setForm({ ...form, industry: event.target.value })
                  }
                  placeholder="e.g. IT Services"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Location
                </label>
                <input
                  value={form.location}
                  onChange={(event) =>
                    setForm({ ...form, location: event.target.value })
                  }
                  placeholder="e.g. Hyderabad"
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
                placeholder="Add any useful details..."
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
                {editingCompany ? 'Save changes' : 'Save company'}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  )
}
