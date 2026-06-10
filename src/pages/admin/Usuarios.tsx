import React, { useEffect, useMemo, useState } from 'react'
import { Search, Snowflake, Store, UserRound, UsersRound } from 'lucide-react'
import { AdminLayout } from '../../components/layouts/AdminLayout'
import { Card } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import type { Profile, Role } from '../../lib/data'

type UserStatus = 'active' | 'blocked'

type AdminUser = Profile & {
  status: UserStatus
  store_name: string | null
  seller_category: string | null
  affiliate_count: number
  product_count: number
  visible_product_count: number
  product_categories: string[]
}

type ProductSummary = {
  seller_id: string | null
  category: string | null
  status: string | null
  hidden_by_admin: boolean | null
}

type AffiliateSummary = {
  user_id: string | null
  status: string | null
}

type EditForm = {
  role: Role
  status: UserStatus
  storeName: string
  sellerCategory: string
}

const ROLE_LABELS: Record<Role, string> = {
  admin: 'Admin',
  seller: 'Vendedor',
  user: 'Usuario comum',
}

function normalize(value: string | null | undefined) {
  return (value ?? '').toLowerCase().trim()
}

function getUserBadge(user: AdminUser) {
  if (user.role === 'admin') {
    return { label: 'Admin', className: 'bg-blue-100 text-blue-700', icon: UserRound }
  }

  if (user.role === 'seller') {
    return { label: 'Vendedor', className: 'bg-purple-100 text-purple-700', icon: Store }
  }

  if (user.affiliate_count > 0) {
    return { label: 'Usuario afiliado', className: 'bg-amber-100 text-amber-700', icon: UsersRound }
  }

  return { label: 'Usuario comum', className: 'bg-gray-100 text-gray-700', icon: UserRound }
}

