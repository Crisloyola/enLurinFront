import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Search, MapPin, Star, Phone } from 'lucide-react'
import { profileService, type Profile } from '../../services/profile.service'
import { useAuth } from '../../hooks/useAuth'

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

// ── Hero ──────────────────────────────────────────────────────────────────
function Hero() {
  const [query, setQuery]       = useState('')
  const [district, setDistrict] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const p = new URLSearchParams()
    if (query)    p.set('q', query)
    if (district) p.set('district', district)
    navigate(`/explorar?${p.toString()}`)
  }

  return (
    <section className="bg-orange-500 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10"
           style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
      <div className="max-w-7xl mx-auto px-4 py-14 md:py-20 relative z-10">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-orange-100 text-sm font-medium mb-3">Encuentra servicios rápidos, seguros y cerca de ti.</p>
            <h1 className="text-white font-extrabold text-4xl md:text-5xl leading-tight mb-6">
              Conectamos clientes,<br />con los mejores<br />
              <span className="text-gray-900">proveedores locales.</span>
            </h1>
            <form onSubmit={handleSearch}
                  className="bg-white rounded-2xl shadow-xl p-2 flex flex-col sm:flex-row gap-2">
              <div className="flex items-center gap-2 flex-1 px-3">
                <Search size={17} className="text-gray-400 shrink-0" />
                <input type="text" placeholder="Busca un servicio o empresa..."
                       value={query} onChange={e => setQuery(e.target.value)}
                       className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400" />
              </div>
              <div className="hidden sm:flex items-center gap-2 px-3 border-l border-gray-100">
                <MapPin size={15} className="text-gray-400 shrink-0" />
                <input type="text" placeholder="Distrito..."
                       value={district} onChange={e => setDistrict(e.target.value)}
                       className="w-24 outline-none text-sm text-gray-700 placeholder-gray-400" />
              </div>
              <button type="submit"
                      className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-full transition-colors">
                Buscar ahora
              </button>
            </form>
          </div>
          <div className="hidden md:flex justify-end">
            <div className="relative">
              <div className="w-72 h-72 rounded-3xl bg-orange-600/40 flex items-center justify-center text-8xl">👩‍💼</div>
              <div className="absolute top-4 -right-4 bg-white rounded-xl shadow-lg px-4 py-2.5 text-xs font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" /> ESLURIN.PE — Servicios confiables ✅
              </div>
              <div className="absolute -bottom-2 -left-4 bg-white rounded-xl shadow-lg px-4 py-2.5 text-xs font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500" /> Profesionales listos para ayudarte 🚀
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Profile Card ──────────────────────────────────────────────────────────
function ProfileCard({ p }: { p: Profile }) {
  const { user } = useAuth()
  const gradient = GRADIENTS[p.category] ?? 'from-orange-400 to-orange-600'
  const isAdmin = user?.role === 'ADMIN'
  const href = isAdmin ? '/admin' : `/perfil/${p.slug}`

  console.log('user role:', user?.role, 'isAdmin:', isAdmin)

  return (
    <Link to={href}
          className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden group block">
      <div className={`relative h-36 bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}>
        {p.logoUrl
          ? <img src={p.logoUrl} alt={p.businessName} className="h-full w-full object-cover" />
          : <span className="text-5xl font-bold text-white/40">{p.businessName.charAt(0)}</span>
        }
        {p.featured && (
          <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">⭐ Destacado</span>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs text-orange-600 font-semibold mb-0.5">{p.category}</p>
        <h3 className="font-bold text-sm text-gray-900 group-hover:text-orange-600 transition-colors mb-1 truncate">{p.businessName}</h3>
        <p className="text-xs text-gray-400 line-clamp-2 mb-3">{p.description}</p>
        <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-50">
          {p.rating
            ? <span className="flex items-center gap-1 font-semibold text-gray-600">
                <Star size={11} className="fill-yellow-400 text-yellow-400" />{p.rating.toFixed(1)}
                <span className="font-normal text-gray-400">({p.reviewCount})</span>
              </span>
            : <span />
          }
          <span className="flex items-center gap-1"><MapPin size={10} /> {p.district}</span>
        </div>
      </div>
    </Link>
  )
}

// ── Featured Section ──────────────────────────────────────────────────────
const TABS = ['Todos', 'Restaurantes', 'Médicos', 'Abogados', 'Belleza & Spa', 'Eventos', 'Otros']

function FeaturedSection() {
  const [profiles, setProfiles]   = useState<Profile[]>([])
  const [loading, setLoading]     = useState(true)
  const [activeTab, setActiveTab] = useState('Todos')

  useEffect(() => {
    profileService.getAllActive()
      .then(data => {
        console.log('perfiles activos:', data)
        setProfiles(data)
      })
      .catch(err => {
        console.error('error al cargar perfiles activos:', err)
        setProfiles([])
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = activeTab === 'Todos'
    ? profiles.slice(0, 6)
    : profiles.filter(p => p.category === activeTab).slice(0, 6)

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-900">Descubre los mejores servicios en Lurín</h2>
        <div className="flex gap-1.5 flex-wrap">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all
                      ${activeTab === tab ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
              <div className="h-36 bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="h-3 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map(p => <ProfileCard key={p.id} p={p} />)}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-sm">No hay servicios en esta categoría aún</p>
        </div>
      )}

      <div className="text-center mt-8">
        <Link to="/explorar"
              className="inline-block border-2 border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white font-semibold px-8 py-3 rounded-full transition-all">
          Ver todos los servicios →
        </Link>
      </div>
    </section>
  )
}

// ── Categories Grid ───────────────────────────────────────────────────────
const CATS = [
  { name: 'Médicos',              emoji: '🏥', color: 'bg-blue-50   text-blue-600'   },
  { name: 'Restaurantes',         emoji: '🍽️', color: 'bg-orange-50 text-orange-600' },
  { name: 'Abogados',             emoji: '⚖️', color: 'bg-gray-100  text-gray-600'   },
  { name: 'Odontólogos',          emoji: '🦷', color: 'bg-teal-50   text-teal-600'   },
  { name: 'Contadores',           emoji: '📊', color: 'bg-indigo-50 text-indigo-600' },
  { name: 'Hoteles',              emoji: '🏨', color: 'bg-yellow-50 text-yellow-600' },
  { name: 'Veterinarias',         emoji: '🐾', color: 'bg-green-50  text-green-600'  },
  { name: 'Belleza & Spa',        emoji: '💆', color: 'bg-pink-50   text-pink-600'   },
  { name: 'Hogar & Reparaciones', emoji: '🔧', color: 'bg-slate-50  text-slate-600'  },
  { name: 'Eventos',              emoji: '🎉', color: 'bg-purple-50 text-purple-600' },
  { name: 'Farmacias',            emoji: '💊', color: 'bg-red-50    text-red-600'    },
  { name: 'Delivery',             emoji: '🛵', color: 'bg-orange-50 text-orange-600' },
]

function CategoriesGrid() {
  const navigate = useNavigate()
  return (
    <section className="bg-gray-50 border-y border-gray-100 py-10">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Empresas, Profesionales y Negocios</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {CATS.map(cat => (
            <button key={cat.name}
                    onClick={() => navigate(`/explorar?category=${encodeURIComponent(cat.name)}`)}
                    className="bg-white rounded-2xl shadow-sm hover:shadow-md text-center p-4 group transition-all">
              <div className={`w-12 h-12 mx-auto rounded-xl ${cat.color} flex items-center justify-center text-2xl mb-2 group-hover:scale-110 transition-transform`}>
                {cat.emoji}
              </div>
              <p className="text-xs font-semibold text-gray-700 leading-tight">{cat.name}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── CTAs ──────────────────────────────────────────────────────────────────
function CTABanners() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="relative rounded-3xl bg-gray-900 p-8 overflow-hidden min-h-48">
          <div className="absolute inset-0 opacity-20"
               style={{ backgroundImage: 'radial-gradient(#ea580c 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          <div className="relative z-10">
            <p className="text-orange-400 text-xs font-semibold mb-2 uppercase tracking-widest">Haz crecer tu negocio</p>
            <h3 className="font-extrabold text-white text-2xl leading-tight mb-5">
              Recibe más pedidos y<br />aumenta tus ventas en Lurín.
            </h3>
            <Link to="/publicar"
                  className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-full transition-colors">
              Únete ahora
            </Link>
          </div>
          <div className="absolute bottom-4 right-6 text-6xl opacity-20">👨‍🍳</div>
        </div>
        <div className="relative rounded-3xl bg-orange-500 p-8 overflow-hidden min-h-48">
          <div className="absolute inset-0 opacity-10"
               style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          <div className="relative z-10">
            <p className="text-orange-100 text-xs font-semibold mb-2 uppercase tracking-widest">¿Ofreces servicios en Lurín?</p>
            <h3 className="font-extrabold text-white text-2xl leading-tight mb-5">
              Conéctate con clientes y<br />genera ingresos.
            </h3>
            <Link to="/registro"
                  className="inline-block bg-white text-orange-700 font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-orange-50 transition-colors">
              Regístrame como profesional
            </Link>
          </div>
          <div className="absolute bottom-4 right-6 text-6xl opacity-20">🛵</div>
        </div>
      </div>
    </section>
  )
}

// ── Stats ─────────────────────────────────────────────────────────────────
function StatsBar() {
  const stats = [
    { value: '50+',    label: 'Empresas Registradas' },
    { value: '1,000+', label: 'Usuarios Activos'      },
    { value: '690+',   label: 'Servicios Publicados'  },
    { value: '5,000+', label: 'Contactos Generados'   },
  ]
  return (
    <section className="bg-orange-500 py-10">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
        {stats.map(s => (
          <div key={s.label}>
            <p className="font-extrabold text-3xl md:text-4xl">{s.value}</p>
            <p className="text-orange-100 text-sm mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedSection />
      <CategoriesGrid />
      <CTABanners />
      <StatsBar />
    </>
  )
}
