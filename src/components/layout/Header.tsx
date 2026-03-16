import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, User, LogOut } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import enlurinLogo from '../../assets/images/enlurinLogo.png'

export default function Header() {
  const [menuOpen,     setMenuOpen]     = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { isAuth, user, logout }        = useAuth()
  const normalizedRole = String(user?.role ?? '').toUpperCase().replace(/^ROLE_/, '')
  const isAdmin = normalizedRole === 'ADMIN'

  /* Links de navegación — activo: lima, inactivo: gris claro */
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${
      isActive
        ? 'text-orange-400 font-semibold'
        : 'text-gray-300 hover:text-orange-400'
    }`

  return (
    <header className="bg-black border-b border-white/10 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="h-16 flex items-center justify-between gap-6">

          {/* Logo imagen */}
          <Link to="/" className="shrink-0 flex items-center">
            <img
              src={enlurinLogo}
              alt="enLurín — Todo en un solo lugar"
              className="h-10 w-auto object-contain"
            />
          </Link>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLink to="/"        end className={linkClass}>Inicio</NavLink>
            <NavLink to="/explorar"    className={linkClass}>Explorar</NavLink>
            <NavLink to="/publicar"    className={linkClass}>Publica Servicio</NavLink>
          </nav>

          {/* Auth desktop */}
          <div className="hidden md:flex items-center gap-2">
            {isAuth && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20
                             rounded-full px-3 py-1.5 text-sm font-semibold text-white transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center
                                  text-black text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  {user.name.split(' ')[0]}
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-11 bg-gray-900 border border-gray-700
                                  rounded-2xl shadow-2xl py-1.5 w-44 z-50">
                    <Link
                      to={isAdmin ? '/admin' : '/mi-perfil'}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-200
                                 hover:bg-gray-800 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User size={15} /> Mi Perfil
                    </Link>
                    <hr className="my-1 border-gray-700" />
                    <button
                      onClick={() => { logout(); setUserMenuOpen(false) }}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400
                                 hover:bg-gray-800 w-full transition-colors"
                    >
                      <LogOut size={15} /> Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-300 hover:text-orange-400 px-3 py-2 transition-colors"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/registro"
                  className="bg-orange-500 hover:bg-orange-600 text-black text-sm font-bold
                             px-4 py-2 rounded-full transition-colors flex items-center gap-2"
                >
                  <User size={14} /> Regístrate
                </Link>
              </>
            )}
          </div>

          {/* Hamburguesa mobile */}
          <button
            className="md:hidden p-2 rounded-xl text-gray-300 hover:bg-white/10 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Menú mobile */}
      {menuOpen && (
        <div className="md:hidden bg-black border-t border-white/10 px-4 py-4 space-y-3">
          <NavLink to="/"        end className={linkClass} onClick={() => setMenuOpen(false)}>Inicio</NavLink>
          <br />
          <NavLink to="/explorar"    className={linkClass} onClick={() => setMenuOpen(false)}>Explorar</NavLink>
          <br />
          <NavLink to="/publicar"    className={linkClass} onClick={() => setMenuOpen(false)}>Publica Servicio</NavLink>

          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            {isAuth ? (
              <button
                onClick={() => { logout(); setMenuOpen(false) }}
                className="border-2 border-orange-500 text-orange-400 font-semibold
                           py-2.5 rounded-full transition-colors text-sm"
              >
                Cerrar sesión
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="border-2 border-orange-500 text-orange-400 font-semibold
                             py-2.5 rounded-full text-center text-sm"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/registro"
                  onClick={() => setMenuOpen(false)}
                  className="bg-orange-500 text-black font-bold py-2.5 rounded-full text-center text-sm"
                >
                  Regístrate gratis
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
