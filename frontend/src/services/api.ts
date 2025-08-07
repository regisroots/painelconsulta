import axios from 'axios';
import { AuthResponse, Consulta, User } from '../types';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, senha: string): Promise<AuthResponse> =>
    api.post('/auth/login', { email, senha }).then(res => res.data),
  
  register: (nome: string, email: string, senha: string, tipo?: string) =>
    api.post('/auth/register', { nome, email, senha, tipo }).then(res => res.data),
};

export const userAPI = {
  getUsers: () =>
    api.get('/users').then(res => res.data),
  
  createUser: (userData: any) =>
    api.post('/users', userData).then(res => res.data),
  
  updateUser: (id: number, userData: any) =>
    api.put(`/users/${id}`, userData).then(res => res.data),
  
  getUserMetrics: (params?: { startDate?: string; endDate?: string; revendedorId?: number }) =>
    api.get('/users/metrics', { params }).then(res => res.data),
  
  banUser: (id: number, motivo: string) =>
    api.post(`/users/${id}/ban`, { motivo }).then(res => res.data),
  
  unbanUser: (id: number) =>
    api.post(`/users/${id}/unban`).then(res => res.data),
  
  addCredits: (id: number, amount: number) =>
    api.post(`/users/${id}/credits/add`, { amount }).then(res => res.data),
  
  removeCredits: (id: number, amount: number) =>
    api.post(`/users/${id}/credits/remove`, { amount }).then(res => res.data),
  
  addDays: (id: number, days: number) =>
    api.post(`/users/${id}/days/add`, { days }).then(res => res.data),
  
  removeDays: (id: number, days: number) =>
    api.post(`/users/${id}/days/remove`, { days }).then(res => res.data),
  
  addHours: (id: number, hours: number) =>
    api.post(`/users/${id}/hours/add`, { hours }).then(res => res.data),
  
  changeUserRole: (id: number, tipo: string) =>
    api.put(`/users/${id}/role`, { tipo }).then(res => res.data),
  
  setModuleLimit: (id: number, modulo_id: number, limite: number) =>
    api.post(`/users/${id}/module-limit`, { modulo_id, limite }).then(res => res.data),
};

export const moduloAPI = {
  getAtivos: () => api.get('/modulos/ativos').then(res => res.data),
  getAll: () => api.get('/modulos').then(res => res.data),
  create: (data: any) => api.post('/modulos', data).then(res => res.data),
  update: (id: number, data: any) => api.put(`/modulos/${id}`, data).then(res => res.data),
  updateTimeout: (id: number, timeout_segundos: number) => api.put(`/modulos/${id}/timeout`, { timeout_segundos }).then(res => res.data),
  updateStatus: (id: number, data: { ativo?: boolean; manutencao?: boolean }) => api.put(`/modulos/${id}/status`, data).then(res => res.data),
  delete: (id: number) => api.delete(`/modulos/${id}`).then(res => res.data),
};


export const logAPI = {
  getLogs: (params?: { tipo?: string; page?: number; limit?: number }) =>
    api.get('/logs', { params }).then(res => res.data),
};

export const consultaAPI = {
  getConsultas: (): Promise<Consulta[]> =>
    api.get('/consultas').then(res => res.data),
  getAllConsultas: (params?: { limit?: number; usuario_id?: number; modulo_id?: number }) =>
    api.get('/consultas/admin/all', { params }).then(res => res.data),
  realizarConsulta: (moduloId: number, input: Record<string, any>) => {
    console.log('=== API REALIZARCONSULTA DEBUG ===');
    console.log('ModuloId:', moduloId);
    console.log('Input:', input);
    console.log('Fazendo POST para /consultas com payload:', { modulo_id: moduloId, input });
    return api.post('/consultas', { modulo_id: moduloId, input }).then(res => {
      console.log('Resposta da API:', res.data);
      return res.data;
    }).catch(err => {
      console.error('Erro na API:', err);
      throw err;
    });
  },
  getConsultaById: (id: number): Promise<Consulta> =>
    api.get(`/consultas/${id}`).then(res => res.data),
};

export const profileAPI = {
  getProfile: (): Promise<{ user: User }> =>
    api.get('/profile').then(res => res.data),
  
  updateProfile: (profileData: { nome?: string; email?: string; whatsapp_contato?: string; telegram_contato?: string }) =>
    api.put('/profile', profileData).then(res => res.data),
  
  changePassword: (senhaAtual: string, novaSenha: string) =>
    api.post('/profile/change-password', { senhaAtual, novaSenha }).then(res => res.data),
};

export const uploadAPI = {
  uploadModuleImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/module-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(res => res.data);
  },
  
  deleteModuleImage: (filename: string) =>
    api.delete(`/upload/module-image/${filename}`).then(res => res.data),
};

export default api;
