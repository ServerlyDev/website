<template>
  <div class="page">
    <PageHeader title="Serveurs" description="Tous les serveurs déployés sur votre infrastructure." icon="solar:server-square-linear">
      <template #actions>
        <UButton icon="solar:add-circle-linear" label="Nouveau serveur" to="/admin/servers/create" />
      </template>
    </PageHeader>
    <ListTable
      title="les serveurs"
      :data="servers"
      item-type="servers"
      :fields="['id', 'name', 'ip_address', 'user_id', 'status']"
      icon="solar:server-square-linear"
      :creatable="false"
      @delete="deleteServer"
    />
  </div>
</template>

<script setup lang="ts">
import { apiFetch } from '~/utils/api'

// Variables
const servers = ref([])


// Récupération de la liste de tous les serveurs
onMounted(async () => {
  // Récupération du token
  const token = localStorage.getItem('token')
  if (!token) return

  try {
    const result = await apiFetch('http://localhost:3001/api/servers/listall', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    servers.value = result
  } catch (error) {
    console.error('Erreur lors du chargement des serveurs :', error)
  }
})


async function deleteServer(serverId: number) {
  const token = localStorage.getItem('token')
  if (!token) return

  try {
    await apiFetch(`http://localhost:3001/api/servers/delete/${serverId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    // Mets à jour la liste après suppression
    servers.value = servers.value.filter(s => s.id !== serverId)

  } catch (error) {
    console.error('Erreur lors de la suppression du serveur :', error)
  }
}
</script>
