<template>
  <AppShell :sections="sections">
    <template #sidebar-footer>
      <UButton
        to="/"
        icon="solar:arrow-left-linear"
        label="Retour à mon espace"
        color="neutral"
        variant="ghost"
        block
        class="justify-start text-(--ui-text-muted)"
      />
    </template>
    <slot />
  </AppShell>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { getLang } from '~/utils/lang'
import type { NavSection } from '~/components/layout/types'

const texts = ref<any>({ manage: {} })
onMounted(async () => {
  const data = await import(`../assets/texts/${getLang()}/components/navigation.json`)
  texts.value = data.default
})

const sections = computed<NavSection[]>(() => [
  {
    title: 'Général',
    items: [
      { label: texts.value.dashboard ?? 'Dashboard', icon: 'solar:widget-5-linear', to: '/admin', exact: true },
      { label: texts.value.settings ?? 'Paramètres', icon: 'solar:settings-linear', to: '/admin/settings' },
      { label: texts.value.api ?? 'API', icon: 'solar:code-square-linear', to: '/admin/api' }
    ]
  },
  {
    title: texts.value.manage.title ?? 'Gestion',
    items: [
      { label: texts.value.manage.locations ?? 'Emplacements', icon: 'solar:map-point-linear', to: '/admin/locations' },
      { label: texts.value.manage.nodes ?? 'Nodes', icon: 'solar:server-path-linear', to: '/admin/nodes' },
      { label: texts.value.manage.servers ?? 'Serveurs', icon: 'solar:server-square-linear', to: '/admin/servers' },
      { label: texts.value.manage.database ?? 'Bases de données', icon: 'solar:database-linear', to: '/admin/database' },
      { label: texts.value.manage.users ?? 'Utilisateurs', icon: 'solar:users-group-rounded-linear', to: '/admin/users' }
    ]
  }
])
</script>
