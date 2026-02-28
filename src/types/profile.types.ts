export type ProfileStatus = 'PENDING' | 'ACTIVE' | 'INACTIVE'

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
  status:       ProfileStatus
  featured?:    boolean
  createdAt:    string
}

export interface ProfileFormData {
  businessName: string
  category:     string
  district:     string
  description:  string
  phone:        string
  address:      string
  website?:     string
}

export const CATEGORIES = [
  'Restaurantes', 'Médicos', 'Abogados', 'Odontólogos',
  'Contadores', 'Hoteles', 'Veterinarias', 'Delivery',
  'Hogar & Reparaciones', 'Belleza & Spa', 'Eventos', 'Farmacias', 'Otros',
] as const

export type Category = typeof CATEGORIES[number]
