import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import api from '../../services/api'
import enlurinLogo from '../../assets/images/enlurinLogo.png'

function decodeJwt(token: string) {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

function extractRole(payload: any): 'USER' | 'PROVIDER' | 'ADMIN' {
  const raw =
    payload?.role ||
    payload?.roles?.[0] ||
    payload?.authorities?.[0]?.authority ||
    payload?.authorities?.[0] ||
    'USER'
  return String(raw).replace('ROLE_', '') as 'USER' | 'PROVIDER' | 'ADMIN'
}

export default function Login() {
  const [form, setForm]         = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { login } = useAuth()
  const navigate  = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', form)
      const token = data.token ?? data

      let user = data.user
      if (!user) {
        const payload = decodeJwt(token)
        user = {
          id:    payload?.id    ?? payload?.userId ?? 0,
          name:  payload?.name  ?? payload?.username ?? form.email.split('@')[0],
          email: payload?.email ?? payload?.sub ?? form.email,
          role:  extractRole(payload),
        }
      }

      login(token, user)
      navigate('/')
    } catch {
      setError('Correo o contraseña incorrectos.')
    } finally {
      setLoading(false)
    }
  }

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
          Inicia sesión en tu cuenta
        </p>

        <div className="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">

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
                  className="w-full bg-black border border-white/10 rounded-xl pl-9 pr-4 py-2.5
                             text-sm text-white placeholder-gray-600 outline-none
                             focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showPass ? 'text' : 'password'} name="password" required
                  value={form.password} onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-black border border-white/10 rounded-xl pl-9 pr-10 py-2.5
                             text-sm text-white placeholder-gray-600 outline-none
                             focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-xs font-medium bg-red-500/10 border border-red-500/20
                            rounded-xl px-3 py-2">
                {error}
              </p>
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
              {loading ? 'Iniciando...' : 'Iniciar Sesión'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿No tienes cuenta?{' '}
            <Link to="/registro" className="text-orange-400 font-semibold hover:underline">
              Regístrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
