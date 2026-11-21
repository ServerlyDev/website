<template>
  <div class="page">
    <PageHeader
      :title="node.name || `Node #${nodeId}`"
      :description="node.fqdn ? `${node.fqdn} · ${node.ip_address}:${node.ssh_port}` : undefined"
      icon="solar:server-path-linear"
    >
      <template #badge>
        <UBadge :color="isOnline ? 'success' : 'error'" variant="subtle">
          <span class="size-1.5 rounded-full bg-current" />
          {{ isOnline ? 'En ligne' : 'Hors ligne' }}
        </UBadge>
        <UBadge v-if="node.maintenance" color="warning" variant="subtle">Maintenance</UBadge>
      </template>
    </PageHeader>

    <UTabs
      :items="tabsitems"
      variant="link"
      class="w-full"
      :ui="{ list: 'border-b border-(--ui-border) overflow-x-auto', content: 'pt-6' }"
    >
      <!-- Aperçu -->
      <template #overview>
        <div class="grid gap-6 xl:grid-cols-3">
          <!-- Informations -->
          <div class="panel self-start xl:col-span-1">
            <div class="panel-header">
              <div>
                <h2 class="panel-title">Informations</h2>
                <p class="panel-description">Configuration actuelle de la node.</p>
              </div>
            </div>
            <dl>
              <div v-for="info in infos" :key="info.label" class="flex items-center justify-between gap-4 border-b border-(--ui-border) px-5 py-3.5 last:border-b-0">
                <dt class="text-sm text-(--ui-text-muted)">{{ info.label }}</dt>
                <dd class="truncate text-sm font-medium text-(--ui-text-highlighted)" :class="info.mono && 'font-mono text-[13px]'">{{ info.value ?? '—' }}</dd>
              </div>
            </dl>
          </div>

          <!-- Ressources -->
          <div class="space-y-6 xl:col-span-2">
            <div class="grid gap-4 sm:grid-cols-3">
              <StatCard label="CPU" :value="node_metrics.cpu_percent ?? '—'" :suffix="node_metrics.cpu_percent !== undefined ? '%' : ''" icon="solar:cpu-bolt-linear" :progress="node_metrics.cpu_percent ?? 0" />
              <StatCard label="Mémoire" :value="node_metrics.memory_percent ?? '—'" :suffix="node_metrics.memory_percent !== undefined ? '%' : ''" icon="solar:ssd-round-linear" color="info" :progress="node_metrics.memory_percent ?? 0" />
              <StatCard label="Stockage" :value="node_metrics.disk_percent ?? '—'" :suffix="node_metrics.disk_percent !== undefined ? '%' : ''" icon="solar:database-linear" color="warning" :progress="node_metrics.disk_percent ?? 0" />
            </div>

            <div class="grid gap-6 lg:grid-cols-2">
              <div class="panel">
                <div class="panel-header">
                  <h2 class="panel-title">Utilisation CPU</h2>
                  <span class="flex items-center gap-1.5 text-xs text-(--ui-text-dimmed)">
                    <span class="size-1.5 animate-pulse rounded-full bg-(--ui-success)" /> Temps réel
                  </span>
                </div>
                <div class="panel-body">
                  <StatsChart v-if="data_cpu.length" color="#6366f1" label="CPU" :data="data_cpu" />
                  <USkeleton v-else class="h-56 w-full" />
                </div>
              </div>
              <div class="panel">
                <div class="panel-header">
                  <h2 class="panel-title">Utilisation mémoire</h2>
                  <span class="flex items-center gap-1.5 text-xs text-(--ui-text-dimmed)">
                    <span class="size-1.5 animate-pulse rounded-full bg-(--ui-success)" /> Temps réel
                  </span>
                </div>
                <div class="panel-body">
                  <StatsChart v-if="data_memory.length" color="#38bdf8" label="Mémoire" :data="data_memory" />
                  <USkeleton v-else class="h-56 w-full" />
                </div>
              </div>
              <div class="panel lg:col-span-2">
                <div class="panel-header">
                  <div>
                    <h2 class="panel-title">Stockage</h2>
                    <p v-if="node_metrics.disk_total_gb" class="panel-description">
                      {{ node_metrics.disk_used_gb.toFixed(1) }} Go utilisés sur {{ node_metrics.disk_total_gb.toFixed(1) }} Go
                    </p>
                  </div>
                </div>
                <div class="panel-body">
                  <PieChart
                    v-if="node_metrics.disk_total_gb"
                    :labels="['Utilisé', 'Disponible']"
                    :values="[node_metrics.disk_used_gb, node_metrics.disk_total_gb - node_metrics.disk_used_gb]"
                    title="Stockage"
                  />
                  <USkeleton v-else class="h-56 w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Paramètres -->
      <template #settings>
        <UForm :state="node_form" class="panel" @submit="updateInfos">
          <div class="panel-body">
            <div class="form-section">
              <div>
                <h2 class="form-section-title">Général</h2>
                <p class="form-section-description">Nom affiché et mode maintenance.</p>
              </div>
              <div class="form-grid">
                <UFormField label="Nom de la node" required class="sm:col-span-2">
                  <UInput v-model="node_form.name" icon="solar:text-square-linear" placeholder="ex : node-paris-1" class="w-full" required />
                </UFormField>
                <div class="sm:col-span-2">
                  <USwitch v-model="node_form.maintenance" label="Mode maintenance" description="La node n'accepte plus de nouveaux serveurs." />
                </div>
              </div>
            </div>

            <div class="form-section">
              <div>
                <h2 class="form-section-title">Connexion</h2>
                <p class="form-section-description">Adresse utilisée par le panel pour joindre l'agent.</p>
              </div>
              <div class="form-grid">
                <UFormField label="FQDN" required class="sm:col-span-2">
                  <UInput v-model="node_form.fqdn" icon="solar:global-linear" placeholder="ex : node1.exemple.com" class="w-full" required />
                </UFormField>
                <UFormField label="Adresse IP" required>
                  <UInput v-model="node_form.ip_address" icon="solar:routing-2-linear" placeholder="ex : 192.168.1.10" class="w-full" required />
                </UFormField>
                <UFormField label="Port" required>
                  <UInput v-model="node_form.ssh_port" icon="solar:plug-circle-linear" placeholder="ex : 8080" class="w-full" required />
                </UFormField>
                <UFormField label="Emplacement" required>
                  <USelect v-model="node_form.location_id" :items="itemsLocation" icon="solar:map-point-linear" class="w-full" />
                </UFormField>
                <UFormField label="Protocole" required>
                  <USelect v-model="node_form.method" default-value="HTTP" :items="itemsMethod" icon="solar:shield-check-linear" class="w-full" />
                </UFormField>
              </div>
            </div>

            <div class="form-section">
              <div>
                <h2 class="form-section-title">Ressources allouables</h2>
                <p class="form-section-description">Indiquez -1 pour illimité.</p>
              </div>
              <div class="form-grid">
                <UFormField label="Stockage" required>
                  <UInput v-model="node_form.storage_usage" type="number" icon="solar:database-linear" placeholder="-1" class="w-full" required>
                    <template #trailing><span class="text-xs text-(--ui-text-dimmed)">Mo</span></template>
                  </UInput>
                </UFormField>
                <UFormField label="Mémoire vive" required>
                  <UInput v-model="node_form.ram_usage" type="number" icon="solar:ssd-round-linear" placeholder="-1" class="w-full" required>
                    <template #trailing><span class="text-xs text-(--ui-text-dimmed)">Mo</span></template>
                  </UInput>
                </UFormField>
                <UFormField label="CPU" required>
                  <UInput v-model="node_form.cpu_usage" type="number" icon="solar:cpu-bolt-linear" placeholder="-1" max="100" class="w-full" required>
                    <template #trailing><span class="text-xs text-(--ui-text-dimmed)">%</span></template>
                  </UInput>
                </UFormField>
              </div>
            </div>
          </div>
          <div class="panel-footer">
            <UButton type="submit" icon="solar:diskette-linear" label="Enregistrer les modifications" :loading="saving" />
          </div>
        </UForm>
      </template>

      <template #allocation>
        <ComingSoon icon="solar:routing-2-linear" description="La gestion des allocations (IP et ports attribués aux serveurs) arrive bientôt." />
      </template>
      <template #servers>
        <ComingSoon icon="solar:server-square-linear" description="La liste des serveurs hébergés sur cette node arrive bientôt." />
      </template>
      <template #configuration>
        <ComingSoon icon="solar:code-square-linear" description="Le fichier de configuration de l'agent sera consultable ici prochainement." />
      </template>
    </UTabs>
  </div>
