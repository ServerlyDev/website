<template>
  <div class="page">
    <PageHeader
      title="Serveurs"
      description="Accédez à vos serveurs et à ceux qui ont été partagés avec vous."
      icon="solar:server-square-linear"
    />

    <!-- Barre d'outils -->
    <div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="inline-flex max-w-full overflow-x-auto rounded-lg border border-(--ui-border) bg-(--ui-bg) p-1">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          type="button"
          class="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
          :class="filter === tab.value
            ? 'bg-(--ui-bg-accented) text-(--ui-text-highlighted) shadow-sm'
            : 'text-(--ui-text-muted) hover:text-(--ui-text-highlighted)'"
          @click="filter = tab.value"
        >
          {{ tab.label }}
          <span
            class="rounded px-1.5 text-xs tabular-nums"
            :class="filter === tab.value ? 'bg-(--ui-primary)/15 text-(--ui-primary)' : 'bg-(--ui-bg-elevated) text-(--ui-text-dimmed)'"
          >
            {{ tab.count }}
          </span>
        </button>
      </div>

      <UInput
        v-model="searchQuery"
        :placeholder="indexTexts.search ?? 'Rechercher un serveur…'"
        icon="solar:magnifer-linear"
        class="w-full sm:w-72"
      />
    </div>

    <!-- Liste -->
    <div v-if="filteredServers.length" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <RouterLink
        v-for="server in filteredServers"
        :key="server.id"
        :to="`/server/${server.id}`"
        class="panel group flex flex-col p-5 transition-all hover:-translate-y-0.5 hover:border-(--ui-border-accented) hover:shadow-lg hover:shadow-black/20"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex min-w-0 items-center gap-3">
            <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-(--ui-primary)/10 text-(--ui-primary)">
              <UIcon name="solar:server-square-bold-duotone" class="size-5" />
            </div>
            <div class="min-w-0">
              <h2 class="truncate font-semibold text-(--ui-text-highlighted)">{{ server.name }}</h2>
              <p class="font-mono text-xs text-(--ui-text-dimmed)">#{{ server.id }}</p>
            </div>
          </div>
          <UBadge :color="status(server).color" variant="subtle" size="sm" class="shrink-0">
            <span class="size-1.5 rounded-full bg-current" />
            {{ status(server).label }}
          </UBadge>
        </div>

        <dl class="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-(--ui-border) pt-4 text-sm">
          <div>
            <dt class="text-xs text-(--ui-text-dimmed)">{{ indexTexts.serverinfo?.ip ?? 'IP' }}</dt>
            <dd class="mt-0.5 font-mono text-[13px] text-(--ui-text-toned)">{{ server.ip_address }}</dd>
          </div>
          <div>
            <dt class="text-xs text-(--ui-text-dimmed)">{{ indexTexts.serverinfo?.ssh_port ?? 'Port' }}</dt>
            <dd class="mt-0.5 font-mono text-[13px] text-(--ui-text-toned)">{{ server.ssh_port }}</dd>
          </div>
          <div>
            <dt class="text-xs text-(--ui-text-dimmed)">{{ indexTexts.serverinfo?.username ?? 'Utilisateur' }}</dt>
            <dd class="mt-0.5 text-(--ui-text-toned)">
              {{ server.user_id === userId ? 'Vous' : `#${server.user_id}` }}
            </dd>
          </div>
        </dl>

        <div class="mt-5 flex items-center justify-end text-sm font-medium text-(--ui-text-muted) transition-colors group-hover:text-(--ui-primary)">
          Ouvrir la console
          <UIcon name="solar:arrow-right-linear" class="ml-1.5 size-4 transition-transform group-hover:translate-x-0.5" />
        </div>
      </RouterLink>
    </div>

    <!-- État vide -->
    <div v-else class="panel flex flex-col items-center justify-center px-6 py-20 text-center">
      <div class="flex size-14 items-center justify-center rounded-full bg-(--ui-bg-accented) text-(--ui-text-dimmed)">
        <UIcon :name="searchQuery ? 'solar:magnifer-linear' : 'solar:server-square-linear'" class="size-7" />
      </div>
      <p class="mt-4 font-medium text-(--ui-text-highlighted)">{{ indexTexts.no_servers ?? 'Aucun serveur trouvé' }}</p>
      <p class="mt-1 max-w-sm text-sm text-(--ui-text-muted)">
        {{ searchQuery
          ? 'Aucun serveur ne correspond à votre recherche.'
          : 'Les serveurs qui vous sont attribués apparaîtront ici.' }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { apiFetch } from '~/utils/api'
// Importation modules
import { ref, computed, onMounted } from 'vue'
import { getLang } from '~/utils/lang.ts'

// Variables
const filter = ref('mine')
const servers = ref<any[]>([])
const userId = ref<any>(null)
const searchQuery = ref('')

// Lang
const lang = getLang()

// Texts
const indexTexts = ref<any>({})

// Récupération liste des serveurs
onMounted(async () => {
  // Récupération du token
  const token = localStorage.getItem('token')
  if (!token) return

  // Décoder le token pour récupérer l'ID utilisateur
  const payload = JSON.parse(atob(token.split('.')[1]))
  userId.value = payload.userId

  const result = await apiFetch('http://localhost:3001/api/servers/list', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  servers.value = result

  indexTexts.value = await import(`@/assets/texts/${lang}/pages/index.json`)
})

// Filtre les serveurs dans les différentes catégories (Mes serveurs, Autres serveurs, Tous les serveurs)
const filteredServers = computed(() => {
  const base = filter.value === 'mine'
    ? servers.value.filter(s => s.user_id === userId.value)
    : filter.value === 'others'
      ? servers.value.filter(s => s.user_id !== userId.value)
      : servers.value

  return base.filter(s =>
    s.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    s.ip_address.includes(searchQuery.value)
  )
})

// Variable des totaux de chaque catégories de serveurs (Mes serveurs, Autres serveurs, Tous les serveurs)
const mineCount = computed(() => servers.value.filter(server => server.user_id === userId.value).length)
const othersCount = computed(() => servers.value.filter(server => server.user_id !== userId.value).length)
const allCount = computed(() => servers.value.length)

const tabs = computed(() => [
  { value: 'mine', label: indexTexts.value.mine ?? 'Mes serveurs', count: mineCount.value },
  { value: 'others', label: indexTexts.value.others ?? 'Partagés', count: othersCount.value },
  { value: 'all', label: indexTexts.value.all ?? 'Tous', count: allCount.value }
])

// Statut affiché sur la carte
function status(server: any) {
  switch (String(server.status).toLowerCase()) {
    case 'offline':
    case 'stopped':
      return { color: 'error' as const, label: 'Hors ligne' }
    case 'installing':
    case 'pending':
      return { color: 'warning' as const, label: 'Installation' }
    default:
      return { color: 'success' as const, label: 'En ligne' }
  }
}
</script>
