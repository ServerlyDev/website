<template>
  <AuthShell>
    <div v-if="loginTexts.form">
      <h1 class="text-2xl font-semibold tracking-tight text-(--ui-text-highlighted)">{{ loginTexts.title }}</h1>
      <p class="mt-2 text-sm text-(--ui-text-muted)">{{ loginTexts.description }}</p>

      <UForm :schema="schema" :state="state" class="mt-8 space-y-5" @submit="onSubmit" @error="onInvalid">
        <UFormField :label="loginTexts.form.mail" name="email" required>
          <UInput
            v-model="state.email"
            type="email"
            icon="solar:letter-linear"
            size="lg"
            autocomplete="email"
            placeholder="nom@exemple.com"
            class="w-full"
          />
        </UFormField>

        <UFormField :label="loginTexts.form.password" name="password" required>
          <UInput
            v-model="state.password"
            :type="showPassword ? 'text' : 'password'"
            icon="solar:lock-password-linear"
            size="lg"
            autocomplete="current-password"
            placeholder="••••••••"
            class="w-full"
            :ui="{ trailing: 'pe-1' }"
          >
            <template #trailing>
              <UButton
                :icon="showPassword ? 'solar:eye-closed-linear' : 'solar:eye-linear'"
                color="neutral"
                variant="link"
                size="sm"
                :aria-label="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
                @click="showPassword = !showPassword"
              />
            </template>
          </UInput>
        </UFormField>

        <UButton type="submit" size="lg" block :loading="loading" :label="loginTexts.buttons.login" />
      </UForm>

      <p class="mt-8 text-center text-sm text-(--ui-text-muted)">
        Pas encore de compte ?
        <RouterLink to="/auth/register" class="font-medium text-(--ui-primary) hover:underline">
          {{ loginTexts.buttons.register }}
        </RouterLink>
      </p>
    </div>
  </AuthShell>
</template>

<script setup lang="ts">
import { apiFetch } from '~/utils/api'

// Importation modules
import { object, string, type InferType } from 'yup'
import type { FormSubmitEvent } from '@nuxt/ui'
import { getLang } from '~/utils/lang.ts'

// Lang
const lang = getLang()

// Texts
const loginTexts = ref<any>({})
const showPassword = ref(false)
const loading = ref(false)

// Variables
const toast = useToast()
const router = useRouter()

const schema = object({
    email: string().email('Adresse email invalide').required('Champ requis'),
    password: string()
        .min(8, 'Au moins 8 caractères').required('Champ requis')
})

type Schema = InferType<typeof schema>

const state = reactive({
    email: '',
    password: ''
})

// Chargement du text json
onMounted(async () => {
    loginTexts.value = await import(`@/assets/texts/${lang}/pages/auth/login.json`)
})

// Fonction submit
async function onSubmit(event: FormSubmitEvent<Schema>) {
    if (event.data.email != null && event.data.password != null) {
        loginUser(event.data)
    }
}

// Fonction API création user
async function loginUser(data: Schema) {
  loading.value = true
  try {
    // Test des identifiants sur l'api
    const response = await apiFetch('http://localhost:3001/api/users/login', {
      method: 'POST',
      body: data,
    })

    // Stockage du token
    localStorage.setItem('token', response.token)
    toast.add({
      title: loginTexts.value.alert.success.title,
      description: loginTexts.value.alert.success.description,
      color: 'success'
    })

    // Redirection vers la page d'accueil
    router.push('/')
  } catch (error) {
    // Gestion des erreurs
    // Afficher une alerte/toast d'erreur
    toast.add({
      title: loginTexts.value.alert.error.title,
      description: loginTexts.value.alert.error.description,
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

function onInvalid(error: any) {
    console.warn("Validation error:", error)
}

</script>
