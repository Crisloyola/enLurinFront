import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import api from '../../services/api'
import enlurinLogo from '../../assets/images/enlurinLogo.png'

export default function Register() {
  const [form, setForm]       = useState({ name: '', email: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate  = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/register', {
        name:     form.name,
        email:    form.email,
        password: form.password,
      })
      const { data } = await api.post('/auth/login', {
        email:    form.email,
        password: form.password,
      })
      const token = data.token ?? data
      const user  = data.user  ?? {
        id:    0,
        name:  form.name,
        email: form.email,
        role:  'USER' as const,
      }
      login(token, user)
      navigate('/')
    } catch (err: any) {
      const msg = err?.response?.data
      setError(typeof msg === 'string' ? msg : 'Error al registrarse. Verifica tus datos.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = `w-full bg-black border border-white/10 rounded-xl py-2.5 text-sm text-white
                    placeholder-gray-600 outline-none
                    focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all`

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/">
            <img
              src={enlurinLogo}
              alt="enLurín"
              className="h-16 w-auto object-contain"
            />
          </Link>
        </div>

        <p className="text-center text-gray-400 text-sm mb-6">
          Crea tu cuenta gratis
        </p>

        <div className="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Nombre */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1.5">
                Nombre completo
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text" name="name" required
                  value={form.name} onChange={handleChange}
                  placeholder="Juan Pérez"
                  className={`${inputCls} pl-9 pr-4`}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1.5">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email" name="email" required
                  value={form.email} onChange={handleChange}
                  placeholder="tu@email.com"
                  className={`${inputCls} pl-9 pr-4`}
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="password" name="password" required minLength={6}
                  value={form.password} onChange={handleChange}
                  placeholder="Mínimo 6 caracteres"
                  className={`${inputCls} pl-9 pr-4`}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                <p className="text-red-400 text-xs font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-black font-bold py-3
                         rounded-full transition-colors disabled:opacity-60
                         flex items-center justify-center gap-2 mt-2"
            >
              {loading && (
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              )}
              {loading ? 'Registrando...' : 'Crear cuenta'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-orange-400 font-semibold hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
