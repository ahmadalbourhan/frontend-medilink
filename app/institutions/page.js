"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import DashboardLayout from "../components/DashboardLayout";
import { mockInstitutions } from "../lib/mockData";
import DangerConfirmModal from "../components/DangerConfirmModal";

export default function Institutions() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [institutions, setInstitutions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredInstitutions, setFilteredInstitutions] = useState([]);
  const [typeFilter, setTypeFilter] = useState("all");
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [institutionToDelete, setInstitutionToDelete] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
    if (!loading && user && user.role === "admin_institutions") {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  useEffect(() => {
    setInstitutions(mockInstitutions);
    setFilteredInstitutions(mockInstitutions);
  }, []);

  useEffect(() => {
    const filtered = institutions.filter((institution) => {
      const matchesSearch =
        institution.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        institution.contact.address
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        institution.contact.email
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesType =
        typeFilter === "all" || institution.type === typeFilter;

      return matchesSearch && matchesType;
    });

    setFilteredInstitutions(filtered);
  }, [searchTerm, typeFilter, institutions]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <DashboardLayout>
        <div className="text-center py-12 text-muted-foreground">
          <p>Access denied. Only admin users can manage institutions.</p>
        </div>
      </DashboardLayout>
    );
  }

  const getTypeColor = (type) => {
    return type === "hospital"
      ? "bg-primary/10 text-primary"
      : "bg-secondary/50 text-secondary-foreground";
  };

  const handleView = (institution) => {
    setSelectedInstitution(institution);
    setShowViewModal(true);
  };

  const handleEdit = (institution) => {
    setSelectedInstitution(institution);
    setShowEditModal(true);
  };

  const handleCreate = () => {
    setShowCreateModal(true);
  };

  const handleSaveEdit = (updatedInstitution) => {
    const updatedInstitutions = institutions.map((inst) =>
      inst._id === updatedInstitution._id ? updatedInstitution : inst
    );
    setInstitutions(updatedInstitutions);
    setShowEditModal(false);
    setSelectedInstitution(null);
  };

  const handleSaveCreate = (newInstitution) => {
    const institutionWithId = {
      ...newInstitution,
      _id: Date.now().toString(),
      password: newInstitution.password,
      role: newInstitution.role || "admin_institutions",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setInstitutions([...institutions, institutionWithId]);
    setShowCreateModal(false);
  };

  const handleDelete = (institution) => {
    setInstitutionToDelete(institution);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (institutionToDelete) {
      const updatedInstitutions = institutions.filter(
        (inst) => inst._id !== institutionToDelete._id
      );
      setInstitutions(updatedInstitutions);
      setInstitutionToDelete(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Institutions
            </h1>
            <p className="text-muted-foreground">
              Manage healthcare institutions
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
          >
            Add New Institution
          </button>
        </div>

        <div className="bg-card shadow rounded-lg text-card-foreground">
          <div className="p-6 border-b border-border">
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex-1 w-full">
                <input
                  type="text"
                  placeholder="Search institutions by name, address, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                />
              </div>
              <div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                >
                  <option value="all">All Types</option>
                  <option value="hospital">Hospital</option>
                  <option value="clinic">Clinic</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Institution
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Services
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {filteredInstitutions.map((institution) => (
                  <tr key={institution._id} className="hover:bg-accent/10">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {institution.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {institution.contact.address}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(
                          institution.type
                        )}`}
                      >
                        {institution.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      <div>{institution.contact.phone}</div>
                      <div className="text-muted-foreground">
                        {institution.contact.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      <div className="max-w-xs">
                        {institution.services.slice(0, 3).join(", ")}
                        {institution.services.length > 3 && "..."}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleView(institution)}
                        className="text-primary hover:text-primary/80 mr-4"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(institution)}
                        className="text-accent hover:text-accent/80 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(institution)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredInstitutions.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No institutions found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>

      {showViewModal && selectedInstitution && (
        <ViewInstitutionModal
          institution={selectedInstitution}
          onClose={() => setShowViewModal(false)}
        />
      )}

      {showEditModal && selectedInstitution && (
        <EditInstitutionModal
          institution={selectedInstitution}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveEdit}
        />
      )}

      {showCreateModal && (
        <CreateInstitutionModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleSaveCreate}
        />
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
  );
}

function ViewInstitutionModal({ institution, onClose }) {
  return (
    <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-card text-card-foreground">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-foreground">
            Institution Details
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground">
                Name
              </label>
              <p className="mt-1 text-sm text-foreground">{institution.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground">
                Type
              </label>
              <p className="mt-1 text-sm text-foreground capitalize">
                {institution.type}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground">
                Phone
              </label>
              <p className="mt-1 text-sm text-foreground">
                {institution.contact.phone}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground">
                Email
              </label>
              <p className="mt-1 text-sm text-foreground">
                {institution.contact.email}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground">
                Role
              </label>
              <p className="mt-1 text-sm text-foreground capitalize">
                {institution.role}
              </p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground">
              Address
            </label>
            <p className="mt-1 text-sm text-foreground">
              {institution.contact.address}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground">
              Services
            </label>
            <p className="mt-1 text-sm text-foreground">
              {institution.services.join(", ")}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/80"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function EditInstitutionModal({ institution, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: institution.name,
    type: institution.type,
    phone: institution.contact.phone,
    email: institution.contact.email,
    address: institution.contact.address,
    services: institution.services.join(", "),
    role: institution.role,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
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
      role: formData.role,
    };
    onSave(updatedInstitution);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-card text-card-foreground">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-foreground">
            Edit Institution
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground">
                Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                required
              >
                <option value="hospital">Hospital</option>
                <option value="clinic">Clinic</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                required
              >
                <option value="admin">System Admin</option>
                <option value="admin_institutions">Institution Admin</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground">
              Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground">
              Services (comma-separated)
            </label>
            <textarea
              name="services"
              value={formData.services}
              onChange={handleChange}
              rows={2}
              className="mt-1 block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
              placeholder="Emergency Care, Surgery, Cardiology"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/80"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CreateInstitutionModal({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: "",
    type: "hospital",
    phone: "",
    email: "",
    address: "",
    services: "",
    password: "",
    role: "admin_institutions",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
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
      password: formData.password,
      role: formData.role,
    };
    onSave(newInstitution);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-card text-card-foreground">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-foreground">
            Create New Institution
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Institution Details */}
          <div>
            <h4 className="text-md font-medium text-foreground mb-3">
              Institution Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground">
                  Institution Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground">
                  Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                  required
                >
                  <option value="hospital">Hospital</option>
                  <option value="clinic">Clinic</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                  required
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-muted-foreground">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                required
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-muted-foreground">
                Services (comma-separated)
              </label>
              <textarea
                name="services"
                value={formData.services}
                onChange={handleChange}
                rows={2}
                className="mt-1 block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                placeholder="Emergency Care, Surgery, Cardiology"
                required
              />
            </div>
          </div>

          <div className="border-t pt-6">
            <h4 className="text-md font-medium text-foreground mb-3">
              Institution Login Credentials
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              Set up login credentials for this institution
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                  required
                >
                  <option value="admin">System Admin</option>
                  <option value="admin_institutions">Institution Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                  minLength={6}
                  required
                />
                <p className="mt-1 text-sm text-muted-foreground">
                  Minimum 6 characters
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/80"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
            >
              Create Institution
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
