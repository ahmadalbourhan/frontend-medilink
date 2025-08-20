"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "../../../components/DashboardLayout";
import apiClient from "../../../lib/api";
import {
  ArrowLeft,
  Calendar,
  User,
  Building2,
  Siren,
  AlertTriangle,
  FileText,
  Pill,
} from "lucide-react";

export default function PatientRecords() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const patientId = params.patientId;

  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showRecordModal, setShowRecordModal] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Patient details
        const patRes = await apiClient.getPatient(patientId);
        const pat = patRes.data || patRes;
        setPatient(pat);

        // Records for patient (public endpoint needs patient token; but we are admin here so use protected list + filter)
        const params =
          user?.role === "admin_institutions"
            ? { patientId, institutionFilter: "own" }
            : { patientId };
        const recRes = await apiClient.getMedicalRecords(params);
        const list = (recRes.data && recRes.data.data) || recRes.data || recRes;
        const sorted = [...list].sort(
          (a, b) => new Date(b.visitInfo.date) - new Date(a.visitInfo.date)
        );
        setRecords(sorted);
        setFilteredRecords(sorted);
      } catch (e) {
        router.push("/patients");
      }
    };
    if (user && patientId) fetchData();
  }, [patientId, user, router]);

  if (loading || !user || !patient) {
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  const getInstitutionName = (institutionId) => {
    // If institutionId is already populated (an object), use its name
    if (
      institutionId &&
      typeof institutionId === "object" &&
      institutionId.name
    ) {
      return institutionId.name;
    }
    // If it's just an ID string, search through records (fallback)
    return (
      records.find(
        (r) =>
          r.institutionId?._id === institutionId ||
          r.institutionId === institutionId
      )?.institutionId?.name || "Unknown Institution"
    );
  };

  const handleViewRecord = (record) => {
    setSelectedRecord(record);
    setShowRecordModal(true);
  };

  const getVisitTypeColor = (type) => {
    switch (type) {
      case "emergency":
        return "bg-destructive/10 text-destructive";
      case "surgery":
        return "bg-accent/10 text-accent-foreground";
      case "consultation":
        return "bg-primary/10 text-primary";
      case "follow-up":
        return "bg-secondary/50 text-secondary-foreground";
      case "immunization":
        return "bg-accent/10 text-accent-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with patient info and back button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push("/patients")}
              className="flex items-center text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Patients
            </button>
          </div>
        </div>

        {/* Patient Summary Card */}
        <div className="bg-card text-card-foreground shadow rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                {patient.name}
              </h1>
              <p className="text-muted-foreground">
                Patient ID: {patient.patientId}
              </p>
              <div className="mt-2 flex items-center space-x-4 text-sm text-muted-foreground">
                <span>{calculateAge(patient.dateOfBirth)} years old</span>
                <span className="capitalize">{patient.gender}</span>
                <span className="px-2 py-1 bg-destructive/10 text-destructive rounded-full text-xs font-medium">
                  {patient.bloodType}
                </span>
              </div>
              {patient.allergies && (
                <div className="mt-2 flex items-center text-destructive text-sm">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Allergies: {patient.allergies}
                </div>
              )}
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <div>Phone: {patient.contact.phone}</div>
              <div>Email: {patient.contact.email}</div>
            </div>
          </div>
        </div>

        {/* Medical Records */}
        <div className="bg-card text-card-foreground shadow rounded-lg">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-medium text-foreground">
              Medical Records
            </h2>
            <p className="text-muted-foreground">
              Complete medical history for {patient.name}
            </p>
          </div>

          {filteredRecords.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No medical records found for this patient.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredRecords.map((record) => (
                <div
                  key={record._id}
                  className="p-6 hover:bg-accent/10 cursor-pointer transition-colors"
                  onClick={() => handleViewRecord(record)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getVisitTypeColor(
                            record.visitInfo.type
                          )}`}
                        >
                          {record.visitInfo.type}
                        </span>
                        {record.visitInfo.isEmergency && (
                          <span className="flex items-center text-destructive text-sm">
                            <Siren className="w-4 h-4 mr-1" />
                            Emergency
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-medium text-foreground mb-1">
                        {record.clinicalData.diagnosis}
                      </h3>

                      <p className="text-muted-foreground mb-2">
                        {record.clinicalData.symptoms}
                      </p>

                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(record.visitInfo.date)}
                        </div>
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {getDoctorName(record.doctorId)}
                        </div>
                        <div className="flex items-center">
                          <Building2 className="w-4 h-4 mr-1" />
                          {getInstitutionName(record.institutionId)}
                        </div>
                      </div>

                      {record.prescriptions.length > 0 && (
                        <div className="mt-2 flex items-center text-sm text-primary">
                          <Pill className="w-4 h-4 mr-1" />
                          {record.prescriptions.length} prescription(s)
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <button className="text-primary hover:text-primary/80 text-sm font-medium">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Record Detail Modal */}
      {showRecordModal && selectedRecord && (
        <RecordDetailModal
          record={selectedRecord}
          patient={patient}
          onClose={() => setShowRecordModal(false)}
          getDoctorName={getDoctorName}
          getInstitutionName={getInstitutionName}
          formatDate={formatDate}
        />
      )}
    </DashboardLayout>
  );
}

function RecordDetailModal({
  record,
  patient,
  onClose,
  getDoctorName,
  getInstitutionName,
  formatDate,
}) {
  return (
    <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-card text-card-foreground max-h-[90vh] overflow-y-auto">
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
          {/* Visit Information */}
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium text-foreground mb-3">
              Visit Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">Date:</span>
                <span className="ml-2">
                  {formatDate(record.visitInfo.date)}
                </span>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Type:</span>
                <span className="ml-2 capitalize">{record.visitInfo.type}</span>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">
                  Doctor:
                </span>
                <span className="ml-2">{getDoctorName(record.doctorId)}</span>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">
                  Institution:
                </span>
                <span className="ml-2">
                  {getInstitutionName(record.institutionId)}
                </span>
              </div>
              {record.visitInfo.isEmergency && (
                <div className="col-span-2">
                  <span className="inline-flex items-center px-2 py-1 bg-destructive/10 text-destructive text-xs font-medium rounded-full">
                    <Siren className="w-3 h-3 mr-1" />
                    Emergency Visit
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Clinical Data */}
          <div>
            <h4 className="font-medium text-foreground mb-3">
              Clinical Information
            </h4>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-muted-foreground">
                  Symptoms:
                </span>
                <p className="mt-1 text-foreground">
                  {record.clinicalData.symptoms}
                </p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">
                  Diagnosis:
                </span>
                <p className="mt-1 text-foreground">
                  {record.clinicalData.diagnosis}
                </p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">
                  Treatment:
                </span>
                <p className="mt-1 text-foreground">
                  {record.clinicalData.treatment}
                </p>
              </div>
              {record.clinicalData.notes && (
                <div>
                  <span className="font-medium text-muted-foreground">
                    Notes:
                  </span>
                  <p className="mt-1 text-foreground">
                    {record.clinicalData.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Prescriptions */}
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
                    {prescription.instructions && (
                      <p className="text-sm text-muted-foreground">
                        {prescription.instructions}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lab Results */}
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

          {/* Attachments */}
          {record.attachments.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Attachments</h4>
              <div className="space-y-2">
                {record.attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <FileText className="w-5 h-5 text-gray-400 mr-3" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {attachment.fileName}
                      </div>
                      <div className="text-sm text-gray-600">
                        {attachment.description}
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                      Download
                    </button>
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
