<template>
  <div class="page flex min-h-[calc(100dvh-var(--app-topbar-height))] flex-col">
    <PageHeader
      :title="server?.name || 'Chargement…'"
      :description="server ? `${server.ip_address}:${server.ssh_port}` : undefined"
      icon="solar:server-square-linear"
    >
      <template v-if="server" #badge>
        <UBadge color="success" variant="subtle" size="md">
          <span class="relative flex size-2">
            <span class="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-60" />
            <span class="relative inline-flex size-2 rounded-full bg-current" />
          </span>
          En ligne
        </UBadge>
      </template>
      <template #actions>
        <UButton icon="solar:play-linear" label="Démarrer" color="success" variant="soft" />
        <UButton icon="solar:restart-linear" label="Redémarrer" color="neutral" variant="outline" />
        <UButton icon="solar:stop-linear" label="Arrêter" color="error" variant="soft" />
      </template>
    </PageHeader>

    <!-- Console -->
    <div class="flex flex-1 flex-col overflow-hidden rounded-(--ui-radius) border border-(--ui-border) bg-[#06070a]">
      <div class="flex items-center justify-between border-b border-(--ui-border) bg-(--ui-bg) px-4 py-2.5">
        <div class="flex items-center gap-2 text-sm font-medium text-(--ui-text-toned)">
          <UIcon name="solar:programming-linear" class="size-4 text-(--ui-text-dimmed)" />
          Console
        </div>
        <span v-if="server" class="font-mono text-xs text-(--ui-text-dimmed)">ws://{{ server.ip_address }}:{{ server.ssh_port }}</span>
      </div>
      <div class="min-h-[420px] flex-1 p-3">
        <WebConsole
          v-if="server"
          :idServer="idServer"
          :ip="server.ip_address"
          :port="server.ssh_port"
        />
        <div v-else class="flex h-full items-center justify-center gap-2 text-sm text-(--ui-text-dimmed)">
          <UIcon name="solar:refresh-linear" class="size-4 animate-spin" />
          Connexion au serveur…
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { apiFetch } from '~/utils/api'

// Importations des modules
import { useRoute } from 'vue-router'
import { defineAsyncComponent, onMounted, ref } from 'vue'

// Variables
const route = useRoute()
const toast = useToast()

const idServer = route.params.idServer as string
const servers = ref<Server[]>([])
const server = ref<Server | null>(null)
const token = ref<string | null>(null)

interface Server {
  id: string
  name: string
  status: string
  ip_address: string
  ssh_port: number
}

onMounted(async () => {
  token.value = localStorage.getItem('token')
  if (!token.value) return

  try {
    const result = await apiFetch<Server[]>('http://localhost:3001/api/servers/list', {
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })
    servers.value = result
    server.value = servers.value.find(s => s.id == idServer) || null

    if (!server.value) {
      toast.add({
        title: 'Serveur introuvable',
        description: `Aucun serveur avec l’ID ${idServer} n’a été trouvé.`,
        color: 'warning'
      })
    }
  } catch (error) {
    toast.add({
      title: 'Erreur lors du chargement des serveurs',
      description: String(error),
      color: 'error'
    })
  }
})

const WebConsole = defineAsyncComponent(() => import('~/components/Webconsole.vue'))
</script>
