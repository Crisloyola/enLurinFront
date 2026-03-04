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
  whatsapp?:    string
  latitude?:    number
  longitude?:   number
  schedule?:    string
  instagram?:   string
  facebook?:    string
  youtube?:     string
  tiktok?:      string
  paymentMethods?: string
  mediaItems?:  MediaItem[]
}

export interface MediaItem {
  id:         number
  type:       'PHOTO' | 'VIDEO' | 'REEL'
  url:        string
  thumbnail?: string
  title?:     string
  createdAt:  string
}

export interface ProfileForm {
  businessName: string
  category:     string
  district:     string
  description:  string
  phone:        string
  address:      string
  website?:     string | null
  whatsapp?:    string | null
  latitude?:    number
  longitude?:   number
  schedule?:    string | null
  instagram?:   string | null
  facebook?:    string | null
  youtube?:     string | null
  tiktok?:      string | null
  paymentMethods?: string | null
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

  /**
   * Actualiza solo los campos de redes sociales por separado.
   * Útil si el backend tiene un endpoint dedicado o si PUT /profiles/me
   * no persiste estos campos.
   */
  updateSocial: async (id: number, social: {
    instagram?: string | null
    facebook?:  string | null
    youtube?:   string | null
    tiktok?:    string | null
  }): Promise<Profile> => {
    // Intentar PATCH primero (más semántico para updates parciales)
    try {
      const { data } = await api.patch(`/profiles/${id}/social`, social)
      return data
    } catch {
      // Si no existe el endpoint PATCH, reintentar con PUT al perfil completo
      // (el llamador ya habrá hecho updateMe, esto es fallback)
      throw new Error('Endpoint PATCH /social no disponible')
    }
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

  // ── Media ────────────────────────────────────────────────────────────────────

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

  addVideoLink: async (url: string, type: 'VIDEO' | 'REEL', title?: string): Promise<MediaItem> => {
    const { data } = await api.post('/profiles/me/media/link', { url, type, title })
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