const API_BASE = 'http://127.0.0.1:8000/api';

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
  login: (email) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email }) }),
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
  assignTechnicianToComplaint: (complaintId, techId) => request(`/admin/complaints/${complaintId}/assign`, { method: 'POST', body: JSON.stringify({ technician_id: techId }) }),
  getAdminBookings: () => request('/admin/bookings')
};
