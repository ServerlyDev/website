<template>
  <div class="page max-w-4xl">
    <PageHeader
      title="Nouvelle node"
      description="Une node est une machine qui héberge vos serveurs grâce à l'agent Serverly."
      icon="solar:server-path-linear"
    />

    <div class="panel">
      <div class="border-b border-(--ui-border) px-5 py-5">
        <UStepper v-model="currentStep" :items="stepperitems" disabled class="w-full" />
      </div>

      <UForm :state="form" @submit="handleSubmit">
        <!-- Étape 1 : configuration -->
        <template v-if="currentStep === 0">
          <div class="panel-body">
            <div class="form-section">
              <div>
                <h2 class="form-section-title">Identité</h2>
                <p class="form-section-description">Nom et emplacement de la node.</p>
              </div>
              <div class="form-grid">
                <UFormField label="Nom de la node" required>
                  <UInput v-model="form.name" icon="solar:text-square-linear" placeholder="ex : node-paris-1" class="w-full" required />
                </UFormField>
                <UFormField label="Emplacement" required>
                  <USelect v-model="form.location_id" :items="itemsLocation" icon="solar:map-point-linear" placeholder="Choisir un emplacement" class="w-full" />
                </UFormField>
              </div>
            </div>

            <div class="form-section">
              <div>
                <h2 class="form-section-title">Connexion</h2>
                <p class="form-section-description">Adresse utilisée par le panel pour joindre l'agent.</p>
              </div>
              <div class="form-grid">
                <UFormField label="FQDN" required class="sm:col-span-2">
                  <UInput v-model="form.fqdn" icon="solar:global-linear" placeholder="ex : node1.exemple.com" class="w-full" required />
                </UFormField>
                <UFormField label="Adresse IP" required>
                  <UInput v-model="form.ip_address" icon="solar:routing-2-linear" placeholder="ex : 192.168.1.10" class="w-full" required />
                </UFormField>
                <UFormField label="Port" required>
                  <UInput v-model="form.port" icon="solar:plug-circle-linear" placeholder="ex : 8080" class="w-full" required />
                </UFormField>
                <UFormField label="Protocole" required>
                  <USelect v-model="form.method" :items="itemsMethod" icon="solar:shield-check-linear" placeholder="HTTP / HTTPS" class="w-full" />
                </UFormField>
              </div>
            </div>
          </div>
          <div class="panel-footer">
            <UButton label="Annuler" color="neutral" variant="ghost" to="/admin/nodes" />
            <UButton type="button" trailing-icon="solar:arrow-right-linear" label="Suivant" @click="next" />
          </div>
        </template>

        <!-- Étape 2 : ressources -->
        <template v-else-if="currentStep === 1">
          <div class="panel-body">
            <div class="form-section">
              <div>
                <h2 class="form-section-title">Ressources allouables</h2>
                <p class="form-section-description">Limites appliquées à l'ensemble des serveurs de la node. Indiquez -1 pour illimité.</p>
              </div>
              <div class="form-grid">
                <UFormField label="Stockage" required>
                  <UInput v-model="form.storageValue" type="number" icon="solar:database-linear" placeholder="-1" class="w-full" required>
                    <template #trailing><span class="text-xs text-(--ui-text-dimmed)">Mo</span></template>
                  </UInput>
                </UFormField>
                <UFormField label="Mémoire vive" required>
                  <UInput v-model="form.memoryValue" type="number" icon="solar:ssd-round-linear" placeholder="-1" class="w-full" required>
                    <template #trailing><span class="text-xs text-(--ui-text-dimmed)">Mo</span></template>
                  </UInput>
                </UFormField>
                <UFormField label="CPU" required>
                  <UInput v-model="form.cpuValue" type="number" icon="solar:cpu-bolt-linear" placeholder="-1" max="100" class="w-full" required>
                    <template #trailing><span class="text-xs text-(--ui-text-dimmed)">%</span></template>
                  </UInput>
                </UFormField>
              </div>
            </div>

            <div class="form-section">
              <div>
                <h2 class="form-section-title">Maintenance</h2>
                <p class="form-section-description">Une node en maintenance n'accepte pas de nouveaux serveurs.</p>
              </div>
              <div class="lg:col-span-2">
                <USwitch v-model="form.maintenance" label="Activer le mode maintenance" />
              </div>
            </div>
          </div>
          <div class="panel-footer">
            <UButton label="Retour" icon="solar:arrow-left-linear" color="neutral" variant="ghost" @click="currentStep = 0" />
            <UButton type="button" icon="solar:check-circle-linear" label="Créer la node" :loading="loading" @click="handleSubmit" />
          </div>
        </template>

        <!-- Étape 3 : déploiement -->
        <template v-else>
          <div class="panel-body space-y-4">
            <UAlert
              color="success"
              variant="subtle"
              icon="solar:check-circle-linear"
              title="Node créée"
              description="Exécutez la commande suivante sur la machine pour installer l'agent Serverly."
            />
            <CopyCommand :command="commandtocpy" />
          </div>
          <div class="panel-footer">
            <UButton icon="solar:check-circle-linear" label="Terminer" to="/admin/nodes" />
          </div>
        </template>
      </UForm>
    </div>
  </div>
</template>

<script setup lang="ts">
import { apiFetch } from '~/utils/api'
import type { StepperItem } from '@nuxt/ui'

// Variables
const toast = useToast()
const loading = ref(false)

// Étapes
const stepperitems = [
  {
    title: 'Configuration',
    description: 'Identité et connexion',
    icon: 'solar:server-path-linear'
  }, {
    title: 'Ressources',
    description: 'Limites et maintenance',
    icon: 'solar:settings-linear'
  },
  {
    title: 'Déploiement',
    description: 'Installation de l\'agent',
    icon: 'solar:rocket-2-linear'
  }
] satisfies StepperItem[]
const currentStep = ref(0)

const commandtocpy = ref('')

// Variables du formulaire à envoyer à l'API
const form = ref({
  name: '',
  fqdn: '',
  ip_address: '',
  port: '',
  location_id: '',
  method: '',
  storageValue: '',
  memoryValue: '',
  cpuValue: '',
  maintenance: true
})

const itemsMethod = ref(['HTTP', 'HTTPS'])
const itemsLocation = ref<any[]>([])

function next() {
  currentStep.value = 1
}

// Récupération liste des emplacements
onMounted(async () => {
  try {
    const token = localStorage.getItem('token')

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
    console.error('Erreur lors du chargement des emplacements:', error)
  }
})

// Fonction pour créer une node
const handleSubmit = async () => {
  const token = localStorage.getItem('token')
  loading.value = true
  try {
    const data = await apiFetch('http://localhost:3001/api/nodes/create', {
      method: 'POST',
      headers: {
          Authorization: `Bearer ${token}`
      },
      body: form.value
    })

    commandtocpy.value = data.command
  } catch (error: any) {
    toast.add({
      title: 'Erreur',
      description: `Problème à la création de la node : ${error.data?.error ?? error.message}`,
      color: 'error'
    })
    return
  } finally {
    loading.value = false
  }

  toast.add({
    title: 'Node créée',
    description: `La node ${form.value.name} a été créée.`,
    color: 'success'
  })

  currentStep.value += 1
}
</script>