</template>

<script setup lang="ts">
import { apiFetch } from '~/utils/api'

// Importations des modules
import { useRoute } from 'vue-router'
import type { TabsItem } from '@nuxt/ui'

// Variables
const route = useRoute()
const toast = useToast()
const nodeId = route.params.nodeId as string
const node = ref<any>({})
const node_metrics = ref<any>({})
const data_cpu = ref<number[]>([])
const data_memory = ref<number[]>([])
const itemsMethod = ref(['HTTP', 'HTTPS'])
const itemsLocation = ref<any[]>([])
const saving = ref(false)
let metricsInterval: ReturnType<typeof setInterval> | undefined

const tabsitems = ref<TabsItem[]>([
  { label: 'Aperçu', icon: 'solar:chart-square-linear', slot: 'overview' as const },
  { label: 'Paramètres', icon: 'solar:settings-linear', slot: 'settings' as const },
  { label: 'Allocations', icon: 'solar:routing-2-linear', slot: 'allocation' as const },
  { label: 'Serveurs', icon: 'solar:server-square-linear', slot: 'servers' as const },
  { label: 'Configuration', icon: 'solar:code-square-linear', slot: 'configuration' as const }
])

// Statut (logique existante : « unknown » est considéré comme en ligne)
const isOnline = computed(() => node.value.status === 'unknown' || node.value.status === 'online')

