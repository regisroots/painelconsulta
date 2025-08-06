import axios from 'axios';
import { AuthResponse, Consulta, Log, User } from '../types';

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
  
  banUser: (id: number, motivo: string) =>
    api.post(`/users/${id}/ban`, { motivo }).then(res => res.data),
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

export const consultaAPI = {
  realizarConsulta: (moduloId: number, input: Record<string, any>) =>
    api.post('/consultas', { modulo_id: moduloId, input }).then(res => res.data),
  
  getConsultas: (): Promise<Consulta[]> =>
    api.get('/consultas').then(res => res.data),
  
  getConsultaById: (id: number): Promise<Consulta> =>
    api.get(`/consultas/${id}`).then(res => res.data),
  
  getAllConsultas: (): Promise<Consulta[]> =>
    api.get('/consultas/admin/all').then(res => res.data),
};

export const logAPI = {
  getLogs: (): Promise<Log[]> =>
    api.get('/logs').then(res => res.data),
};

export const profileAPI = {
  getProfile: (): Promise<{ user: User }> =>
    api.get('/profile').then(res => res.data),
  
  updateProfile: (profileData: { nome?: string; email?: string; whatsapp_contato?: string; telegram_contato?: string }) =>
    api.put('/profile', profileData).then(res => res.data),
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
