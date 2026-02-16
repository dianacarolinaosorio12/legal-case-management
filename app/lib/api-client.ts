// ============================================
// API Client Centralizado - SICOP
// Preparado para API Gateway (Nginx)
// ============================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const STUDENT_API_URL = process.env.NEXT_PUBLIC_STUDENT_API_URL || 'http://localhost:3002';

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('sicop_token');
  }
  return null;
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new ApiError(response.status, error.error || 'Request failed');
  }
  return response.json();
};

export const apiClient = {
  // ============================================
  // AUTH SERVICE (Puerto 3001)
  // ============================================
  
  auth: {
    login: async (email: string, password: string) => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      return handleResponse(response);
    },

    forgotPassword: async (email: string) => {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      return handleResponse(response);
    },

    resetPassword: async (token: string, password: string) => {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      return handleResponse(response);
    },

    register: async (userData: {
      email: string;
      password: string;
      name: string;
      role: string;
    }) => {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      return handleResponse(response);
    },

    me: async () => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return handleResponse(response);
    },
  },

  // ============================================
  // STUDENT SERVICE (Puerto 3002)
  // ============================================
  
  cases: {
    getAll: async () => {
      const token = getAuthToken();
      const response = await fetch(`${STUDENT_API_URL}/cases`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return handleResponse(response);
    },

    getById: async (id: string) => {
      const token = getAuthToken();
      const response = await fetch(`${STUDENT_API_URL}/cases/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return handleResponse(response);
    },

    create: async (caseData: Record<string, unknown>) => {
      const token = getAuthToken();
      const response = await fetch(`${STUDENT_API_URL}/cases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(caseData),
      });
      return handleResponse(response);
    },

    update: async (id: string, caseData: Record<string, unknown>) => {
      const token = getAuthToken();
      const response = await fetch(`${STUDENT_API_URL}/cases/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(caseData),
      });
      return handleResponse(response);
    },

    delete: async (id: string) => {
      const token = getAuthToken();
      const response = await fetch(`${STUDENT_API_URL}/cases/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return handleResponse(response);
    },
  },

  appointments: {
    getAll: async () => {
      const token = getAuthToken();
      const response = await fetch(`${STUDENT_API_URL}/appointments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return handleResponse(response);
    },

    create: async (appointmentData: Record<string, unknown>) => {
      const token = getAuthToken();
      const response = await fetch(`${STUDENT_API_URL}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(appointmentData),
      });
      return handleResponse(response);
    },
  },

  // ============================================
  // DOCUMENT SERVICE (Puerto 3003) - Futuro
  // ============================================
  
  documents: {
    upload: async (file: File, caseId: string) => {
      const token = getAuthToken();
      const formData = new FormData();
      formData.append('file', file);
      formData.append('caseId', caseId);

      const response = await fetch(`${process.env.NEXT_PUBLIC_DOCUMENT_API_URL || 'http://localhost:3003'}/documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      return handleResponse(response);
    },

    getByCase: async (caseId: string) => {
      const token = getAuthToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_DOCUMENT_API_URL || 'http://localhost:3003'}/documents/case/${caseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return handleResponse(response);
    },

    delete: async (id: string) => {
      const token = getAuthToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_DOCUMENT_API_URL || 'http://localhost:3003'}/documents/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return handleResponse(response);
    },
  },
};

export { ApiError };
export default apiClient;