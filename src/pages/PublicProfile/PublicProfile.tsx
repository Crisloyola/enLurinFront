import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, Star, MapPin, Phone,
  Instagram, Facebook, Youtube, Music2,
  Play, Image as ImageIcon, X, ChevronLeft, ChevronRight,
  MessageCircle, Navigation, Clock
} from 'lucide-react'
import { profileService, type Profile } from '../../services/profile.service'
import { useFetch } from '../../hooks/useFetch'
import Loader from '../../components/common/Loader'

interface MediaItem {
  id: number
  type: string
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

function ensureUrl(url?: string): string | null {
  if (!url?.trim()) return null
  return url.startsWith('http') ? url : `https://${url}`
}

function getYoutubeThumbnail(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return m ? `https://img.youtube.com/vi/${m[1]}/mqdefault.jpg` : null
}

function getVideoEmbedUrl(url: string): string | null {
  const ytWatch = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/)
  if (ytWatch) return `https://www.youtube.com/embed/${ytWatch[1]}?autoplay=1`
  const ytShort = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/)
  if (ytShort) return `https://www.youtube.com/embed/${ytShort[1]}?autoplay=1`
  const ytBe = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/)
  if (ytBe) return `https://www.youtube.com/embed/${ytBe[1]}?autoplay=1`
  return null
}

function getVideoPlatform(url: string): string {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube'
  if (url.includes('tiktok.com'))                              return 'TikTok'
  if (url.includes('facebook.com') || url.includes('fb.watch')) return 'Facebook'
  if (url.includes('instagram.com'))                           return 'Instagram'
  return 'Video'
}

function getVideoThumbnail(item: MediaItem): string {
  if (item.thumbnail) return item.thumbnail
  const yt = getYoutubeThumbnail(item.url)
  if (yt) return yt
  return ''
}

function VideoModal({ item, onClose }: { item: MediaItem; onClose: () => void }) {
  const embedUrl = getVideoEmbedUrl(item.url)
  const platform = getVideoPlatform(item.url)

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4" onClick={onClose}>
      <button onClick={onClose}
        className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 z-10">
        <X size={24} />
      </button>
      <div className="w-full max-w-3xl" onClick={e => e.stopPropagation()}>
        {embedUrl ? (
          <div className="relative w-full rounded-2xl overflow-hidden bg-black" style={{ paddingBottom: '56.25%' }}>
            <iframe
              src={embedUrl}
              className="absolute inset-0 w-full h-full"
              allow="autoplay; fullscreen"
              allowFullScreen
              title={item.title ?? 'Video'}
            />
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center">
            <Play size={40} className="mx-auto text-orange-500 mb-4" />
            <p className="font-bold text-gray-900 mb-2">{item.title ?? 'Ver video'}</p>
            <p className="text-gray-500 text-sm mb-4">
              Este video de {platform} se abrirá en una nueva pestaña.
            </p>
            <a href={item.url} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-full transition-colors">
              <Play size={16} /> Ver en {platform}
            </a>
          </div>
        )}
        {item.title && embedUrl && (
          <p className="text-white/60 text-sm text-center mt-3">{item.title}</p>
        )}
      </div>
    </div>
  )
}

