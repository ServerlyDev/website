import type { NavigationGuard } from 'vue-router'

// Équivalent de l'ancien middleware Nuxt `auth.global.ts`
export const authGuard: NavigationGuard = async (to) => {
  const token = localStorage.getItem('token')
  const isAuthPage = to.path.startsWith('/auth')

  if (!token) {
    if (!isAuthPage) return '/auth/login'
    return
  }

  let payload
  try {
    payload = JSON.parse(atob(token.split('.')[1]))

    const response = await fetch('http://localhost:3001/api/token/verify', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    if (!response.ok) throw new Error('Token invalide')
  } catch (error) {
    localStorage.removeItem('token')
    if (!isAuthPage) return '/auth/login'
    return
  }

  const isAdminRoute = to.path.startsWith('/admin')
  if (isAdminRoute && !payload?.isAdmin) {
    return '/'
  }

  if (isAuthPage) {
    return '/'
  }
}
