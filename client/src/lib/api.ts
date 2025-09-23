import type { FaultReport } from "@/components/ReportsTable";

export interface CreateFaultReportData {
  title: string;
  description: string;
  priority: string;
  department?: string;
  location?: string;
  reportedBy?: string;
}

export interface UpdateStatusData {
  status: 'pending' | 'approved' | 'assigned' | 'rejected';
}

export interface ProcurementRequestData {
  priority: '24hrs' | '72hrs' | 'miscellaneous';
}

class ApiClient {
  private baseUrl = '/api';

  async fetchFaultReports(): Promise<FaultReport[]> {
    const response = await fetch(`${this.baseUrl}/fault-reports`);
    if (!response.ok) {
      throw new Error('Failed to fetch fault reports');
    }
    return response.json();
  }

  async getFaultReport(id: string): Promise<FaultReport> {
    const response = await fetch(`${this.baseUrl}/fault-reports/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch fault report');
    }
    return response.json();
  }

  async createFaultReport(data: CreateFaultReportData, files?: File[]): Promise<FaultReport> {
    const formData = new FormData();
    
    // Add text data
    Object.entries(data).forEach(([key, value]) => {
      if (value) {
        formData.append(key, value);
      }
    });

    // Add files
    if (files && files.length > 0) {
      files.forEach(file => {
        formData.append('attachments', file);
      });
    }

    const response = await fetch(`${this.baseUrl}/fault-reports`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create fault report');
    }
    
    return response.json();
  }

  async updateFaultReportStatus(id: string, data: UpdateStatusData): Promise<FaultReport> {
    const response = await fetch(`${this.baseUrl}/fault-reports/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update status');
    }
    
    return response.json();
  }

  async issueJobCard(id: string): Promise<{ message: string; report: FaultReport }> {
    const response = await fetch(`${this.baseUrl}/fault-reports/${id}/issue-job-card`, {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to issue job card');
    }
    
    return response.json();
  }

  async submitProcurementRequest(id: string, data: ProcurementRequestData): Promise<{ message: string; priority: string; report: FaultReport }> {
    const response = await fetch(`${this.baseUrl}/fault-reports/${id}/procurement-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to submit procurement request');
    }
    
    return response.json();
  }

  async deleteFaultReport(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/fault-reports/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete fault report');
    }
  }

  async addAttachment(id: string, file: File): Promise<FaultReport> {
    const formData = new FormData();
    formData.append('attachment', file);

    const response = await fetch(`${this.baseUrl}/fault-reports/${id}/attachments`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add attachment');
    }
    
    return response.json();
  }

  getFileDownloadUrl(filename: string): string {
    return `/uploads/${filename}`;
  }
}

export const apiClient = new ApiClient();