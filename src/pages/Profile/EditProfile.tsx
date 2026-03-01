import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, ImagePlus, X } from 'lucide-react'
import { profileService, type ProfileForm } from '../../services/profile.service'
import { useFetch } from '../../hooks/useFetch'
import Loader from '../../components/common/Loader'

const CATEGORIES = [
  'Restaurantes', 'Médicos', 'Abogados', 'Odontólogos', 'Contadores',
  'Hoteles', 'Veterinarias', 'Delivery', 'Hogar & Reparaciones',
  'Belleza & Spa', 'Eventos', 'Farmacias', 'Otros',
]

const EMPTY: ProfileForm = {
  businessName: '', category: '', district: '',
  description:  '', phone: '',   address: '', website: '',
}

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

interface Props { isNew?: boolean }

export default function EditProfile({ isNew = false }: Props) {
  const [form, setForm]                     = useState<ProfileForm>(EMPTY)
  const [loading, setLoading]               = useState(false)
  const [success, setSuccess]               = useState(false)
  const [error, setError]                   = useState('')
  const [profileId, setProfileId]           = useState<number | null>(null)

  const [logoFile, setLogoFile]             = useState<File | null>(null)
  const [bannerFile, setBannerFile]         = useState<File | null>(null)
  const [logoPreview, setLogoPreview]       = useState<string | null>(null)
  const [bannerPreview, setBannerPreview]   = useState<string | null>(null)

  const logoRef   = useRef<HTMLInputElement>(null)
  const bannerRef = useRef<HTMLInputElement>(null)
  const navigate  = useNavigate()

  const { data: existing, loading: isLoading } = useFetch(
    () => isNew ? Promise.resolve(null) : profileService.getMyProfile()
  )

  useEffect(() => {
    if (existing) {
      setProfileId(existing.id)
      setForm({
        businessName: existing.businessName ?? '',
        category:     existing.category     ?? '',
        district:     existing.district     ?? '',
        description:  existing.description  ?? '',
        phone:        existing.phone        ?? '',
        address:      existing.address      ?? '',
        website:      existing.website      ?? '',
      })
      if (existing.logoUrl)   setLogoPreview(existing.logoUrl)
      if (existing.bannerUrl) setBannerPreview(existing.bannerUrl)
    }
  }, [existing])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBannerFile(file)
    setBannerPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = {
        ...form,
        categorySlug: toSlug(form.category),
        districtSlug: toSlug(form.district),
      }

      let saved
      if (isNew) {
        saved = await profileService.create(payload)
      } else {
        saved = await profileService.updateMe(payload)
      }

      const id = saved.id ?? profileId

      if (logoFile && id) {
        await profileService.uploadLogo(id, logoFile)
      }

      if (bannerFile) {
        await profileService.uploadBanner(bannerFile)
      }

      setSuccess(true)
      setTimeout(() => navigate('/mi-perfil'), 1800)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al guardar. Intenta de nuevo.')
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
      <p className="text-gray-500 text-sm">Redirigiendo a tu perfil...</p>
    </div>
  )

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
        <div
          className="relative h-40 bg-gradient-to-br from-orange-400 to-orange-600 cursor-pointer group"
          onClick={() => bannerRef.current?.click()}
        >
          {bannerPreview && (
            <img src={bannerPreview} alt="banner" className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <ImagePlus size={28} className="text-white mb-1" />
            <span className="text-white text-sm font-semibold">
              {bannerPreview ? 'Cambiar banner' : 'Subir banner'}
            </span>
            <span className="text-white/70 text-xs">Recomendado: 1200×400px</span>
          </div>
          {bannerPreview && (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); setBannerPreview(null); setBannerFile(null) }}
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors"
            >
              <X size={14} />
            </button>
          )}
          <input
            ref={bannerRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleBannerChange}
          />
        </div>

        {/* Logo */}
        <div className="px-8 -mt-10 relative z-10 flex items-end gap-4 mb-4">
          <div
            className="relative cursor-pointer group"
            onClick={() => logoRef.current?.click()}
          >
            <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-orange-100 flex items-center justify-center">
              {logoPreview
                ? <img src={logoPreview} alt="logo" className="w-full h-full object-cover" />
                : <span className="text-3xl font-bold text-orange-400">
                    {form.businessName.charAt(0) || '?'}
                  </span>
              }
            </div>
            <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={20} className="text-white" />
            </div>
            <input
              ref={logoRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoChange}
            />
          </div>
          <div className="pb-2">
            <p className="text-xs text-gray-500 font-medium">Logo del negocio</p>
            <p className="text-xs text-gray-400">Click para cambiar</p>
          </div>
        </div>

        {/* Formulario */}
        <div className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Nombre del negocio *">
                <input
                  name="businessName" required
                  value={form.businessName} onChange={handleChange}
                  placeholder="Ej: La Sazón Lurín"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
                />
              </Field>
              <Field label="Categoría *">
                <select
                  name="category" required
                  value={form.category} onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors bg-white"
                >
                  <option value="">Seleccionar...</option>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </Field>
            </div>

            <Field label="Descripción *">
              <textarea
                name="description" required rows={3}
                value={form.description} onChange={handleChange}
                placeholder="Describe tu servicio..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors resize-none"
              />
            </Field>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Teléfono *">
                <input
                  name="phone" required
                  value={form.phone} onChange={handleChange}
                  placeholder="+51 900 000 000"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
                />
              </Field>
              <Field label="Distrito *">
                <input
                  name="district" required
                  value={form.district} onChange={handleChange}
                  placeholder="Lurín"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
                />
              </Field>
            </div>

            <Field label="Dirección">
              <input
                name="address"
                value={form.address} onChange={handleChange}
                placeholder="Av. Principal 123"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
              />
            </Field>

            <Field label="Sitio web (opcional)">
              <input
                name="website"
                value={form.website} onChange={handleChange}
                placeholder="https://mitienda.pe"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
              />
            </Field>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-red-500 text-sm font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-3 rounded-full transition-colors flex items-center justify-center gap-2"
            >
              {loading && (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {loading ? 'Guardando...' : isNew ? '🚀 Publicar servicio' : '💾 Guardar cambios'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      {children}
    </div>
  )
}