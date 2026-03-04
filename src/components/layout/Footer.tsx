import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 pt-14 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-10">
          <div className="col-span-2 md:col-span-1">
            <p className="font-extrabold text-xl text-white mb-3">
              ENLURIN<span className="text-orange-500">.PE</span>
            </p>
            <p className="text-sm leading-relaxed mb-4">
              Conectamos clientes con los mejores proveedores locales en Lurín.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Plataforma</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/"          className="hover:text-orange-400 transition-colors">Inicio</Link></li>
              <li><Link to="/explorar"  className="hover:text-orange-400 transition-colors">Explorar</Link></li>
              <li><Link to="/publicar"  className="hover:text-orange-400 transition-colors">Publica tu Servicio</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Cuenta</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/login"     className="hover:text-orange-400 transition-colors">Iniciar Sesión</Link></li>
              <li><Link to="/registro"  className="hover:text-orange-400 transition-colors">Regístrate</Link></li>
              <li><Link to="/mi-perfil" className="hover:text-orange-400 transition-colors">Mi Perfil</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Contacto</h4>
            <ul className="space-y-2.5 text-sm">
              <li>📍 Lurín, Lima — Perú</li>
              <li>📧 hola@enlurin.pe</li>
              <li>📱 +51 900 000 000</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
          <span>© {new Date().getFullYear()} Enlurin.pe — Todos los derechos reservados.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-orange-400 transition-colors">Términos</a>
            <a href="#" className="hover:text-orange-400 transition-colors">Privacidad</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
