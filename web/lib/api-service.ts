const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://one23tutors-dashboard-backend.onrender.com'
    : 'http://localhost:8081');

class ApiService {
  private currentBursary: string | null = null;

  // Set the current bursary for all API calls
  setCurrentBursary(bursary: string | null) {
    this.currentBursary = bursary;
  }

  // Helper method to build bursary-specific endpoints
  private buildBursaryEndpoint(baseEndpoint: string, method?: string): string {
    if (this.currentBursary) {
      // Use bursary-specific endpoints when available (only for GET requests)
      if (baseEndpoint.includes('/tutor-requests') && !baseEndpoint.includes('/bursary/') && method === 'GET') {
        return `/tutor-requests/bursary/${encodeURIComponent(this.currentBursary)}`;
      }
      // Only use bursary-specific endpoint for GET requests to bursary-students, not POST
      if (baseEndpoint.includes('/bursary-students') && !baseEndpoint.includes('/bursary/') && method === 'GET') {
        return `/bursary-students/bursary/${encodeURIComponent(this.currentBursary)}`;
      }
      if (baseEndpoint.includes('/student-progress') && !baseEndpoint.includes('/bursary/') && method === 'GET') {
        return `/student-progress/bursary/${encodeURIComponent(this.currentBursary)}`;
      }
      if (baseEndpoint.includes('/invoices') && !baseEndpoint.includes('/bursary/') && method === 'GET') {
        return `/invoices/bursary/${encodeURIComponent(this.currentBursary)}`;
      }
      if (baseEndpoint.includes('/lessons') && !baseEndpoint.includes('/bursary/') && method === 'GET') {
        return `/lessons/bursary/${encodeURIComponent(this.currentBursary)}`;
      }
      
      // Skip adding bursaryName parameter for courses since they are not bursary-specific
      if (baseEndpoint.includes('/courses')) {
        return baseEndpoint;
      }
      
      // Skip adding bursaryName parameter for user profile uploads
      if (baseEndpoint.includes('/user-profiles/') && baseEndpoint.includes('/upload-image')) {
        return baseEndpoint;
      }
      
      // For analytics and other endpoints, add as query parameter (only for GET requests)
      if (method === 'GET') {
        const separator = baseEndpoint.includes('?') ? '&' : '?';
        return `${baseEndpoint}${separator}bursaryName=${encodeURIComponent(this.currentBursary)}`;
      }
    }
    return baseEndpoint;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const bursaryEndpoint = this.buildBursaryEndpoint(endpoint, options.method);
    const url = `${API_BASE_URL}${bursaryEndpoint}`;
    
    try {
      const headers: Record<string, string> = {};
      
      // Only set Content-Type for JSON requests, not for FormData
      if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
      }
      
      const response = await fetch(url, {
        headers: {
          ...headers,
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        let errorMessage = `API request failed: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If we can't parse the error response, use the default message
        }
        
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to the server. Please check your internet connection and try again.');
      }
      throw error;
    }
  }

  // Analytics endpoints
  async getDashboardAnalytics(bursaryName?: string) {
    const params = bursaryName ? `?bursaryName=${encodeURIComponent(bursaryName)}` : '';
    return this.request(`/analytics/dashboard${params}`);
  }

  async getComprehensiveDashboardStats(bursaryName?: string) {
    const params = bursaryName ? `?bursaryName=${encodeURIComponent(bursaryName)}` : '';
    return this.request(`/analytics/comprehensive-dashboard${params}`);
  }

  async getCourseAnalytics(courseId: string) {
    return this.request(`/analytics/course?courseId=${encodeURIComponent(courseId)}`);
  }

  async getStudentProgressAnalytics(studentEmail: string) {
    return this.request(`/analytics/student-progress?studentEmail=${encodeURIComponent(studentEmail)}`);
  }

  // Courses endpoints
  async getCourses(page = 1, limit = 10, search = '') {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search,
    });
    return this.request(`/courses?${params}`);
  }

  async getCourse(uniqueId: string) {
    return this.request(`/courses/${uniqueId}`);
  }

  async createCourse(courseData: any) {
    return this.request('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  }

  async updateCourse(uniqueId: string, courseData: any) {
    return this.request(`/courses/${uniqueId}`, {
      method: 'PUT',
      body: JSON.stringify(courseData),
    });
  }

  async deleteCourse(uniqueId: string) {
    return this.request(`/courses/${uniqueId}`, {
      method: 'DELETE',
    });
  }

  // Bursary Students endpoints
  async getBursaryStudents(page = 1, limit = 10, search = '') {
    console.log('API Service: Getting bursary students, currentBursary:', this.currentBursary)
    // If we have a current bursary, use the bursary-specific endpoint
    if (this.currentBursary) {
      const endpoint = `/bursary-students/bursary/${encodeURIComponent(this.currentBursary)}`;
      console.log('API Service: Using bursary-specific endpoint:', endpoint)
      const response = await this.request(endpoint);
      console.log('API Service: Bursary-specific response:', response)
      return {
        data: response,
        total: response.length
      };
    }
    
    // Otherwise use the regular paginated endpoint
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search,
    });
    const endpoint = `/bursary-students?${params}`;
    console.log('API Service: Using general endpoint:', endpoint)
    const response = await this.request(endpoint);
    console.log('API Service: General response:', response)
    return response;
  }

  async getBursaryStudent(uniqueId: string) {
    return this.request(`/bursary-students/${uniqueId}`);
  }

  async createBursaryStudent(studentData: any) {
    console.log('API Service: Creating student with data:', studentData)
    console.log('API Service: Current bursary:', this.currentBursary)
    const result = await this.request('/bursary-students', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
    console.log('API Service: Student creation response:', result)
    return result;
  }

  async updateBursaryStudent(uniqueId: string, studentData: any) {
    return this.request(`/bursary-students/${uniqueId}`, {
      method: 'PUT',
      body: JSON.stringify(studentData),
    });
  }

  async deleteBursaryStudent(uniqueId: string) {
    return this.request(`/bursary-students/${uniqueId}`, {
      method: 'DELETE',
    });
  }

  async disableBursaryStudent(uniqueId: string) {
    return this.request(`/bursary-students/${uniqueId}/disable`, {
      method: 'PATCH',
    });
  }

  async enableBursaryStudent(uniqueId: string) {
    return this.request(`/bursary-students/${uniqueId}/enable`, {
      method: 'PATCH',
    });
  }

  // Bulk upload endpoints
  async bulkUploadStudentsFromFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.request('/bursary-students/bulk-upload/file', {
      method: 'POST',
      headers: {
        // Don't set Content-Type, let the browser set it with boundary for multipart/form-data
      },
      body: formData,
    });
  }

  async bulkUploadStudentsFromData(students: any[]) {
    return this.request('/bursary-students/bulk-upload/data', {
      method: 'POST',
      body: JSON.stringify({ students }),
    });
  }

  // Tutor Requests endpoints
  async getTutorRequests(page = 1, limit = 10, search = '') {
    // If we have a current bursary, use the bursary-specific endpoint
    if (this.currentBursary) {
      const response = await this.request(`/tutor-requests/bursary/${encodeURIComponent(this.currentBursary)}`);
      // The bursary endpoint returns an array directly, so we need to format it like the paginated response
      return {
        data: response,
        total: response.length
      };
    }
    
    // Otherwise use the regular paginated endpoint
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search,
    });
    return this.request(`/tutor-requests?${params}`);
  }

  async getTutorRequest(uniqueId: string) {
    return this.request(`/tutor-requests/${uniqueId}`);
  }

  async createTutorRequest(requestData: any) {
    return this.request('/tutor-requests', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }

  async updateTutorRequest(uniqueId: string, requestData: any) {
    return this.request(`/tutor-requests/${uniqueId}`, {
      method: 'PATCH',
      body: JSON.stringify(requestData),
    });
  }

  async deleteTutorRequest(uniqueId: string) {
    return this.request(`/tutor-requests/${uniqueId}`, {
      method: 'DELETE',
    });
  }

  async approveTutorRequest(uniqueId: string) {
    return this.request(`/tutor-requests/${uniqueId}/approve`, {
      method: 'PATCH',
    });
  }

  async rejectTutorRequest(uniqueId: string) {
    return this.request(`/tutor-requests/${uniqueId}/reject`, {
      method: 'PATCH',
    });
  }

  // Student Lessons endpoints
  async getStudentLessons(page = 1, limit = 10, search = '') {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search,
    });
    return this.request(`/student-lessons?${params}`);
  }

  async getStudentLesson(uniqueId: string) {
    return this.request(`/student-lessons/${uniqueId}`);
  }

  async createStudentLesson(lessonData: any) {
    return this.request('/student-lessons', {
      method: 'POST',
      body: JSON.stringify(lessonData),
    });
  }

  async updateStudentLesson(uniqueId: string, lessonData: any) {
    return this.request(`/student-lessons/${uniqueId}`, {
      method: 'PUT',
      body: JSON.stringify(lessonData),
    });
  }

  async deleteStudentLesson(uniqueId: string) {
    return this.request(`/student-lessons/${uniqueId}`, {
      method: 'DELETE',
    });
  }

  // Invoices endpoints
  async getInvoices(page = 1, limit = 10, search = '') {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search,
    });
    return this.request(`/invoices?${params}`);
  }

  async getInvoice(uniqueId: string) {
    return this.request(`/invoices/${uniqueId}`);
  }

  async createInvoice(invoiceData: any) {
    return this.request('/invoices', {
      method: 'POST',
      body: JSON.stringify(invoiceData),
    });
  }

  async updateInvoice(uniqueId: string, invoiceData: any) {
    return this.request(`/invoices/${uniqueId}`, {
      method: 'PATCH',
      body: JSON.stringify(invoiceData),
    });
  }

  async deleteInvoice(uniqueId: string) {
    return this.request(`/invoices/${uniqueId}`, {
      method: 'DELETE',
    });
  }

  async markInvoiceAsPaid(uniqueId: string) {
    return this.request(`/invoices/${uniqueId}/mark-paid`, {
      method: 'PATCH',
    });
  }

  // Lessons endpoints
  async getLessons(page = 1, limit = 10, search = '') {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search,
    });
    return this.request(`/lessons?${params}`);
  }

  async getLesson(uniqueId: string) {
    return this.request(`/lessons/${uniqueId}`);
  }

  async createLesson(lessonData: any) {
    return this.request('/lessons', {
      method: 'POST',
      body: JSON.stringify(lessonData),
    });
  }

  async updateLesson(uniqueId: string, lessonData: any) {
    return this.request(`/lessons/${uniqueId}`, {
      method: 'PATCH',
      body: JSON.stringify(lessonData),
    });
  }

  async deleteLesson(uniqueId: string) {
    return this.request(`/lessons/${uniqueId}`, {
      method: 'DELETE',
    });
  }

  // Student Progress endpoints
  async getStudentProgress(page = 1, limit = 10, search = '') {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search,
    });
    return this.request(`/student-progress?${params}`);
  }

  async getStudentProgressByEmail(studentEmail: string) {
    return this.request(`/student-progress/student/${encodeURIComponent(studentEmail)}`);
  }

  async createStudentProgress(progressData: any) {
    return this.request('/student-progress', {
      method: 'POST',
      body: JSON.stringify(progressData),
    });
  }

  async updateStudentProgress(uniqueId: string, progressData: any) {
    return this.request(`/student-progress/${uniqueId}`, {
      method: 'PATCH',
      body: JSON.stringify(progressData),
    });
  }

  async deleteStudentProgress(uniqueId: string) {
    return this.request(`/student-progress/${uniqueId}`, {
      method: 'DELETE',
    });
  }

  async updateProgressOnActivity(activityData: {
    studentEmail: string;
    activityType: 'assignment' | 'exam' | 'attendance' | 'participation';
    score?: number;
  }) {
    return this.request('/student-progress/activity', {
      method: 'POST',
      body: JSON.stringify(activityData),
    });
  }

  async createOrUpdateProgress(progressData: {
    studentEmail: string;
    studentName: string;
    courseName: string;
    bursaryName: string;
  }) {
    return this.request('/student-progress/create-or-update', {
      method: 'POST',
      body: JSON.stringify(progressData),
    });
  }

  // Audit endpoints
  async getRecentActivities(bursaryName?: string, userRole?: string, limit = 50, offset = 0) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    
    if (bursaryName) params.append('bursaryName', bursaryName);
    if (userRole) params.append('userRole', userRole);
    
    return this.request(`/audit/recent-activities?${params}`);
  }

  async getStudentActivities(studentEmail: string, limit = 20, offset = 0) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    
    return this.request(`/audit/student/${encodeURIComponent(studentEmail)}?${params}`);
  }

  async getActivitiesByAction(action: string, bursaryName?: string, limit = 20, offset = 0) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    
    if (bursaryName) params.append('bursaryName', bursaryName);
    
    return this.request(`/audit/action/${action}?${params}`);
  }

  async getAuditStats(bursaryName?: string) {
    const params = new URLSearchParams();
    if (bursaryName) params.append('bursaryName', bursaryName);
    
    return this.request(`/audit/stats?${params}`);
  }

  // Bursary Profile Management
  async getBursaryProfile(uniqueId: string) {
    return this.request(`/bursary-names/${uniqueId}`);
  }

  async updateBursaryProfile(uniqueId: string, profileData: any) {
    return this.request(`/bursary-names/${uniqueId}`, {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
  }

  async createBursaryProfile(profileData: any) {
    return this.request('/bursary-names', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  }

  async getBursaryStats(uniqueId: string) {
    return this.request(`/bursary-names/${uniqueId}/stats`);
  }

  // User Profile endpoints
  async getUserProfile(email: string) {
    return this.request(`/user-profiles/${encodeURIComponent(email)}`);
  }

  async createUserProfile(profileData: any) {
    return this.request('/user-profiles', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  }

  async updateUserProfile(email: string, profileData: any) {
    return this.request(`/user-profiles/${encodeURIComponent(email)}`, {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
  }

  async getBursaryAdminsByBursary(bursaryName: string) {
    return this.request(`/user-profiles/bursary-admins/${encodeURIComponent(bursaryName)}`);
  }

  // Upload profile image
  async uploadProfileImage(email: string, file: File): Promise<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('image', file);

    return await this.request(`/user-profiles/${encodeURIComponent(email)}/upload-image`, {
      method: 'POST',
      body: formData,
    });
  }
}

export const apiService = new ApiService();
