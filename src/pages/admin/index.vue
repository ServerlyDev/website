<template>
  <div class="page">
    <PageHeader
      title="Vue d'ensemble"
      description="Suivi en temps réel de votre infrastructure."
      icon="solar:widget-5-linear"
    >
      <template #actions>
        <span v-if="lastUpdate" class="hidden text-xs text-(--ui-text-dimmed) sm:inline">
          Mis à jour à {{ lastUpdate }}
        </span>
        <UButton icon="solar:refresh-linear" label="Actualiser" color="neutral" variant="outline" :loading="refreshing" @click="manualRefresh" />
        <UButton icon="solar:add-circle-linear" label="Nouvelle node" to="/admin/nodes/create" />
      </template>
    </PageHeader>

    <!-- Alertes critiques -->
    <UAlert
      v-if="criticalAlerts.length > 0"
      color="error"
      variant="subtle"
      icon="solar:danger-triangle-linear"
      :title="`${criticalAlerts.length} alerte${criticalAlerts.length > 1 ? 's' : ''} critique${criticalAlerts.length > 1 ? 's' : ''}`"
      class="mb-6"
    >
      <template #description>
        <ul class="mt-1 space-y-1">
          <li v-for="alert in criticalAlerts" :key="alert.id">
            <span class="font-medium">{{ alert.nodeName }}</span> — {{ alert.message }}
          </li>
        </ul>
      </template>
    </UAlert>

    <!-- Statistiques globales -->
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <StatCard label="Nodes actives" :value="activeNodesCount" :suffix="` / ${totalNodes}`" icon="solar:server-path-linear" color="primary" hint="Nodes connectées à l'agent" />
      <StatCard label="Serveurs" :value="totalServers" icon="solar:server-square-linear" color="success" hint="Serveurs déployés sur l'ensemble des nodes" />
      <StatCard label="Utilisateurs" :value="totalUsers" icon="solar:users-group-rounded-linear" color="info" hint="Comptes enregistrés" />
      <StatCard label="CPU moyen" :value="globalCpuUsage" suffix="%" icon="solar:cpu-bolt-linear" color="primary" :progress="globalCpuUsage" />
      <StatCard label="Mémoire moyenne" :value="globalMemoryUsage" suffix="%" icon="solar:ssd-round-linear" color="info" :progress="globalMemoryUsage" />
      <StatCard label="Stockage moyen" :value="globalDiskUsage" suffix="%" icon="solar:database-linear" color="warning" :progress="globalDiskUsage" />
    </div>

    <!-- État des nodes -->
    <div class="mt-10">
      <div class="mb-4 flex items-end justify-between">
        <div>
          <h2 class="text-base font-semibold text-(--ui-text-highlighted)">État des nodes</h2>
          <p class="mt-0.5 text-sm text-(--ui-text-muted)">Actualisation automatique toutes les 30 secondes.</p>
        </div>
        <UButton to="/admin/nodes" label="Toutes les nodes" trailing-icon="solar:arrow-right-linear" color="neutral" variant="ghost" size="sm" />
      </div>

      <div v-if="nodes.length" class="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        <div v-for="node in nodes" :key="node.id" class="panel flex flex-col">
          <div class="panel-header">
            <div class="flex min-w-0 items-center gap-3">
              <span class="size-2 shrink-0 rounded-full" :style="{ backgroundColor: getNodeStatusColor(node), boxShadow: `0 0 0 4px ${getNodeStatusColor(node)}22` }" />
              <div class="min-w-0">
                <h3 class="truncate text-sm font-semibold text-(--ui-text-highlighted)">{{ node.name }}</h3>
                <p class="truncate font-mono text-xs text-(--ui-text-dimmed)">{{ node.fqdn }} · {{ node.ip_address }}:{{ node.ssh_port }}</p>
              </div>
            </div>
            <UBadge :color="node.status === 'online' ? 'success' : 'error'" variant="subtle" size="sm" class="shrink-0">
              {{ node.status === 'online' ? 'En ligne' : 'Hors ligne' }}
            </UBadge>
          </div>

          <div class="panel-body flex-1">
            <div v-if="nodeMetrics[node.id]" class="space-y-4">
              <div v-for="metric in metricsOf(node.id)" :key="metric.label">
                <div class="mb-1.5 flex items-center justify-between text-sm">
                  <span class="text-(--ui-text-muted)">{{ metric.label }}</span>
                  <span class="tabular-nums">
                    <span v-if="metric.detail" class="mr-2 text-xs text-(--ui-text-dimmed)">{{ metric.detail }}</span>
                    <span class="font-medium text-(--ui-text-highlighted)">{{ metric.value }}%</span>
                  </span>
                </div>
                <div class="h-1.5 w-full overflow-hidden rounded-full bg-(--ui-bg-accented)">
                  <div class="h-full rounded-full transition-all duration-500" :class="barColor(metric.value)" :style="{ width: `${Math.min(metric.value, 100)}%` }" />
                </div>
              </div>
            </div>
            <div v-else class="space-y-4">
              <USkeleton v-for="i in 3" :key="i" class="h-7 w-full" />
            </div>
          </div>

          <div class="panel-footer justify-between">
            <UButton size="sm" color="neutral" variant="ghost" icon="solar:refresh-linear" label="Rafraîchir" @click="refreshNodeMetrics(node.id)" />
            <UButton size="sm" color="neutral" variant="outline" trailing-icon="solar:arrow-right-linear" label="Détails" :to="`/admin/nodes/${node.id}/view`" />
          </div>
        </div>
      </div>

      <div v-else class="panel flex flex-col items-center justify-center px-6 py-16 text-center">
        <div class="flex size-12 items-center justify-center rounded-full bg-(--ui-bg-accented) text-(--ui-text-dimmed)">
          <UIcon name="solar:server-path-linear" class="size-6" />
        </div>
        <p class="mt-4 text-sm font-medium text-(--ui-text-highlighted)">Aucune node configurée</p>
        <p class="mt-1 text-sm text-(--ui-text-muted)">Ajoutez votre première node pour commencer à superviser votre infrastructure.</p>
        <UButton class="mt-5" icon="solar:add-circle-linear" label="Ajouter une node" to="/admin/nodes/create" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { apiFetch } from '~/utils/api'
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const nodes = ref<any[]>([])
const nodeMetrics = ref<Record<string, any>>({})
const servers = ref<any[]>([])
const users = ref<any[]>([])
const lastUpdate = ref('')
const refreshing = ref(false)
const token = ref('')
let metricsInterval: ReturnType<typeof setInterval> | undefined

