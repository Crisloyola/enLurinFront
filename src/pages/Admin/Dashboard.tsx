import { adminService } from '../../services/admin.service'
import { useFetch } from '../../hooks/useFetch'
import Loader from '../../components/common/Loader'
import { Link } from 'react-router-dom'
import { Users, Store, Clock, Star, Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { AppUser } from '../../services/admin.service'
import type { Profile } from '../../services/profile.service'

function roleLabel(role: any): string {
  if (!role) return 'USER'
  if (typeof role === 'object') return role.authority ?? role.name ?? 'USER'
  return String(role).replace('ROLE_', '')
}

export default function Dashboard() {
  const { data: pending,   isLoading: l1 } = useFetch<Profile[]>(() => adminService.getPending())
  const { data: approved,  isLoading: l2 } = useFetch<Profile[]>(() => adminService.getAllProfiles())
  const { data: suspended, isLoading: l3 } = useFetch<Profile[]>(() => adminService.getSuspended())
  const { data: users,     isLoading: l4, refetch: refetchUsers } = useFetch<AppUser[]>(() => adminService.getUsers())
  const [processing, setProcessing] = useState<number | null>(null)

  const handleFeatured = async (id: number) => {
    setProcessing(id)
    try { await adminService.setFeatured(id) } finally { setProcessing(null) }
  }

  const handleDeleteUser = async (id: number) => {
    if (!confirm('¿Eliminar este usuario?')) return
    setProcessing(id)
    try { await adminService.deleteUser(id); refetchUsers() } finally { setProcessing(null) }
  }

  if (l1 || l2 || l3 || l4) return <Loader text="Cargando panel..." />

  const allProfiles = [
    ...(pending   ?? []),
    ...(approved  ?? []),
    ...(suspended ?? []),
  ]

  const stats = [
    { label: 'Usuarios totales',        value: users?.length    ?? 0, icon: <Users size={20}/>, color: 'bg-blue-50   text-blue-600'   },
    { label: 'Perfiles aprobados',       value: approved?.length ?? 0, icon: <Store size={20}/>, color: 'bg-green-50  text-green-600'  },
    { label: 'Pendientes de aprobación', value: pending?.length  ?? 0, icon: <Clock size={20}/>, color: 'bg-yellow-50 text-yellow-600' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-extrabold text-2xl text-gray-900">Panel de Administración</h1>
        <Link to="/admin/pendientes"
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-4 py-2.5 rounded-full transition-colors">
          <Clock size={15}/> Ver pendientes
          {(pending?.length ?? 0) > 0 && (
            <span className="bg-white text-orange-600 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {pending!.length}
            </span>
          )}
        </Link>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl shadow-sm p-5">
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}>{s.icon}</div>
            <p className="font-extrabold text-3xl text-gray-900">{s.value}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Profiles */}
      <h2 className="font-bold text-lg text-gray-900 mb-4">Todos los Perfiles</h2>
      <div className="space-y-3 mb-10">
        {allProfiles.map(p => (
          <div key={p.id} className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm text-gray-900 truncate">{p.businessName}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full
                  ${p.status === 'ACTIVE'  ? 'bg-green-100 text-green-700'  : ''}
                  ${p.status === 'PENDING'   ? 'bg-yellow-100 text-yellow-700': ''}
                  ${p.status === 'PENDING'   ? 'bg-yellow-100 text-yellow-700': ''}
                  ${p.status === 'INACTIVE' ? 'bg-red-100 text-red-600'      : ''}`}>
                  {p.status}
                </span>
                {p.featured && <span className="text-xs font-bold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">⭐</span>}
              </div>
              <p className="text-xs text-gray-400">{p.category} — {p.district}</p>
            </div>
            <button onClick={() => handleFeatured(p.id)} disabled={processing === p.id}
                    className="text-xs font-semibold flex items-center gap-1 border border-yellow-400 text-yellow-600 hover:bg-yellow-50 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50">
              <Star size={12}/> {p.featured ? 'Quitar' : 'Destacar'}
            </button>
          </div>
        ))}
        {allProfiles.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-8">No hay perfiles aún</p>
        )}
      </div>

      {/* Users */}
      <h2 className="font-bold text-lg text-gray-900 mb-4">Usuarios Registrados</h2>
      <div className="space-y-3">
        {(users ?? []).map(u => (
          <div key={u.id} className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-4">
            <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {String(u.name ?? '?').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-900 truncate">{u.name}</p>
              <p className="text-xs text-gray-400">{u.email}</p>
            </div>
            <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              {roleLabel(u.role)}
            </span>
            <button onClick={() => handleDeleteUser(u.id)} disabled={processing === u.id}
                    className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-xl transition-colors disabled:opacity-50">
              <Trash2 size={14}/>
            </button>
          </div>
        ))}
        {(users ?? []).length === 0 && (
          <p className="text-gray-400 text-sm text-center py-8">No hay usuarios aún</p>
        )}
      </div>
    </div>
  )
}
