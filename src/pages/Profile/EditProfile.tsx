import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Camera, ImagePlus, X, Instagram, Facebook, Youtube,
  Music2, MapPin, Globe, Phone, FileText, Store,
  Tag, Image as ImageIcon, Film, Link as LinkIcon,
  ChevronDown, ChevronUp, Check, Loader2, AlertCircle, Plus, Trash2
} from 'lucide-react'
import { profileService, type ProfileForm } from '../../services/profile.service'
import { useFetch } from '../../hooks/useFetch'
import Loader from '../../components/common/Loader'

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface PhotoPreview {
  id: string
  file: File
  preview: string
  title: string
}

interface ExistingPhoto {
  id: number
  type: 'PHOTO'
  url: string
  title?: string
}

interface VideoLink {
  id: string
  url: string
  type: 'REEL' | 'VIDEO'
  title: string
}

// ─── Constantes ───────────────────────────────────────────────────────────────
const CATEGORIES = [
  'Restaurantes', 'Médicos', 'Abogados', 'Odontólogos', 'Contadores',
  'Hoteles', 'Veterinarias', 'Delivery', 'Hogar & Reparaciones',
  'Belleza & Spa', 'Eventos', 'Farmacias', 'Otros',
]

const PAYMENT_METHODS = [
  'Efectivo', 'Visa', 'Mastercard', 'Yape', 'Plin', 'BCP', 'Interbank', 'BBVA', 'Transferencia'
]

// Distrito fijo — la plataforma solo opera en Lurín
const FIXED_DISTRICT = 'Lurín'

const EMPTY: ProfileForm = {
  businessName: '', category: '', district: FIXED_DISTRICT,
  description: '', phone: '', address: '',
  whatsapp: '', latitude: undefined, longitude: undefined,
  schedule: '', instagram: '', facebook: '', youtube: '', tiktok: '',
}