interface Alert {
  id: string
  message: string
  nodeName: string
  severity: 'critical' | 'warning'
}

const criticalAlerts = computed(() => {
  const alerts = []
  for (const nodeId in nodeMetrics.value) {
    const metrics = nodeMetrics.value[nodeId]
    const node = nodes.value.find(n => n.id == nodeId)
    if (!node) continue

    if (metrics.cpu_percent > 90) {
      alerts.push({
        id: `cpu-${nodeId}`,
        message: `CPU critique: ${metrics.cpu_percent}%`,
        nodeName: node.name,
        severity: 'critical'
      })
    }
    if (metrics.memory_percent > 90) {
      alerts.push({
        id: `mem-${nodeId}`,
        message: `Mémoire critique: ${metrics.memory_percent}%`,
        nodeName: node.name,
        severity: 'critical'
      })
    }
    if (metrics.disk_percent > 95) {
      alerts.push({
        id: `disk-${nodeId}`,
        message: `Stockage critique: ${metrics.disk_percent}%`,
        nodeName: node.name,
        severity: 'critical'
      })
    }
  }
  return alerts
})

const activeNodesCount = computed(() => {
  return nodes.value.filter(n => n.status === 'online').length
})

const totalNodes = computed(() => nodes.value.length)
const totalServers = computed(() => servers.value.length)
const totalUsers = computed(() => users.value.length)

