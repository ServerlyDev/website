<template>
  <div class="page max-w-4xl">
    <PageHeader
      title="Nouvel emplacement"
      description="Un emplacement regroupe des nodes situées dans un même datacenter ou une même région."
      icon="solar:map-point-linear"
    />

    <UForm :state="form" class="panel" @submit="createLocation">
      <div class="panel-body">
        <div class="form-section">
          <div>
            <h2 class="form-section-title">Informations</h2>
            <p class="form-section-description">Le nom est affiché lors de l'attribution d'une node.</p>
          </div>
          <div class="form-grid">
            <UFormField label="Nom" name="name" required>
              <UInput v-model="form.name" icon="solar:map-point-linear" placeholder="ex : France n°1" class="w-full" required />
            </UFormField>
            <UFormField label="Description" name="description">
              <UInput v-model="form.description" icon="solar:document-text-linear" placeholder="ex : Datacenter Paris" class="w-full" />
            </UFormField>
          </div>
        </div>
      </div>
      <div class="panel-footer">
        <UButton label="Annuler" color="neutral" variant="ghost" to="/admin/locations" />
        <UButton type="submit" icon="solar:check-circle-linear" label="Créer l'emplacement" :loading="loading" />
      </div>
    </UForm>
  </div>
</template>

<script setup lang="ts">
import { apiFetch } from '~/utils/api'

// Variables
const toast = useToast()
const router = useRouter()
const loading = ref(false)
const form = ref({
  name: '',
  description: '',
})

// Fonction de création d'emplacement
async function createLocation() {
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Token manquant.')

    if (!form.value.name) {
      throw new Error('veuillez remplir le champ obligatoire.')
    }
    // Fonction création location
    await apiFetch('http://localhost:3001/api/locations/create', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: {
        name: form.value.name,
        ip_address: form.value.description
      }
    })

    toast.add({
      title: 'Emplacement créé',
      description: `L'emplacement ${form.value.name} a été créé.`,
      color: 'success'
    })
    router.push('/admin/locations')
  } catch (error: any) {
    console.error('Erreur lors de la création de l\'emplacement :', error)
    toast.add({
      title: 'Erreur',
      description: `Problème à la création de l'emplacement : ${error.data?.error ?? error.message}`,
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}
</script>
