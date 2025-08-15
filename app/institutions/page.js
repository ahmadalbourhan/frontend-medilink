"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useRouter } from "next/navigation"
import DashboardLayout from "../components/DashboardLayout"
import { mockInstitutions } from "../lib/mockData"
import DangerConfirmModal from "../components/DangerConfirmModal"

export default function Institutions() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [institutions, setInstitutions] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredInstitutions, setFilteredInstitutions] = useState([])
  const [typeFilter, setTypeFilter] = useState("all")
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedInstitution, setSelectedInstitution] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [institutionToDelete, setInstitutionToDelete] = useState(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
    if (!loading && user && user.role === "admin_institutions") {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  useEffect(() => {
    setInstitutions(mockInstitutions)
    setFilteredInstitutions(mockInstitutions)
  }, [])

  useEffect(() => {
    const filtered = institutions.filter((institution) => {
      const matchesSearch =
        institution.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        institution.contact.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        institution.contact.email?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesType = typeFilter === "all" || institution.type === typeFilter

      return matchesSearch && matchesType
    })

    setFilteredInstitutions(filtered)
  }, [searchTerm, typeFilter, institutions])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (user.role !== "admin") {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Access denied. Only admin users can manage institutions.</p>
        </div>
      </DashboardLayout>
    )
  }

  const getTypeColor = (type) => {
    return type === "hospital" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
  }

  const handleView = (institution) => {
    setSelectedInstitution(institution)
    setShowViewModal(true)
  }

  const handleEdit = (institution) => {
    setSelectedInstitution(institution)
    setShowEditModal(true)
  }

  const handleCreate = () => {
    setShowCreateModal(true)
  }

  const handleSaveEdit = (updatedInstitution) => {
    const updatedInstitutions = institutions.map((inst) =>
      inst._id === updatedInstitution._id ? updatedInstitution : inst,
    )
    setInstitutions(updatedInstitutions)
    setShowEditModal(false)
    setSelectedInstitution(null)
  }

  const handleSaveCreate = (newInstitution) => {
    const institutionWithId = {
      ...newInstitution,
      _id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setInstitutions([...institutions, institutionWithId])
    setShowCreateModal(false)
  }

  const handleDelete = (institution) => {
    setInstitutionToDelete(institution)
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    if (institutionToDelete) {
      const updatedInstitutions = institutions.filter((inst) => inst._id !== institutionToDelete._id)
      setInstitutions(updatedInstitutions)
      setInstitutionToDelete(null)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Institutions</h1>
            <p className="text-gray-600">Manage healthcare institutions</p>
          </div>
          <button onClick={handleCreate} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Add New Institution
          </button>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex-1 w-full">
                <input
                  type="text"
                  placeholder="Search institutions by name, address, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="hospital">Hospital</option>
                  <option value="clinic">Clinic</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Institution
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Services
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInstitutions.map((institution) => (
                  <tr key={institution._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{institution.name}</div>
                        <div className="text-sm text-gray-500">{institution.contact.address}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(institution.type)}`}
                      >
                        {institution.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{institution.contact.phone}</div>
                      <div className="text-gray-500">{institution.contact.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="max-w-xs">
                        {institution.services.slice(0, 3).join(", ")}
                        {institution.services.length > 3 && "..."}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleView(institution)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(institution)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button onClick={() => handleDelete(institution)} className="text-red-600 hover:text-red-900">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredInstitutions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No institutions found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>

      {showViewModal && selectedInstitution && (
        <ViewInstitutionModal institution={selectedInstitution} onClose={() => setShowViewModal(false)} />
      )}

      {showEditModal && selectedInstitution && (
        <EditInstitutionModal
          institution={selectedInstitution}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveEdit}
        />
      )}

      {showCreateModal && (
        <CreateInstitutionModal onClose={() => setShowCreateModal(false)} onSave={handleSaveCreate} />
      )}

      <DangerConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Institution"
        message="Are you sure you want to delete this institution? This will permanently remove the institution and all associated data including doctors, patients, and medical records."
        itemName={institutionToDelete?.name || ""}
      />
    </DashboardLayout>
  )
}

function ViewInstitutionModal({ institution, onClose }) {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Institution Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <p className="mt-1 text-sm text-gray-900">{institution.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <p className="mt-1 text-sm text-gray-900 capitalize">{institution.type}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <p className="mt-1 text-sm text-gray-900">{institution.contact.phone}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-sm text-gray-900">{institution.contact.email}</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <p className="mt-1 text-sm text-gray-900">{institution.contact.address}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Services</label>
            <p className="mt-1 text-sm text-gray-900">{institution.services.join(", ")}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function EditInstitutionModal({ institution, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: institution.name,
    type: institution.type,
    phone: institution.contact.phone,
    email: institution.contact.email,
    address: institution.contact.address,
    services: institution.services.join(", "),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const updatedInstitution = {
      ...institution,
      name: formData.name,
      type: formData.type,
      contact: {
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
      },
      services: formData.services
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s),
    }
    onSave(updatedInstitution)
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Edit Institution</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="hospital">Hospital</option>
                <option value="clinic">Clinic</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Services (comma-separated)</label>
            <textarea
              name="services"
              value={formData.services}
              onChange={handleChange}
              rows={2}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Emergency Care, Surgery, Cardiology"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function CreateInstitutionModal({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: "",
    type: "hospital",
    phone: "",
    email: "",
    address: "",
    services: "",
    adminEmail: "",
    adminPassword: "",
    adminName: "",
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const newInstitution = {
      name: formData.name,
      type: formData.type,
      contact: {
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
      },
      services: formData.services
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s),
      adminCredentials: {
        email: formData.adminEmail,
        password: formData.adminPassword,
        name: formData.adminName,
      },
    }
    onSave(newInstitution)
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Create New Institution</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Institution Details */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Institution Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Institution Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="hospital">Hospital</option>
                  <option value="clinic">Clinic</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Services (comma-separated)</label>
              <textarea
                name="services"
                value={formData.services}
                onChange={handleChange}
                rows={2}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Emergency Care, Surgery, Cardiology"
                required
              />
            </div>
          </div>

          {/* Admin Credentials */}
          <div className="border-t pt-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">Institution Admin Credentials</h4>
            <p className="text-sm text-gray-600 mb-4">Create login credentials for the institution administrator</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Admin Name</label>
                <input
                  type="text"
                  name="adminName"
                  value={formData.adminName}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Admin Email</label>
                <input
                  type="email"
                  name="adminEmail"
                  value={formData.adminEmail}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Admin Password</label>
                <input
                  type="password"
                  name="adminPassword"
                  value={formData.adminPassword}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  minLength={6}
                  required
                />
                <p className="mt-1 text-sm text-gray-500">Minimum 6 characters</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Create Institution
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