const globalCpuUsage = computed(() => {
  if (Object.keys(nodeMetrics.value).length === 0) return 0
  const avg = Object.values(nodeMetrics.value).reduce((sum, m: any) => sum + m.cpu_percent, 0) / Object.keys(nodeMetrics.value).length
  return Math.round(avg)
})

const globalMemoryUsage = computed(() => {
  if (Object.keys(nodeMetrics.value).length === 0) return 0
  const avg = Object.values(nodeMetrics.value).reduce((sum, m: any) => sum + m.memory_percent, 0) / Object.keys(nodeMetrics.value).length
  return Math.round(avg)
})

const globalDiskUsage = computed(() => {
  if (Object.keys(nodeMetrics.value).length === 0) return 0
  const avg = Object.values(nodeMetrics.value).reduce((sum, m: any) => sum + m.disk_percent, 0) / Object.keys(nodeMetrics.value).length
  return Math.round(avg)
})

const getNodeStatusColor = (node: any) => {
  return node.status === 'online' ? '#22c55e' : '#ef4444'
}

const loadData = async () => {
  if (!token.value) return

  try {
    const [nodesData, serversData, usersData] = await Promise.all([
      apiFetch('http://localhost:3001/api/nodes/list', {
        headers: { Authorization: `Bearer ${token.value}` }
      }),
      apiFetch('http://localhost:3001/api/servers/list', {
        headers: { Authorization: `Bearer ${token.value}` }
      }),
      apiFetch('http://localhost:3001/api/users/list', {
        headers: { Authorization: `Bearer ${token.value}` }
      })
    ])

    nodes.value = nodesData || []
    servers.value = serversData || []
    users.value = usersData || []

    await refreshAllMetrics()
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error)
  }
}

const refreshAllMetrics = async () => {
  if (!token.value) return

  const promises = nodes.value.map(node => refreshNodeMetrics(node.id))
  await Promise.all(promises)
  lastUpdate.value = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

// Rafraîchissement manuel depuis l'en-tête
const manualRefresh = async () => {
  refreshing.value = true
  try {
    await loadData()
  } finally {
    refreshing.value = false
  }
}

// Métriques affichées sur la carte d'une node
const metricsOf = (nodeId: any) => {
  const m = nodeMetrics.value[nodeId]
  return [
    { label: 'CPU', value: m.cpu_percent },
    { label: 'Mémoire', value: m.memory_percent, detail: `${m.memory_used_gb?.toFixed(1)} / ${m.memory_total_gb?.toFixed(1)} Go` },
    { label: 'Stockage', value: m.disk_percent, detail: `${m.disk_used_gb?.toFixed(1)} / ${m.disk_total_gb?.toFixed(1)} Go` }
  ]
}

// Couleur de la barre selon le seuil
const barColor = (value: number) => {
  if (value >= 90) return 'bg-(--ui-error)'
  if (value >= 75) return 'bg-(--ui-warning)'
  return 'bg-(--ui-primary)'
}

const refreshNodeMetrics = async (nodeId: any) => {
  if (!token.value) return

  try {
    const metrics = await apiFetch(`http://localhost:3001/api/nodes/metrics/${nodeId}`, {
      headers: { Authorization: `Bearer ${token.value}` }
    })
    nodeMetrics.value[nodeId] = metrics
  } catch (error) {
    console.error(`Erreur métriques node ${nodeId}:`, error)
  }
}

onMounted(async () => {
  token.value = localStorage.getItem('token') || ''
  await loadData()

  metricsInterval = setInterval(refreshAllMetrics, 30000)
})

onBeforeUnmount(() => {
  if (metricsInterval) clearInterval(metricsInterval)
})
</script>
