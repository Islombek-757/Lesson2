import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
});

// Add token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  changePassword: (data: any) => api.put('/auth/change-password', data)
};

// Subjects
export const subjectAPI = {
  getAll: () => api.get('/subjects'),
  getOne: (slug: string) => api.get(`/subjects/${slug}`),
  create: (data: any) => api.post('/subjects', data),
  update: (id: string, data: any) => api.put(`/subjects/${id}`, data),
  delete: (id: string) => api.delete(`/subjects/${id}`)
};

// Lessons
export const lessonAPI = {
  getAll: (params?: any) => api.get('/lessons', { params }),
  getOne: (slug: string) => api.get(`/lessons/${slug}`),
  search: (q: string) => api.get(`/lessons/search?q=${q}`),
  create: (data: FormData) => api.post('/lessons', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, data: any) => api.put(`/lessons/${id}`, data),
  delete: (id: string) => api.delete(`/lessons/${id}`),
  bookmark: (id: string) => api.post(`/lessons/${id}/bookmark`),
  complete: (id: string) => api.post(`/lessons/${id}/complete`)
};

// Quiz
export const quizAPI = {
  getAll: (params?: any) => api.get('/quiz', { params }),
  getOne: (id: string) => api.get(`/quiz/${id}`),
  submit: (id: string, data: any) => api.post(`/quiz/${id}/submit`, data),
  create: (data: any) => api.post('/quiz', data),
  update: (id: string, data: any) => api.put(`/quiz/${id}`, data),
  delete: (id: string) => api.delete(`/quiz/${id}`),
  getLeaderboard: (quizId: string) => api.get(`/quiz/${quizId}/leaderboard`),
  getGlobalLeaderboard: () => api.get('/quiz/leaderboard'),
  getMyResults: () => api.get('/quiz/my-results')
};

// AI
export const aiAPI = {
  chat: (data: any) => api.post('/ai/chat', data),
  summarize: (data: any) => api.post('/ai/summarize', data),
  generateQuestions: (data: any) => api.post('/ai/generate-questions', data),
  explain: (data: any) => api.post('/ai/explain', data)
};

// Analytics
export const analyticsAPI = {
  getStudentDashboard: () => api.get('/analytics/student'),
  getTeacherAnalytics: () => api.get('/analytics/teacher'),
  getStudentProgress: (id: string) => api.get(`/analytics/student/${id}`)
};

// Users
export const userAPI = {
  getAll: (params?: any) => api.get('/users', { params }),
  getOne: (id: string) => api.get(`/users/${id}`),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  getLeaderboard: () => api.get('/users/leaderboard')
};

// Notifications
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/mark-all-read')
};
