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
  rating?:      number
  reviewCount?: number
  status:       'PENDING' | 'ACTIVE' | 'INACTIVE'
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
  // GET /profiles/public
  getPublic: async (): Promise<Profile[]> => {
    const { data } = await api.get('/profiles/public')
    return data
  },
  // GET /profiles/public/search?q=&category=&district=
  search: async (params: { q?: string; category?: string; district?: string }): Promise<Profile[]> => {
    const { data } = await api.get('/profiles/public/search', { params })
    return data
  },
  // GET /profiles/public/{slug}
  getBySlug: async (slug: string): Promise<Profile> => {
    const { data } = await api.get(`/profiles/public/${slug}`)
    return data
  },
  // GET /profiles/me
  getMyProfile: async (): Promise<Profile> => {
    const { data } = await api.get('/profiles/me')
    return data
  },
  // POST /profiles
  create: async (form: ProfileForm): Promise<Profile> => {
    const { data } = await api.post('/profiles', form)
    return data
  },
  // PUT /profiles/me
  updateMe: async (form: ProfileForm): Promise<Profile> => {
    const { data } = await api.put('/profiles/me', form)
    return data
  },
  // PUT /profiles/{id}
  update: async (id: number, form: ProfileForm): Promise<Profile> => {
    const { data } = await api.put(`/profiles/${id}`, form)
    return data
  },
  // DELETE /profiles/{id}
  delete: async (id: number): Promise<void> => {
    await api.delete(`/profiles/${id}`)
  },
  // POST /profiles/{id}/logo
  uploadLogo: async (id: number, file: File): Promise<{ logoUrl: string }> => {
    const form = new FormData()
    form.append('file', file)
    const { data } = await api.post(`/profiles/${id}/logo`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },
}
