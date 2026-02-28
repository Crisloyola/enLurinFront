import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, User, LogOut } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export default function Header() {
  const [menuOpen, setMenuOpen]     = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { isAuth, user, logout } = useAuth()

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-orange-500 font-semibold' : 'text-gray-600 hover:text-orange-500'}`

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="h-16 flex items-center justify-between gap-6">

          <Link to="/" className="font-extrabold text-xl shrink-0">
            <span className="text-gray-900">ESLURIN</span>
            <span className="text-orange-500">.PE</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <NavLink to="/" end className={linkClass}>Inicio</NavLink>
            <NavLink to="/explorar" className={linkClass}>Explorar</NavLink>
            <NavLink to="/publicar" className={linkClass}>Publica Servicio</NavLink>
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {isAuth && user ? (
              <div className="relative">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                        className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full px-3 py-1.5 text-sm font-semibold text-gray-700 transition-colors">
                  <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  {user.name.split(' ')[0]}
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-11 bg-white border border-gray-100 rounded-2xl shadow-xl py-1.5 w-44 z-50">
                    <Link to="/mi-perfil"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setUserMenuOpen(false)}>
                      <User size={15} /> Mi Perfil
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <button onClick={() => { logout(); setUserMenuOpen(false) }}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 w-full transition-colors">
                      <LogOut size={15} /> Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-orange-500 px-3 py-2 transition-colors">
                  Iniciar sesión
                </Link>
                <Link to="/registro" className="bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors flex items-center gap-2">
                  <User size={14} /> Login / Register
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100"
                  onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
          <NavLink to="/" end className={linkClass} onClick={() => setMenuOpen(false)}>Inicio</NavLink>
          <br />
          <NavLink to="/explorar" className={linkClass} onClick={() => setMenuOpen(false)}>Explorar</NavLink>
          <br />
          <NavLink to="/publicar" className={linkClass} onClick={() => setMenuOpen(false)}>Publica Servicio</NavLink>
          <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
            {isAuth
              ? <button onClick={() => { logout(); setMenuOpen(false) }}
                        className="border-2 border-orange-500 text-orange-500 font-semibold py-2.5 rounded-full transition-colors text-sm">
                  Cerrar sesión
                </button>
              : <>
                  <Link to="/login" onClick={() => setMenuOpen(false)}
                        className="border-2 border-orange-500 text-orange-500 font-semibold py-2.5 rounded-full text-center text-sm">
                    Iniciar sesión
                  </Link>
                  <Link to="/registro" onClick={() => setMenuOpen(false)}
                        className="bg-orange-500 text-white font-semibold py-2.5 rounded-full text-center text-sm">
                    Regístrate gratis
                  </Link>
                </>
            }
          </div>
        </div>
      )}
    </header>
  )
}
