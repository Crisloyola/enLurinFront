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
  // Nuevos campos
  whatsapp?:    string
  latitude?:    number
  longitude?:   number
  schedule?:    string
  instagram?:   string
  facebook?:    string
  youtube?:     string
  tiktok?:      string
  mediaItems?:  MediaItem[]
}
interface MediaItem {
  id:        number
  type:      'PHOTO' | 'VIDEO' | 'REEL'
  url:       string
  thumbnail?: string
  title?:    string
  createdAt: string
}


export interface ProfileForm {
  businessName: string
  category:     string
  district:     string
  description:  string
  phone:        string
  address:      string
  website?:     string
  // Nuevos
  whatsapp?:    string
  latitude?:    number
  longitude?:   number
  schedule?:    string
  instagram?:   string
  facebook?:    string
  youtube?:     string
  tiktok?:      string
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

  // Media
  getMyMedia: async (): Promise<MediaItem[]> => {
    const { data } = await api.get('/profiles/me/media')
    return data
  },
  uploadMedia: async (file: File, type: 'PHOTO' | 'VIDEO' | 'REEL', title?: string): Promise<MediaItem> => {
    const form = new FormData()
    form.append('file', file)
    form.append('type', type)
    if (title) form.append('title', title)
    const { data } = await api.post('/profiles/me/media', form)
    return data
  },
  deleteMedia: async (mediaId: number): Promise<void> => {
    await api.delete(`/profiles/me/media/${mediaId}`)
  },
  getPublicMedia: async (slug: string): Promise<MediaItem[]> => {
    const { data } = await api.get(`/profiles/public/${slug}/media`)
    return data
  },
}