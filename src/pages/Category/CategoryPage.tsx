import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { MapPin, Star, Phone, ArrowLeft, Search } from 'lucide-react'
import { profileService, type Profile } from '../../services/profile.service'

// ── Config de categorías ──────────────────────────────────────────────────────
const CAT_CONFIG: Record<string, {
  emoji: string
  gradient: string
  bg: string
  description: string
}> = {
  'Médicos':              { emoji: '🏥', gradient: 'from-blue-500 to-cyan-500',    bg: 'bg-blue-500',   description: 'Clínicas, consultorios y especialistas médicos en Lurín' },
  'Restaurantes':         { emoji: '🍽️', gradient: 'from-orange-400 to-red-500',   bg: 'bg-orange-500', description: 'Los mejores sabores y cocinas de Lurín en un solo lugar' },
  'Abogados':             { emoji: '⚖️', gradient: 'from-gray-600 to-gray-800',    bg: 'bg-gray-700',   description: 'Asesoría legal y estudios jurídicos en Lurín' },
  'Odontólogos':          { emoji: '🦷', gradient: 'from-teal-400 to-emerald-500', bg: 'bg-teal-500',   description: 'Clínicas dentales y especialistas en salud bucal' },
  'Contadores':           { emoji: '📊', gradient: 'from-indigo-500 to-blue-600',  bg: 'bg-indigo-500', description: 'Estudios contables y asesoría financiera en Lurín' },
  'Hoteles':              { emoji: '🏨', gradient: 'from-yellow-400 to-orange-400',bg: 'bg-yellow-500', description: 'Hospedajes, hostales y hoteles en Lurín' },
  'Veterinarias':         { emoji: '🐾', gradient: 'from-green-400 to-teal-500',   bg: 'bg-green-500',  description: 'Clínicas veterinarias y tiendas de mascotas' },
  'Belleza & Spa':        { emoji: '💆', gradient: 'from-pink-400 to-rose-500',    bg: 'bg-pink-500',   description: 'Salones de belleza, spas y centros de estética' },
  'Hogar & Reparaciones': { emoji: '🔧', gradient: 'from-slate-400 to-gray-600',   bg: 'bg-slate-500',  description: 'Técnicos, gasfiteros, electricistas y servicios del hogar' },
  'Eventos':              { emoji: '🎉', gradient: 'from-violet-500 to-purple-600',bg: 'bg-violet-500', description: 'Organizadores de eventos, catering y alquiler de locales' },
  'Farmacias':            { emoji: '💊', gradient: 'from-red-400 to-rose-500',     bg: 'bg-red-500',    description: 'Farmacias y boticas en Lurín' },
  'Delivery':             { emoji: '🛵', gradient: 'from-orange-300 to-orange-500',bg: 'bg-orange-400', description: 'Servicios de delivery y envíos en Lurín' },
  'Otros':                { emoji: '🏪', gradient: 'from-gray-400 to-gray-600',    bg: 'bg-gray-500',   description: 'Otros servicios y negocios en Lurín' },
}

const GRADIENTS: Record<string, string> = {
  'Restaurantes':         'from-orange-400 to-red-500',
  'Médicos':              'from-blue-400 to-cyan-500',
  'Abogados':             'from-gray-600 to-gray-800',
  'Odontólogos':          'from-teal-400 to-emerald-500',
  'Belleza & Spa':        'from-pink-400 to-rose-500',
  'Hogar & Reparaciones': 'from-slate-400 to-gray-600',
  'Eventos':              'from-violet-400 to-purple-600',
  'Contadores':           'from-indigo-400 to-blue-600',
  'Hoteles':              'from-yellow-400 to-orange-400',
  'Veterinarias':         'from-green-400 to-teal-500',
  'Delivery':             'from-orange-300 to-orange-500',
  'Farmacias':            'from-red-400 to-rose-500',
}

// ── Skeleton loader ───────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse flex gap-0">
      <div className="w-28 shrink-0 bg-gray-200" />
      <div className="flex-1 p-4 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-1/4" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-3/4" />
      </div>
    </div>
  )
}

