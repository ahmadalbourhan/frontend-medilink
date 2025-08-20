"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Siren } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import apiClient from "../lib/api";
import DangerConfirmModal from "../components/DangerConfirmModal";

export default function MedicalRecords() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        let params = {};

        // If user is institution admin, filter by their institution
        if (user?.role === "admin_institutions" && user?.institutionId) {
          params.institutionFilter = "own";
        }

        const res = await apiClient.getMedicalRecords(params);
        const list = (res.data && res.data.data) || res.data || res;
        setRecords(list);
        setFilteredRecords(list);
      } catch (e) {
        setRecords([]);
        setFilteredRecords([]);
      }
    };
    if (user) fetchRecords();
  }, [user]);

  useEffect(() => {
    const filtered = records.filter((record) => {
      const patientName = record.patient?.name;
      const doctorName = record.doctorId?.name || record.doctor?.name;

      const matchesSearch =
        record.patientId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.clinicalData.diagnosis
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesType =
        filterType === "all" || record.visitInfo.type === filterType;

      return matchesSearch && matchesType;
    });

    setFilteredRecords(filtered);
  }, [searchTerm, filterType, records]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getPatientName = (patientId) => {
    // If patientId is already populated (an object), use its name
    if (patientId && typeof patientId === "object" && patientId.name) {
      return patientId.name;
    }
    // If it's just an ID string, search through records (fallback)
    return (
      records.find((r) => r.patientId === patientId)?.patient?.name ||
      "Unknown Patient"
    );
  };

  const getDoctorName = (doctorId) => {
    // If doctorId is already populated (an object), use its name
    if (doctorId && typeof doctorId === "object" && doctorId.name) {
      return doctorId.name;
    }
    // If it's just an ID string, search through records (fallback)
    return (
      records.find(
        (r) => r.doctorId?._id === doctorId || r.doctorId === doctorId
      )?.doctorId?.name || "Unknown Doctor"
    );
  };

  const getVisitTypeColor = (type) => {
    const colors = {
      consultation: "bg-primary/10 text-primary",
      emergency: "bg-destructive/10 text-destructive",
      "follow-up": "bg-secondary/50 text-secondary-foreground",
      surgery: "bg-accent/10 text-accent-foreground",
      "lab-test": "bg-accent/10 text-accent-foreground",
      immunization: "bg-accent/10 text-accent-foreground",
    };
    return colors[type] || "bg-muted text-muted-foreground";
  };

  const handleView = (record) => {
    setSelectedRecord(record);
    setShowViewModal(true);
  };

  const handleEdit = (record) => {
    setSelectedRecord(record);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (updatedRecord) => {
    try {
      const res = await apiClient.updateMedicalRecord(
        updatedRecord._id,
        updatedRecord
      );
      const saved = res.data || res;
      const updatedRecords = records.map((rec) =>
        rec._id === saved._id ? saved : rec
      );
      setRecords(updatedRecords);
    } finally {
      setShowEditModal(false);
      setSelectedRecord(null);
    }
  };

  const handleCreate = () => {
    setShowCreateModal(true);
  };

  const handleSaveCreate = async (newRecord) => {
    try {
      const res = await apiClient.createMedicalRecord(newRecord);
      const created = res.data || res;
      setRecords([...records, created]);
    } finally {
      setShowCreateModal(false);
    }
  };

  const handleDelete = (record) => {
    setRecordToDelete(record);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!recordToDelete) return;
    try {
      await apiClient.deleteMedicalRecord(recordToDelete._id);
      const updatedRecords = records.filter(
        (rec) => rec._id !== recordToDelete._id
      );
      setRecords(updatedRecords);
    } finally {
      setRecordToDelete(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Medical Records
            </h1>
            <p className="text-muted-foreground">
              View and manage patient medical records
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
          >
            Add New Record
          </button>
        </div>

        <div className="bg-card text-card-foreground shadow rounded-lg">
          <div className="p-6 border-b border-border">
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex-1 w-full">
                <input
                  type="text"
                  placeholder="Search by patient name, ID, doctor, or diagnosis..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                />
              </div>
              <div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                >
                  <option value="all">All Types</option>
                  <option value="consultation">Consultation</option>
                  <option value="emergency">Emergency</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="surgery">Surgery</option>
                  <option value="lab-test">Lab Test</option>
                  <option value="immunization">Immunization</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Visit Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Date
                  </th>
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Diagnosis
                  </th> */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {filteredRecords.map((record) => (
                  <tr key={record._id} className="hover:bg-accent/10">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {getPatientName(record.patientId)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ID: {record.patientId}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {getDoctorName(record.doctorId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getVisitTypeColor(
                          record.visitInfo.type
                        )}`}
                      >
                        {record.visitInfo.type}
                      </span>
                      {record.visitInfo.isEmergency && (
                        <span className="ml-2 text-destructive inline-flex items-center">
                          <Siren className="w-4 h-4" />
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {new Date(record.visitInfo.date).toLocaleDateString()}
                    </td>
                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="max-w-xs truncate">
                        {record.clinicalData.diagnosis ||
                          "No diagnosis recorded"}
                      </div>
                    </td> */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleView(record)}
                        className="text-primary hover:text-primary/80 mr-4"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(record)}
                        className="text-accent hover:text-accent/80 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(record)}
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

          {filteredRecords.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No medical records found matching your criteria.
              </p>
            </div>
          )}
        </div>
      </div>

      {showViewModal && selectedRecord && (
        <ViewRecordModal
          record={selectedRecord}
          onClose={() => setShowViewModal(false)}
          getPatientName={getPatientName}
          getDoctorName={getDoctorName}
        />
      )}

      {showEditModal && selectedRecord && (
        <EditRecordModal
          record={selectedRecord}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveEdit}
        />
      )}

      {showCreateModal && (
        <CreateRecordModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleSaveCreate}
        />
      )}

      <DangerConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Medical Record"
        message="Are you sure you want to delete this medical record? This will permanently remove all clinical data and cannot be undone."
        itemName={`${getPatientName(recordToDelete?.patientId)} - ${
          recordToDelete?.visitInfo?.type || "Record"
        }`}
      />
    </DashboardLayout>
  );
}

function ViewRecordModal({ record, onClose, getPatientName, getDoctorName }) {
  return (
    <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-card text-card-foreground">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-foreground">
            Medical Record Details
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

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground">
                Patient
              </label>
              <p className="mt-1 text-sm text-foreground">
                {getPatientName(record.patientId)}
              </p>
              <p className="text-xs text-muted-foreground">
                ID: {record.patientId}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground">
                Doctor
              </label>
              <p className="mt-1 text-sm text-foreground">
                {getDoctorName(record.doctorId)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground">
                Visit Type
              </label>
              <p className="mt-1 text-sm text-foreground capitalize">
                {record.visitInfo.type}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground">
                Date
              </label>
              <p className="mt-1 text-sm text-foreground">
                {new Date(record.visitInfo.date).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground">
              Symptoms
            </label>
            <p className="mt-1 text-sm text-foreground">
              {record.clinicalData.symptoms}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground">
              Diagnosis
            </label>
            <p className="mt-1 text-sm text-foreground">
              {record.clinicalData.diagnosis}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground">
              Treatment
            </label>
            <p className="mt-1 text-sm text-foreground">
              {record.clinicalData.treatment}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground">
              Notes
            </label>
            <p className="mt-1 text-sm text-foreground">
              {record.clinicalData.notes}
            </p>
          </div>

          {record.prescriptions && record.prescriptions.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Prescriptions
              </label>
              <div className="space-y-2">
                {record.prescriptions.map((prescription, index) => (
                  <div key={index} className="bg-muted p-3 rounded">
                    <p className="font-medium">{prescription.medicationName}</p>
                    <p className="text-sm text-muted-foreground">
                      {prescription.dosage} - {prescription.frequency} for{" "}
                      {prescription.duration}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {prescription.instructions}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {record.labResults && record.labResults.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Lab Results
              </label>
              <div className="space-y-2">
                {record.labResults.map((result, index) => (
                  <div key={index} className="bg-muted p-3 rounded">
                    <p className="font-medium">{result.testName}</p>
                    <p className="text-sm text-muted-foreground">
                      Result: {result.result}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Reference: {result.referenceRange}
                    </p>
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded ${
                        result.status === "normal"
                          ? "bg-secondary/50 text-secondary-foreground"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {result.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
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

function EditRecordModal({ record, onClose, onSave }) {
  const [formData, setFormData] = useState({
    symptoms: record.clinicalData.symptoms,
    diagnosis: record.clinicalData.diagnosis,
    treatment: record.clinicalData.treatment,
    notes: record.clinicalData.notes,
    visitType: record.visitInfo.type,
    visitDate: record.visitInfo.date.split("T")[0],
    isEmergency: record.visitInfo.isEmergency,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedRecord = {
      ...record,
      visitInfo: {
        ...record.visitInfo,
        type: formData.visitType,
        date: formData.visitDate + "T" + record.visitInfo.date.split("T")[1],
        isEmergency: formData.isEmergency,
      },
      clinicalData: {
        ...record.clinicalData,
        symptoms: formData.symptoms,
        diagnosis: formData.diagnosis,
        treatment: formData.treatment,
        notes: formData.notes,
      },
    };
    onSave(updatedRecord);
  };

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  return (
    <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-card text-card-foreground">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-foreground">
            Edit Medical Record
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
                Visit Type
              </label>
              <select
                name="visitType"
                value={formData.visitType}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                required
              >
                <option value="consultation">Consultation</option>
                <option value="emergency">Emergency</option>
                <option value="follow-up">Follow-up</option>
                <option value="surgery">Surgery</option>
                <option value="lab-test">Lab Test</option>
                <option value="immunization">Immunization</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground">
                Visit Date
              </label>
              <input
                type="date"
                name="visitDate"
                value={formData.visitDate}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                required
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isEmergency"
              checked={formData.isEmergency}
              onChange={handleChange}
              className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
            />
            <label className="ml-2 block text-sm text-foreground">
              Emergency Visit
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground">
              Symptoms
            </label>
            <textarea
              name="symptoms"
              value={formData.symptoms}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground">
              Diagnosis
            </label>
            <textarea
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground">
              Treatment
            </label>
            <textarea
              name="treatment"
              value={formData.treatment}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
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

function CreateRecordModal({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    patientId: "",
    doctorId: "",
    visitType: "consultation",
    visitDate: new Date().toISOString().split("T")[0],
    isEmergency: false,
    symptoms: "",
    diagnosis: "",
    treatment: "",
    notes: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newRecord = {
      patientId: formData.patientId,
      doctorId: formData.doctorId,
      visitInfo: {
        type: formData.visitType,
        date: formData.visitDate + "T00:00:00Z",
        isEmergency: formData.isEmergency,
      },
      clinicalData: {
        symptoms: formData.symptoms,
        diagnosis: formData.diagnosis,
        treatment: formData.treatment,
        notes: formData.notes,
      },
      prescriptions: [],
      labResults: [],
      institutionId: "",
    };
    onSave(newRecord);
  };

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  return (
    <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-card text-card-foreground">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-foreground">
            Add New Medical Record
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
                Patient ID
              </label>
              <input
                type="text"
                name="patientId"
                value={formData.patientId}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                placeholder="e.g., PAT001"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground">
                Doctor ID
              </label>
              <input
                type="text"
                name="doctorId"
                value={formData.doctorId}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                placeholder="e.g., DOC001"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground">
                Visit Type
              </label>
              <select
                name="visitType"
                value={formData.visitType}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                required
              >
                <option value="consultation">Consultation</option>
                <option value="emergency">Emergency</option>
                <option value="follow-up">Follow-up</option>
                <option value="surgery">Surgery</option>
                <option value="lab-test">Lab Test</option>
                <option value="immunization">Immunization</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground">
                Visit Date
              </label>
              <input
                type="date"
                name="visitDate"
                value={formData.visitDate}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                required
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isEmergency"
              checked={formData.isEmergency}
              onChange={handleChange}
              className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
            />
            <label className="ml-2 block text-sm text-foreground">
              Emergency Visit
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground">
              Symptoms
            </label>
            <textarea
              name="symptoms"
              value={formData.symptoms}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground">
              Diagnosis
            </label>
            <textarea
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground">
              Treatment
            </label>
            <textarea
              name="treatment"
              value={formData.treatment}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
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
              Add Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
