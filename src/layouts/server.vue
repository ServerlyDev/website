<template>
  <AppShell :sections="sections">
    <template #context>
      <RouterLink
        to="/"
        class="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium text-(--ui-text-muted) transition-colors hover:text-(--ui-text-highlighted)"
      >
        <UIcon name="solar:arrow-left-linear" class="size-4" />
        Tous les serveurs
      </RouterLink>
      <div class="mt-2 flex items-center gap-3 rounded-md bg-(--ui-bg-elevated) px-2.5 py-2.5">
        <div class="flex size-8 items-center justify-center rounded-md bg-(--ui-primary)/15 text-(--ui-primary)">
          <UIcon name="solar:server-square-bold-duotone" class="size-5" />
        </div>
        <div class="min-w-0">
          <p class="truncate text-sm font-semibold text-(--ui-text-highlighted)">Serveur #{{ idServer }}</p>
          <p class="text-xs text-(--ui-text-dimmed)">Gestion du serveur</p>
        </div>
      </div>
    </template>
    <slot />
  </AppShell>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { NavSection } from '~/components/layout/types'

const route = useRoute()
const idServer = computed(() => route.params.idServer as string)

const sections = computed<NavSection[]>(() => {
  const base = `/server/${idServer.value}`
  return [
    {
      title: 'Serveur',
      items: [
        { label: 'Console', icon: 'solar:programming-linear', to: base, exact: true },
        { label: 'Fichiers', icon: 'solar:folder-with-files-linear', to: `${base}/files`, soon: true },
        { label: 'Base de données', icon: 'solar:database-linear', to: `${base}/database`, soon: true },
        { label: 'Actions', icon: 'solar:alarm-play-linear', to: `${base}/actions`, soon: true }
      ]
    },
    {
      title: 'Configuration',
      items: [
        { label: 'Utilisateurs', icon: 'solar:users-group-rounded-linear', to: `${base}/users`, soon: true },
        { label: 'Backups', icon: 'solar:rewind-back-linear', to: `${base}/backups`, soon: true },
        { label: 'Logs', icon: 'solar:document-text-linear', to: `${base}/logs`, soon: true },
        { label: 'Paramètres', icon: 'solar:settings-linear', to: `${base}/settings`, soon: true }
      ]
    }
  ]
})
</script>
