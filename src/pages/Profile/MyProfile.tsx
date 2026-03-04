import { Link } from 'react-router-dom'
import { Edit, Star, MapPin, Phone, Globe, Clock, Instagram, Facebook, Youtube, Music2, MessageCircle } from 'lucide-react'
import { profileService, type Profile } from '../../services/profile.service'
import { useFetch } from '../../hooks/useFetch'
import { useAuth } from '../../hooks/useAuth'
import Loader from '../../components/common/Loader'

/** Garantiza URL absoluta o retorna null si está vacía/inválida */
function ensureUrl(url?: string | null): string | null {
  const v = url?.trim()
  if (!v) return null
  return v.startsWith('http') ? v : `https://${v}`
}

export default function MyProfile() {
  const { user } = useAuth()
  const { data: profile, loading, error } = useFetch<Profile>(
    () => profileService.getMyProfile()
  )

  if (loading) return <Loader text="Cargando tu perfil..." />

  const statusColor: Record<string, string> = {
    ACTIVE:   'bg-green-100 text-green-700',
    PENDING:  'bg-yellow-100 text-yellow-700',
    INACTIVE: 'bg-red-100 text-red-600',
  }

  // Construir lista de redes solo con las que tienen URL válida
  const socialLinks = profile
    ? [
        { url: profile.instagram, label: 'Instagram', icon: <Instagram size={15} className="text-white" />, bg: 'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)' },
        { url: profile.facebook,  label: 'Facebook',  icon: <Facebook  size={15} className="text-white" />, bg: '#1877F2' },
        { url: profile.youtube,   label: 'YouTube',   icon: <Youtube   size={15} className="text-white" />, bg: '#FF0000' },
        { url: profile.tiktok,    label: 'TikTok',    icon: <Music2    size={15} className="text-white" />, bg: '#000000' },
      ]
        .map(item => ({ ...item, href: ensureUrl(item.url) }))
        .filter(item => !!item.href) as { href: string; label: string; icon: React.ReactNode; bg: string }[]
    : []

  const whatsappNum = (profile?.whatsapp || profile?.phone || '').replace(/[^0-9]/g, '')
  const whatsappUrl = whatsappNum
    ? `https://wa.me/${whatsappNum}`
    : '#'

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="font-extrabold text-2xl text-gray-900 mb-6">Mi Perfil</h1>

      {/* Info del usuario */}
      <div className="bg-white rounded-2xl shadow-sm p-5 mb-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center text-white text-xl font-bold">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900">{user?.name}</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>
        <span className="text-xs font-bold bg-orange-100 text-orange-700 px-3 py-1 rounded-full">
          {user?.role}
        </span>
      </div>

      {error || !profile ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <p className="text-5xl mb-4">🏪</p>
          <h3 className="font-bold text-lg text-gray-900 mb-2">Aún no tienes un perfil de negocio</h3>
          <p className="text-gray-500 text-sm mb-6">Publica tu servicio y llega a clientes en Lurín</p>
          <Link to="/publicar" className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-full transition-colors">
            Publicar mi servicio
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-start justify-between mb-4 gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColor[profile.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {profile.status}
                </span>
                {profile.featured && (
                  <span className="text-xs font-bold bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full">⭐ Destacado</span>
                )}
              </div>
              <h2 className="font-extrabold text-xl text-gray-900 truncate">{profile.businessName}</h2>
              <p className="text-orange-600 text-sm font-semibold">
                {profile.category ?? 'Sin categoría'} — {profile.district ?? 'Sin distrito'}
              </p>
            </div>
            <Link to="/mi-perfil/editar"
              className="inline-flex items-center gap-1.5 border-2 border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white font-semibold text-sm px-3 py-2 rounded-full transition-all shrink-0">
              <Edit size={14} /> Editar
            </Link>
          </div>

          {profile.description && (
            <p className="text-gray-600 text-sm leading-relaxed mb-5">{profile.description}</p>
          )}

          <div className="grid sm:grid-cols-2 gap-3 mb-5">
            {profile.address && (
              <InfoRow icon={<MapPin size={14} />}
                text={`${profile.address}${profile.district ? ` — ${profile.district}` : ''}`} />
            )}
            {profile.phone && <InfoRow icon={<Phone size={14} />} text={profile.phone} />}
            {profile.whatsapp && (
              <a href={whatsappUrl} target="_blank" rel="noreferrer" className="flex items-start gap-2.5 text-sm text-gray-600 bg-gray-50 hover:bg-green-50 rounded-xl p-3 transition-colors">
                <span className="text-green-500 mt-0.5 shrink-0"><MessageCircle size={14} /></span>
                <span className="break-all">{profile.whatsapp}</span>
              </a>
            )}
            {profile.schedule && <InfoRow icon={<Clock size={14} />} text={profile.schedule} />}
            {profile.website  && <InfoRow icon={<Globe size={14} />} text={profile.website} />}
            {profile.rating != null && (
              <InfoRow icon={<Star size={14} />}
                text={`${profile.rating.toFixed(1)} ★ (${profile.reviewCount ?? 0} reseñas)`} />
            )}
          </div>

          {/* Redes sociales */}
          {socialLinks.length > 0 && (
            <div className="mb-5">
              <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Redes sociales</p>
              <div className="flex gap-2 flex-wrap">
                {socialLinks.map(({ href, icon, bg, label }) => (
                  <a key={label} href={href} target="_blank" rel="noreferrer"
                    title={label}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-80 hover:scale-105"
                    style={{ background: bg }}>
                    {icon} {label}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Aviso si no tiene redes cargadas */}
          {socialLinks.length === 0 && (
            <div className="mb-5 bg-gray-50 border border-dashed border-gray-200 rounded-xl p-4 flex items-center justify-between">
              <p className="text-sm text-gray-400">No tienes redes sociales configuradas.</p>
              <Link to="/mi-perfil/editar"
                className="text-xs font-semibold text-orange-500 hover:underline shrink-0 ml-3">
                Agregar →
              </Link>
            </div>
          )}

          {profile.status === 'PENDING' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm text-yellow-800">
              ⏳ Tu perfil está en revisión. El equipo de Enlurin lo aprobará pronto.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function InfoRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-start gap-2.5 text-sm text-gray-600 bg-gray-50 rounded-xl p-3">
      <span className="text-orange-500 mt-0.5 shrink-0">{icon}</span>
      <span className="break-all">{text}</span>
    </div>
  )
}
