import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import api from '../../services/api'

/** Decodifica el payload del JWT sin librerías externas */
function decodeJwt(token: string) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload
  } catch {
    return null
  }
}

/** Extrae el rol del payload — Spring puede guardarlo de distintas formas */
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

      // Si el backend ya devuelve user, usarlo directo
      // Si no, decodificar el JWT para sacar el rol real
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-extrabold">
            <span className="text-gray-900">ESLURIN</span>
            <span className="text-orange-500">.PE</span>
          </Link>
          <p className="text-gray-500 text-sm mt-2">Inicia sesión en tu cuenta</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Correo electrónico</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email" name="email" required
                  value={form.email} onChange={handleChange}
                  placeholder="tu@email.com"
                  className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contraseña</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPass ? 'text' : 'password'} name="password" required
                  value={form.password} onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-xl pl-9 pr-10 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-500 text-xs font-medium">{error}</p>}

            <button type="submit" disabled={loading}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-full transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {loading ? 'Iniciando...' : 'Iniciar Sesión'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿No tienes cuenta?{' '}
            <Link to="/registro" className="text-orange-500 font-semibold hover:underline">
              Regístrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
