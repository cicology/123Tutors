// Get API URL from environment or default to localhost:3001
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
console.log('[API] Base URL:', API_BASE_URL);

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('access_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('access_token', token);
    } else {
      localStorage.removeItem('access_token');
    }
  }

  getToken(): string | null {
    // Always get fresh token from localStorage in case it was updated elsewhere
    this.token = localStorage.getItem('access_token');
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    console.log(`[API] Making request to: ${url}`);
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Always get fresh token
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log(`[API] Token found, length: ${token.length}`);
    } else {
      console.warn('[API] No token found for request to:', endpoint);
      // Don't proceed with authenticated requests if no token
      // Allow public endpoints: login, register (tutor), register/student
      const publicEndpoints = [
        '/auth/login',
        '/auth/register',
        '/auth/register/student',
        '/tutors/marketplace',
      ];
      if (!publicEndpoints.includes(endpoint)) {
        return {
          error: 'No authentication token found. Please sign in again.',
          statusCode: 401,
        };
      }
    }

    try {
      // Ensure method is set - default to POST if body is provided, GET otherwise
      const method = options.method || (options.body ? 'POST' : 'GET');
      
      const fetchOptions: RequestInit = {
        ...options,
        method,
        headers,
      };
      
      console.log(`[API] Request method: ${method}, URL: ${url}, has body: ${!!options.body}`);
      
      const response = await fetch(url, fetchOptions);
      
      console.log(`[API] Response status: ${response.status} for ${url}`);

      // Check if response has content before trying to parse JSON
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        const text = await response.text();
        try {
          data = text ? JSON.parse(text) : {};
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          return {
            error: response.statusText || 'Invalid response from server',
          };
        }
      } else {
        data = {};
      }

      if (!response.ok) {
        // Handle 401 Unauthorized - token might be expired or invalid
        if (response.status === 401) {
          console.warn('[API] 401 Unauthorized - Token expired or invalid');
          console.warn('[API] Current path:', window.location.pathname);
          console.warn('[API] Token exists:', !!this.getToken());
          
          // Clear all authentication data
          this.setToken(null);
          localStorage.removeItem('access_token');
          localStorage.removeItem('user_roles');
          localStorage.removeItem('isTutor');
          localStorage.removeItem('isStudent');
          localStorage.removeItem('tutorId');
          localStorage.removeItem('studentId');
          
          // Show toast notification if available
          try {
            // Try to import and show toast (only if sonner is available)
            if (typeof window !== 'undefined' && (window as any).toast) {
              (window as any).toast.error('Session expired. Please sign in again.');
            }
          } catch (e) {
            // Toast not available, continue
          }
          
          // Only redirect if we're not already on the login page
          const currentPath = window.location.pathname.toLowerCase();
          const isOnLoginPage = currentPath.includes('/signin') || 
                                currentPath.includes('/sign-in') || 
                                currentPath.includes('/login') ||
                                currentPath === '/';
          
          if (!isOnLoginPage) {
            console.log('[API] Redirecting to /signin due to 401 Unauthorized');
            // Use setTimeout to ensure the error is returned first
            setTimeout(() => {
              window.location.href = '/signin';
            }, 100);
          } else {
            console.log('[API] Already on login page, not redirecting');
          }
          
          return {
            error: 'Session expired. Please sign in again.',
            statusCode: 401,
          };
        }
        
        return {
          error: data.message || data.error || response.statusText || 'An error occurred',
        };
      }

      return { data };
    } catch (error) {
      console.error('[API] Request error:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Network error - Failed to fetch';
      
      // Provide helpful error message
      let userMessage = errorMessage;
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('Network error')) {
        userMessage = `Cannot connect to backend server at ${this.baseURL}. Please make sure:
1. Backend server is running (cd backend && npm run start:dev)
2. Backend is running on port 3000
3. Check browser console for detailed error`;
        console.error('[API] Connection failed. Backend URL:', this.baseURL);
      }
      
      return {
        error: userMessage,
      };
    }
  }

  // Auth endpoints
  async registerTutor(tutorData: any) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(tutorData),
    });
  }

  async registerStudent(studentData: any) {
    return this.request('/auth/register/student', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
  }

  async login(email: string, password: string) {
    const response = await this.request<{ 
      access_token: string; 
      user: any;
      roles: string[];
      isTutor?: boolean;
      isStudent?: boolean;
      isAdmin?: boolean;
      tutorId?: string | null;
      studentId?: string | null;
      adminId?: string | null;
    }>( 
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      },
    );

    if (response.data?.access_token) {
      this.setToken(response.data.access_token);
      // Store role information
      if (response.data.roles) {
        localStorage.setItem('user_roles', JSON.stringify(response.data.roles));
        localStorage.setItem('isTutor', String(response.data.isTutor || false));
        localStorage.setItem('isStudent', String(response.data.isStudent || false));
        localStorage.setItem('isAdmin', String(response.data.isAdmin || response.data.roles?.includes('admin') || false));
      }
      // Clear old IDs first, then store new ones (always store, even if null, to clear stale data)
      localStorage.setItem('tutorId', response.data.tutorId || '');
      localStorage.setItem('studentId', response.data.studentId || '');
      // Store email for role switching re-auth - use the email from login parameter
      localStorage.setItem('user_email', email);
      
      // Debug logging
      console.log('Login - Response tutorId:', response.data.tutorId, 'studentId:', response.data.studentId);
      console.log('Login - Stored tutorId:', localStorage.getItem('tutorId'), 'studentId:', localStorage.getItem('studentId'));
      console.log('Login - Roles:', response.data.roles, 'isTutor:', response.data.isTutor, 'isStudent:', response.data.isStudent);
      console.log('Login - hasBothRoles:', !!response.data.tutorId && !!response.data.studentId);
    }

    return response;
  }

  // Keep for backward compatibility
  async loginTutor(email: string, password: string) {
    return this.login(email, password);
  }

  getRoles(): string[] {
    const rolesStr = localStorage.getItem('user_roles');
    return rolesStr ? JSON.parse(rolesStr) : [];
  }

  isTutor(): boolean {
    return localStorage.getItem('isTutor') === 'true' || !!this.getTutorId();
  }

  isStudent(): boolean {
    return localStorage.getItem('isStudent') === 'true' || !!this.getStudentId();
  }

  hasBothRoles(): boolean {
    // User has both roles if both tutorId and studentId exist (meaning both accounts exist for this email)
    return !!this.getTutorId() && !!this.getStudentId();
  }

  getTutorId(): string | null {
    const id = localStorage.getItem('tutorId');
    return id && id !== 'null' && id !== '' ? id : null;
  }

  getStudentId(): string | null {
    const id = localStorage.getItem('studentId');
    return id && id !== 'null' && id !== '' ? id : null;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Tutor endpoints
  async getTutorDashboard() {
    return this.request('/tutors/dashboard');
  }

  // Student endpoints
  async getStudentDashboard() {
    return this.request('/students/dashboard');
  }

  async getTutorProfile() {
    return this.request('/tutors/profile');
  }

  async getMarketplaceTutors() {
    return this.request('/tutors/marketplace');
  }

  async updateTutorProfile(data: any) {
    return this.request('/tutors/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async applyAsTutor(data: any) {
    return this.request('/tutors/apply', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTutor(id: string) {
    return this.request(`/tutors/${id}`);
  }

  // Courses endpoints
  async getCourses(view?: 'tutor' | 'student') {
    const query = view ? `?view=${view}` : '';
    return this.request(`/courses${query}`);
  }

  async createCourse(data: any) {
    return this.request('/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCourse(id: string, data: any) {
    return this.request(`/courses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteCourse(id: string) {
    return this.request(`/courses/${id}`, {
      method: 'DELETE',
    });
  }

  // Students endpoints
  async getStudents() {
    return this.request('/students');
  }

  async getStudent(id: string) {
    return this.request(`/students/${id}`);
  }

  // Lessons endpoints
  async getLessons() {
    return this.request('/lessons');
  }

  async getUpcomingLessons() {
    return this.request('/lessons/upcoming');
  }

  async createLesson(data: any) {
    return this.request('/lessons', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLesson(id: string, data: any) {
    return this.request(`/lessons/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Reviews endpoints
  async getReviews() {
    return this.request('/reviews');
  }

  async getRating() {
    return this.request('/reviews/rating');
  }

  // Chats endpoints
  async getChats() {
    return this.request('/chats');
  }

  async getOrCreateChat(studentId: string) {
    return this.request(`/chats/with/${studentId}`);
  }

  async getChat(id: string) {
    return this.request(`/chats/${id}`);
  }

  async sendMessage(data: any) {
    return this.request('/chats/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Analytics endpoints
  async getAnalytics() {
    return this.request('/analytics/dashboard');
  }

  // Payments endpoints
  async getPayments() {
    return this.request('/payments');
  }

  async getPaymentSummary() {
    return this.request('/payments/summary');
  }

  async requestPayment(data: any) {
    return this.request('/payments/request', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Referrals endpoints
  async getReferrals() {
    return this.request('/referrals');
  }

  async generateReferralCode() {
    return this.request('/referrals/generate', {
      method: 'POST',
    });
  }

  async getReferralStats() {
    return this.request('/referrals/stats');
  }

  // Requests endpoints
  async createServiceRequest(payload: {
    tutorId: string;
    courseId?: string;
    preferredSchedule: string;
    message?: string;
    serviceType?: string;
    lessonCount?: number;
    lessonDuration?: number;
    totalPrice?: number;
    notes?: string;
  }) {
    return this.request('/requests', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getTutorRequests() {
    return this.request('/requests/tutor');
  }

  async getStudentRequests() {
    return this.request('/requests/student');
  }

  async getAllRequests() {
    return this.request('/requests/admin/all');
  }

  async assignTutorToRequest(requestId: string, tutorId: string) {
    return this.request(`/requests/${requestId}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ tutorId }),
    });
  }

  async initializeRequestPayment(requestId: string) {
    return this.request(`/payments/request/${requestId}/initialize`, {
      method: 'POST',
    });
  }

  async verifyRequestPayment(requestId: string, paymentId: string, paystackReference: string, transactionId: string) {
    return this.request(`/payments/request/${requestId}/verify`, {
      method: 'POST',
      body: JSON.stringify({ paymentId, paystackReference, transactionId }),
    });
  }

  async getRequestPayment(requestId: string) {
    return this.request(`/payments/request/${requestId}`);
  }

  async getStudentRequests() {
    return this.request('/requests/student');
  }

  async acceptRequest(requestId: string) {
    return this.request(`/requests/${requestId}/accept`, {
      method: 'PATCH',
    });
  }

  async declineRequest(requestId: string) {
    return this.request(`/requests/${requestId}/decline`, {
      method: 'PATCH',
    });
  }

  async referRequest(requestId: string, referredToTutorId: string) {
    return this.request(`/requests/${requestId}/refer`, {
      method: 'PATCH',
      body: JSON.stringify({ referredToTutorId }),
    });
  }

  // Notifications endpoints
  async getTutorNotifications() {
    return this.request('/notifications/tutor');
  }

  async getStudentNotifications() {
    return this.request('/notifications/student');
  }

  async getUnreadCount() {
    return this.request('/notifications/unread-count');
  }

  async markNotificationRead(notificationId: string) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
  }

  // Lessons endpoints (enhanced)
  async generateLessonsFromRequest(requestId: string) {
    return this.request(`/lessons/generate-from-request/${requestId}`, {
      method: 'POST',
    });
  }

  async cancelLesson(lessonId: string) {
    return this.request(`/lessons/${lessonId}/cancel`, {
      method: 'PATCH',
    });
  }

  async rescheduleLesson(lessonId: string, newScheduledAt: string) {
    return this.request(`/lessons/${lessonId}/reschedule`, {
      method: 'PATCH',
      body: JSON.stringify({ newScheduledAt }),
    });
  }

  async getCalendar(month?: number, year?: number) {
    const params = new URLSearchParams();
    if (month !== undefined) params.append('month', month.toString());
    if (year !== undefined) params.append('year', year.toString());
    return this.request(`/lessons/calendar?${params.toString()}`);
  }

  // Payments endpoints (enhanced)
  async createPaymentFromSession(lessonId: string) {
    return this.request(`/payments/from-session/${lessonId}`, {
      method: 'POST',
    });
  }

  async confirmPayment(paymentId: string) {
    return this.request(`/payments/${paymentId}/confirm`, {
      method: 'PATCH',
    });
  }

  async declinePayment(paymentId: string, reason?: string) {
    return this.request(`/payments/${paymentId}/decline`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
  }

  async getStudentNotifications() {
    return this.request('/notifications/student');
  }

  // Reviews endpoints
  async createReview(lessonId: string, rating: number, comment?: string) {
    return this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify({ lessonId, rating, comment }),
    });
  }

  // Admin endpoints
  async getAdminDashboardStats() {
    return this.request('/admin/dashboard/stats');
  }

  async getTutorApplications() {
    return this.request('/admin/applications');
  }

  async getPendingTutorApplications() {
    return this.request('/admin/applications/pending');
  }

  async getTutorApplication(id: string) {
    return this.request(`/admin/applications/${id}`);
  }

  async updateTutorApplication(id: string, status: string, reviewNotes?: string) {
    return this.request(`/admin/applications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reviewNotes }),
    });
  }

  async getBursaries() {
    return this.request('/admin/bursaries');
  }

  async getPendingBursaries() {
    return this.request('/admin/bursaries/pending');
  }

  async getCommissionSummary() {
    return this.request('/admin/commissions');
  }

  async getUserByEmail(email: string) {
    return this.request(`/admin/users/${encodeURIComponent(email)}`);
  }

  async resetUserPassword(email: string, newPassword: string) {
    return this.request(`/admin/users/${encodeURIComponent(email)}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    });
  }

  async approveBursary(studentId: string) {
    return this.request(`/admin/bursaries/${studentId}/approve`, {
      method: 'POST',
    });
  }

  async declineBursary(studentId: string) {
    return this.request(`/admin/bursaries/${studentId}/decline`, {
      method: 'POST',
    });
  }

  async downloadTutorCV(tutorId: string) {
    const response = await fetch(`${this.baseUrl}/admin/tutors/${tutorId}/cv`, {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to download CV');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tutor-${tutorId}-cv.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}

export const apiService = new ApiService(API_BASE_URL);

