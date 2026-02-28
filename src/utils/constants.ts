export const APP_NAME = 'Enlurin.pe'
export const APP_TAGLINE = 'Directorio de Servicios en Lurín'

export const CATEGORIES = [
  'Restaurantes',
  'Médicos',
  'Abogados',
  'Odontólogos',
  'Contadores',
  'Hoteles',
  'Veterinarias',
  'Delivery',
  'Hogar & Reparaciones',
  'Belleza & Spa',
  'Eventos',
  'Farmacias',
  'Educación',
  'Transporte',
  'Otros',
] as const

export type Category = typeof CATEGORIES[number]

export const NAV_LINKS = [
  { label: 'Inicio',           to: '/'         },
  { label: 'Explorar',         to: '/explorar'  },
  { label: 'Publica Servicio', to: '/publicar'  },
] as const

export const STATS = [
  { value: '50+',    label: 'Empresas Registradas' },
  { value: '1,000+', label: 'Usuarios Activos'      },
  { value: '690+',   label: 'Servicios Publicados'  },
  { value: '5,000+', label: 'Contactos Generados'   },
] as const
