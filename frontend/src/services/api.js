const RAW_API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
const API_BASE = `${RAW_API_URL.replace(/\/+$/, '')}/api`;

async function request(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(errorData.detail || 'API request failed');
  }
  return res.json();
}

export const api = {
  // Auth
  login: (email, password = '') => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  googleLogin: (googleData) => request('/auth/google', { method: 'POST', body: JSON.stringify(googleData) }),
  getUsers: (role) => request(`/auth/users${role ? `?role=${role}` : ''}`),
  getProfile: (userId) => request(`/auth/profile/${userId}`),

  // Products
  getProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/products${query ? `?${query}` : ''}`);
  },
  getProduct: (id) => request(`/products/${id}`),
  compareProducts: (idsArray) => request(`/products/compare?ids=${idsArray.join(',')}`),
  addReview: (productId, reviewData) => request(`/products/${productId}/reviews`, { method: 'POST', body: JSON.stringify(reviewData) }),

  // Calculator
  calculateEnergy: (data) => request('/calculator/estimate', { method: 'POST', body: JSON.stringify(data) }),

  // Services
  getServices: () => request('/services'),
  checkPincode: (pincode) => request(`/services/check-pincode/${pincode}`),
  bookService: (bookingData) => request('/services/book', { method: 'POST', body: JSON.stringify(bookingData) }),
  getUserBookings: (userId) => request(`/services/user/${userId}`),

  // Complaints
  raiseComplaint: (complaintData) => request('/complaints/raise', { method: 'POST', body: JSON.stringify(complaintData) }),
  trackComplaint: (ticketId) => request(`/complaints/track/${ticketId}`),
  getUserComplaints: (userId) => request(`/complaints/user/${userId}`),
  uploadComplaintPhoto: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/complaints/upload-photo`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Failed to upload problem photo');
    return res.json();
  },

  // AMC
  getAMCPlans: () => request('/amc/plans'),
  checkAMCEligibility: (data) => request('/amc/check-eligibility', { method: 'POST', body: JSON.stringify(data) }),
  subscribeAMC: (data) => request('/amc/subscribe', { method: 'POST', body: JSON.stringify(data) }),
  getUserAMC: (userId) => request(`/amc/user/${userId}`),

  // Orders
  validateCoupon: (code, total) => request(`/orders/validate-coupon?coupon_code=${code}&total_amount=${total}`, { method: 'POST' }),
  checkout: (orderData) => request('/orders/checkout', { method: 'POST', body: JSON.stringify(orderData) }),
  getUserOrders: (userId) => request(`/orders/user/${userId}`),
  trackOrder: (orderNum) => request(`/orders/track/${orderNum}`),

  // Technician
  getTechnicianJobs: (techId) => request(`/technician/jobs/${techId}`),
  updateTechnicianJob: (jobId, data) => request(`/technician/jobs/${jobId}/update`, { method: 'POST', body: JSON.stringify(data) }),

  // Chatbot
  queryChatbot: (message, userId = null) => request('/chatbot/query', { method: 'POST', body: JSON.stringify({ message, user_id: userId }) }),

  // Admin
  getAdminAnalytics: () => request('/admin/analytics'),
  getAdminComplaints: () => request('/admin/complaints'),
  getAdminTechnicians: () => request('/admin/technicians'),
  acceptComplaint: (complaintId) => request(`/admin/complaints/${complaintId}/accept`, { method: 'POST' }),
  rejectComplaint: (complaintId) => request(`/admin/complaints/${complaintId}/reject`, { method: 'POST' }),
  assignTechnicianToComplaint: (complaintId, techId) => request(`/admin/complaints/${complaintId}/assign`, { method: 'POST', body: JSON.stringify({ technician_id: techId }) }),
  updateComplaintStatus: (complaintId, status) => request(`/admin/complaints/${complaintId}/status`, { method: 'POST', body: JSON.stringify({ status }) }),
  getAdminBookings: () => request('/admin/bookings'),
  acceptBooking: (bookingId) => request(`/admin/bookings/${bookingId}/accept`, { method: 'POST' }),
  rejectBooking: (bookingId) => request(`/admin/bookings/${bookingId}/reject`, { method: 'POST' }),
  assignTechnicianToBooking: (bookingId, techId) => request(`/admin/bookings/${bookingId}/assign`, { method: 'POST', body: JSON.stringify({ technician_id: techId }) }),
  getAdminProducts: () => request('/admin/products'),
  createProduct: (productData) => request('/admin/products', { method: 'POST', body: JSON.stringify(productData) }),
  updateProduct: (id, productData) => request(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(productData) }),
  deleteProduct: (id) => request(`/admin/products/${id}`, { method: 'DELETE' }),
  uploadProductImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/admin/upload-image`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Failed to upload image');
    return res.json();
  },

  // Admin AC Services Management
  getAdminServices: () => request('/admin/services'),
  createService: (serviceData) => request('/admin/services', { method: 'POST', body: JSON.stringify(serviceData) }),
  updateService: (id, serviceData) => request(`/admin/services/${id}`, { method: 'PUT', body: JSON.stringify(serviceData) }),
  deleteService: (id) => request(`/admin/services/${id}`, { method: 'DELETE' }),

  // Admin AMC Plans Management
  getAdminAMCPlans: () => request('/admin/amc-plans'),
  createAMCPlan: (planData) => request('/admin/amc-plans', { method: 'POST', body: JSON.stringify(planData) }),
  updateAMCPlan: (id, planData) => request(`/admin/amc-plans/${id}`, { method: 'PUT', body: JSON.stringify(planData) }),
  deleteAMCPlan: (id) => request(`/admin/amc-plans/${id}`, { method: 'DELETE' }),

  // Notifications
  getNotifications: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/notifications${query ? `?${query}` : ''}`);
  },
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'POST' }),
  markAllNotificationsRead: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/notifications/mark-all-read${query ? `?${query}` : ''}`, { method: 'POST' });
  }
};
