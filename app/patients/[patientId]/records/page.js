"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../../contexts/AuthContext"
import { useRouter, useParams } from "next/navigation"
import DashboardLayout from "../../../components/DashboardLayout"
import { mockPatients, mockMedicalRecords, mockDoctors, mockInstitutions } from "../../../lib/mockData"
import { ArrowLeft, Calendar, User, Building2, Siren, AlertTriangle, FileText, Pill } from "lucide-react"

export default function PatientRecords() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const patientId = params.patientId

  const [patient, setPatient] = useState(null)
  const [records, setRecords] = useState([])
  const [filteredRecords, setFilteredRecords] = useState([])
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [showRecordModal, setShowRecordModal] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  useEffect(() => {
    // Find the patient
    const foundPatient = mockPatients.find((p) => p.patientId === patientId)
    if (!foundPatient) {
      router.push("/patients")
      return
    }

    // Check if user has access to this patient
    if (user?.role === "admin_institutions" && user?.institutionId) {
      if (!foundPatient.institutionIds.includes(user.institutionId)) {
        router.push("/patients")
        return
      }
    }

    setPatient(foundPatient)

    // Get all medical records for this patient
    let patientRecords = mockMedicalRecords.filter((record) => record.patientId === patientId)

    // Filter by institution if user is admin_institutions
    if (user?.role === "admin_institutions" && user?.institutionId) {
      patientRecords = patientRecords.filter((record) => record.institutionId === user.institutionId)
    }

    // Sort by date (newest first)
    patientRecords.sort((a, b) => new Date(b.visitInfo.date) - new Date(a.visitInfo.date))

    setRecords(patientRecords)
    setFilteredRecords(patientRecords)
  }, [patientId, user, router])

  if (loading || !user || !patient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const calculateAge = (dateOfBirth) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getDoctorName = (doctorId) => {
    const doctor = mockDoctors.find((d) => d._id === doctorId)
    return doctor ? doctor.name : "Unknown Doctor"
  }

  const getInstitutionName = (institutionId) => {
    const institution = mockInstitutions.find((i) => i._id === institutionId)
    return institution ? institution.name : "Unknown Institution"
  }

  const handleViewRecord = (record) => {
    setSelectedRecord(record)
    setShowRecordModal(true)
  }

  const getVisitTypeColor = (type) => {
    switch (type) {
      case "emergency":
        return "bg-red-100 text-red-800"
      case "surgery":
        return "bg-purple-100 text-purple-800"
      case "consultation":
        return "bg-blue-100 text-blue-800"
      case "follow-up":
        return "bg-green-100 text-green-800"
      case "immunization":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with patient info and back button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push("/patients")}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Patients
            </button>
          </div>
        </div>

        {/* Patient Summary Card */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{patient.name}</h1>
              <p className="text-gray-600">Patient ID: {patient.patientId}</p>
              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                <span>{calculateAge(patient.dateOfBirth)} years old</span>
                <span className="capitalize">{patient.gender}</span>
                <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                  {patient.bloodType}
                </span>
              </div>
              {patient.allergies && (
                <div className="mt-2 flex items-center text-red-600 text-sm">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Allergies: {patient.allergies}
                </div>
              )}
            </div>
            <div className="text-right text-sm text-gray-600">
              <div>Phone: {patient.contact.phone}</div>
              <div>Email: {patient.contact.email}</div>
            </div>
          </div>
        </div>

        {/* Medical Records */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Medical Records</h2>
            <p className="text-gray-600">Complete medical history for {patient.name}</p>
          </div>

          {filteredRecords.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No medical records found for this patient.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredRecords.map((record) => (
                <div
                  key={record._id}
                  className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleViewRecord(record)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getVisitTypeColor(record.visitInfo.type)}`}
                        >
                          {record.visitInfo.type}
                        </span>
                        {record.visitInfo.isEmergency && (
                          <span className="flex items-center text-red-600 text-sm">
                            <Siren className="w-4 h-4 mr-1" />
                            Emergency
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-medium text-gray-900 mb-1">{record.clinicalData.diagnosis}</h3>

                      <p className="text-gray-600 mb-2">{record.clinicalData.symptoms}</p>

                      <div className="flex items-center space-x-4 text-sm text-gray-500">
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
                        <div className="mt-2 flex items-center text-sm text-blue-600">
                          <Pill className="w-4 h-4 mr-1" />
                          {record.prescriptions.length} prescription(s)
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">View Details</button>
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
  )
}

function RecordDetailModal({ record, patient, onClose, getDoctorName, getInstitutionName, formatDate }) {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Medical Record Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Visit Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Visit Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Date:</span>
                <span className="ml-2">{formatDate(record.visitInfo.date)}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Type:</span>
                <span className="ml-2 capitalize">{record.visitInfo.type}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Doctor:</span>
                <span className="ml-2">{getDoctorName(record.doctorId)}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Institution:</span>
                <span className="ml-2">{getInstitutionName(record.institutionId)}</span>
              </div>
              {record.visitInfo.isEmergency && (
                <div className="col-span-2">
                  <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                    <Siren className="w-3 h-3 mr-1" />
                    Emergency Visit
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Clinical Data */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Clinical Information</h4>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-700">Symptoms:</span>
                <p className="mt-1 text-gray-900">{record.clinicalData.symptoms}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Diagnosis:</span>
                <p className="mt-1 text-gray-900">{record.clinicalData.diagnosis}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Treatment:</span>
                <p className="mt-1 text-gray-900">{record.clinicalData.treatment}</p>
              </div>
              {record.clinicalData.notes && (
                <div>
                  <span className="font-medium text-gray-700">Notes:</span>
                  <p className="mt-1 text-gray-900">{record.clinicalData.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Prescriptions */}
          {record.prescriptions.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Prescriptions</h4>
              <div className="space-y-3">
                {record.prescriptions.map((prescription, index) => (
                  <div key={index} className="bg-blue-50 p-3 rounded-lg">
                    <div className="font-medium text-gray-900">{prescription.medicationName}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      <span className="mr-4">Dosage: {prescription.dosage}</span>
                      <span className="mr-4">Frequency: {prescription.frequency}</span>
                      <span>Duration: {prescription.duration}</span>
                    </div>
                    {prescription.instructions && (
                      <div className="text-sm text-gray-600 mt-1">Instructions: {prescription.instructions}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lab Results */}
          {record.labResults.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Lab Results</h4>
              <div className="space-y-3">
                {record.labResults.map((result, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-900">{result.testName}</div>
                        <div className="text-sm text-gray-600 mt-1">Result: {result.result}</div>
                        <div className="text-sm text-gray-500">Reference: {result.referenceRange}</div>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          result.status === "normal" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {result.status}
                      </span>
                    </div>
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
                  <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <FileText className="w-5 h-5 text-gray-400 mr-3" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{attachment.fileName}</div>
                      <div className="text-sm text-gray-600">{attachment.description}</div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">Download</button>
                  </div>
                ))}
              </div>
            </div>
          )}
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