// ── Tarjeta de negocio en fila (estilo directorio) ────────────────────────────
function DirectoryCard({ p }: { p: Profile }) {
  const gradient = GRADIENTS[p.category] ?? 'from-orange-400 to-orange-600'
  const whatsappNum = (p.whatsapp || p.phone || '').replace(/[^0-9]/g, '')
  const whatsappUrl = whatsappNum ? `https://wa.me/${whatsappNum}` : null

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden flex group">
      {/* Imagen / Logo lateral */}
      <Link to={`/perfil/${p.slug}`} className="relative w-28 sm:w-36 shrink-0 overflow-hidden">
        <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center min-h-[110px]`}>
          {p.logoUrl
            ? <img src={p.logoUrl} alt={p.businessName} className="w-full h-full object-cover" />
            : <span className="text-4xl font-bold text-white/30">{p.businessName.charAt(0)}</span>
          }
        </div>
        {p.featured && (
          <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full">⭐</span>
        )}
      </Link>

      {/* Contenido */}
      <div className="flex-1 p-4 min-w-0 flex flex-col justify-between">
        <div>
          <Link to={`/perfil/${p.slug}`}>
            <h3 className="font-bold text-gray-900 text-sm group-hover:text-orange-500 transition-colors truncate mb-0.5">
              {p.businessName}
            </h3>
          </Link>
          <p className="text-xs text-orange-500 font-semibold mb-1">{p.category}</p>
          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{p.description}</p>
        </div>

        <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            {p.address && (
              <span className="flex items-center gap-1">
                <MapPin size={10} /> {p.address.split(',')[0]}
              </span>
            )}
            {p.rating && (
              <span className="flex items-center gap-1 font-semibold text-gray-600">
                <Star size={10} className="fill-yellow-400 text-yellow-400" />
                {p.rating.toFixed(1)}
              </span>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex gap-1.5 shrink-0">
            <Link
              to={`/perfil/${p.slug}`}
              className="text-xs font-semibold px-3 py-1.5 rounded-full border-2 border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white transition-all"
            >
              Ver Perfil
            </Link>
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold px-3 py-1.5 rounded-full bg-green-500 hover:bg-green-600 text-white transition-all"
              >
                WhatsApp
              </a>
            )}
            {p.latitude && p.longitude && (
              <a
                href={`https://www.google.com/maps?q=${p.latitude},${p.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-all"
              >
                Ubicación
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function CategoryPage() {
  const { category } = useParams<{ category: string }>()
  const navigate     = useNavigate()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading,  setLoading]  = useState(true)
  const [query,    setQuery]    = useState('')

  const catName   = decodeURIComponent(category ?? '')
  const config    = CAT_CONFIG[catName] ?? {
    emoji: '🏪', gradient: 'from-gray-500 to-gray-700', bg: 'bg-gray-600',
    description: `Servicios de ${catName} en Lurín`,
  }

  useEffect(() => {
    setLoading(true)
    profileService.search({ category: catName })
      .then(setProfiles)
      .catch(() => setProfiles([]))
      .finally(() => setLoading(false))
  }, [catName])

  const filtered = query
    ? profiles.filter(p =>
        p.businessName.toLowerCase().includes(query.toLowerCase()) ||
        p.description?.toLowerCase().includes(query.toLowerCase())
      )
    : profiles

  return (
    <div>
      {/* ── Banner de categoría ─────────────────────────────────────────────── */}
      <div className={`relative bg-gradient-to-br ${config.gradient} overflow-hidden`}>
        {/* Patrón de fondo */}
        <div className="absolute inset-0 opacity-10"
             style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        <div className="max-w-7xl mx-auto px-4 py-10 relative z-10">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeft size={16} /> Volver
          </button>

          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center text-4xl shrink-0 shadow-lg">
              {config.emoji}
            </div>
            <div>
              <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">
                Directorio Lurín
              </p>
              <h1 className="text-white font-extrabold text-3xl md:text-4xl leading-tight mb-1">
                {catName}
              </h1>
              <p className="text-white/80 text-sm">{config.description}</p>
            </div>
          </div>

          {/* Buscador interno */}
          <div className="mt-6 max-w-md">
            <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 shadow-lg">
              <Search size={15} className="text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder={`Buscar en ${catName}...`}
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Ola decorativa abajo */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 32L1440 32L1440 10C1200 32 720 0 0 20L0 32Z" fill="#f9fafb"/>
          </svg>
        </div>
      </div>

      {/* ── Listado ─────────────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Contador de resultados */}
        {!loading && (
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-gray-500">
              <span className="font-bold text-gray-900">{filtered.length}</span>{' '}
              {filtered.length === 1 ? 'negocio encontrado' : 'negocios encontrados'}
              {query && <span className="text-orange-500"> para "{query}"</span>}
            </p>
            <Link
              to="/explorar"
              className="text-xs text-orange-500 font-semibold hover:underline"
            >
              Ver todas las categorías →
            </Link>
          </div>
        )}

        {/* Sin categorías / sin resultados */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">{config.emoji}</p>
            <h3 className="font-bold text-lg text-gray-900 mb-2">
              {query ? 'Sin resultados' : `Aún no hay ${catName} registrados`}
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              {query
                ? `No encontramos resultados para "${query}"`
                : 'Sé el primero en publicar tu negocio en esta categoría'
              }
            </p>
            <Link
              to="/publicar"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-full transition-colors"
            >
              Publicar mi negocio
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(p => <DirectoryCard key={p.id} p={p} />)}
          </div>
        )}

        {/* CTA inferior */}
        {!loading && filtered.length > 0 && (
          <div className="mt-10 bg-white rounded-2xl shadow-sm p-6 text-center border border-gray-100">
            <p className="text-2xl mb-2">{config.emoji}</p>
            <h3 className="font-bold text-gray-900 mb-1">¿Tienes un negocio de {catName}?</h3>
            <p className="text-gray-500 text-sm mb-4">Únete a Enlurin y llega a más clientes en Lurín</p>
            <Link
              to="/publicar"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-full transition-colors"
            >
              Publicar mi negocio gratis
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
