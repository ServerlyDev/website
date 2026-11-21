<template>
  <div class="page max-w-4xl">
    <PageHeader
      title="Nouveau serveur"
      description="Déclarez un serveur et attribuez-le à un utilisateur."
      icon="solar:server-square-linear"
    />

    <div class="panel">
      <div class="border-b border-(--ui-border) px-5 py-5">
        <UStepper v-model="currentStep" :items="stepperitems" disabled class="w-full" />
      </div>

      <!-- Étape 1 : configuration -->
      <UForm v-if="currentStep === 0" :state="form" @submit="createServer">
        <div class="panel-body">
          <div class="form-section">
            <div>
              <h2 class="form-section-title">Général</h2>
              <p class="form-section-description">Nom du serveur, propriétaire et type.</p>
            </div>
            <div class="form-grid">
              <UFormField label="Nom du serveur" required class="sm:col-span-2">
                <UInput v-model="form.name" icon="solar:server-square-linear" placeholder="ex : Mon VPS personnel" class="w-full" />
              </UFormField>
              <UFormField label="Propriétaire" required>
                <USelectMenu v-model="form.user" :items="itemsuser" icon="solar:user-linear" placeholder="Choisir un utilisateur" class="w-full" />
              </UFormField>
              <UFormField label="Type de serveur" required>
                <USelect v-model="form.type" :items="itemstype" icon="solar:hashtag-square-linear" placeholder="Sélectionner un type" class="w-full" />
              </UFormField>
            </div>
          </div>

          <div class="form-section">
            <div>
              <h2 class="form-section-title">Réseau</h2>
              <p class="form-section-description">Node d'hébergement et accès au serveur.</p>
            </div>
            <div class="form-grid">
              <UFormField label="Node" class="sm:col-span-2">
                <USelect v-model="form.node" :items="itemsnode" icon="solar:server-path-linear" placeholder="Choisir une node" class="w-full" />
              </UFormField>
              <UFormField label="Adresse IP" required>
                <UInput v-model="form.ip_address" icon="solar:global-linear" placeholder="ex : 192.168.0.1" class="w-full" />
              </UFormField>
              <UFormField label="Port" required>
                <UInput v-model="form.port" type="number" icon="solar:plug-circle-linear" placeholder="22" class="w-full" />
              </UFormField>
            </div>
          </div>
        </div>
        <div class="panel-footer">
          <UButton label="Annuler" color="neutral" variant="ghost" to="/admin/servers" />
          <UButton type="submit" icon="solar:check-circle-linear" label="Créer le serveur" :loading="loading" />
        </div>
      </UForm>

      <!-- Étape 2 : déploiement -->
      <template v-else>
        <div class="panel-body space-y-4">
          <UAlert
            color="success"
            variant="subtle"
            icon="solar:check-circle-linear"
            title="Serveur créé"
            description="Exécutez la commande suivante sur le serveur pour installer l'agent et terminer la configuration."
          />
          <CopyCommand :command="commandtocpy" />
        </div>
        <div class="panel-footer">
          <UButton icon="solar:check-circle-linear" label="Terminer" to="/admin/servers" />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { apiFetch } from '~/utils/api'
import type { StepperItem } from '@nuxt/ui'

// Variables
const itemsnode = ref<any[]>([])
const itemstype = ref(['VPS', 'Docker'])
const itemsuser = ref<any[]>([])
const toast = useToast()
const loading = ref(false)
const form = ref<any>({
  node: 'Node 01',
  name: '',
  user: '',
  ip_address: '',
  port: 8765,
  type: 'VPS'
})
const stepperitems = [
  {
    title: 'Configuration',
    description: 'Informations du serveur',
    icon: 'solar:settings-linear'
  }, {
    title: 'Déploiement',
    description: 'Installation de l\'agent',
    icon: 'solar:rocket-2-linear'
  }
] satisfies StepperItem[]

const currentStep = ref(0)

const commandtocpy = ref('')

// Récupération liste des utilisateurs
onMounted(async () => {
  try {
    const token = localStorage.getItem('token')

    // Récupération des users
    const users = await apiFetch('http://localhost:3001/api/users/list', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    itemsuser.value = users.map((user: any) => ({
      label: user.pseudo,
      value: user.id
    }))

    // Récupération des nodes
    const nodes = await apiFetch('http://localhost:3001/api/nodes/list', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    itemsnode.value = nodes.map((node: any) => ({
      label: node.name,
      value: node.id
    }))
  } catch (error) {
    console.error('Erreur lors du chargement des utilisateurs:', error)
    toast.add({
      title: 'Erreur',
      description: "Impossible de charger les utilisateurs",
      color: 'error'
    })
  }
})


// Fonction de création de serveur
async function createServer() {
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Token manquant.')

    if (!form.value.name || !form.value.ip_address || !form.value.user.value) {
      throw new Error('veuillez remplir tous les champs obligatoires.')
    }

    const response = await apiFetch('http://localhost:3001/api/servers/create', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: {
        name: form.value.name,
        node_id: form.value.node,
        ip_address: form.value.ip_address,
        ownerId: form.value.user.value,
        ssh_port: form.value.port
      }
    })

    commandtocpy.value = response.command
    currentStep.value = 1

    toast.add({
      title: 'Serveur créé',
      description: `Le serveur ${form.value.name} a été créé.`,
      color: 'success'
    })
  } catch (error: any) {
    console.error('Erreur lors de la création du serveur :', error)
    toast.add({
      title: 'Erreur',
      description: `Problème à la création du serveur : ${error.data?.error ?? error.message}`,
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}
</script>
