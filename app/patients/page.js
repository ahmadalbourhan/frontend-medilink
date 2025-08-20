"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import DashboardLayout from "../components/DashboardLayout";
import apiClient from "../lib/api";
import DangerConfirmModal from "../components/DangerConfirmModal";
import { AlertTriangle, Baby } from "lucide-react";
import TranslateButton from "../components/TranslateButton";
import { useLanguage } from "../contexts/LanguageContext";

export default function Patients() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);
  const { isArabic } = useLanguage();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        let params = {};

        // If user is institution admin, filter by their institution
        if (user?.role === "admin_institutions" && user?.institutionId) {
          params.institutionId = user.institutionId;
        }

        const res = await apiClient.getPatients(params);
        const list = res.data || res;
        setPatients(list);
        setFilteredPatients(list);
      } catch (e) {
        setPatients([]);
        setFilteredPatients([]);
      }
    };
    if (user) fetchPatients();
  }, [user]);

  useEffect(() => {
    const filtered = patients.filter(
      (patient) =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.contact.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPatients(filtered);
  }, [searchTerm, patients]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const handleView = (patient) => {
    setSelectedPatient(patient);
    setShowViewModal(true);
  };

  const handleEdit = (patient) => {
    setSelectedPatient(patient);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (updatedPatient) => {
    try {
      const res = await apiClient.updatePatient(
        updatedPatient.patientId,
        updatedPatient
      );
      const saved = res.data || res;
      const updatedPatients = patients.map((pat) =>
        pat.patientId === saved.patientId ? saved : pat
      );
      setPatients(updatedPatients);
    } finally {
      setShowEditModal(false);
      setSelectedPatient(null);
    }
  };

  const handleCreate = () => {
    setShowCreateModal(true);
  };

  const handleSaveCreate = async (newPatient) => {
    try {
      const res = await apiClient.createPatient({
        ...newPatient,
        password: "password123",
      });
      const created = (res.data && res.data.data) || res.data || res;
      const createdPatient = created.data || created; // handle different shapes
      setPatients([...patients, createdPatient]);
    } finally {
      setShowCreateModal(false);
    }
  };

  const handleDelete = (patient) => {
    setPatientToDelete(patient);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!patientToDelete) return;
    try {
      await apiClient.deletePatient(patientToDelete.patientId);
      const updatedPatients = patients.filter(
        (pat) => pat.patientId !== patientToDelete.patientId
      );
      setPatients(updatedPatients);
    } finally {
      setPatientToDelete(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              {isArabic ? "المرضى" : "Patients"}
            </h1>
            <p className="text-muted-foreground">
              {isArabic
                ? "إدارة سجلات ومعلومات المرضى"
                : "Manage patient records and information"}
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
          >
            {isArabic ? "إضافة مريض جديد" : "Add New Patient"}
          </button>
        </div>

        <div className="bg-card text-card-foreground shadow rounded-lg">
          <div className="p-6 border-b border-border">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder={
                    isArabic
                      ? "ابحث عن المرضى بالاسم أو الهوية أو البريد الإلكتروني..."
                      : "Search patients by name, ID, or email..."
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {isArabic ? "المريض" : "Patient"}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {isArabic ? "رقم المريض" : "Patient ID"}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {isArabic ? "العمر/الجنس" : "Age/Gender"}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {isArabic ? "فصيلة الدم" : "Blood Type"}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {isArabic ? "جهة الاتصال" : "Contact"}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {isArabic ? "الإجراءات" : "Actions"}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {filteredPatients.map((patient) => (
                  <tr
                    key={patient.patientId}
                    className="hover:bg-accent/10 cursor-pointer transition-colors"
                    onClick={() =>
                      router.push(`/patients/${patient.patientId}/records`)
                    }
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {patient.name}
                        </div>
                        {patient.allergies && (
                          <div className="text-sm text-destructive flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4" />
                            {isArabic
                              ? `الحساسية: ${patient.allergies}`
                              : `Allergies: ${patient.allergies}`}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {patient.patientId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {calculateAge(patient.dateOfBirth)} {isArabic ? "سنوات" : "years"},{" "}
                      {patient.gender}
                      {patient.isPregnant && (
                        <span className="ml-2 text-pink-600 inline-flex items-center">
                          <Baby className="w-4 h-4" />
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-destructive/10 text-destructive">
                        {patient.bloodType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      <div>{patient.contact.phone}</div>
                      <div className="text-muted-foreground">
                        {patient.contact.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleView(patient);
                        }}
                        className="text-primary hover:text-primary/80 mr-4"
                      >
                        {isArabic ? "عرض" : "View"}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(patient);
                        }}
                        className="text-accent hover:text-accent/80 mr-4"
                      >
                        {isArabic ? "تعديل" : "Edit"}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(patient);
                        }}
                        className="text-destructive hover:text-destructive/80"
                      >
                        {isArabic ? "حذف" : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPatients.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {isArabic
                  ? "لا توجد مرضى تطابق بحثك."
                  : "No patients found matching your search."}
              </p>
            </div>
          )}
        </div>
      </div>

      {showViewModal && selectedPatient && (
        <ViewPatientModal
          patient={selectedPatient}
          onClose={() => setShowViewModal(false)}
        />
      )}

      {showEditModal && selectedPatient && (
        <EditPatientModal
          patient={selectedPatient}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveEdit}
        />
      )}

      {showCreateModal && (
        <CreatePatientModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleSaveCreate}
        />
      )}

      <DangerConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title={isArabic ? "حذف المريض" : "Delete Patient"}
        message={isArabic
          ? "هل أنت متأكد أنك تريد حذف هذا المريض؟ سيؤدي ذلك إلى إزالة جميع بيانات المريض وسجلاته الطبية بشكل دائم."
          : "Are you sure you want to delete this patient? This will permanently remove all patient data and medical records."}
        itemName={patientToDelete?.name || ""}
      />
    </DashboardLayout>
  );
}

function ViewPatientModal({ patient, onClose }) {
  const { isArabic } = useLanguage();

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  return (
    <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-card text-card-foreground">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-foreground">
            {isArabic ? "تفاصيل المريض" : "Patient Details"}
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
                {isArabic ? "الاسم" : "Name"}
              </label>
              <p className="mt-1 text-sm text-foreground">{patient.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground">
                {isArabic ? "رقم المريض" : "Patient ID"}
              </label>
              <p className="mt-1 text-sm text-foreground">
                {patient.patientId}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground">
                {isArabic ? "العمر" : "Age"}
              </label>
              <p className="mt-1 text-sm text-foreground">
                {calculateAge(patient.dateOfBirth)} {isArabic ? "سنوات" : "years"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground">
                {isArabic ? "الجنس" : "Gender"}
              </label>
              <p className="mt-1 text-sm text-foreground capitalize">
                {patient.gender}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground">
                {isArabic ? "فصيلة الدم" : "Blood Type"}
              </label>
              <p className="mt-1 text-sm text-foreground">
                {patient.bloodType}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground">
                {isArabic ? "الهاتف" : "Phone"}
              </label>
              <p className="mt-1 text-sm text-foreground">
                {patient.contact.phone}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground">
                {isArabic ? "البريد الإلكتروني" : "Email"}
              </label>
              <p className="mt-1 text-sm text-foreground">
                {patient.contact.email}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground">
                {isArabic ? "جهة الاتصال في حالات الطوارئ" : "Emergency Contact"}
              </label>
              <p className="mt-1 text-sm text-foreground">
                {patient.emergencyContact.name} (
                {patient.emergencyContact.relationship})
              </p>
              <p className="text-sm text-muted-foreground">
                {patient.emergencyContact.phone}
              </p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground">
              {isArabic ? "العنوان" : "Address"}
            </label>
            <p className="mt-1 text-sm text-foreground">
              {patient.contact.address}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground">
              {isArabic ? "الحساسية" : "Allergies"}
            </label>
            <p className="mt-1 text-sm text-foreground">
              {patient.allergies || "None known"}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground">
              {isArabic ? "التأمين" : "Insurance"}
            </label>
            <p className="mt-1 text-sm text-foreground">
              {patient.insuranceInfo.provider} ({patient.insuranceInfo.type})
            </p>
            <p className="text-sm text-muted-foreground">
              {isArabic ? "رقم البوليصة: " : "Policy: "}{" "}
              {patient.insuranceInfo.policyNumber}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/80"
          >
            {isArabic ? "إغلاق" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditPatientModal({ patient, onClose, onSave }) {
  const { isArabic } = useLanguage();

  const [formData, setFormData] = useState({
    name: patient.name,
    dateOfBirth: patient.dateOfBirth.split("T")[0],
    gender: patient.gender,
    bloodType: patient.bloodType,
    phone: patient.contact.phone,
    email: patient.contact.email,
    address: patient.contact.address,
    emergencyName: patient.emergencyContact.name,
    emergencyPhone: patient.emergencyContact.phone,
    emergencyRelationship: patient.emergencyContact.relationship,
    allergies: patient.allergies,
    insuranceProvider: patient.insuranceInfo.provider,
    insuranceType: patient.insuranceInfo.type,
    policyNumber: patient.insuranceInfo.policyNumber,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedPatient = {
      ...patient,
      name: formData.name,
      dateOfBirth: formData.dateOfBirth + "T00:00:00Z",
      gender: formData.gender,
      bloodType: formData.bloodType,
      contact: {
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
      },
      emergencyContact: {
        name: formData.emergencyName,
        phone: formData.emergencyPhone,
        relationship: formData.emergencyRelationship,
      },
      allergies: formData.allergies,
      insuranceInfo: {
        provider: formData.insuranceProvider,
        type: formData.insuranceType,
        policyNumber: formData.policyNumber,
      },
    };
    onSave(updatedPatient);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-card text-card-foreground">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-foreground">
            {isArabic ? "تعديل المريض" : "Edit Patient"}
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
                {isArabic ? "الاسم" : "Name"}
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
                {isArabic ? "تاريخ الميلاد" : "Date of Birth"}
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground">
                {isArabic ? "الجنس" : "Gender"}
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                required
              >
                <option value="male">{isArabic ? "ذكر" : "Male"}</option>
                <option value="female">{isArabic ? "أنثى" : "Female"}</option>
                <option value="other">{isArabic ? "آخر" : "Other"}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground">
                {isArabic ? "فصيلة الدم" : "Blood Type"}
              </label>
              <select
                name="bloodType"
                value={formData.bloodType}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                required
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground">
                {isArabic ? "الهاتف" : "Phone"}
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
                {isArabic ? "البريد الإلكتروني" : "Email"}
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

          <div>
            <label className="block text-sm font-medium text-muted-foreground">
              {isArabic ? "العنوان" : "Address"}
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={2}
              className="mt-1 block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
              required
            />
          </div>

          <div className="border-t pt-4">
            <h4 className="text-md font-medium text-foreground mb-3">
              {isArabic ? "جهة الاتصال في حالات الطوارئ" : "Emergency Contact"}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground">
                  {isArabic ? "الاسم" : "Name"}
                </label>
                <input
                  type="text"
                  name="emergencyName"
                  value={formData.emergencyName}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground">
                  {isArabic ? "الهاتف" : "Phone"}
                </label>
                <input
                  type="tel"
                  name="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground">
                  {isArabic ? "العلاقة" : "Relationship"}
                </label>
                <input
                  type="text"
                  name="emergencyRelationship"
                  value={formData.emergencyRelationship}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground">
              {isArabic ? "الحساسية" : "Allergies"}
            </label>
            <textarea
              name="allergies"
              value={formData.allergies}
              onChange={handleChange}
              rows={2}
              className="mt-1 block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
              placeholder={
                isArabic
                  ? "اكتب أي حساسية معروفة"
                  : "List any known allergies"
              }
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/80"
            >
              {isArabic ? "إلغاء" : "Cancel"}
            </button>
            <button
              type="submit"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
            >
              {isArabic ? "حفظ التغييرات" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CreatePatientModal({ onClose, onSave }) {
  const { isArabic } = useLanguage();

  const [formData, setFormData] = useState({
    name: "",
    dateOfBirth: "",
    gender: "male",
    bloodType: "A+",
    phone: "",
    email: "",
    address: "",
    emergencyName: "",
    emergencyPhone: "",
    emergencyRelationship: "",
    allergies: "",
    insuranceProvider: "",
    insuranceType: "",
    policyNumber: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newPatient = {
      name: formData.name,
      dateOfBirth: formData.dateOfBirth + "T00:00:00Z",
      gender: formData.gender,
      bloodType: formData.bloodType,
      contact: {
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
      },
      emergencyContact: {
        name: formData.emergencyName,
        phone: formData.emergencyPhone,
        relationship: formData.emergencyRelationship,
      },
      allergies: formData.allergies,
      insuranceInfo: {
        provider: formData.insuranceProvider,
        type: formData.insuranceType,
        policyNumber: formData.policyNumber,
      },
      isPregnant: false,
      institutionIds: [],
    };
    onSave(newPatient);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-card text-card-foreground">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-foreground">
            {isArabic ? "إضافة مريض جديد" : "Add New Patient"}
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
                {isArabic ? "الاسم" : "Name"}
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
                {isArabic ? "تاريخ الميلاد" : "Date of Birth"}
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground">
                {isArabic ? "الجنس" : "Gender"}
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                required
              >
                <option value="male">{isArabic ? "ذكر" : "Male"}</option>
                <option value="female">{isArabic ? "أنثى" : "Female"}</option>
                <option value="other">{isArabic ? "آخر" : "Other"}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground">
                {isArabic ? "فصيلة الدم" : "Blood Type"}
              </label>
              <select
                name="bloodType"
                value={formData.bloodType}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                required
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground">
                {isArabic ? "الهاتف" : "Phone"}
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
                {isArabic ? "البريد الإلكتروني" : "Email"}
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

          <div>
            <label className="block text-sm font-medium text-muted-foreground">
              {isArabic ? "العنوان" : "Address"}
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={2}
              className="mt-1 block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
              required
            />
          </div>

          <div className="border-t pt-4">
            <h4 className="text-md font-medium text-foreground mb-3">
              {isArabic ? "جهة الاتصال في حالات الطوارئ" : "Emergency Contact"}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground">
                  {isArabic ? "الاسم" : "Name"}
                </label>
                <input
                  type="text"
                  name="emergencyName"
                  value={formData.emergencyName}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground">
                  {isArabic ? "الهاتف" : "Phone"}
                </label>
                <input
                  type="tel"
                  name="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground">
                  {isArabic ? "العلاقة" : "Relationship"}
                </label>
                <input
                  type="text"
                  name="emergencyRelationship"
                  value={formData.emergencyRelationship}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground">
              {isArabic ? "الحساسية" : "Allergies"}
            </label>
            <textarea
              name="allergies"
              value={formData.allergies}
              onChange={handleChange}
              rows={2}
              className="mt-1 block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
              placeholder={
                isArabic
                  ? "اكتب أي حساسية معروفة"
                  : "List any known allergies"
              }
            />
          </div>

          <div className="border-t pt-4">
            <h4 className="text-md font-medium text-foreground mb-3">
              {isArabic ? "معلومات التأمين" : "Insurance Information"}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground">
                  {isArabic ? "المزود" : "Provider"}
                </label>
                <input
                  type="text"
                  name="insuranceProvider"
                  value={formData.insuranceProvider}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground">
                  {isArabic ? "النوع" : "Type"}
                </label>
                <input
                  type="text"
                  name="insuranceType"
                  value={formData.insuranceType}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground">
                  {isArabic ? "رقم البوليصة" : "Policy Number"}
                </label>
                <input
                  type="text"
                  name="policyNumber"
                  value={formData.policyNumber}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/80"
            >
              {isArabic ? "إلغاء" : "Cancel"}
            </button>
            <button
              type="submit"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
            >
              {isArabic ? "إضافة مريض" : "Add Patient"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
