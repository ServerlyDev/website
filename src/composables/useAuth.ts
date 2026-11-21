import { computed } from 'vue'

interface TokenPayload {
  userId?: number | string
  email?: string
  pseudo?: string
  isAdmin?: boolean
}

// Lecture des informations de l'utilisateur connecté depuis le JWT stocké
function readPayload(): TokenPayload | null {
  const token = localStorage.getItem('token')
  if (!token) return null
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

export function useAuth() {
  const payload = readPayload()

  const user = computed(() => payload)
  const userId = computed(() => payload?.userId ?? null)
  const isAdmin = computed(() => Boolean(payload?.isAdmin))
  const displayName = computed(() => payload?.pseudo || payload?.email || 'Mon compte')
  const initials = computed(() => displayName.value.slice(0, 2).toUpperCase())

  return { user, userId, isAdmin, displayName, initials }
}
