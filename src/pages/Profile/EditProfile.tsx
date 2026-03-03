import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Camera, ImagePlus, X, Instagram, Facebook, Youtube,
  Music2, MapPin, Globe, Phone, FileText, Store,
  Tag, Image as ImageIcon, Video, Film,
  ChevronDown, ChevronUp, Check, Loader2, AlertCircle
} from 'lucide-react'
import { profileService, type ProfileForm } from '../../services/profile.service'
import { useFetch } from '../../hooks/useFetch'
import Loader from '../../components/common/Loader'

interface MediaPreview {
  id: string
  file: File
  type: 'PHOTO' | 'VIDEO' | 'REEL'
  preview: string
  title: string
}

interface ExistingMedia {
  id: number
  type: 'PHOTO' | 'VIDEO' | 'REEL'
  url: string
  thumbnail?: string
  title?: string
}

const CATEGORIES = [
  'Restaurantes', 'Médicos', 'Abogados', 'Odontólogos', 'Contadores',
  'Hoteles', 'Veterinarias', 'Delivery', 'Hogar & Reparaciones',
  'Belleza & Spa', 'Eventos', 'Farmacias', 'Otros',
]

const EMPTY: ProfileForm = {
  businessName: '', category: '', district: '',
  description: '', phone: '', address: '',
  whatsapp: '', latitude: undefined, longitude: undefined,
  schedule: '', instagram: '', facebook: '', youtube: '', tiktok: '',
}

function toSlug(text: string): string {
  return text.toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

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
          <span className="bg-orange-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {badge}
          </span>
        )}
      </div>
      {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
    </button>
  )
}

