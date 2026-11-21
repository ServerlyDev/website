<template>
  <div class="page max-w-5xl">
    <!-- En-tête du profil -->
    <div class="mb-8 flex items-center gap-4">
      <UAvatar :text="initials" size="3xl" class="bg-(--ui-primary)/15 text-(--ui-primary) ring-1 ring-(--ui-primary)/25" />
      <div class="min-w-0">
        <h1 class="truncate text-xl font-semibold tracking-tight text-(--ui-text-highlighted) sm:text-2xl">
          {{ state.pseudo || indexTexts.title || 'Votre profil' }}
        </h1>
        <p class="mt-0.5 truncate text-sm text-(--ui-text-muted)">{{ state.email }}</p>
      </div>
    </div>

    <UTabs
      v-if="indexTexts.tabs"
      :items="items"
      variant="link"
      class="w-full"
      :ui="{ list: 'border-b border-(--ui-border) overflow-x-auto', content: 'pt-6' }"
    >
      <!-- Compte -->
      <template #account>
        <UForm :schema="schema" :state="state" class="panel" @submit="onSubmit">
          <div class="panel-body">
            <div class="form-section">
              <div>
                <h2 class="form-section-title">Informations personnelles</h2>
                <p class="form-section-description">Ces informations sont visibles par les administrateurs.</p>
              </div>
              <div class="form-grid">
                <UFormField :label="indexTexts.account.pseudo" name="pseudo" required>
                  <UInput v-model="state.pseudo" icon="solar:user-linear" :placeholder="indexTexts.account.pseudo" class="w-full" required />
                </UFormField>
                <UFormField :label="indexTexts.account.email" name="email" required>
                  <UInput v-model="state.email" type="email" icon="solar:letter-linear" :placeholder="indexTexts.account.email" class="w-full" required />
                </UFormField>
              </div>
            </div>

            <div class="form-section">
              <div>
                <h2 class="form-section-title">{{ indexTexts.account.password }}</h2>
                <p class="form-section-description">Laissez vide pour conserver le mot de passe actuel.</p>
              </div>
              <div class="form-grid">
                <UFormField label="Nouveau mot de passe" name="password" class="sm:col-span-2">
                  <UInput v-model="state.password" type="password" icon="solar:lock-password-linear" placeholder="••••••••" autocomplete="new-password" class="w-full sm:max-w-sm" />
                </UFormField>
              </div>
            </div>
          </div>
          <div class="panel-footer">
            <UButton type="submit" icon="solar:diskette-linear" :label="indexTexts.account.save" :loading="saving" />
          </div>
        </UForm>
      </template>

      <!-- Double authentification -->
      <template #twofa>
        <div class="panel">
          <div class="panel-header">
            <div>
              <h2 class="panel-title">Double authentification</h2>
              <p class="panel-description">Ajoutez une couche de sécurité supplémentaire à votre compte.</p>
            </div>
            <UBadge color="neutral" variant="subtle">Désactivée</UBadge>
          </div>
          <div class="panel-body grid gap-8 md:grid-cols-[auto_1fr]">
            <div class="flex size-44 items-center justify-center rounded-lg border border-dashed border-(--ui-border-accented) bg-(--ui-bg-muted) text-(--ui-text-dimmed)">
              <UIcon name="solar:qr-code-linear" class="size-14" />
            </div>
            <ol class="space-y-5 text-sm">
              <li class="flex gap-3">
                <span class="flex size-6 shrink-0 items-center justify-center rounded-full bg-(--ui-bg-accented) text-xs font-semibold text-(--ui-text-highlighted)">1</span>
                <p class="pt-0.5 text-(--ui-text-muted)">Scannez le QR code avec une application d'authentification (Google Authenticator, 1Password, Authy…).</p>
              </li>
              <li class="flex gap-3">
                <span class="flex size-6 shrink-0 items-center justify-center rounded-full bg-(--ui-bg-accented) text-xs font-semibold text-(--ui-text-highlighted)">2</span>
                <div class="flex-1 space-y-3">
                  <p class="pt-0.5 text-(--ui-text-muted)">Saisissez le code à 6 chiffres généré par l'application.</p>
                  <UInput v-model="twoFactor" icon="solar:shield-keyhole-linear" placeholder="000 000" class="w-full max-w-xs font-mono" />
                </div>
              </li>
            </ol>
          </div>
          <div class="panel-footer">
            <UButton icon="solar:shield-check-linear" label="Activer la double authentification" />
          </div>
        </div>
      </template>

      <!-- API -->
      <template #api>
        <div class="panel">
          <div class="panel-header">
            <div>
              <h2 class="panel-title">Clés API</h2>
              <p class="panel-description">Utilisez une clé API pour automatiser vos actions via l'API Serverly.</p>
            </div>
          </div>
          <div class="panel-body">
            <div class="flex flex-col gap-3 sm:flex-row">
              <UInput v-model="apiKeyName" icon="solar:key-linear" placeholder="Nom de la clé (ex : CI/CD)" class="w-full sm:max-w-sm" />
              <UButton icon="solar:add-circle-linear" label="Créer une clé API" />
            </div>
            <div class="mt-6 flex flex-col items-center justify-center rounded-lg border border-dashed border-(--ui-border-accented) px-6 py-10 text-center">
              <UIcon name="solar:key-linear" class="size-8 text-(--ui-text-dimmed)" />
              <p class="mt-3 text-sm font-medium text-(--ui-text-highlighted)">Aucune clé API</p>
              <p class="mt-1 text-sm text-(--ui-text-muted)">Les clés que vous créez apparaîtront ici.</p>
            </div>
          </div>
        </div>
      </template>

      <!-- Préférences -->
      <template #preferences>
        <ComingSoon icon="solar:pallete-2-linear" description="Les préférences d'affichage (langue par défaut, notifications…) seront bientôt disponibles." />
      </template>
    </UTabs>
  </div>
