<template>
  <div class="page">
    <PageHeader title="Nodes" description="Les machines physiques ou virtuelles qui hébergent vos serveurs." icon="solar:server-path-linear">
      <template #actions>
        <UButton icon="solar:add-circle-linear" label="Nouvelle node" to="/admin/nodes/create" />
      </template>
    </PageHeader>
    <ListTable
      title="les nodes"
      :data="nodes"
      item-type="nodes"
      :fields="['id', 'name', 'fqdn', 'ip_address', 'location_id']"
      icon="solar:server-path-linear"
      :creatable="false"
      viewable
      @delete="deleteNodes"
    />
  </div>
</template>

<script setup lang="ts">
import { apiFetch } from '~/utils/api'

// Variables
const nodes = ref([])


// Récupération de la liste de tous les nodes
onMounted(async () => {
  // Récupération du token
  const token = localStorage.getItem('token')
  if (!token) return

  try {
    const result = await apiFetch('http://localhost:3001/api/nodes/list', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    nodes.value = result
  } catch (error) {
    console.error('Erreur lors du chargement des nodes :', error)
  }
})


async function deleteNodes(nodeId: number) {
  const token = localStorage.getItem('token')
  if (!token) return

  try {
    await apiFetch(`http://localhost:3001/api/nodes/delete/${nodeId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    // Mets à jour la liste après suppression
    nodes.value = nodes.value.filter(n => n.id !== nodeId)

  } catch (error) {
    console.error('Erreur lors de la suppression de la node :', error)
  }
}
</script>
