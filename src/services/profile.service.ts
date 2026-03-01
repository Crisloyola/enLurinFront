import api from './api'

export interface Profile {
  id:           number
  slug:         string
  businessName: string
  category:     string
  district:     string
  description:  string
  phone:        string
  address:      string
  website?:     string
  logoUrl?:     string
  bannerUrl?:   string
  rating?:      number
  reviewCount?: number
  status:       'ACTIVE' | 'INACTIVE' | 'PENDING'
  featured?:    boolean
  createdAt:    string
}

export interface ProfileForm {
  businessName: string
  category:     string
  district:     string
  description:  string
  phone:        string
  address:      string
  website?:     string
}

export const profileService = {
  getAllActive: async (): Promise<Profile[]> => {
    const { data } = await api.get('/profiles/public')
    return data
  },
  getPublic: async (params?: { district?: string; category?: string; q?: string }): Promise<Profile[]> => {
    const { data } = await api.get('/profiles/public', { params })
    return data
  },
  search: async (params: { q?: string; category?: string; district?: string }): Promise<Profile[]> => {
    const { data } = await api.get('/profiles/public', { params })
    return data
  },
  getBySlug: async (slug: string): Promise<Profile> => {
    const { data } = await api.get(`/profiles/public/${slug}`)
    return data
  },
  getMyProfile: async (): Promise<Profile> => {
    const { data } = await api.get('/profiles/me')
    return data
  },
  create: async (form: ProfileForm): Promise<Profile> => {
    const { data } = await api.post('/profiles', form)
    return data
  },
  updateMe: async (form: ProfileForm): Promise<Profile> => {
    const { data } = await api.put('/profiles/me', form)
    return data
  },
  update: async (id: number, form: ProfileForm): Promise<Profile> => {
    const { data } = await api.put(`/profiles/${id}`, form)
    return data
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/profiles/${id}`)
  },
  uploadLogo: async (id: number, file: File): Promise<Profile> => {
    const form = new FormData()
    form.append('file', file)
    const { data } = await api.post(`/profiles/${id}/logo`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },
  uploadBanner: async (file: File): Promise<Profile> => {
    const form = new FormData()
    form.append('file', file)
    const { data } = await api.post('/profiles/me/banner', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },
}