import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Star, MapPin, Phone, Globe, Clock } from 'lucide-react'
import { profileService, type Profile } from '../../services/profile.service'
import { useFetch } from '../../hooks/useFetch'
import Loader from '../../components/common/Loader'

export default function PublicProfile() {
  const { slug } = useParams<{ slug: string }>()
  const { data: p, loading: isLoading, error } = useFetch<Profile>(
    () => profileService.getBySlug(slug!), [slug]
  )

  if (isLoading) return <Loader text="Cargando perfil..." />
  if (error || !p) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <p className="text-5xl mb-4">😕</p>
      <h2 className="font-bold text-xl mb-4 text-gray-900">Perfil no encontrado</h2>
      <Link to="/explorar" className="text-orange-500 font-semibold hover:underline">Ver todos los servicios</Link>
    </div>
  )
  // Temporal para debug — borrarlo después
  console.log('bannerUrl:', p.bannerUrl)
  console.log('logoUrl:', p.logoUrl)
  const GRADIENTS: Record<string, string> = {
    'Restaurantes': 'from-orange-400 to-red-500',
    'Médicos':      'from-blue-400 to-cyan-500',
    'Abogados':     'from-gray-600 to-gray-800',
    'Belleza & Spa':'from-pink-400 to-rose-500',
    default:        'from-orange-400 to-orange-600',
  }
  const gradient = GRADIENTS[p.category] ?? GRADIENTS.default

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/explorar"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-500 mb-6 transition-colors">
        <ArrowLeft size={16} /> Volver a resultados
      </Link>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

       {/* Banner + Logo */}
      <div className={`relative h-52 bg-gradient-to-br ${gradient} overflow-hidden`}>
        {p.bannerUrl && (
          <img src={p.bannerUrl} alt="banner" className="absolute inset-0 w-full h-full object-cover" />
        )}
      </div>

      {/* Logo — FUERA del div del banner */}
      <div className="relative px-6 -mt-10 mb-2">
        <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-white flex items-center justify-center">
          {p.logoUrl
            ? <img src={p.logoUrl} alt={p.businessName} className="w-full h-full object-cover" />
            : <span className="text-3xl font-bold text-orange-400">{p.businessName.charAt(0)}</span>
          }
        </div>
      </div>

        <div className="p-6 md:p-8 pt-14">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
            <div>
              <span className="inline-block bg-orange-100 text-orange-700 text-xs font-bold px-2.5 py-1 rounded-full mb-2">
                {p.category}
              </span>
              {p.featured && (
                <span className="inline-block bg-yellow-100 text-yellow-700 text-xs font-bold px-2.5 py-1 rounded-full mb-2 ml-1">⭐ Destacado</span>
              )}
              <h1 className="font-extrabold text-2xl text-gray-900">{p.businessName}</h1>
              {p.rating && (
                <div className="flex items-center gap-1.5 mt-1">
                  <Star size={15} className="fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-sm">{p.rating.toFixed(1)}</span>
                  <span className="text-gray-400 text-sm">({p.reviewCount} reseñas)</span>
                </div>
              )}
            </div>
            {p.phone ? (
              <a href={`tel:${p.phone}`}
                 className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-full transition-colors shrink-0">
                <Phone size={16} /> Llamar ahora
              </a>
            ) : null}
          </div>

          <p className="text-gray-600 text-sm leading-relaxed mb-6">{p.description}</p>

          <div className="grid sm:grid-cols-2 gap-3">
            <InfoRow icon={<MapPin size={15}/>} text={(() => {
              const parts: string[] = []
              if (p.address) parts.push(p.address)
              if (p.district) parts.push(p.district)
              return parts.join(' — ') || 'Dirección no especificada'
            })()} />
            <InfoRow icon={<Phone  size={15}/>} text={p.phone || 'No disponible'} />
            {p.website && <InfoRow icon={<Globe size={15}/>} text={p.website} />}
            <InfoRow icon={<Clock  size={15}/>} text="Contáctanos para conocer horarios" />
          </div>
        </div>
      </div>
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

