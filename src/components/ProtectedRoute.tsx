import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import type { Role } from '../lib/data'

type ProtectedRouteProps = {
  allowedRoles: Role[]
  children: React.ReactNode
}

function getRoleHome(role: Role | null) {
  if (role === 'admin') return '/painel/admin'
  if (role === 'seller') return '/painel/vendedor'
  if (role === 'user') return '/painel/usuario'
  return '/login'
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { user, role, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-sm text-gray-500">
        Carregando...
      </div>
    )
  }

  if (!user || !role) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to={getRoleHome(role)} replace />
  }

  return <>{children}</>
}