// Informations affichées dans l'aperçu
const infos = computed(() => [
  { label: 'Domaine (FQDN)', value: node.value.fqdn, mono: true },
  { label: 'Adresse IP', value: node.value.ip_address, mono: true },
  { label: 'Port', value: node.value.ssh_port, mono: true },
  { label: 'Emplacement', value: itemsLocation.value.find(l => l.value === node.value.location_id)?.label ?? node.value.location_id },
  { label: 'Version de l\'agent', value: 'dev-431', mono: true },
  { label: 'Maintenance', value: node.value.maintenance ? 'Activée' : 'Désactivée' }
])

// Variables du formulaire à envoyer à l'API
const node_form = ref<any>({
  name: '',
  fqdn: '',
  ip_address: '',
  ssh_port: '',
  location_id: '',
  method: '',
  storage_usage: '',
  ram_usage: '',
  cpu_usage: '',
  maintenance: false
})


// Récupération de la node
onMounted(async () => {
  const token = localStorage.getItem('token')
  if (!token) return

  try {
    const [result_node] = await apiFetch(`http://localhost:3001/api/nodes/get/${nodeId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    node.value = result_node
    node_form.value = { ...result_node }

    // Récupération des location
    const locations = await apiFetch('http://localhost:3001/api/locations/list', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    itemsLocation.value = locations.map((location: any) => ({
      label: location.name,
      value: location.id
    }))
  } catch (error) {
    console.error('Erreur lors du chargement de la node :', error)
  }

  // Démarrage du suivi des ressources en temps réel
  startMetrics()
})

onBeforeUnmount(() => {
  if (metricsInterval) clearInterval(metricsInterval)
})

function pushLimitedArray(arr: number[], value: number, maxLength: number) {
  if (arr.length >= maxLength) {
    arr.shift()
  }
  arr.push(value)
}

async function get_metrics() {
  const token = localStorage.getItem('token')
  if (!token) return
  try {
    const result_metrics = await apiFetch(`http://localhost:3001/api/nodes/metrics/${nodeId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    node_metrics.value = result_metrics

    pushLimitedArray(data_cpu.value, result_metrics.cpu_percent, 12)
    pushLimitedArray(data_memory.value, result_metrics.memory_percent, 12)
  } catch (error) {
    console.error('Erreur lors de la récupération des métriques :', error)
  }
}

function startMetrics() {
  get_metrics()
  metricsInterval = setInterval(get_metrics, 5000)
}

// Mise à jour de la node
const updateInfos = async () => {
  const token = localStorage.getItem('token')
  if (!token) {
    console.error('Token manquant')
    return
  }

  saving.value = true
  try {
    await apiFetch('http://localhost:3001/api/nodes/update', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: node_form.value
    })
    node.value = { ...node_form.value }
    toast.add({
      title: 'Node mise à jour',
      description: 'Les modifications ont été enregistrées.',
      color: 'success'
    })
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la node :', error)
    toast.add({
      title: 'Erreur',
      description: 'La node n\'a pas pu être modifiée.',
      color: 'error'
    })
  } finally {
    saving.value = false
  }
}
</script>
