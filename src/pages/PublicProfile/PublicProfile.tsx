import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, Star, MapPin, Phone, Globe, Clock,
  Instagram, Facebook, Youtube,
  Play, Image, X, ChevronLeft, ChevronRight,
  MessageCircle, Navigation, Music2
} from 'lucide-react'
import { profileService, type Profile } from '../../services/profile.service'
import { useFetch } from '../../hooks/useFetch'
import Loader from '../../components/common/Loader'

interface MediaItem {
  id: number
  type: 'photo' | 'reel' | 'video' | 'PHOTO' | 'VIDEO' | 'REEL'
  url: string
  thumbnail?: string
  title?: string
}

const GRADIENTS: Record<string, string> = {
  'Restaurantes':         'from-orange-400 to-red-500',
  'Médicos':              'from-blue-400 to-cyan-500',
  'Abogados':             'from-gray-600 to-gray-800',
  'Belleza & Spa':        'from-pink-400 to-rose-500',
  'Odontólogos':          'from-teal-400 to-emerald-500',
  'Contadores':           'from-indigo-400 to-blue-600',
  'Hoteles':              'from-yellow-400 to-orange-400',
  'Veterinarias':         'from-green-400 to-teal-500',
  'Delivery':             'from-orange-300 to-orange-500',
  'Hogar & Reparaciones': 'from-slate-400 to-gray-600',
  'Eventos':              'from-violet-400 to-purple-600',
  'Farmacias':            'from-red-400 to-rose-500',
  'default':              'from-orange-400 to-orange-600',
}

