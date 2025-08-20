"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import DashboardLayout from "../components/DashboardLayout";
import DangerConfirmModal from "../components/DangerConfirmModal";
import apiClient from "../lib/api";

export default function UsersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [institutionToDelete, setInstitutionToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [user, loading, router]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await apiClient.getUsers();
        const list = res.data || res;
        setUsers(list);
      } catch (e) {
        setUsers([]);
      }
    };
    if (user?.role === "admin") fetchUsers();
  }, [user]);

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
          <p>Access denied. Only admin users can manage users.</p>
        </div>
      </DashboardLayout>
    );
  }

  const handleCreate = () => {
    setShowCreate(true);
  };

  const handleEdit = (u) => setEditingUser(u);

  const handleDelete = async (u) => {
    try {
      await apiClient.deleteUser(u._id);
      setUsers(users.filter((x) => x._id !== u._id));
    } catch (e) {}
  };

  const onSaveNew = async (form) => {
    try {
      const res = await apiClient.createUser(form);
      const created = res.data || res;
      setUsers([...users, created]);
    } finally {
      setShowCreate(false);
    }
  };

  const onSaveEdit = async (form) => {
    try {
      const res = await apiClient.updateUser(editingUser._id, form);
      const saved = res.data || res;
      setUsers(users.map((x) => (x._id === saved._id ? saved : x)));
    } finally {
      setEditingUser(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Users</h1>
            <p className="text-muted-foreground">Manage institution users</p>
          </div>
          <button
            onClick={handleCreate}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
          >
            Create User
          </button>
        </div>

        <div className="bg-card text-card-foreground shadow rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Institution
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-accent/10">
                  <td className="px-6 py-4 whitespace-nowrap">{u.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{u.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{u.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {u.institutionId?.name || u.institutionId || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {/* Don't show actions for admin users */}
                    {u.role !== "admin" && (
                      <>
                        <button
                          onClick={() => handleEdit(u)}
                          className="text-accent hover:text-accent/80 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setInstitutionToDelete(u);
                            setShowDeleteModal(true);
                          }}
                          className="text-destructive hover:text-destructive/80"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showCreate && (
          <UserModal
            onClose={() => setShowCreate(false)}
            onSave={onSaveNew}
            title="Create User"
          />
        )}
        {editingUser && (
          <UserModal
            user={editingUser}
            onClose={() => setEditingUser(null)}
            onSave={onSaveEdit}
            title="Edit User"
          />
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && institutionToDelete && (
          <DangerConfirmModal
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setInstitutionToDelete(null);
            }}
            onConfirm={() => {
              handleDelete(institutionToDelete);
              setShowDeleteModal(false);
              setInstitutionToDelete(null);
            }}
            title="Delete User"
            message={`Are you sure you want to delete ${institutionToDelete.name}? This action cannot be undone.`}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

function UserModal({ user, onClose, onSave, title }) {
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "admin_institutions",
    institutionId: user?.institutionId?._id || user?.institutionId || "",
    password: "",
  });
  const [institutions, setInstitutions] = useState([]);

  useEffect(() => {
    const loadInstitutions = async () => {
      try {
        const res = await apiClient.getInstitutions({ limit: 1000 });
        const list = res.data || res;
        setInstitutions(list.data || list);
      } catch (e) {}
    };
    loadInstitutions();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form };

    // Only include password if it's provided (not empty)
    if (!payload.password || payload.password.trim() === "") {
      delete payload.password;
    }

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-card text-card-foreground">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-foreground">{title}</h3>
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
                value={form.name}
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
                value={form.email}
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
                value={form.role}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                required
              >
                <option value="admin_institutions">Institution Admin</option>
                <option value="admin">System Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground">
                Institution
              </label>
              <select
                name="institutionId"
                value={form.institutionId}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
              >
                <option value="">None</option>
                {(institutions.data || institutions).map((inst) => (
                  <option key={inst._id} value={inst._id}>
                    {inst.name}
                  </option>
                ))}
              </select>
            </div>
            {!user && <></>}
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
              placeholder={
                user ? "Leave blank to keep current password" : "Enter password"
              }
            />
            <p className="mt-1 text-sm text-muted-foreground">
              {user
                ? "Leave blank to keep current password"
                : "Minimum 6 characters required"}
            </p>
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
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
