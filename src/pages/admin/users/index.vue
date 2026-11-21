<template>
  <div class="page">
    <PageHeader title="Utilisateurs" description="Les comptes ayant accès à la plateforme." icon="solar:users-group-rounded-linear" />
    <ListTable
      title="les utilisateurs"
      :data="users"
      item-type="users"
      :fields="['id', 'pseudo', 'email', 'is_admin']"
      icon="solar:user-linear"
      :creatable="false"
      @delete="deleteUser"
    />
  </div>
</template>

<script setup lang="ts">
import { apiFetch } from '~/utils/api'

// Variables
const toast = useToast()
const users = ref([])

// Récupération liste des serveurs
onMounted(async () => {
  // Récupération du token
  const token = localStorage.getItem('token')
  if (!token) return

  try {
    // Connexion api pour liste des serveurs
    const result = await apiFetch('http://localhost:3001/api/users/list', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    users.value = result
  } catch (error) {
    // Gestion si erreur api
    toast.add({
    title: 'Erreur lors du chargement des utilisateurs :',
    description: `${error}`,
    color: 'error'
    })
  }
})

  
function deleteUser(id: number) {
  console.log('Supprimer serveur', id)
  // Logique pour supprimer un serveur
}
</script>
