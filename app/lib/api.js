// API utility functions for connecting to Express backend
// Currently using mock data, replace with actual API calls

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1"

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const token = localStorage.getItem("authToken")

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    }
  }

  // Authentication
  async login(email, password) {
    return this.request("/auth/sign-in", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  async logout() {
    return this.request("/auth/sign-out", {
      method: "POST",
    })
  }

  // Patients
  async getPatients() {
    return this.request("/patients")
  }

  async getPatient(id) {
    return this.request(`/patients/${id}`)
  }

  async createPatient(patientData) {
    return this.request("/patients", {
      method: "POST",
      body: JSON.stringify(patientData),
    })
  }

  async updatePatient(id, patientData) {
    return this.request(`/patients/${id}`, {
      method: "PUT",
      body: JSON.stringify(patientData),
    })
  }

  async deletePatient(id) {
    return this.request(`/patients/${id}`, {
      method: "DELETE",
    })
  }

  // Medical Records
  async getMedicalRecords() {
    return this.request("/medical-records")
  }

  async getMedicalRecord(id) {
    return this.request(`/medical-records/${id}`)
  }

  async getPatientMedicalRecords(patientId) {
    return this.request(`/medical-records/patient/${patientId}`)
  }

  async createMedicalRecord(recordData) {
    return this.request("/medical-records", {
      method: "POST",
      body: JSON.stringify(recordData),
    })
  }

  async updateMedicalRecord(id, recordData) {
    return this.request(`/medical-records/${id}`, {
      method: "PUT",
      body: JSON.stringify(recordData),
    })
  }

  // Doctors
  async getDoctors() {
    return this.request("/doctors")
  }

  async getDoctor(id) {
    return this.request(`/doctors/${id}`)
  }

  async createDoctor(doctorData) {
    return this.request("/doctors", {
      method: "POST",
      body: JSON.stringify(doctorData),
    })
  }

  async updateDoctor(id, doctorData) {
    return this.request(`/doctors/${id}`, {
      method: "PUT",
      body: JSON.stringify(doctorData),
    })
  }

  async deleteDoctor(id) {
    return this.request(`/doctors/${id}`, {
      method: "DELETE",
    })
  }

  // Institutions (Admin only)
  async getInstitutions() {
    return this.request("/admin/institutions")
  }

  async getInstitution(id) {
    return this.request(`/admin/institutions/${id}`)
  }

  async createInstitution(institutionData) {
    return this.request("/admin/institutions", {
      method: "POST",
      body: JSON.stringify(institutionData),
    })
  }

  async updateInstitution(id, institutionData) {
    return this.request(`/admin/institutions/${id}`, {
      method: "PUT",
      body: JSON.stringify(institutionData),
    })
  }

  async deleteInstitution(id) {
    return this.request(`/admin/institutions/${id}`, {
      method: "DELETE",
    })
  }

  // Users (Admin only)
  async getUsers() {
    return this.request("/admin/users")
  }

  async getUser(id) {
    return this.request(`/admin/users/${id}`)
  }
}

export const apiClient = new ApiClient()
export default apiClient
