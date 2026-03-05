import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Loader from '../components/common/Loader'
import MainLayout from '../components/layout/MainLayout'
import Home            from '../pages/Home/Home'
import Explorar        from '../pages/Explorar/Explorar'
import CategoryPage    from '../pages/Category/CategoryPage'
import Login           from '../pages/Auth/Login'
import Register        from '../pages/Auth/Register'
import MyProfile       from '../pages/Profile/MyProfile'
import EditProfile     from '../pages/Profile/EditProfile'
import PublicProfile   from '../pages/PublicProfile/PublicProfile'
import Dashboard       from '../pages/Admin/Dashboard'
import ProfilesPending from '../pages/Admin/ProfilesPending'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuth, isLoading } = useAuth()
  const location = useLocation()
  if (isLoading) return <Loader fullScreen />
  if (!isAuth)   return <Navigate to="/login" state={{ from: location.pathname }} replace />
  return <>{children}</>
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuth, isLoading } = useAuth()
  if (isLoading) return <Loader fullScreen />
  if (!isAuth || user?.role !== 'ADMIN') return <Navigate to="/" replace />
  return <>{children}</>
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuth, isLoading } = useAuth()
  if (isLoading) return <Loader fullScreen />
  if (isAuth)    return <Navigate to="/" replace />
  return <>{children}</>
}

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index                       element={<Home />} />
        <Route path="/explorar"            element={<Explorar />} />
        <Route path="/categoria/:category" element={<CategoryPage />} />
        <Route path="/perfil/:slug"        element={<PublicProfile />} />

        <Route path="/mi-perfil"        element={<PrivateRoute><MyProfile /></PrivateRoute>} />
        <Route path="/mi-perfil/editar" element={<PrivateRoute><EditProfile /></PrivateRoute>} />
        <Route path="/publicar"         element={<PrivateRoute><EditProfile isNew /></PrivateRoute>} />

        <Route path="/admin"            element={<AdminRoute><Dashboard /></AdminRoute>} />
        <Route path="/admin/pendientes" element={<AdminRoute><ProfilesPending /></AdminRoute>} />
      </Route>

      <Route path="/login"    element={<GuestRoute><Login    /></GuestRoute>} />
      <Route path="/registro" element={<GuestRoute><Register /></GuestRoute>} />
      <Route path="*"         element={<Navigate to="/" replace />} />
    </Routes>
  )
}