export function Usuarios() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [editForm, setEditForm] = useState<EditForm | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [modalMessage, setModalMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const loadUsers = async () => {
    setLoading(true)

    const [profilesResult, productsResult, affiliatesResult] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('products').select('seller_id, category, status, hidden_by_admin'),
      supabase.from('affiliates').select('user_id, status'),
    ])

    if (profilesResult.error) throw profilesResult.error
    if (productsResult.error) throw productsResult.error
    if (affiliatesResult.error) throw affiliatesResult.error

    const products = (productsResult.data ?? []) as ProductSummary[]
    const affiliates = (affiliatesResult.data ?? []) as AffiliateSummary[]

    setUsers((profilesResult.data ?? []).map((profile) => {
      const sellerProducts = products.filter((product) => product.seller_id === profile.id)
      const categories = Array.from(new Set(sellerProducts.map((product) => product.category).filter(Boolean))) as string[]
      const userAffiliates = affiliates.filter((affiliate) => affiliate.user_id === profile.id && affiliate.status !== 'inactive')

      return {
        ...(profile as Profile),
        status: (profile.status ?? 'active') as UserStatus,
        store_name: profile.store_name ?? null,
        seller_category: profile.seller_category ?? null,
        affiliate_count: userAffiliates.length,
        product_count: sellerProducts.length,
        visible_product_count: sellerProducts.filter((product) => product.status === 'active' && !product.hidden_by_admin).length,
        product_categories: categories,
      }
    }))

    setLoading(false)
  }

  useEffect(() => {
    loadUsers().catch((error) => {
      console.error(error)
      setMessage(error instanceof Error ? error.message : 'Nao foi possivel carregar usuarios.')
      setLoading(false)
    })
  }, [])

  const filteredUsers = useMemo(() => {
    const term = normalize(search)
    if (!term) return users

    return users.filter((user) => {
      const values = [
        user.full_name,
        user.email,
        ROLE_LABELS[user.role],
        user.store_name,
        user.seller_category,
        ...user.product_categories,
      ]

      return values.some((value) => normalize(value).includes(term))
    })
  }, [search, users])

  const openEditor = (nextUser: AdminUser) => {
    setMessage(null)
    setModalMessage(null)
    setSelectedUser(nextUser)
    setEditForm({
      role: nextUser.role,
      status: nextUser.status,
      storeName: nextUser.store_name ?? '',
      sellerCategory: nextUser.seller_category ?? nextUser.product_categories[0] ?? '',
    })
  }

  const closeEditor = () => {
    setSelectedUser(null)
    setEditForm(null)
    setModalMessage(null)
  }

  const saveUserWithFallback = async (
    selectedUserId: string,
    nextRole: Role,
    nextStatus: UserStatus,
    storeName: string,
    sellerCategory: string,
  ) => {
    const rpcResult = await supabase.rpc('admin_update_user_controls', {
      target_user_id: selectedUserId,
      next_role: nextRole,
      next_status: nextStatus,
      next_store_name: storeName,
      next_seller_category: sellerCategory,
    })

    if (!rpcResult.error) return null

    const rpcErrorMessage = rpcResult.error.message.toLowerCase()
    const canFallback = rpcErrorMessage.includes('function') || rpcErrorMessage.includes('schema cache')

    if (!canFallback) return rpcResult.error

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        role: nextRole,
        status: nextStatus,
        store_name: storeName.trim() || null,
        seller_category: sellerCategory.trim() || null,
      })
      .eq('id', selectedUserId)

    if (profileError) return profileError

    const { error: productsError } = await supabase
      .from('products')
      .update({ hidden_by_admin: nextRole !== 'seller' || nextStatus === 'blocked' })
      .eq('seller_id', selectedUserId)

    return productsError ?? null
  }

  const saveUser = async () => {
    if (!selectedUser || !editForm) return

    setSaving(true)
    setMessage(null)
    setModalMessage(null)

    const isSelf = selectedUser.id === currentUser?.id

    if (isSelf) {
      const { error } = await supabase
        .from('profiles')
        .update({
          store_name: editForm.storeName.trim() || null,
          seller_category: editForm.sellerCategory.trim() || null,
        })
        .eq('id', selectedUser.id)

      if (error) {
        setModalMessage(error.message)
        setSaving(false)
        return
      }

      await loadUsers()
      closeEditor()
      setSaving(false)
      setMessage('Usuario atualizado.')
      return
    }

    const nextRole = isSelf ? selectedUser.role : editForm.role
    const nextStatus = isSelf ? selectedUser.status : editForm.status

    const error = await saveUserWithFallback(
      selectedUser.id,
      nextRole,
      nextStatus,
      editForm.storeName,
      editForm.sellerCategory,
    )

    if (error) {
      setModalMessage(error.message)
      setSaving(false)
      return
    }

    await loadUsers()
    closeEditor()
    setSaving(false)
    setMessage('Usuario atualizado.')
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-light text-ml-dark">Gerenciamento de Usuarios</h2>
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome, email, categoria ou loja..."
              className="w-full h-10 pl-9 pr-4 border border-gray-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-ml-blue text-sm"
            />
          </div>
        </div>

        {message && <p className={`text-sm ${message.includes('atualizado') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}

        <Card className="bg-white border-none shadow-sm rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/50 text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Nome</th>
                  <th className="px-6 py-4 font-medium">E-mail</th>
                  <th className="px-6 py-4 font-medium">Identificacao</th>
                  <th className="px-6 py-4 font-medium">Loja / Categoria</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => {
                  const badge = getUserBadge(user)
                  const BadgeIcon = badge.icon

                  return (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-ml-dark">{user.full_name || 'Sem nome'}</p>
                        {user.role === 'seller' && <p className="text-xs text-gray-500">{user.visible_product_count}/{user.product_count} produtos visiveis</p>}
                      </td>
                      <td className="px-6 py-4 text-gray-500">{user.email || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-sm text-xs font-semibold ${badge.className}`}>
                          <BadgeIcon className="w-3.5 h-3.5" />
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        <p>{user.store_name || '-'}</p>
                        <p className="text-xs text-gray-400">{user.seller_category || user.product_categories.join(', ') || '-'}</p>
                      </td>
                      <td className="px-6 py-4">
                        {user.status === 'blocked' ? (
                          <span className="inline-flex items-center gap-1 text-red-600 font-medium">
                            <Snowflake className="w-4 h-4" /> Congelada
                          </span>
                        ) : (
                          <span className="text-green-600 font-medium">Ativo</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-ml-blue hover:underline" onClick={() => openEditor(user)}>Editar</button>
                      </td>
                    </tr>
                  )
                })}
                {!loading && filteredUsers.length === 0 && (
                  <tr>
                    <td className="px-6 py-8 text-center text-gray-500" colSpan={6}>Nenhum usuario encontrado.</td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td className="px-6 py-8 text-center text-gray-500" colSpan={6}>Carregando usuarios...</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Dialog open={Boolean(selectedUser)} onOpenChange={(open) => !open && closeEditor()}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Editar usuario</DialogTitle>
            <DialogDescription>
              Ajuste acesso, congelamento e dados de loja. Produtos nao sao apagados.
            </DialogDescription>
          </DialogHeader>

          {selectedUser && editForm && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de conta</label>
                  <select
                    value={editForm.role}
                    disabled={selectedUser.id === currentUser?.id}
                    onChange={(event) => setEditForm((current) => current ? { ...current, role: event.target.value as Role } : current)}
                    className="w-full h-10 px-3 border border-gray-300 rounded-sm bg-white focus:outline-none focus:border-ml-blue disabled:bg-gray-100"
                  >
                    <option value="user">Usuario comum</option>
                    <option value="seller">Vendedor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={editForm.status}
                    disabled={selectedUser.id === currentUser?.id}
                    onChange={(event) => setEditForm((current) => current ? { ...current, status: event.target.value as UserStatus } : current)}
                    className="w-full h-10 px-3 border border-gray-300 rounded-sm bg-white focus:outline-none focus:border-ml-blue disabled:bg-gray-100"
                  >
                    <option value="active">Ativo</option>
                    <option value="blocked">Congelada</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da loja</label>
                <input
                  type="text"
                  value={editForm.storeName}
                  onChange={(event) => setEditForm((current) => current ? { ...current, storeName: event.target.value } : current)}
                  placeholder="Ex: Said Ads Store"
                  className="w-full h-10 px-3 border border-gray-300 rounded-sm focus:outline-none focus:border-ml-blue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria do vendedor</label>
                <input
                  type="text"
                  value={editForm.sellerCategory}
                  onChange={(event) => setEditForm((current) => current ? { ...current, sellerCategory: event.target.value } : current)}
                  placeholder="Ex: Meta Ads, Google Ads"
                  className="w-full h-10 px-3 border border-gray-300 rounded-sm focus:outline-none focus:border-ml-blue"
                />
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-sm p-4 text-sm text-gray-600 space-y-1">
                <p>Produtos cadastrados: <strong>{selectedUser.product_count}</strong></p>
                <p>Produtos visiveis na loja: <strong>{selectedUser.visible_product_count}</strong></p>
                {selectedUser.id === currentUser?.id && <p className="text-amber-600">Voce nao pode congelar ou alterar o proprio tipo de conta.</p>}
                {editForm.role !== 'seller' && selectedUser.product_count > 0 && <p>Ao salvar como usuario comum, os produtos saem da loja e voltam se ele for aprovado como vendedor novamente.</p>}
                {editForm.status === 'blocked' && <p>Conta congelada perde acesso ao painel e seus produtos ficam ocultos.</p>}
              </div>

              {modalMessage && <p className="text-sm text-red-600">{modalMessage}</p>}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeEditor}>Cancelar</Button>
            <Button type="button" disabled={saving} onClick={saveUser}>{saving ? 'Salvando...' : 'Salvar alteracoes'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
