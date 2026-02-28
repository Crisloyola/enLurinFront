import api from './api'
import type { Profile } from './profile.service'

export interface AppUser {
  id:        number
  name:      string
  email:     string
  role:      any
  createdAt: string
}

export const adminService = {

  // GET /admin/profiles?status=PENDING
  getPending: async (): Promise<Profile[]> => {
    const { data } = await api.get('/admin/profiles', {
      params: { status: 'PENDING' }
    })
    return data
  },

  // GET /admin/profiles?status=ACTIVE
  getAllProfiles: async (): Promise<Profile[]> => {
    const { data } = await api.get('/admin/profiles', {
      params: { status: 'ACTIVE' }
    })
    return data
  },

  // GET /admin/profiles?status=INACTIVE
  getSuspended: async (): Promise<Profile[]> => {
    const { data } = await api.get('/admin/profiles', {
      params: { status: 'INACTIVE' }
    })
    return data
  },

  // PUT /admin/profiles/{id}/approve
  approve: async (id: number): Promise<Profile> => {
    const { data } = await api.put(`/admin/profiles/${id}/approve`, {})
    return data
  },

  // PUT /admin/profiles/{id}/suspend
  suspend: async (id: number): Promise<Profile> => {
    const { data } = await api.put(`/admin/profiles/${id}/suspend`, {})
    return data
  },

  // PUT /admin/profiles/{id}/featured
  setFeatured: async (id: number): Promise<Profile> => {
    const { data } = await api.put(`/admin/profiles/${id}/featured`, {})
    return data
  },

  // GET /users
  getUsers: async (): Promise<AppUser[]> => {
    const { data } = await api.get('/users')
    return data
  },

  // DELETE /admin/users/{id}
  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/admin/users/${id}`)
  },
}