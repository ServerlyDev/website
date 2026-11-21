<template>
  <AppShell :sections="sections">
    <slot />
  </AppShell>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuth } from '~/composables/useAuth'
import type { NavSection } from '~/components/layout/types'

const { userId, isAdmin } = useAuth()

const sections = computed<NavSection[]>(() => {
  const result: NavSection[] = [
    {
      title: 'Espace',
      items: [
        { label: 'Serveurs', icon: 'solar:server-square-linear', to: '/', exact: true },
        { label: 'Mon profil', icon: 'solar:user-circle-linear', to: `/user/${userId.value}` }
      ]
    }
  ]
  if (isAdmin.value) {
    result.push({
      title: 'Administration',
      items: [{ label: 'Panneau admin', icon: 'solar:shield-user-linear', to: '/admin' }]
    })
  }
  return result
})
</script>
