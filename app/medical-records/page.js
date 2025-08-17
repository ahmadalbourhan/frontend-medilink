"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Siren } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import { mockMedicalRecords, mockPatients, mockDoctors } from "../lib/mockData";
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
    let recordsToShow = mockMedicalRecords;

    if (user?.role === "admin_institutions" && user?.institutionId) {
      recordsToShow = mockMedicalRecords.filter(
        (record) => record.institutionId === user.institutionId
      );
    }

    setRecords(recordsToShow);
    setFilteredRecords(recordsToShow);
  }, [user]);

  useEffect(() => {
    const filtered = records.filter((record) => {
      const patient = mockPatients.find(
        (p) => p.patientId === record.patientId
      );
      const doctor = mockDoctors.find((d) => d._id === record.doctorId);

      const matchesSearch =
        record.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    const patient = mockPatients.find((p) => p.patientId === patientId);
    return patient?.name || "Unknown Patient";
  };

  const getDoctorName = (doctorId) => {
    const doctor = mockDoctors.find((d) => d._id === doctorId);
    return doctor?.name || "Unknown Doctor";
  };

  const getVisitTypeColor = (type) => {
    const colors = {
      consultation: "bg-blue-100 text-blue-800",
      emergency: "bg-red-100 text-red-800",
      "follow-up": "bg-green-100 text-green-800",
      surgery: "bg-purple-100 text-purple-800",
      "lab-test": "bg-yellow-100 text-yellow-800",
      immunization: "bg-indigo-100 text-indigo-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const handleView = (record) => {
    setSelectedRecord(record);
    setShowViewModal(true);
  };

  const handleEdit = (record) => {
    setSelectedRecord(record);
    setShowEditModal(true);
  };

  const handleSaveEdit = (updatedRecord) => {
    const updatedRecords = records.map((rec) =>
      rec._id === updatedRecord._id ? updatedRecord : rec
    );
    setRecords(updatedRecords);
    setShowEditModal(false);
    setSelectedRecord(null);
  };

  const handleCreate = () => {
    setShowCreateModal(true);
  };

  const handleSaveCreate = (newRecord) => {
    const recordWithId = {
      ...newRecord,
      _id: Date.now().toString(),
      institutionId:
        user?.role === "admin_institutions"
          ? user.institutionId
          : newRecord.institutionId,
    };
    setRecords([...records, recordWithId]);
    setShowCreateModal(false);
  };

  const handleDelete = (record) => {
    setRecordToDelete(record);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (recordToDelete) {
      const updatedRecords = records.filter(
        (rec) => rec._id !== recordToDelete._id
      );
      setRecords(updatedRecords);
      setRecordToDelete(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Medical Records
            </h1>
            <p className="text-gray-600">
              View and manage patient medical records
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Add New Record
          </button>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex-1 w-full">
                <input
                  type="text"
                  placeholder="Search by patient name, ID, doctor, or diagnosis..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visit Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Diagnosis
                  </th> */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr key={record._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {getPatientName(record.patientId)}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {record.patientId}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
                        <span className="ml-2 text-red-600 inline-flex items-center">
                          <Siren className="w-4 h-4" />
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(record)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(record)}
                        className="text-red-600 hover:text-red-900"
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
              <p className="text-gray-500">
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
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Medical Record Details
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
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
              <label className="block text-sm font-medium text-gray-700">
                Patient
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {getPatientName(record.patientId)}
              </p>
              <p className="text-xs text-gray-500">ID: {record.patientId}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Doctor
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {getDoctorName(record.doctorId)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Visit Type
              </label>
              <p className="mt-1 text-sm text-gray-900 capitalize">
                {record.visitInfo.type}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Date
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(record.visitInfo.date).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Symptoms
            </label>
            <p className="mt-1 text-sm text-gray-900">
              {record.clinicalData.symptoms}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Diagnosis
            </label>
            <p className="mt-1 text-sm text-gray-900">
              {record.clinicalData.diagnosis}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Treatment
            </label>
            <p className="mt-1 text-sm text-gray-900">
              {record.clinicalData.treatment}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <p className="mt-1 text-sm text-gray-900">
              {record.clinicalData.notes}
            </p>
          </div>

          {record.prescriptions && record.prescriptions.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prescriptions
              </label>
              <div className="space-y-2">
                {record.prescriptions.map((prescription, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded">
                    <p className="font-medium">{prescription.medicationName}</p>
                    <p className="text-sm text-gray-600">
                      {prescription.dosage} - {prescription.frequency} for{" "}
                      {prescription.duration}
                    </p>
                    <p className="text-sm text-gray-500">
                      {prescription.instructions}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {record.labResults && record.labResults.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lab Results
              </label>
              <div className="space-y-2">
                {record.labResults.map((result, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded">
                    <p className="font-medium">{result.testName}</p>
                    <p className="text-sm text-gray-600">
                      Result: {result.result}
                    </p>
                    <p className="text-sm text-gray-500">
                      Reference: {result.referenceRange}
                    </p>
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded ${
                        result.status === "normal"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
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
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
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
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Edit Medical Record
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
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
              <label className="block text-sm font-medium text-gray-700">
                Visit Type
              </label>
              <select
                name="visitType"
                value={formData.visitType}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <label className="block text-sm font-medium text-gray-700">
                Visit Date
              </label>
              <input
                type="date"
                name="visitDate"
                value={formData.visitDate}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Emergency Visit
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Symptoms
            </label>
            <textarea
              name="symptoms"
              value={formData.symptoms}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Diagnosis
            </label>
            <textarea
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Treatment
            </label>
            <textarea
              name="treatment"
              value={formData.treatment}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
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
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Add New Medical Record
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
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
              <label className="block text-sm font-medium text-gray-700">
                Patient ID
              </label>
              <input
                type="text"
                name="patientId"
                value={formData.patientId}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., PAT001"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Doctor ID
              </label>
              <input
                type="text"
                name="doctorId"
                value={formData.doctorId}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., DOC001"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Visit Type
              </label>
              <select
                name="visitType"
                value={formData.visitType}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <label className="block text-sm font-medium text-gray-700">
                Visit Date
              </label>
              <input
                type="date"
                name="visitDate"
                value={formData.visitDate}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Emergency Visit
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Symptoms
            </label>
            <textarea
              name="symptoms"
              value={formData.symptoms}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Diagnosis
            </label>
            <textarea
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Treatment
            </label>
            <textarea
              name="treatment"
              value={formData.treatment}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Add Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
