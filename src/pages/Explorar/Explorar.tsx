import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Search, MapPin, Star, SlidersHorizontal } from 'lucide-react'
import { profileService, type Profile } from '../../services/profile.service'

const CATEGORIES = [
  'Todos', 'Restaurantes', 'Médicos', 'Abogados', 'Odontólogos',
  'Contadores', 'Hoteles', 'Veterinarias', 'Delivery',
  'Hogar & Reparaciones', 'Belleza & Spa', 'Eventos', 'Farmacias', 'Otros',
]

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

export default function Explorar() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Leer parámetros iniciales de la URL
  const [query, setQuery]       = useState(searchParams.get('q') || '')
  const [district, setDistrict] = useState(searchParams.get('district') || '')
  const [category, setCategory] = useState(searchParams.get('category') || 'Todos')
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading]   = useState(true)

  const doSearch = (q: string, cat: string, dist: string) => {
    setLoading(true)
    const params: Record<string, string> = {}
    if (q)               params.q        = q
    if (cat !== 'Todos') params.category = cat
    if (dist)            params.district = dist
    profileService.search(params)
      .then(setProfiles)
      .catch(() => setProfiles([]))
      .finally(() => setLoading(false))
  }

  // Buscar cuando cambia category, query o district desde la URL
  useEffect(() => {
    const urlCategory = searchParams.get('category') || 'Todos'
    const urlQuery    = searchParams.get('q') || ''
    const urlDistrict = searchParams.get('district') || ''
    setCategory(urlCategory)
    setQuery(urlQuery)
    setDistrict(urlDistrict)
    doSearch(urlQuery, urlCategory, urlDistrict)
  }, [searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const p: Record<string, string> = {}
    if (query)               p.q        = query
    if (district)            p.district = district
    if (category !== 'Todos') p.category = category
    setSearchParams(p)
  }

  const handleCategory = (cat: string) => {
    const p: Record<string, string> = {}
    if (query)    p.q        = query
    if (district) p.district = district
    if (cat !== 'Todos') p.category = cat
    setSearchParams(p)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-5">
        <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm focus-within:border-orange-400 transition-colors">
          <Search size={16} className="text-gray-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar servicios, empresas..."
            className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400"
          />
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 focus-within:border-orange-400 transition-colors shadow-sm">
          <MapPin size={15} className="text-gray-400 shrink-0" />
          <input
            type="text"
            value={district}
            onChange={e => setDistrict(e.target.value)}
            placeholder="Distrito..."
            className="w-28 outline-none text-sm text-gray-700 placeholder-gray-400"
          />
        </div>
        <button
          type="submit"
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          Buscar
        </button>
        <button
          type="button"
          className="hidden sm:flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 text-sm font-medium text-gray-600 hover:bg-gray-50 shadow-sm transition-colors"
        >
          <SlidersHorizontal size={15} /> Filtros
        </button>
      </form>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6" style={{ scrollbarWidth: 'none' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => handleCategory(cat)}
            className={`shrink-0 text-sm font-semibold px-4 py-2 rounded-full transition-all
              ${category === cat
                ? 'bg-orange-500 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
              <div className="h-32 bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="h-3 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : profiles.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-5xl mb-4">🔍</p>
          <h3 className="font-bold text-lg text-gray-900 mb-2">Sin resultados</h3>
          <p className="text-gray-500 text-sm">
            {category !== 'Todos'
              ? `No hay servicios en la categoría "${category}" aún`
              : 'Intenta con otros términos o categorías'}
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4 font-medium">
            {profiles.length} resultado(s)
            {category !== 'Todos' && <span className="text-orange-600 font-bold"> en {category}</span>}
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {profiles.map(p => {
              const gradient = GRADIENTS[p.category] ?? 'from-orange-400 to-orange-600'
              return (
                <Link
                  key={p.id}
                  to={`/perfil/${p.slug}`}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden group block"
                >
                  <div className={`relative h-32 bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}>
                    {p.logoUrl
                      ? <img src={p.logoUrl} alt={p.businessName} className="h-full w-full object-cover" />
                      : <span className="text-4xl font-bold text-white/30">{p.businessName.charAt(0)}</span>
                    }
                    {p.featured && (
                      <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">⭐</span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-orange-600 font-semibold mb-0.5">{p.category}</p>
                    <h3 className="font-bold text-sm text-gray-900 group-hover:text-orange-600 transition-colors truncate mb-1">
                      {p.businessName}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-2 mb-2">{p.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      {p.rating
                        ? <span className="flex items-center gap-1">
                            <Star size={10} className="fill-yellow-400 text-yellow-400" />
                            {p.rating.toFixed(1)}
                          </span>
                        : <span />
                      }
                      <span className="flex items-center gap-1"><MapPin size={10} />{p.district}</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}