function MediaUploader({ newMedia, existingMedia, onAddMedia, onRemoveNew, onRemoveExisting, onUpdateTitle }: {
  newMedia: MediaPreview[]; existingMedia: ExistingMedia[]
  onAddMedia: (files: FileList, type: 'PHOTO' | 'VIDEO' | 'REEL') => void
  onRemoveNew: (id: string) => void; onRemoveExisting: (id: number) => void
  onUpdateTitle: (id: string, title: string) => void
}) {
  const photoRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLInputElement>(null)
  const reelRef  = useRef<HTMLInputElement>(null)

  const typeBadge = (type: string) =>
    type === 'PHOTO' ? 'bg-orange-500' : type === 'VIDEO' ? 'bg-blue-500' : 'bg-purple-500'

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {[
          { ref: photoRef, type: 'PHOTO' as const, icon: <ImageIcon size={20} />, label: 'Foto', accept: 'image/*', hover: 'hover:border-orange-400 hover:bg-orange-50 group-hover:text-orange-500 group-hover:text-orange-600' },
          { ref: videoRef, type: 'VIDEO' as const, icon: <Video size={20} />,     label: 'Video', accept: 'video/*', hover: 'hover:border-blue-400 hover:bg-blue-50 group-hover:text-blue-500 group-hover:text-blue-600' },
          { ref: reelRef,  type: 'REEL'  as const, icon: <Film size={20} />,      label: 'Reel',  accept: 'video/*', hover: 'hover:border-purple-400 hover:bg-purple-50 group-hover:text-purple-500 group-hover:text-purple-600' },
        ].map(({ ref, type, icon, label, accept }) => (
          <button key={type} type="button" onClick={() => ref.current?.click()}
            className="flex flex-col items-center gap-1.5 border-2 border-dashed border-gray-200 hover:border-orange-300 hover:bg-orange-50 rounded-xl py-3 transition-all group">
            <span className="text-gray-400 group-hover:text-orange-400 transition-colors">{icon}</span>
            <span className="text-xs font-semibold text-gray-500 group-hover:text-orange-500 transition-colors">{label}</span>
            <input ref={ref} type="file" accept={accept} multiple className="hidden"
              onChange={e => e.target.files && onAddMedia(e.target.files, type)} />
          </button>
        ))}
      </div>

      {(existingMedia.length > 0 || newMedia.length > 0) ? (
        <div className="grid grid-cols-3 gap-2">
          {existingMedia.map(item => (
            <div key={`ex-${item.id}`} className="relative group">
              <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                {item.type === 'PHOTO'
                  ? <img src={item.url} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 text-white gap-1">
                      {item.type === 'VIDEO' ? <Video size={22} /> : <Film size={22} />}
                      <span className="text-xs font-bold">{item.type}</span>
                    </div>
                }
                <span className={`absolute top-1.5 left-1.5 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md ${typeBadge(item.type)}`}>
                  {item.type}
                </span>
              </div>
              <button type="button" onClick={() => onRemoveExisting(item.id)}
                className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <X size={11} />
              </button>
            </div>
          ))}
          {newMedia.map(item => (
            <div key={`new-${item.id}`} className="relative group">
              <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 ring-2 ring-orange-400 ring-offset-1">
                {item.type === 'PHOTO'
                  ? <img src={item.preview} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 text-white gap-1">
                      {item.type === 'VIDEO' ? <Video size={22} /> : <Film size={22} />}
                      <span className="text-xs font-bold">{item.type}</span>
                    </div>
                }
                <span className={`absolute top-1.5 left-1.5 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md ${typeBadge(item.type)}`}>
                  {item.type}
                </span>
                <span className="absolute bottom-1.5 right-1.5 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">NUEVO</span>
              </div>
              <button type="button" onClick={() => onRemoveNew(item.id)}
                className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <X size={11} />
              </button>
              <input type="text" value={item.title}
                onChange={e => onUpdateTitle(item.id, e.target.value)}
                placeholder="Título (opcional)"
                className="mt-1 w-full text-xs border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-orange-400" />
            </div>
          ))}
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-200 rounded-xl py-8 text-center">
          <ImageIcon size={28} className="mx-auto text-gray-300 mb-2" />
          <p className="text-xs text-gray-400 font-medium">Sube fotos, videos y reels de tu negocio</p>
          <p className="text-xs text-gray-300 mt-1">Atrae más clientes con contenido visual</p>
        </div>
      )}
    </div>
  )
}

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
      () => { setDetecting(false); setGeoError('No se pudo obtener la ubicación. Verifica los permisos del navegador.') }
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

  const [newMedia,        setNewMedia]        = useState<MediaPreview[]>([])
  const [existingMedia,   setExistingMedia]   = useState<ExistingMedia[]>([])
  const [deletedMediaIds, setDeletedMediaIds] = useState<number[]>([])

  const [sections, setSections] = useState({
    basic: true, contact: true, location: false, social: false, media: false,
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
      district:     existing.district     ?? '',
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

    // Cargar media existente
    ;(async () => {
      try {
        if (existing.mediaItems && existing.mediaItems.length > 0) {
          setExistingMedia(existing.mediaItems as ExistingMedia[])
        } else {
          const media = await profileService.getPublicMedia(existing.slug)
          setExistingMedia(media as ExistingMedia[])
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
  ) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const toggleSection = (k: keyof typeof sections) =>
    setSections(prev => ({ ...prev, [k]: !prev[k] }))

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return
    setLogoFile(f); setLogoPreview(URL.createObjectURL(f))
  }
  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return
    setBannerFile(f); setBannerPreview(URL.createObjectURL(f))
  }

  const handleAddMedia = (files: FileList, type: 'PHOTO' | 'VIDEO' | 'REEL') =>
    setNewMedia(prev => [...prev, ...Array.from(files).map(file => ({
      id: `${Date.now()}-${Math.random()}`, file, type,
      preview: URL.createObjectURL(file), title: '',
    }))])

  const handleRemoveNew      = (id: string)  => setNewMedia(prev => prev.filter(m => m.id !== id))
  const handleRemoveExisting = (id: number)  => {
    setExistingMedia(prev => prev.filter(m => m.id !== id))
    setDeletedMediaIds(prev => [...prev, id])
  }
  const handleUpdateTitle = (id: string, title: string) =>
    setNewMedia(prev => prev.map(m => m.id === id ? { ...m, title } : m))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setUploadLog([]); setLoading(true)

    try {
      const payload = {
        ...form,
        categorySlug: toSlug(form.category),
        districtSlug: toSlug(form.district),
      }

      // PASO 1: Guardar perfil — obtenemos el id real del servidor
      const saved = isNew
        ? await profileService.create(payload)
        : await profileService.updateMe(payload)

      const id = saved.id
      if (!id) throw new Error('No se pudo obtener el ID del perfil')

      // PASO 2: Logo
      if (logoFile) {
        try {
          setUploadLog(l => [...l, 'Subiendo logo...'])
          await profileService.uploadLogo(id, logoFile)
          setUploadLog(l => [...l, '✓ Logo subido'])
        } catch { setUploadLog(l => [...l, '⚠️ Logo no se pudo subir']) }
      }

      // PASO 3: Banner
      if (bannerFile) {
        try {
          setUploadLog(l => [...l, 'Subiendo banner...'])
          await profileService.uploadBanner(bannerFile)
          setUploadLog(l => [...l, '✓ Banner subido'])
        } catch { setUploadLog(l => [...l, '⚠️ Banner no se pudo subir']) }
      }

      // PASO 4: Eliminar media borrada
      for (const mediaId of deletedMediaIds) {
        try { await profileService.deleteMedia(mediaId) } catch { /* ignorar */ }
      }

      // PASO 5: Subir nueva media — secuencial
      if (newMedia.length > 0) {
        setUploadLog(l => [...l, `Subiendo ${newMedia.length} archivo(s)...`])
        let ok = 0
        for (const media of newMedia) {
          try {
            await profileService.uploadMedia(media.file, media.type, media.title || undefined)
            ok++
            setUploadLog(l => {
              const updated = [...l]
              updated[updated.length - 1] = `Subiendo archivos... ${ok}/${newMedia.length}`
              return updated
            })
          } catch { setUploadLog(l => [...l, `⚠️ No se pudo subir: ${media.file.name}`]) }
        }
        setUploadLog(l => [...l, `✓ ${ok}/${newMedia.length} archivos subidos`])
      }

      setSuccess(true)
      setTimeout(() => navigate('/mi-perfil'), 2000)

    } catch (err: any) {
      const msg = err?.response?.data?.error ?? err?.response?.data?.message
        ?? err?.response?.data ?? err?.message ?? 'Error al guardar. Intenta de nuevo.'
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
      <p className="text-gray-500 text-sm mt-3">Redirigiendo a tu perfil...</p>
    </div>
  )

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-colors"

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
            <span className="text-white/70 text-xs">Recomendado: 1200×400px</span>
          </div>
          {bannerPreview && (
            <button type="button" onClick={e => { e.stopPropagation(); setBannerPreview(null); setBannerFile(null) }}
              className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1">
              <X size={14} />
            </button>
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
                  <input name="schedule" value={form.schedule || ''} onChange={handleChange}
                    placeholder="Ej: Lun-Vie 9am-6pm, Sáb 9am-1pm" className={inputCls} />
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
                    <p className="text-xs text-gray-400">Código de país + número, sin espacios: 51900000000</p>
                  </Field>
                </div>
                <Field label="Distrito *" icon={<MapPin size={14} />}>
                  <input name="district" required value={form.district} onChange={handleChange}
                    placeholder="Lurín" className={inputCls} />
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
                <p className="text-xs text-gray-400">Pega el link completo de tu perfil (ej: https://instagram.com/tunegocio)</p>
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
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: bg }}>{icon}</div>
                    <input name={name} value={(form as any)[name] || ''}
                      onChange={handleChange} placeholder={placeholder} className={inputCls} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Galería */}
          <div>
            <SectionHeader title="Fotos, Videos y Reels" icon={<ImageIcon size={16} />}
              isOpen={sections.media} onToggle={() => toggleSection('media')}
              badge={newMedia.length + existingMedia.length} />
            {sections.media && (
              <div className="pt-4">
                <MediaUploader
                  newMedia={newMedia} existingMedia={existingMedia}
                  onAddMedia={handleAddMedia} onRemoveNew={handleRemoveNew}
                  onRemoveExisting={handleRemoveExisting} onUpdateTitle={handleUpdateTitle}
                />
                {newMedia.length > 0 && (
                  <p className="text-xs text-orange-600 font-medium mt-2 flex items-center gap-1">
                    <AlertCircle size={12} />{newMedia.length} archivo(s) se subirán al guardar
                  </p>
                )}
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