function toSlug(text: string): string {
  return text.toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

// ─── Helpers de video ─────────────────────────────────────────────────────────
function getVideoThumbnail(url: string): string | null {
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  if (ytMatch) return `https://img.youtube.com/vi/${ytMatch[1]}/mqdefault.jpg`
  return null
}

function detectVideoType(url: string): 'REEL' | 'VIDEO' {
  if (url.includes('tiktok.com') || url.includes('/reel') || url.includes('reels')) return 'REEL'
  return 'VIDEO'
}

function getVideoPlatform(url: string): string {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube'
  if (url.includes('tiktok.com')) return 'TikTok'
  if (url.includes('facebook.com') || url.includes('fb.watch')) return 'Facebook'
  if (url.includes('instagram.com')) return 'Instagram'
  return 'Video'
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────
function Field({ label, children, icon }: { label: string; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
        {icon && <span className="text-orange-500">{icon}</span>}{label}
      </label>
      {children}
    </div>
  )
}

function SectionHeader({ title, icon, isOpen, onToggle, badge }: {
  title: string; icon: React.ReactNode; isOpen: boolean; onToggle: () => void; badge?: number
}) {
  return (
    <button type="button" onClick={onToggle}
      className="w-full flex items-center justify-between py-3 border-b border-gray-100 hover:bg-gray-50/50 transition-colors rounded-lg px-1">
      <div className="flex items-center gap-2">
        <span className="text-orange-500">{icon}</span>
        <span className="font-bold text-gray-900 text-sm">{title}</span>
        {!!badge && badge > 0 && (
          <span className="bg-orange-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{badge}</span>
        )}
      </div>
      {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
    </button>
  )
}

// ─── Uploader de fotos ────────────────────────────────────────────────────────
function PhotoUploader({ newPhotos, existingPhotos, onAdd, onRemoveNew, onRemoveExisting, onUpdateTitle }: {
  newPhotos: PhotoPreview[]; existingPhotos: ExistingPhoto[]
  onAdd: (files: FileList) => void
  onRemoveNew: (id: string) => void; onRemoveExisting: (id: number) => void
  onUpdateTitle: (id: string, title: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="space-y-3">
      <button type="button" onClick={() => inputRef.current?.click()}
        className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 hover:border-orange-400 hover:bg-orange-50 rounded-xl py-4 transition-all group">
        <ImageIcon size={18} className="text-gray-400 group-hover:text-orange-500" />
        <span className="text-sm font-semibold text-gray-500 group-hover:text-orange-600">Agregar fotos</span>
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
          onChange={e => e.target.files && onAdd(e.target.files)} />
      </button>

      {(existingPhotos.length > 0 || newPhotos.length > 0) && (
        <div className="grid grid-cols-3 gap-2">
          {existingPhotos.map(p => (
            <div key={`ex-${p.id}`} className="relative group">
              <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                <img src={p.url} alt="" className="w-full h-full object-cover" />
              </div>
              <button type="button" onClick={() => onRemoveExisting(p.id)}
                className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <X size={11} />
              </button>
            </div>
          ))}
          {newPhotos.map(p => (
            <div key={`new-${p.id}`} className="relative group">
              <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 ring-2 ring-orange-400 ring-offset-1">
                <img src={p.preview} alt="" className="w-full h-full object-cover" />
                <span className="absolute bottom-1.5 right-1.5 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">NUEVO</span>
              </div>
              <button type="button" onClick={() => onRemoveNew(p.id)}
                className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <X size={11} />
              </button>
              <input type="text" value={p.title} onChange={e => onUpdateTitle(p.id, e.target.value)}
                placeholder="Título (opcional)"
                className="mt-1 w-full text-xs border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-orange-400" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Gestor de links de video ─────────────────────────────────────────────────
function VideoLinksManager({ links, onAdd, onRemove, onUpdate }: {
  links: VideoLink[]
  onAdd: () => void
  onRemove: (id: string) => void
  onUpdate: (id: string, field: 'url' | 'title', value: string) => void
}) {
  const PLATFORM_COLORS: Record<string, string> = {
    YouTube:  'bg-red-100 text-red-700',
    TikTok:   'bg-gray-100 text-gray-800',
    Facebook: 'bg-blue-100 text-blue-700',
    Instagram:'bg-pink-100 text-pink-700',
    Video:    'bg-gray-100 text-gray-600',
  }

  return (
    <div className="space-y-3">
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-2.5 text-xs text-blue-700 flex items-start gap-2">
        <LinkIcon size={13} className="shrink-0 mt-0.5" />
        <span>Pega links de <strong>YouTube</strong>, <strong>TikTok</strong>, <strong>Facebook</strong> o <strong>Instagram</strong>. Los videos se mostrarán como miniaturas en tu perfil.</span>
      </div>

      {links.map(link => {
        const platform = link.url ? getVideoPlatform(link.url) : ''
        const thumbnail = link.url ? getVideoThumbnail(link.url) : null
        return (
          <div key={link.id} className="border border-gray-200 rounded-xl p-3 space-y-2">
            <div className="flex items-center gap-2">
              {thumbnail && (
                <img src={thumbnail} alt="" className="w-14 h-10 rounded-lg object-cover shrink-0" />
              )}
              {!thumbnail && link.url && (
                <div className="w-14 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <Film size={18} className="text-gray-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {platform && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${PLATFORM_COLORS[platform] ?? PLATFORM_COLORS.Video}`}>
                      {platform}
                    </span>
                  )}
                  <span className="text-xs text-gray-400">
                    {link.type === 'REEL' ? '🎬 Reel' : '▶️ Video'}
                  </span>
                </div>
                <input
                  type="url"
                  value={link.url}
                  onChange={e => onUpdate(link.id, 'url', e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-orange-400 truncate"
                />
              </div>
              <button type="button" onClick={() => onRemove(link.id)}
                className="text-red-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors shrink-0">
                <Trash2 size={15} />
              </button>
            </div>
            <input
              type="text"
              value={link.title}
              onChange={e => onUpdate(link.id, 'title', e.target.value)}
              placeholder="Título del video (opcional)"
              className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-orange-400"
            />
          </div>
        )
      })}

      <button type="button" onClick={onAdd}
        className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 hover:border-orange-400 hover:bg-orange-50 rounded-xl py-3 transition-all group">
        <Plus size={16} className="text-gray-400 group-hover:text-orange-500" />
        <span className="text-sm font-semibold text-gray-500 group-hover:text-orange-600">Agregar link de video/reel</span>
      </button>
    </div>
  )
}

// ─── Picker de ubicación ──────────────────────────────────────────────────────
function LocationPicker({ latitude, longitude, address, onLatChange, onLngChange, onAddressChange }: {
  latitude?: number; longitude?: number; address: string
  onLatChange: (v: number | undefined) => void
  onLngChange: (v: number | undefined) => void
  onAddressChange: (v: string) => void
}) {
  const [detecting, setDetecting] = useState(false)
  const [detected,  setDetected]  = useState(false)
  const [geoError,  setGeoError]  = useState('')
  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-colors"

  const detect = () => {
    if (!navigator.geolocation) { setGeoError('Tu navegador no soporta geolocalización'); return }
    setDetecting(true); setGeoError('')
    navigator.geolocation.getCurrentPosition(
      pos => {
        onLatChange(Number(pos.coords.latitude.toFixed(6)))
        onLngChange(Number(pos.coords.longitude.toFixed(6)))
        setDetecting(false); setDetected(true)
        setTimeout(() => setDetected(false), 3000)
      },
      () => { setDetecting(false); setGeoError('No se pudo obtener la ubicación. Verifica los permisos.') }
    )
  }

  return (
    <div className="space-y-3">
      <Field label="Dirección" icon={<MapPin size={14} />}>
        <input value={address} onChange={e => onAddressChange(e.target.value)}
          placeholder="Av. Principal 123, Lurín" className={inputCls} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Latitud">
          <input type="number" step="0.000001" value={latitude ?? ''}
            onChange={e => onLatChange(e.target.value ? Number(e.target.value) : undefined)}
            placeholder="-12.271..." className={inputCls} />
        </Field>
        <Field label="Longitud">
          <input type="number" step="0.000001" value={longitude ?? ''}
            onChange={e => onLngChange(e.target.value ? Number(e.target.value) : undefined)}
            placeholder="-76.877..." className={inputCls} />
        </Field>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={detect} disabled={detecting}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-semibold text-sm py-2.5 rounded-xl transition-colors disabled:opacity-60">
          {detecting ? <Loader2 size={15} className="animate-spin" /> : detected ? <Check size={15} /> : <MapPin size={15} />}
          {detecting ? 'Detectando...' : detected ? '¡Guardado!' : 'Usar mi ubicación actual'}
        </button>
        {latitude && longitude && (
          <a href={`https://www.google.com/maps?q=${latitude},${longitude}`} target="_blank" rel="noreferrer"
            className="px-4 flex items-center gap-1.5 bg-white border border-gray-200 hover:border-orange-400 text-gray-600 text-sm font-semibold rounded-xl transition-colors">
            <Globe size={14} /> Ver
          </a>
        )}
      </div>
      {geoError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          <AlertCircle size={13} className="text-red-500 shrink-0" />
          <p className="text-xs text-red-600">{geoError}</p>
        </div>
      )}
      {latitude && longitude && !geoError && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
          <Check size={13} className="text-green-600 shrink-0" />
          <p className="text-xs text-green-700 font-medium">Coordenadas: {latitude}, {longitude}</p>
        </div>
      )}
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────
interface Props { isNew?: boolean }

export default function EditProfile({ isNew = false }: Props) {
  const [form,       setForm]       = useState<ProfileForm>(EMPTY)
  const [loading,    setLoading]    = useState(false)
  const [success,    setSuccess]    = useState(false)
  const [error,      setError]      = useState('')
  const [uploadLog,  setUploadLog]  = useState<string[]>([])
  const [profileId,  setProfileId]  = useState<number | null>(null)

  const [logoFile,      setLogoFile]      = useState<File | null>(null)
  const [bannerFile,    setBannerFile]    = useState<File | null>(null)
  const [logoPreview,   setLogoPreview]   = useState<string | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)

  const [newPhotos,        setNewPhotos]        = useState<PhotoPreview[]>([])
  const [existingPhotos,   setExistingPhotos]   = useState<ExistingPhoto[]>([])
  const [deletedPhotoIds,  setDeletedPhotoIds]  = useState<number[]>([])
  const [deletedVideoIds,  setDeletedVideoIds]  = useState<number[]>([])
  const [videoLinks,       setVideoLinks]       = useState<VideoLink[]>([])
  const [paymentMethods,   setPaymentMethods]   = useState<string[]>([])

  const [sections, setSections] = useState({
    basic: true, contact: true, location: false, social: true, media: false, payment: false,
  })

  const logoRef   = useRef<HTMLInputElement>(null)
  const bannerRef = useRef<HTMLInputElement>(null)
  const navigate  = useNavigate()

  const { data: existing, loading: isLoading } = useFetch(
    () => isNew ? Promise.resolve(null) : profileService.getMyProfile()
  )

  useEffect(() => {
    if (!existing || isNew) return
    setProfileId(existing.id)
    setForm({
      businessName: existing.businessName ?? '',
      category:     existing.category     ?? '',
      // Siempre forzar Lurín aunque venga otro valor del backend
      district:     FIXED_DISTRICT,
      description:  existing.description  ?? '',
      phone:        existing.phone        ?? '',
      address:      existing.address      ?? '',
      whatsapp:     existing.whatsapp     ?? '',
      latitude:     existing.latitude,
      longitude:    existing.longitude,
      schedule:     existing.schedule     ?? '',
      instagram:    existing.instagram    ?? '',
      facebook:     existing.facebook     ?? '',
      youtube:      existing.youtube      ?? '',
      tiktok:       existing.tiktok       ?? '',
    })
    if (existing.logoUrl)   setLogoPreview(existing.logoUrl)
    if (existing.bannerUrl) setBannerPreview(existing.bannerUrl)

    ;(async () => {
      try {
        const media = existing.mediaItems?.length
          ? existing.mediaItems
          : await profileService.getPublicMedia(existing.slug)

        const photos = (media as any[]).filter(m => m.type === 'PHOTO')
        const videos = (media as any[]).filter(m => m.type === 'VIDEO' || m.type === 'REEL')

        setExistingPhotos(photos as ExistingPhoto[])
        if (videos.length > 0) {
          setVideoLinks(videos.map((v: any) => ({
            id:    `ex-${v.id}`,
            url:   v.url,
            type:  v.type as 'VIDEO' | 'REEL',
            title: v.title ?? '',
          })))
        }
      } catch { /* sin media aún */ }
    })()

    setSections(prev => ({
      ...prev,
      location: !!(existing.latitude || existing.longitude || existing.address),
      social:   !!(existing.instagram || existing.facebook || existing.youtube || existing.tiktok),
      media:    true,
    }))
  }, [existing, isNew])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    // Nunca permitir cambiar el distrito
    if (e.target.name === 'district') return
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const toggleSection = (k: keyof typeof sections) =>
    setSections(prev => ({ ...prev, [k]: !prev[k] }))

  const togglePayment = (method: string) =>
    setPaymentMethods(prev =>
      prev.includes(method) ? prev.filter(m => m !== method) : [...prev, method]
    )

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return
    setLogoFile(f); setLogoPreview(URL.createObjectURL(f))
  }
  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return
    setBannerFile(f); setBannerPreview(URL.createObjectURL(f))
  }

  const handleAddPhotos = (files: FileList) =>
    setNewPhotos(prev => [...prev, ...Array.from(files).map(file => ({
      id: `${Date.now()}-${Math.random()}`, file,
      preview: URL.createObjectURL(file), title: '',
    }))])
  const handleRemoveNewPhoto      = (id: string)  => setNewPhotos(prev => prev.filter(p => p.id !== id))
  const handleRemoveExistingPhoto = (id: number)  => {
    setExistingPhotos(prev => prev.filter(p => p.id !== id))
    setDeletedPhotoIds(prev => [...prev, id])
  }
  const handleUpdatePhotoTitle = (id: string, title: string) =>
    setNewPhotos(prev => prev.map(p => p.id === id ? { ...p, title } : p))

  const handleAddVideoLink = () =>
    setVideoLinks(prev => [...prev, { id: `${Date.now()}`, url: '', type: 'VIDEO', title: '' }])
  const handleRemoveVideoLink = (id: string) => {
    // Si es un video existente (prefijo "ex-"), guardarlo para eliminarlo en el backend
    if (id.startsWith('ex-')) {
      const numericId = parseInt(id.replace('ex-', ''), 10)
      if (!isNaN(numericId)) {
        setDeletedVideoIds(prev => [...prev, numericId])
      }
    }
    setVideoLinks(prev => prev.filter(v => v.id !== id))
  }
  const handleUpdateVideoLink = (id: string, field: 'url' | 'title', value: string) =>
    setVideoLinks(prev => prev.map(v => {
      if (v.id !== id) return v
      const updated = { ...v, [field]: value }
      if (field === 'url') updated.type = detectVideoType(value)
      return updated
    }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setUploadLog([]); setLoading(true)

    try {
      const payload = {
        ...form,
        district:     FIXED_DISTRICT,
        districtSlug: 'lurin',
        categorySlug: toSlug(form.category),
        // Trimear strings; si están vacíos mandar null para que el backend los limpie
        instagram: form.instagram?.trim() || null,
        facebook:  form.facebook?.trim()  || null,
        youtube:   form.youtube?.trim()   || null,
        tiktok:    form.tiktok?.trim()    || null,
        whatsapp:  form.whatsapp?.trim()  || null,
        schedule:  form.schedule?.trim()  || null,
      }

      // DEBUG: ver exactamente qué se manda al backend
      console.log('[EditProfile] payload a guardar:', JSON.stringify(payload, null, 2))

      const saved = isNew
        ? await profileService.create(payload)
        : await profileService.updateMe(payload)
      const id = saved.id
      if (!id) throw new Error('No se pudo obtener el ID del perfil')

      if (logoFile) {
        try { await profileService.uploadLogo(id, logoFile); setUploadLog(l => [...l, '✓ Logo subido']) }
        catch { setUploadLog(l => [...l, '⚠️ Logo no se pudo subir']) }
      }

      if (bannerFile) {
        try { await profileService.uploadBanner(bannerFile); setUploadLog(l => [...l, '✓ Banner subido']) }
        catch { setUploadLog(l => [...l, '⚠️ Banner no se pudo subir']) }
      }

      // Eliminar fotos borradas
      for (const photoId of deletedPhotoIds) {
        try { await profileService.deleteMedia(photoId) } catch { /* ignorar */ }
      }
      // Eliminar videos/reels borrados
      for (const videoId of deletedVideoIds) {
        try { await profileService.deleteMedia(videoId) } catch { /* ignorar */ }
      }

      if (newPhotos.length > 0) {
        setUploadLog(l => [...l, `Subiendo ${newPhotos.length} foto(s)...`])
        let ok = 0
        for (const photo of newPhotos) {
          try {
            await profileService.uploadMedia(photo.file, 'PHOTO', photo.title || undefined)
            ok++
          } catch { setUploadLog(l => [...l, `⚠️ No se pudo subir: ${photo.file.name}`]) }
        }
        setUploadLog(l => [...l, `✓ ${ok}/${newPhotos.length} fotos subidas`])
      }

      // Solo guardar los links NUEVOS (los existentes tienen id con prefijo "ex-")
      const newVideoLinks = videoLinks.filter(
        v => !v.id.startsWith('ex-') && v.url.trim().startsWith('http')
      )
      if (newVideoLinks.length > 0) {
        setUploadLog(l => [...l, `Guardando ${newVideoLinks.length} link(s) de video...`])
        for (const vlink of newVideoLinks) {
          try {
            await profileService.addVideoLink?.(vlink.url, vlink.type, vlink.title || undefined)
          } catch { /* ignorar si ya existe */ }
        }
        setUploadLog(l => [...l, `✓ ${newVideoLinks.length} link(s) guardados`])
      }

      // Eliminar links de video que el usuario borró (tenían id "ex-" pero ya no están en la lista)
      // Los IDs existentes que siguen en la lista
      const keptExIds = new Set(
        videoLinks.filter(v => v.id.startsWith('ex-')).map(v => v.id.replace('ex-', ''))
      )
      // deletedPhotoIds ya maneja fotos; aquí manejamos videos borrados
      // Los videos cargados al inicio tenían id "ex-{mediaId}"
      // Si el usuario los eliminó con handleRemoveVideoLink, ya no están en videoLinks
      // Necesitamos comparar contra los que se cargaron originalmente
      // Nota: esto ya funciona si el usuario usó el botón de eliminar (Trash2) en VideoLinksManager

      setSuccess(true)
      setTimeout(() => navigate('/mi-perfil'), 2000)

    } catch (err: any) {
      const msg = err?.response?.data?.error ?? err?.response?.data?.message
        ?? err?.response?.data ?? err?.message ?? 'Error al guardar.'
      setError(typeof msg === 'string' ? msg : 'Error al guardar. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) return <Loader text="Cargando..." />

  if (success) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-6xl mb-4">🎉</div>
      <h2 className="font-extrabold text-2xl text-gray-900 mb-2">
        {isNew ? '¡Servicio publicado!' : '¡Perfil actualizado!'}
      </h2>
      {uploadLog.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-3 mt-3 text-left max-w-xs w-full space-y-0.5">
          {uploadLog.map((l, i) => <p key={i} className="text-xs text-gray-600">{l}</p>)}
        </div>
      )}
      <p className="text-gray-500 text-sm mt-3">Redirigiendo...</p>
    </div>
  )

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-colors"
  const totalMedia = newPhotos.length + existingPhotos.length + videoLinks.filter(v => v.url).length

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="font-extrabold text-2xl text-gray-900 mb-1">
        {isNew ? 'Publica tu servicio' : 'Editar perfil'}
      </h1>
      <p className="text-gray-500 text-sm mb-8">
        {isNew ? 'Llega a miles de clientes en Lurín.' : 'Mantén tu información actualizada.'}
      </p>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="relative h-40 bg-gradient-to-br from-orange-400 to-orange-600 cursor-pointer group"
          onClick={() => bannerRef.current?.click()}>
          {bannerPreview && <img src={bannerPreview} alt="" className="w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <ImagePlus size={28} className="text-white mb-1" />
            <span className="text-white text-sm font-semibold">{bannerPreview ? 'Cambiar banner' : 'Subir banner'}</span>
          </div>
          {bannerPreview && (
            <button type="button" onClick={e => { e.stopPropagation(); setBannerPreview(null); setBannerFile(null) }}
              className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1"><X size={14} /></button>
          )}
          <input ref={bannerRef} type="file" accept="image/*" className="hidden" onChange={handleBannerChange} />
        </div>

        {/* Logo */}
        <div className="px-8 -mt-10 relative z-10 flex items-end gap-4 mb-6">
          <div className="relative cursor-pointer group" onClick={() => logoRef.current?.click()}>
            <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-orange-100 flex items-center justify-center">
              {logoPreview
                ? <img src={logoPreview} alt="" className="w-full h-full object-cover" />
                : <span className="text-3xl font-bold text-orange-400">{form.businessName.charAt(0) || '?'}</span>
              }
            </div>
            <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={20} className="text-white" />
            </div>
            <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
          </div>
          <div className="pb-2">
            <p className="text-xs text-gray-500 font-medium">Logo del negocio</p>
            <p className="text-xs text-gray-400">Click para cambiar</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-5">

          {/* Básica */}
          <div>
            <SectionHeader title="Información básica" icon={<Store size={16} />}
              isOpen={sections.basic} onToggle={() => toggleSection('basic')} />
            {sections.basic && (
              <div className="pt-4 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Nombre del negocio *" icon={<Store size={14} />}>
                    <input name="businessName" required value={form.businessName}
                      onChange={handleChange} placeholder="Ej: La Sazón Lurín" className={inputCls} />
                  </Field>
                  <Field label="Categoría *" icon={<Tag size={14} />}>
                    <select name="category" required value={form.category}
                      onChange={handleChange} className={`${inputCls} bg-white`}>
                      <option value="">Seleccionar...</option>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </Field>
                </div>
                <Field label="Descripción *" icon={<FileText size={14} />}>
                  <textarea name="description" required rows={3} value={form.description}
                    onChange={handleChange} placeholder="Describe tu servicio..."
                    className={`${inputCls} resize-none`} />
                </Field>
                <Field label="Horario de atención" icon={<Store size={14} />}>
                  <input
                    name="schedule"
                    value={form.schedule || ''}
                    onChange={handleChange}
                    placeholder="Ej: Lun-Sáb 9am-6pm / Dom CERRADO"
                    className={inputCls}
                  />
                  <p className="text-xs text-gray-400">
                    Separa los horarios con <strong>/</strong> para mostrarlos en líneas separadas.
                    Ej: <em>Lun-Vie 8am-6pm / Sáb 9am-2pm / Dom CERRADO</em>
                  </p>
                </Field>
              </div>
            )}
          </div>

          {/* Contacto */}
          <div>
            <SectionHeader title="Datos de contacto" icon={<Phone size={16} />}
              isOpen={sections.contact} onToggle={() => toggleSection('contact')} />
            {sections.contact && (
              <div className="pt-4 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Teléfono *" icon={<Phone size={14} />}>
                    <input name="phone" required value={form.phone} onChange={handleChange}
                      placeholder="+51 900 000 000" className={inputCls} />
                  </Field>
                  <Field label="WhatsApp" icon={<Phone size={14} />}>
                    <input name="whatsapp" value={form.whatsapp || ''} onChange={handleChange}
                      placeholder="51900000000 (sin + ni espacios)" className={inputCls} />
                    <p className="text-xs text-gray-400">Solo dígitos con código país: 51900000000</p>
                  </Field>
                </div>

                {/* Distrito bloqueado a Lurín */}
                <Field label="Distrito" icon={<MapPin size={14} />}>
                  <div className="relative">
                    <input
                      name="district"
                      value={FIXED_DISTRICT}
                      readOnly
                      className={`${inputCls} bg-orange-50 border-orange-200 text-orange-700 font-semibold cursor-not-allowed`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold bg-orange-500 text-white px-2 py-0.5 rounded-full">
                      Fijo
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">La plataforma opera exclusivamente en Lurín.</p>
                </Field>
              </div>
            )}
          </div>

          {/* Ubicación */}
          <div>
            <SectionHeader title="Ubicación en el mapa" icon={<MapPin size={16} />}
              isOpen={sections.location} onToggle={() => toggleSection('location')} />
            {sections.location && (
              <div className="pt-4">
                <LocationPicker
                  latitude={form.latitude} longitude={form.longitude} address={form.address || ''}
                  onLatChange={v => setForm(p => ({ ...p, latitude: v }))}
                  onLngChange={v => setForm(p => ({ ...p, longitude: v }))}
                  onAddressChange={v => setForm(p => ({ ...p, address: v }))}
                />
              </div>
            )}
          </div>

          {/* Redes sociales */}
          <div>
            <SectionHeader title="Redes sociales" icon={<Instagram size={16} />}
              isOpen={sections.social} onToggle={() => toggleSection('social')} />
            {sections.social && (
              <div className="pt-4 space-y-3">
                <p className="text-xs text-gray-400">Link completo de tu perfil (ej: https://instagram.com/tunegocio)</p>
                {[
                  { name: 'instagram', placeholder: 'https://instagram.com/tunegocio',
                    bg: 'linear-gradient(135deg,#f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)',
                    icon: <Instagram size={15} className="text-white" /> },
                  { name: 'facebook',  placeholder: 'https://facebook.com/tupagina',
                    bg: '#1877F2', icon: <Facebook size={15} className="text-white" /> },
                  { name: 'youtube',   placeholder: 'https://youtube.com/@tucanal',
                    bg: '#FF0000', icon: <Youtube size={15} className="text-white" /> },
                  { name: 'tiktok',    placeholder: 'https://tiktok.com/@tunegocio',
                    bg: '#000000', icon: <Music2 size={15} className="text-white" /> },
                ].map(({ name, placeholder, bg, icon }) => (
                  <div key={name} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg }}>{icon}</div>
                    <input name={name} value={(form as any)[name] || ''} onChange={handleChange}
                      placeholder={placeholder} className={inputCls} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Galería */}
          <div>
            <SectionHeader title="Fotos y Videos" icon={<ImageIcon size={16} />}
              isOpen={sections.media} onToggle={() => toggleSection('media')} badge={totalMedia} />
            {sections.media && (
              <div className="pt-4 space-y-5">
                <div>
                  <p className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                    <ImageIcon size={13} className="text-orange-500" /> Fotos del negocio
                  </p>
                  <PhotoUploader
                    newPhotos={newPhotos} existingPhotos={existingPhotos}
                    onAdd={handleAddPhotos} onRemoveNew={handleRemoveNewPhoto}
                    onRemoveExisting={handleRemoveExistingPhoto} onUpdateTitle={handleUpdatePhotoTitle}
                  />
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                    <Film size={13} className="text-orange-500" /> Reels y Videos (YouTube, TikTok, Facebook)
                  </p>
                  <VideoLinksManager
                    links={videoLinks}
                    onAdd={handleAddVideoLink}
                    onRemove={handleRemoveVideoLink}
                    onUpdate={handleUpdateVideoLink}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Medios de pago */}
          <div>
            <SectionHeader title="Medios de pago" icon={<Globe size={16} />}
              isOpen={sections.payment} onToggle={() => toggleSection('payment')}
              badge={paymentMethods.length} />
            {sections.payment && (
              <div className="pt-4">
                <p className="text-xs text-gray-400 mb-3">Selecciona los métodos de pago que aceptas</p>
                <div className="flex flex-wrap gap-2">
                  {PAYMENT_METHODS.map(method => (
                    <button key={method} type="button" onClick={() => togglePayment(method)}
                      className={`text-sm font-semibold px-3 py-1.5 rounded-full border-2 transition-all
                        ${paymentMethods.includes(method)
                          ? 'bg-orange-500 border-orange-500 text-white'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-orange-300'}`}>
                      {method}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
              <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-red-500 text-sm font-medium">{error}</p>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-3.5 rounded-full transition-colors flex items-center justify-center gap-2 text-base shadow-sm">
            {loading
              ? <><Loader2 size={18} className="animate-spin" />Guardando...</>
              : isNew ? '🚀 Publicar servicio' : '💾 Guardar cambios'}
          </button>
        </form>
      </div>
    </div>
  )
}