function PhotoLightbox({ photos, index, onClose, onPrev, onNext }: {
  photos: MediaItem[]; index: number
  onClose: () => void; onPrev: () => void; onNext: () => void
}) {
  const item = photos[index]
  if (!item) return null
  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 z-10">
        <X size={24} />
      </button>
      <button onClick={e => { e.stopPropagation(); onPrev() }}
        className="absolute left-3 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10">
        <ChevronLeft size={28} />
      </button>
      <div className="max-w-3xl max-h-[85vh] mx-16" onClick={e => e.stopPropagation()}>
        <img src={item.url} alt={item.title ?? ''} className="max-h-[80vh] max-w-full object-contain rounded-xl" />
        {item.title && <p className="text-white/60 text-sm text-center mt-3">{item.title}</p>}
      </div>
      <button onClick={e => { e.stopPropagation(); onNext() }}
        className="absolute right-3 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10">
        <ChevronRight size={28} />
      </button>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
        {photos.map((_, i) => (
          <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === index ? 'bg-white' : 'bg-white/30'}`} />
        ))}
      </div>
    </div>
  )
}

function MediaGallery({ media }: { media: MediaItem[] }) {
  const [tab,        setTab]        = useState<'PHOTO' | 'REEL' | 'VIDEO'>('PHOTO')
  const [photoIndex, setPhotoIndex] = useState<number | null>(null)
  const [videoItem,  setVideoItem]  = useState<MediaItem | null>(null)

  const normalized = media.map(m => ({ ...m, type: String(m.type).toUpperCase() }))
  const photos  = normalized.filter(m => m.type === 'PHOTO')
  const reels   = normalized.filter(m => m.type === 'REEL')
  const videos  = normalized.filter(m => m.type === 'VIDEO')

  const tabs = [
    photos.length  > 0 && { key: 'PHOTO' as const, label: 'Fotos',  count: photos.length,  icon: <ImageIcon size={13} /> },
    reels.length   > 0 && { key: 'REEL'  as const, label: 'Reels',  count: reels.length,   icon: <Play size={13} /> },
    videos.length  > 0 && { key: 'VIDEO' as const, label: 'Videos', count: videos.length,  icon: <Play size={13} /> },
  ].filter(Boolean) as { key: 'PHOTO' | 'REEL' | 'VIDEO'; label: string; count: number; icon: React.ReactNode }[]

  if (tabs.length === 0) return null

  const activeTab = tabs.find(t => t.key === tab) ? tab : tabs[0].key
  const currentItems = activeTab === 'PHOTO' ? photos : activeTab === 'REEL' ? reels : videos

  return (
    <div className="mt-1">
      <div className="flex gap-1 mb-4">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg transition-all
              ${activeTab === t.key
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {t.icon} {t.label}
            <span className={`ml-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full
              ${activeTab === t.key ? 'bg-white/30' : 'bg-gray-200 text-gray-500'}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {activeTab === 'PHOTO' && (
        <div className="grid grid-cols-3 gap-1 rounded-xl overflow-hidden">
          {photos.map((item, idx) => (
            <button key={item.id} onClick={() => setPhotoIndex(idx)}
              className="relative aspect-square overflow-hidden group bg-gray-100">
              <img src={item.url} alt={item.title ?? ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            </button>
          ))}
        </div>
      )}

      {(activeTab === 'REEL' || activeTab === 'VIDEO') && (
        <div className="grid grid-cols-3 gap-2">
          {currentItems.map(item => {
            const thumb    = getVideoThumbnail(item)
            const platform = getVideoPlatform(item.url)
            return (
              <button key={item.id} onClick={() => setVideoItem(item)}
                className="relative aspect-[9/16] rounded-xl overflow-hidden group bg-gray-900 flex flex-col">
                {thumb ? (
                  <img src={thumb} alt={item.title ?? ''} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900" />
                )}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play size={20} className="text-white fill-white ml-0.5" />
                  </div>
                </div>
                <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                  {platform}
                </div>
                {item.title && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <p className="text-white text-[10px] font-medium line-clamp-2 text-left">{item.title}</p>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}

      {photoIndex !== null && (
        <PhotoLightbox photos={photos} index={photoIndex} onClose={() => setPhotoIndex(null)}
          onPrev={() => setPhotoIndex(i => i !== null ? (i - 1 + photos.length) % photos.length : null)}
          onNext={() => setPhotoIndex(i => i !== null ? (i + 1) % photos.length : null)}
        />
      )}
      {videoItem && <VideoModal item={videoItem} onClose={() => setVideoItem(null)} />}
    </div>
  )
}

function EmbeddedMap({ address, district, latitude, longitude }: {
  address?: string; district?: string; latitude?: number; longitude?: number
}) {
  const query = latitude && longitude
    ? `${latitude},${longitude}`
    : encodeURIComponent(`${address ?? ''} ${district ?? ''} Lurín Lima Perú`.trim())

  const embedSrc = `https://maps.google.com/maps?q=${query}&output=embed&z=16`
  const mapsUrl  = latitude && longitude
    ? `https://www.google.com/maps?q=${latitude},${longitude}`
    : `https://www.google.com/maps/search/${encodeURIComponent(`${address ?? ''} ${district ?? ''} Lurín Lima Perú`.trim())}`

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <MapPin size={16} className="text-orange-500" />
          ENCUÉNTRANOS EN:
        </h3>
        <a href={mapsUrl} target="_blank" rel="noreferrer"
          className="text-xs text-orange-500 font-semibold hover:underline flex items-center gap-1">
          <Navigation size={12} /> Abrir en Maps
        </a>
      </div>
      <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm" style={{ height: 320 }}>
        <iframe
          title="Ubicación del negocio"
          src={embedSrc}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  )
}

function SocialButtons({ instagram, facebook, youtube, tiktok }: {
  instagram?: string; facebook?: string; youtube?: string; tiktok?: string
}) {
  // Construir lista solo con los que tienen URL válida
  const raw = [
    { url: instagram, label: 'Instagram', icon: <Instagram size={17} className="text-white" />, bg: 'linear-gradient(135deg,#f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)' },
    { url: facebook,  label: 'Facebook',  icon: <Facebook  size={17} className="text-white" />, bg: '#1877F2' },
    { url: youtube,   label: 'YouTube',   icon: <Youtube   size={17} className="text-white" />, bg: '#FF0000' },
    { url: tiktok,    label: 'TikTok',    icon: <Music2    size={17} className="text-white" />, bg: '#000000' },
  ]
  const buttons = raw
    .map(item => ({ ...item, href: ensureUrl(item.url) }))
    .filter(item => !!item.href) as { href: string; label: string; icon: React.ReactNode; bg: string }[]

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

export default function PublicProfile() {
  const { slug } = useParams<{ slug: string }>()

  const { data: p, loading: isLoading, error } = useFetch<Profile>(
    () => profileService.getBySlug(slug!), [slug]
  )

  const { data: mediaRaw } = useFetch<MediaItem[]>(
    () => p ? profileService.getPublicMedia(p.slug) : Promise.resolve([]),
    [p?.slug]
  )

  if (isLoading) return <Loader text="Cargando perfil..." />
  if (error || !p) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <p className="text-5xl mb-4">😕</p>
      <h2 className="font-bold text-xl mb-4 text-gray-900">Perfil no encontrado</h2>
      <Link to="/explorar" className="text-orange-500 font-semibold hover:underline">Ver todos los servicios</Link>
    </div>
  )

  const gradient = GRADIENTS[p.category] ?? GRADIENTS.default

  const whatsappNum = (p.whatsapp || p.phone || '').replace(/[^0-9]/g, '')
  const whatsappMsg = encodeURIComponent(`Hola, vi tu perfil en Enlurin.pe y me interesa ${p.businessName}. ¿Podría darme más información?`)
  const whatsappUrl = whatsappNum ? `https://wa.me/${whatsappNum}?text=${whatsappMsg}` : '#'

  const mapsUrl = p.latitude && p.longitude
    ? `https://www.google.com/maps?q=${p.latitude},${p.longitude}`
    : `https://www.google.com/maps/search/${encodeURIComponent(`${p.address ?? ''} ${p.district ?? ''} Lurín Lima`.trim())}`

  const allMedia: MediaItem[] = [
    ...(p.mediaItems ?? []) as MediaItem[],
    ...(mediaRaw ?? []),
  ].filter((m, idx, arr) => arr.findIndex(x => x.id === m.id) === idx)

  // ── Horario: soporta separadores / o | o salto de línea ──────────────────
  const scheduleLines = p.schedule
    ? p.schedule.split(/[\/|\n]/).map(s => s.trim()).filter(Boolean)
    : []

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Link to="/explorar"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-500 mb-4 transition-colors">
        <ArrowLeft size={16} /> Volver
      </Link>

      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">

        {/* Banner */}
        <div className={`relative h-52 bg-gradient-to-br ${gradient} overflow-hidden`}>
          {p.bannerUrl && <img src={p.bannerUrl} alt="banner" className="absolute inset-0 w-full h-full object-cover" />}
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
              <SocialButtons instagram={p.instagram} facebook={p.facebook} youtube={p.youtube} tiktok={p.tiktok} />
            </div>
          </div>

          {/* Nombre + badges */}
          <div className="mb-3">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2.5 py-0.5 rounded-full">{p.category}</span>
              {p.featured && <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2.5 py-0.5 rounded-full">⭐ Destacado</span>}
            </div>
            <h1 className="font-extrabold text-xl text-gray-900">{p.businessName}</h1>
            {p.rating && (
              <div className="flex items-center gap-1 mt-0.5">
                {[1,2,3,4,5].map(n => (
                  <Star key={n} size={13} className={n <= Math.round(p.rating!) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'} />
                ))}
                <span className="font-bold text-sm ml-0.5">{p.rating.toFixed(1)}</span>
                <span className="text-gray-400 text-xs">({p.reviewCount} reseñas)</span>
              </div>
            )}
          </div>

          {/* 3 botones de acción */}
          <div className="grid grid-cols-3 gap-2.5 mb-5">
            <a href={p.phone ? `tel:${p.phone}` : '#'}
              className="flex flex-col items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white py-3.5 rounded-2xl transition-all active:scale-95 shadow-sm">
              <Phone size={21} />
              <span className="text-xs font-bold">Llamar</span>
            </a>
            <a href={mapsUrl} target="_blank" rel="noreferrer"
              className="flex flex-col items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white py-3.5 rounded-2xl transition-all active:scale-95 shadow-sm">
              <MapPin size={21} />
              <span className="text-xs font-bold">Ubicación</span>
            </a>
            <a href={whatsappUrl} target="_blank" rel="noreferrer"
              className={`flex flex-col items-center gap-1.5 text-white py-3.5 rounded-2xl transition-all active:scale-95 shadow-sm ${!whatsappNum ? 'opacity-40 pointer-events-none' : ''}`}
              style={{ backgroundColor: '#25D366' }}>
              <MessageCircle size={21} />
              <span className="text-xs font-bold">WhatsApp</span>
            </a>
          </div>

          {/* Descripción */}
          {p.description && (
            <p className="text-gray-600 text-sm leading-relaxed pb-5 border-b border-gray-100 mb-5">
              {p.description}
            </p>
          )}

          {/* Galería */}
          {allMedia.length > 0 && (
            <div className="mb-6">
              <MediaGallery media={allMedia} />
            </div>
          )}

          {/* Sección ENCUÉNTRANOS EN */}
          <div className="bg-gray-50 rounded-2xl overflow-hidden mb-5 border border-gray-100">
            <div className="bg-gray-900 text-white px-5 py-3 flex items-center gap-2">
              <MapPin size={15} className="text-orange-400" />
              <span className="font-bold text-sm tracking-wide uppercase">Encuéntranos en:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
              {/* Dirección */}
              <div className="px-5 py-4">
                <p className="text-xs font-bold text-orange-500 uppercase tracking-wide mb-2">Dirección</p>
                {p.address && (
                  <div className="flex items-start gap-1.5 text-sm text-gray-700 mb-1">
                    <MapPin size={13} className="text-gray-400 shrink-0 mt-0.5" />
                    <span>{p.address}</span>
                  </div>
                )}
                {p.phone && (
                  <a href={`tel:${p.phone}`} className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-orange-500 transition-colors mb-1">
                    <Phone size={13} className="text-gray-400 shrink-0" />
                    <span>{p.phone}</span>
                  </a>
                )}
                {p.whatsapp && (
                  <a href={whatsappUrl} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-green-600 transition-colors">
                    <MessageCircle size={13} className="text-gray-400 shrink-0" />
                    <span>{p.whatsapp}</span>
                  </a>
                )}
              </div>

              {/* Horarios — CORREGIDO */}
              <div className="px-5 py-4">
                <p className="text-xs font-bold text-orange-500 uppercase tracking-wide mb-2">Horarios de Atención</p>
                {scheduleLines.length > 0 ? (
                  <div className="space-y-1.5">
                    {scheduleLines.map((line, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-sm text-gray-700">
                        <Clock size={13} className="text-gray-400 shrink-0 mt-0.5" />
                        <span>{line}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">No especificado</p>
                )}
              </div>

              {/* Medios de pago */}
              <div className="px-5 py-4">
                <p className="text-xs font-bold text-orange-500 uppercase tracking-wide mb-2">Medios de Pago</p>
                <div className="flex flex-wrap gap-1.5">
                  {['Efectivo', 'Visa', 'Mastercard', 'Yape', 'Plin'].map(m => (
                    <span key={m} className="text-xs bg-white border border-gray-200 text-gray-600 font-semibold px-2 py-1 rounded-lg shadow-sm">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Mapa */}
            <div className="px-4 pb-4">
              <EmbeddedMap
                address={p.address}
                district={p.district}
                latitude={p.latitude}
                longitude={p.longitude}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="mb-5 pt-2 flex items-center justify-between text-xs text-gray-400">
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
