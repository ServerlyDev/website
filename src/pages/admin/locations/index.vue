<template>
  <div class="page">
    <PageHeader title="Emplacements" description="Regroupez vos nodes par datacenter ou par région." icon="solar:map-point-linear">
      <template #actions>
        <UButton icon="solar:add-circle-linear" label="Nouvel emplacement" to="/admin/locations/create" />
      </template>
    </PageHeader>
    <ListTable
      title="les emplacements"
      :data="locations"
      item-type="locations"
      :fields="['id', 'name']"
      icon="solar:map-point-linear"
      :creatable="false"
      @delete="deleteLocations"
    />
  </div>
</template>

<script setup lang="ts">
import { apiFetch } from '~/utils/api'

// Import Style

// Variables
const locations = ref([])


// Récupération de la liste de tous les locations
onMounted(async () => {
  // Récupération du token
  const token = localStorage.getItem('token')
  if (!token) return

  try {
    const result = await apiFetch('http://localhost:3001/api/locations/list', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    locations.value = result
  } catch (error) {
    console.error('Erreur lors du chargement des emplacements :', error)
  }
})

async function deleteLocations(locationID: number) {
  const token = localStorage.getItem('token')
  if (!token) return

  try {
    await apiFetch(`http://localhost:3001/api/locations/delete/${locationID}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    // Mets à jour la liste après suppression
    locations.value = locations.value.filter(s => s.id !== locationID)

  } catch (error) {
    console.error('Erreur lors de la suppression de emplacement :', error)
  }
}
</script>