</template>

<script setup lang="ts">
import { apiFetch } from '~/utils/api'

// Importation des modules
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import type { TabsItem } from '@nuxt/ui'
import { getLang } from '~/utils/lang.ts'
import * as yup from 'yup'

// Notification
const toast = useToast()

// Chargement de la langue et des textes
const lang = getLang()
const indexTexts = ref<any>({})

// Récupération de l'ID utilisateur depuis l'URL
const route = useRoute()
const idUser = route.params.idUser as string

// Définition des onglets
const items = computed(() => [
  {
    label: indexTexts.value?.tabs?.account,
    icon: 'solar:user-circle-linear',
    slot: 'account' as const
  },
  {
    label: indexTexts.value?.tabs?.twofa,
    icon: 'solar:shield-keyhole-linear',
    slot: 'twofa' as const
  },
  {
    label: indexTexts.value?.tabs?.api,
    icon: 'solar:key-linear',
    slot: 'api' as const
  },
  {
    label: indexTexts.value?.tabs?.custom,
    icon: 'solar:pallete-2-linear',
    slot: 'preferences' as const
  }
]) satisfies TabsItem[]

// Déclaration des états utilisateur
const userInfos = ref<any>({})
const saving = ref(false)

// Initiales pour l'avatar
const initials = computed(() => (state.value.pseudo || state.value.email || '?').slice(0, 2).toUpperCase())

// Schéma de validation du formulaire
const schema = yup.object({
  pseudo: yup.string().required('Le pseudo est requis'),
  email: yup.string().email('Email invalide').required('L\'email est requis'),
  password: yup.string().optional()
})

const state = ref({
  pseudo: '',
  email: '',
  password: ''
})

// Chargement des données utilisateur au montage
onMounted(async () => {
  const token = localStorage.getItem('token')
  if (!token) return

  indexTexts.value = await import(`@/assets/texts/${lang}/pages/user/index.json`)

  try {
    const result = await apiFetch(`http://localhost:3001/api/users/infos?userTarget=${idUser}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    userInfos.value = result[0]

    // Remplissage des champs du formulaire
    state.value.pseudo = userInfos.value.pseudo
    state.value.email = userInfos.value.email
  } catch (error) {
    console.error("Erreur lors du chargement des informations de l'utilisateur :", error)
  }
})

// Données pour l'authentification à deux facteurs et l'API
const twoFactor = ref('')
const apiKeyName = ref('')

// Fonction de soumission du formulaire
const onSubmit = async (data: any) => {
  const token = localStorage.getItem('token')
  if (!token) {
    console.error('Token manquant')
    return
  }

  data = data.data

  // Construction du payload de mise à jour
  const updatePayload: any = {
    userTarget: idUser,
    pseudo: data.pseudo,
    email: data.email
  }
  if (data.password?.trim()) {
    updatePayload.password = data.password
  }

  saving.value = true
  try {
    await apiFetch('http://localhost:3001/api/users/update', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: updatePayload
    })

    state.value.password = ''
    toast.add({
      title: indexTexts.value.toast.success.title,
      description: indexTexts.value.toast.success.description,
      color: 'success'
    })
  } catch (error) {
    console.error('Erreur lors de la mise à jour du compte :', error)
    toast.add({
      title: indexTexts.value.toast.error.title,
      description: indexTexts.value.toast.error.description,
      color: 'error'
    })
  } finally {
    saving.value = false
  }
}
</script>
