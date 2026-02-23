const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8081";

function buildQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }
    query.append(key, value);
  });
  const text = query.toString();
  return text ? `?${text}` : "";
}

function uniqueId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

async function request(path, options = {}) {
  const token = localStorage.getItem("tutors_access_token") || "";
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const message =
      data?.message || data?.error || `Request failed (${response.status}) for ${path}`;
    throw new Error(message);
  }

  return data;
}

export const api = {
  baseUrl: API_BASE_URL,

  uniqueId,

  async login(email, userType) {
    return request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, userType }),
    });
  },

  async registerUser({ email, userType, uniqueId: id, bursaryName }) {
    const unique = id || uniqueId("UP");
    const registerResponse = await request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, userType, uniqueId: unique }),
    });

    if (bursaryName) {
      await request(`/user-profiles/${encodeURIComponent(email)}`, {
        method: "PATCH",
        body: JSON.stringify({ bursaryName }),
      });
      registerResponse.user = {
        ...registerResponse.user,
        bursaryName,
      };
    }

    return registerResponse;
  },

  async getProfile() {
    return request("/auth/profile", { method: "GET" });
  },

  async createTutorRequest(payload) {
    return request("/tutor-requests", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async submitRequestWithTutor(payload) {
    return request("/admin/submit-request", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getTutorRequests(params = {}) {
    return request(`/tutor-requests${buildQuery(params)}`);
  },

  async getTutorRequestsByStudent(studentEmail) {
    return request(`/tutor-requests/student/${encodeURIComponent(studentEmail)}`);
  },

  async getTutorRequestsByStatus(status) {
    return request(`/tutor-requests/status/${status}`);
  },

  async patchTutorRequest(uniqueId, payload) {
    return request(`/tutor-requests/${uniqueId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  async approveTutorRequest(uniqueId) {
    return request(`/tutor-requests/${uniqueId}/approve`, {
      method: "PATCH",
    });
  },

  async rejectTutorRequest(uniqueId, reason) {
    return request(`/tutor-requests/${uniqueId}/reject`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    });
  },

  async findTutors(params = {}) {
    return request(`/admin/find-tutor${buildQuery(params)}`);
  },

  async getUsers(params = {}) {
    return request(`/user-profiles${buildQuery(params)}`);
  },

  async getUsersByType(type) {
    return request(`/user-profiles/by-type/${type}`);
  },

  async getUserByEmail(email) {
    return request(`/user-profiles/${encodeURIComponent(email)}`);
  },

  async updateUserProfile(email, payload) {
    return request(`/user-profiles/${encodeURIComponent(email)}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  async createUserProfile(payload) {
    return request("/user-profiles", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getCourses(params = {}) {
    return request(`/courses${buildQuery(params)}`);
  },

  async createCourse(payload) {
    return request("/courses", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getSchoolNames(params = {}) {
    return request(`/school-names${buildQuery(params)}`);
  },

  async getTertiaryNames(params = {}) {
    return request(`/tertiary-names${buildQuery(params)}`);
  },

  async getStudentLessons(params = {}) {
    return request(`/student-lessons${buildQuery(params)}`);
  },

  async createStudentLesson(payload) {
    return request("/student-lessons", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async updateStudentLesson(uniqueId, payload) {
    return request(`/student-lessons/${uniqueId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async getTutorSessionOrders(params = {}) {
    return request(`/tutor-sessions-orders${buildQuery(params)}`);
  },

  async getTutorStudentHours(params = {}) {
    return request(`/tutor-student-hours${buildQuery(params)}`);
  },

  async getInvoices(params = {}) {
    return request(`/invoices${buildQuery(params)}`);
  },

  async createInvoice(payload) {
    return request("/invoices", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async markInvoicePaid(uniqueId, paymentMethod) {
    return request(`/invoices/${uniqueId}/mark-paid`, {
      method: "PATCH",
      body: JSON.stringify({ paymentMethod }),
    });
  },

  async verifyPaystackPayment(payload) {
    return request("/payments/paystack/verify", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getTutorJobNotifications(params = {}) {
    return request(`/tutor-job-notifications${buildQuery(params)}`);
  },

  async getNotifications(bursaryName) {
    return request(`/notifications${buildQuery({ bursaryName })}`);
  },

  async getAnalyticsDashboard() {
    return request("/analytics/dashboard");
  },

  async getComprehensiveAnalytics() {
    return request("/analytics/comprehensive-dashboard");
  },

  async getTutorRequestStats() {
    return request("/tutor-requests/stats");
  },

  async getInvoiceStats() {
    return request("/invoices/stats");
  },
};

export { API_BASE_URL };
