/**
 * API Service - Axios instance con interceptores
 * Maneja autenticación automática y refresh de tokens
 */

import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Request Interceptor - Agrega token JWT ──────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('proformax_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response Interceptor - Maneja errores globalmente ───────────────────
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status  = error.response?.status
    const message = error.response?.data?.message || 'Error de conexión con el servidor.'

    if (status === 401) {
      localStorage.removeItem('proformax_token')
      localStorage.removeItem('proformax_user')
      window.location.href = '/login'
    }

    return Promise.reject({ status, message, data: error.response?.data })
  }
)

// ── Auth endpoints ──────────────────────────────────────────────────────
export const authAPI = {
  login:  (credentials) => api.post('/auth/login', credentials),
  logout: ()            => api.post('/auth/logout'),
  me:     ()            => api.get('/auth/me'),
}

// ── Usuarios endpoints ──────────────────────────────────────────────────
export const usuariosAPI = {
  getAll:     (params) => api.get('/usuarios', { params }),
  getById:    (id)     => api.get(`/usuarios/${id}`),
  create:     (data)   => api.post('/usuarios', data),
  update:     (id, d)  => api.put(`/usuarios/${id}`, d),
  deactivate: (id)     => api.delete(`/usuarios/${id}`),
}

// ── Productos / Inventario endpoints ────────────────────────────────────
export const productosAPI = {
  getAll:       (params) => api.get('/productos', { params }),
  getById:      (id)     => api.get(`/productos/${id}`),
  getCategorias:()       => api.get('/productos/categorias/all'),
  create:       (data)   => api.post('/productos', data),
  update:       (id, d)  => api.put(`/productos/${id}`, d),
  delete:       (id)     => api.delete(`/productos/${id}`),
}

// ── Proformas endpoints ─────────────────────────────────────────────────
export const proformasAPI = {
  getAll:       (params) => api.get('/proformas', { params }),
  getById:      (id)     => api.get(`/proformas/${id}`),
  create:       (data)   => api.post('/proformas', data),
  update:       (id, d)  => api.put(`/proformas/${id}`, d),
  changeStatus: (id, d)  => api.patch(`/proformas/${id}/estado`, d),
  exportPdf:    (id)     => api.get(`/proformas/${id}/pdf`, { responseType: 'blob' }),
}

// ── Clientes endpoints ──────────────────────────────────────────────────
export const clientesAPI = {
  getAll:  (params) => api.get('/clientes', { params }),
  getById: (id)     => api.get(`/clientes/${id}`),
  create:  (data)   => api.post('/clientes', data),
  update:  (id, d)  => api.put(`/clientes/${id}`, d),
}

// ── Proveedores endpoints ───────────────────────────────────────────────
export const proveedoresAPI = {
  getAll:  (params) => api.get('/proveedores', { params }),
  getById: (id)     => api.get(`/proveedores/${id}`),
  create:  (data)   => api.post('/proveedores', data),
  update:  (id, d)  => api.put(`/proveedores/${id}`, d),
}

// ── Configuración endpoints ─────────────────────────────────────────────
export const configAPI = {
  getAll:      ()          => api.get('/config'),
  update:      (clave, d)  => api.put(`/config/${clave}`, d),
  bulkUpdate:  (config)    => api.post('/config/bulk', { config }),
}

// ── Facturas / Azure AI endpoints ───────────────────────────────────────
export const facturasAPI = {
  getAll:   (params) => api.get('/facturas', { params }),
  getById:  (id)     => api.get(`/facturas/${id}`),
  procesar: (formData) => api.post('/facturas/procesar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
}
