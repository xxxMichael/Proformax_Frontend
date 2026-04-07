/**
 * useAuthStore - Estado global de autenticación con Zustand
 * Persiste en localStorage con seguridad básica
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { authAPI } from '../services/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user:           null,
      token:          null,
      isAuthenticated: false,
      isLoading:      false,

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const res = await authAPI.login({ email, password })
          const { token, usuario } = res.data

          localStorage.setItem('proformax_token', token)
          set({ user: usuario, token, isAuthenticated: true, isLoading: false })
          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          return { success: false, message: error.message }
        }
      },

      logout: async () => {
        try { await authAPI.logout() } catch {}
        localStorage.removeItem('proformax_token')
        set({ user: null, token: null, isAuthenticated: false })
      },

      updateUser: (userData) => set({ user: { ...get().user, ...userData } }),
    }),
    {
      name:    'proformax-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user:           state.user,
        token:          state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
