// SUGASTHA Backend API Client
// Connects Frontend to FastAPI Backend. Defaults to localhost for local dev;
// set VITE_API_BASE_URL when deploying (e.g. to your Render backend URL).

import { adaptHospital, adaptDoctor, adaptAppointment } from './apiAdapters';

const API_BASE_URL: string =
  (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
const ROOT_URL = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

export interface ApiHealthResponse {
  status: string;
  database: string;
}

export const api = {
  // Check backend connectivity
  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${ROOT_URL}/health`, { method: 'GET', signal: AbortSignal.timeout(2000) });
      if (!res.ok) return false;
      const data: ApiHealthResponse = await res.json();
      return data.status === 'healthy';
    } catch {
      return false;
    }
  },

  // 1. Hospitals API
  async getHospitals(): Promise<any[]> {
    const res = await fetch(`${API_BASE_URL}/hospitals`);
    if (!res.ok) throw new Error(`Failed to fetch hospitals: ${res.statusText}`);
    const raw = await res.json();
    return raw.map((h: any) => adaptHospital(h));
  },

  async getHospitalById(id: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/hospitals/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch hospital ${id}: ${res.statusText}`);
    return res.json();
  },

  // 2. Doctors API
  async getDoctors(hospitalId?: string): Promise<any[]> {
    const url = hospitalId
      ? `${API_BASE_URL}/doctors?hospital_id=${encodeURIComponent(hospitalId)}`
      : `${API_BASE_URL}/doctors`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch doctors: ${res.statusText}`);
    const raw = await res.json();
    return raw.map((d: any) => adaptDoctor(d));
  },

  async createDoctor(doctorData: any): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/doctors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doctorData)
    });
    if (!res.ok) throw new Error(`Failed to create doctor: ${res.statusText}`);
    return res.json();
  },

  async updateDoctor(doctorId: string, updates: any): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/doctors/${doctorId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error(`Failed to update doctor ${doctorId}: ${res.statusText}`);
    return res.json();
  },

  async extractDoctorsFromPdf(file: File, hospitalId: string): Promise<any[]> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('hospital_id', hospitalId);
    const res = await fetch(`${API_BASE_URL}/doctors/extract-pdf`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error(`Failed to extract doctors from PDF: ${res.statusText}`);
    return res.json();
  },

  // 3. Appointments / Triage Queue API
  async getAppointments(hospitalId?: string, status?: string): Promise<any[]> {
    const params = new URLSearchParams();
    if (hospitalId) params.append('hospital_id', hospitalId);
    if (status) params.append('status', status);

    const url = `${API_BASE_URL}/appointments?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch appointments: ${res.statusText}`);
    const raw = await res.json();
    return raw.map((a: any) => adaptAppointment(a));
  },

  async createAppointment(appointmentData: any): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appointmentData)
    });
    if (!res.ok) throw new Error(`Failed to create appointment: ${res.statusText}`);
    return adaptAppointment(await res.json());
  },

  async acceptAppointment(appointmentId: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/accept`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error(`Failed to accept appointment ${appointmentId}: ${res.statusText}`);
    return adaptAppointment(await res.json());
  },

  async escalateAppointment(appointmentId: string, reason?: string): Promise<any> {
    const url = reason
      ? `${API_BASE_URL}/appointments/${appointmentId}/escalate?reason=${encodeURIComponent(reason)}`
      : `${API_BASE_URL}/appointments/${appointmentId}/escalate`;
    const res = await fetch(url, { method: 'POST' });
    if (!res.ok) throw new Error(`Failed to escalate appointment ${appointmentId}: ${res.statusText}`);
    return adaptAppointment(await res.json());
  },

  // 4. Doctor Consultations & ABHA Sync API
  async submitConsultation(consultationData: any): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/consultations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(consultationData)
    });
    if (!res.ok) throw new Error(`Failed to submit consultation: ${res.statusText}`);
    return res.json();
  }
};