// ── Lightbox ──────────────────────────────────────────────────────────────────
function Lightbox({ items, currentIndex, onClose, onPrev, onNext }: {
  items: MediaItem[]; currentIndex: number
  onClose: () => void; onPrev: () => void; onNext: () => void
}) {
  const item = items[currentIndex]
  if (!item) return null
  const isPhoto = item.type === 'PHOTO' || item.type === 'photo'

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={onClose}>
      <button onClick={onClose}
        className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-10">
        <X size={24} />
      </button>
      <button onClick={e => { e.stopPropagation(); onPrev() }}
        className="absolute left-3 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors">
        <ChevronLeft size={28} />
      </button>
      <div className="max-w-3xl max-h-[85vh] mx-16" onClick={e => e.stopPropagation()}>
        {isPhoto
          ? <img src={item.url} alt={item.title} className="max-h-[80vh] max-w-full object-contain rounded-xl" />
          : <div className="relative rounded-xl overflow-hidden bg-black">
              <img src={item.thumbnail ?? item.url} alt={item.title}
                className="max-h-[80vh] max-w-full object-contain" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Play size={28} className="text-white fill-white ml-1" />
                </div>
              </div>
            </div>
        }
        {item.title && <p className="text-white/60 text-sm text-center mt-3">{item.title}</p>}
      </div>
      <button onClick={e => { e.stopPropagation(); onNext() }}
        className="absolute right-3 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors">
        <ChevronRight size={28} />
      </button>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
        {items.map((_, i) => (
          <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === currentIndex ? 'bg-white' : 'bg-white/30'}`} />
        ))}
      </div>
    </div>
  )
}

// ── Galería ───────────────────────────────────────────────────────────────────
function MediaGallery({ media }: { media: MediaItem[] }) {
  const [filter,   setFilter]   = useState<'all' | 'PHOTO' | 'VIDEO' | 'REEL'>('all')
  const [lightbox, setLightbox] = useState<number | null>(null)

  // Normalizar tipos a mayúsculas
  const normalized = media.map(m => ({
    ...m,
    type: String(m.type).toUpperCase() as 'PHOTO' | 'VIDEO' | 'REEL',
  }))

  const filtered = filter === 'all' ? normalized : normalized.filter(m => m.type === filter)

  const counts = {
    PHOTO: normalized.filter(m => m.type === 'PHOTO').length,
    VIDEO: normalized.filter(m => m.type === 'VIDEO').length,
    REEL:  normalized.filter(m => m.type === 'REEL').length,
  }

  if (media.length === 0) return null

  return (
    <div className="mt-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-900">Galería</h3>
        <div className="flex gap-1">
          {([
            { key: 'all'   as const, label: 'Todos' },
            { key: 'PHOTO' as const, label: `📷 ${counts.PHOTO}` },
            { key: 'VIDEO' as const, label: `▶️ ${counts.VIDEO}` },
            { key: 'REEL'  as const, label: `🎬 ${counts.REEL}` },
          ]).filter(({ key }) => key === 'all' || counts[key as keyof typeof counts] > 0)
            .map(({ key, label }) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`text-xs font-semibold px-2.5 py-1.5 rounded-full transition-all
                ${filter === key ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-0.5 rounded-2xl overflow-hidden">
        {filtered.map((item, idx) => (
          <button key={item.id} onClick={() => setLightbox(idx)}
            className="relative aspect-square overflow-hidden group bg-gray-100">
            <img src={item.thumbnail ?? item.url} alt={item.title ?? ''}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-200" />
            <div className="absolute top-1.5 right-1.5 bg-black/50 rounded-md p-1">
              {item.type === 'PHOTO' ? <Image size={11} className="text-white" /> : <Play size={11} className="text-white" />}
            </div>
          </button>
        ))}
      </div>

      {lightbox !== null && (
        <Lightbox items={filtered} currentIndex={lightbox}
          onClose={() => setLightbox(null)}
          onPrev={() => setLightbox(i => i !== null ? (i - 1 + filtered.length) % filtered.length : null)}
          onNext={() => setLightbox(i => i !== null ? (i + 1) % filtered.length : null)}
        />
      )}
    </div>
  )
}

// ── Mapa ──────────────────────────────────────────────────────────────────────
function LocationMap({ address, district, latitude, longitude }: {
  address?: string; district?: string; latitude?: number; longitude?: number
}) {
  // Si hay coordenadas exactas, usarlas; si no, buscar por texto
  const mapsUrl = latitude && longitude
    ? `https://www.google.com/maps?q=${latitude},${longitude}`
    : `https://www.google.com/maps/search/${encodeURIComponent(`${address ?? ''} ${district ?? ''} Lurín Lima Perú`.trim())}`

  return (
    <div className="mt-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-900">📍 Cómo llegar</h3>
        <a href={mapsUrl} target="_blank" rel="noreferrer"
          className="text-xs text-orange-500 font-semibold hover:underline flex items-center gap-1">
          <Navigation size={12} /> Abrir en Maps
        </a>
      </div>
      <a href={mapsUrl} target="_blank" rel="noreferrer"
        className="block relative h-48 rounded-2xl overflow-hidden border border-gray-100 shadow-sm group">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-lime-50 to-sky-100" />
        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <line x1="0" y1="40%" x2="100%" y2="40%" stroke="#9ca3af" strokeWidth="1"/>
          <line x1="0" y1="65%" x2="100%" y2="65%" stroke="#9ca3af" strokeWidth="1"/>
          <line x1="30%" y1="0" x2="30%" y2="100%" stroke="#9ca3af" strokeWidth="1"/>
          <line x1="70%" y1="0" x2="70%" y2="100%" stroke="#9ca3af" strokeWidth="1"/>
          <line x1="0" y1="52%" x2="100%" y2="52%" stroke="#f59e0b" strokeWidth="2.5"/>
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#f59e0b" strokeWidth="2.5"/>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center drop-shadow-xl">
            <div className="w-11 h-11 bg-red-500 rounded-full border-[3px] border-white shadow-lg flex items-center justify-center">
              <MapPin size={18} className="text-white fill-white" />
            </div>
            <div className="w-3 h-3 bg-red-500 rotate-45 -mt-1.5 rounded-sm shadow" />
          </div>
        </div>
        <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-md flex items-center gap-2">
          <MapPin size={13} className="text-red-500 shrink-0" />
          <span className="text-xs font-semibold text-gray-700 truncate">
            {address || district || 'Lurín, Lima — Perú'}
          </span>
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <span className="bg-white text-gray-800 font-semibold text-xs px-4 py-2 rounded-full shadow-lg">
            Ver en Google Maps →
          </span>
        </div>
      </a>
    </div>
  )
}

// ── Redes sociales ────────────────────────────────────────────────────────────
function SocialButtons({ instagram, facebook, youtube, tiktok }: {
  instagram?: string; facebook?: string; youtube?: string; tiktok?: string
}) {
  // Función para asegurar que el link tenga https://
  const ensureUrl = (url?: string) => {
    if (!url) return null
    const trimmed = url.trim()
    if (!trimmed) return null
    return trimmed.startsWith('http') ? trimmed : `https://${trimmed}`
  }

  const buttons = [
    instagram && {
      href: ensureUrl(instagram)!,
      label: 'Instagram',
      icon: <Instagram size={17} className="text-white" />,
      bg: 'linear-gradient(135deg,#f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)',
    },
    facebook && {
      href: ensureUrl(facebook)!,
      label: 'Facebook',
      icon: <Facebook size={17} className="text-white" />,
      bg: '#1877F2',
    },
    youtube && {
      href: ensureUrl(youtube)!,
      label: 'YouTube',
      icon: <Youtube size={17} className="text-white" />,
      bg: '#FF0000',
    },
    tiktok && {
      href: ensureUrl(tiktok)!,
      label: 'TikTok',
      icon: <Music2 size={17} className="text-white" />,
      bg: '#000000',
    },
  ].filter(Boolean) as { href: string; label: string; icon: React.ReactNode; bg: string }[]

  if (buttons.length === 0) return null

  return (
    <div className="flex gap-2">
      {buttons.map(({ href, label, icon, bg }) => (
        <a key={label} href={href} target="_blank" rel="noreferrer" title={label}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110 hover:shadow-md active:scale-95"
          style={{ background: bg }}>
          {icon}
        </a>
      ))}
    </div>
  )
}

function InfoRow({ icon, text, href }: { icon: React.ReactNode; text: string; href?: string }) {
  const inner = (
    <div className="flex items-start gap-2.5 text-sm text-gray-600 bg-gray-50 rounded-xl p-3">
      <span className="text-orange-500 mt-0.5 shrink-0">{icon}</span>
      <span className="break-all">{text}</span>
    </div>
  )
  return href ? <a href={href} target="_blank" rel="noreferrer" className="block hover:opacity-80 transition-opacity">{inner}</a> : inner
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function PublicProfile() {
  const { slug } = useParams<{ slug: string }>()
  const { data: p, loading: isLoading, error } = useFetch<Profile>(
    () => profileService.getBySlug(slug!), [slug]
  )

  // Cargar media del negocio
  const { data: mediaItems } = useFetch<any[]>(
    () => p ? profileService.getPublicMedia(p.slug) : Promise.resolve([]),
    [p?.slug]
  )

  if (isLoading) return <Loader text="Cargando perfil..." />
  if (error || !p) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <p className="text-5xl mb-4">😕</p>
      <h2 className="font-bold text-xl mb-4 text-gray-900">Perfil no encontrado</h2>
      <Link to="/explorar" className="text-orange-500 font-semibold hover:underline">
        Ver todos los servicios
      </Link>
    </div>
  )

  const gradient = GRADIENTS[p.category] ?? GRADIENTS.default

  // WhatsApp: usar el número real del perfil, limpiando caracteres no numéricos
  const whatsappNum = p.whatsapp
    ? p.whatsapp.replace(/[^0-9]/g, '')
    : p.phone
      ? p.phone.replace(/[^0-9]/g, '')
      : null

  const whatsappMsg = encodeURIComponent(
    `Hola, vi tu perfil en Enlurin.pe y me interesa ${p.businessName}. ¿Podrías darme más información?`
  )
  const whatsappUrl = whatsappNum ? `https://wa.me/${whatsappNum}?text=${whatsappMsg}` : '#'

  // Media: combinar mediaItems del perfil con los cargados por separado
  const allMedia: MediaItem[] = [
    ...(p.mediaItems ?? []),
    ...(mediaItems ?? []),
  ]
    // Deduplicar por id
    .filter((m, idx, arr) => arr.findIndex(x => x.id === m.id) === idx) as MediaItem[]

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Link to="/explorar"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-500 mb-4 transition-colors">
        <ArrowLeft size={16} /> Volver
      </Link>

      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">

        {/* Banner */}
        <div className={`relative h-52 bg-gradient-to-br ${gradient} overflow-hidden`}>
          {p.bannerUrl && (
            <img src={p.bannerUrl} alt="banner" className="absolute inset-0 w-full h-full object-cover" />
          )}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/30 to-transparent" />
        </div>

        <div className="px-5">

          {/* Logo + Redes */}
          <div className="relative -mt-8 flex items-end justify-between mb-3">
            <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-white flex items-center justify-center shrink-0">
              {p.logoUrl
                ? <img src={p.logoUrl} alt={p.businessName} className="w-full h-full object-cover" />
                : <span className="text-3xl font-bold text-orange-400">{p.businessName.charAt(0)}</span>
              }
            </div>
            <div className="pb-1">
              {/* Redes sociales con datos REALES del perfil */}
              <SocialButtons
                instagram={p.instagram}
                facebook={p.facebook}
                youtube={p.youtube}
                tiktok={p.tiktok}
              />
            </div>
          </div>

          {/* Nombre + Rating */}
          <div className="mb-1">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {p.category}
              </span>
              {p.featured && (
                <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  ⭐ Destacado
                </span>
              )}
            </div>
            <h1 className="font-extrabold text-xl text-gray-900">{p.businessName}</h1>
            {p.rating && (
              <div className="flex items-center gap-1 mt-0.5">
                {[1,2,3,4,5].map(n => (
                  <Star key={n} size={13}
                    className={n <= Math.round(p.rating!) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'} />
                ))}
                <span className="font-bold text-sm ml-0.5">{p.rating.toFixed(1)}</span>
                <span className="text-gray-400 text-xs">({p.reviewCount} reseñas)</span>
              </div>
            )}
          </div>

          {/* 3 botones de acción */}
          <div className="grid grid-cols-3 gap-2.5 my-4">
            <a href={p.phone ? `tel:${p.phone}` : '#'}
              className="flex flex-col items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white py-3.5 rounded-2xl transition-all active:scale-95 shadow-sm">
              <Phone size={21} />
              <span className="text-xs font-bold tracking-wide">Llamar</span>
            </a>
            <a href={p.latitude && p.longitude
                ? `https://www.google.com/maps?q=${p.latitude},${p.longitude}`
                : `https://www.google.com/maps/search/${encodeURIComponent(`${p.address ?? ''} ${p.district ?? ''} Lurín Lima`.trim())}`}
              target="_blank" rel="noreferrer"
              className="flex flex-col items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white py-3.5 rounded-2xl transition-all active:scale-95 shadow-sm">
              <MapPin size={21} />
              <span className="text-xs font-bold tracking-wide">Ubicación</span>
            </a>
            {/* WhatsApp con número REAL del perfil */}
            <a href={whatsappUrl} target="_blank" rel="noreferrer"
              className={`flex flex-col items-center gap-1.5 text-white py-3.5 rounded-2xl transition-all active:scale-95 shadow-sm
                ${!whatsappNum ? 'opacity-40 pointer-events-none' : ''}`}
              style={{ backgroundColor: '#25D366' }}>
              <MessageCircle size={21} />
              <span className="text-xs font-bold tracking-wide">WhatsApp</span>
            </a>
          </div>

          {/* Descripción */}
          {p.description && (
            <p className="text-gray-600 text-sm leading-relaxed pt-1 pb-4 border-t border-gray-50">
              {p.description}
            </p>
          )}

          {/* Info de contacto */}
          <div className="space-y-2 mb-2">
            {p.address && (
              <InfoRow icon={<MapPin size={14} />}
                text={`${p.address}${p.district ? ` — ${p.district}` : ''}`} />
            )}
            {p.phone && (
              <InfoRow icon={<Phone size={14} />} text={p.phone}
                href={`tel:${p.phone}`} />
            )}
            {p.whatsapp && (
              <InfoRow icon={<MessageCircle size={14} />}
                text={`WhatsApp: ${p.whatsapp}`}
                href={whatsappUrl} />
            )}
            {p.schedule && (
              <InfoRow icon={<Clock size={14} />} text={p.schedule} />
            )}
          </div>

          {/* Galería con media REAL */}
          <MediaGallery media={allMedia} />

          {/* Mapa con coordenadas reales si existen */}
          <LocationMap
            address={p.address}
            district={p.district}
            latitude={p.latitude}
            longitude={p.longitude}
          />

          {/* Footer */}
          <div className="mt-5 mb-5 pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              Verificado por Enlurin.pe
            </span>
            <button
              onClick={() => {
                if (navigator.share) navigator.share({ title: p.businessName, url: window.location.href })
                else navigator.clipboard.writeText(window.location.href)
              }}
              className="text-orange-500 font-semibold hover:underline">
              Compartir perfil
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
