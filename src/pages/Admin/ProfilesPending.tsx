import { useState } from 'react'
import { adminService } from '../../services/admin.service'
import { useFetch } from '../../hooks/useFetch'
import Loader from '../../components/common/Loader'
import { Check, X, MapPin, Phone } from 'lucide-react'
import type { Profile } from '../../services/profile.service'

export default function ProfilesPending() {
  const {
    data: profiles,
    loading,
    refetch
  } = useFetch<Profile[]>(() => adminService.getPending())

  const [processing, setProcessing] = useState<number | null>(null)
  const [errors, setErrors]         = useState<Record<number, string>>({})

  const handleApprove = async (id: number) => {
    setProcessing(id)
    setErrors(prev => ({ ...prev, [id]: '' }))
    try {
      await adminService.approve(id)
      refetch()
    } catch (err: any) {
      const msg = err?.response?.data?.error ??
                  err?.response?.data?.message ??
                  err?.response?.data ??
                  'Error al aprobar'
      setErrors(prev => ({
        ...prev,
        [id]: typeof msg === 'string' ? msg : 'Error al aprobar'
      }))
    } finally {
      setProcessing(null)
    }
  }

  const handleSuspend = async (id: number) => {
    if (!confirm('¿Rechazar este perfil?')) return
    setProcessing(id)
    try {
      await adminService.suspend(id)
      refetch()
    } catch {
      setErrors(prev => ({ ...prev, [id]: 'Error al rechazar' }))
    } finally {
      setProcessing(null)
    }
  }

  if (loading) return <Loader text="Cargando pendientes..." />

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="font-extrabold text-2xl text-gray-900 mb-1">
        Perfiles Pendientes
      </h1>
      <p className="text-gray-500 text-sm mb-8">
        {profiles?.length ?? 0} perfil(es) esperando aprobación
      </p>

      {!profiles || profiles.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
          <p className="text-5xl mb-4">✅</p>
          <h3 className="font-bold text-lg text-gray-900">¡Todo al día!</h3>
          <p className="text-gray-500 text-sm mt-1">No hay perfiles pendientes.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {profiles.map(p => (
            <div key={p.id} className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-bold text-gray-900">{p.businessName}</h3>
                    <span className="text-xs font-bold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                      PENDIENTE
                    </span>
                  </div>
                  <p className="text-xs text-orange-600 font-semibold mb-1">
                    {p.category ?? 'Sin categoría'} — {p.district ?? 'Sin distrito'}
                  </p>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                    {p.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    {p.address && (
                      <span className="flex items-center gap-1">
                        <MapPin size={11} />{p.address}
                      </span>
                    )}
                    {p.phone && (
                      <span className="flex items-center gap-1">
                        <Phone size={11} />{p.phone}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    disabled={processing === p.id}
                    onClick={() => handleApprove(p.id)}
                    className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-semibold text-sm px-4 py-2 rounded-full transition-colors"
                  >
                    {processing === p.id
                      ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <Check size={14} />
                    }
                    Aprobar
                  </button>
                  <button
                    disabled={processing === p.id}
                    onClick={() => handleSuspend(p.id)}
                    className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-semibold text-sm px-4 py-2 rounded-full transition-colors"
                  >
                    <X size={14} /> Rechazar
                  </button>
                </div>
              </div>

              {errors[p.id] && (
                <p className="text-red-500 text-xs mt-2 font-medium">
                  {errors[p.id]}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}