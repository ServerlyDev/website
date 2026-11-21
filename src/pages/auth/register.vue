<template>
  <AuthShell>
    <div v-if="registerTexts.form">
      <h1 class="text-2xl font-semibold tracking-tight text-(--ui-text-highlighted)">{{ registerTexts.title }}</h1>
      <p class="mt-2 text-sm text-(--ui-text-muted)">{{ registerTexts.description }}</p>

      <UForm :schema="schema" :state="state" class="mt-8 space-y-5" @submit="onSubmit" @error="onInvalid">
        <UFormField :label="registerTexts.form.pseudo" name="pseudo" required>
          <UInput
            v-model="state.pseudo"
            icon="solar:user-linear"
            size="lg"
            autocomplete="username"
            placeholder="jdupont"
            class="w-full"
          />
        </UFormField>

        <UFormField :label="registerTexts.form.mail" name="email" required>
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

        <UFormField :label="registerTexts.form.password" name="password" hint="9 caractères minimum" required>
          <UInput
            v-model="state.password"
            :type="showPassword ? 'text' : 'password'"
            icon="solar:lock-password-linear"
            size="lg"
            autocomplete="new-password"
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

        <UButton type="submit" size="lg" block :loading="loading" :label="registerTexts.buttons.login" />

        <p class="text-center text-xs text-(--ui-text-dimmed)">{{ registerTexts.cgu }}</p>
      </UForm>

      <p class="mt-8 text-center text-sm text-(--ui-text-muted)">
        Déjà un compte ?
        <RouterLink to="/auth/login" class="font-medium text-(--ui-primary) hover:underline">
          {{ registerTexts.buttons.register }}
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
const registerTexts = ref<any>({})

// Variables
const toast = useToast()
const router = useRouter()
const showPassword = ref(false)
const loading = ref(false)

const schema = object({
  email: string().email('Adresse email invalide').required('Champ requis'),
  pseudo: string().required('Champ requis'),
  password: string().required('Champ requis')
})

type Schema = InferType<typeof schema>

const state = reactive<Schema>({
  email: '',
  pseudo: '',
  password: ''
})

// Chargement du text json
onMounted(async () => {
  registerTexts.value = await import(`@/assets/texts/${lang}/pages/auth/register.json`)
})

// Fonction vérification des informations saisies
async function onSubmit(event: FormSubmitEvent<Schema>) {
  if (event.data.email != null && event.data.password != null && event.data.pseudo != null) {
    if (event.data.password.length > 8) {
      registerUser(event.data)
    } else {
      toast.add({
        title: registerTexts.value.alert.fielderror.title,
        description: registerTexts.value.alert.fielderror.description,
        color: 'error'
      })
    }
  } else {
    toast.add({
      title: registerTexts.value.alert.fielderror.title,
      description: registerTexts.value.alert.fielderror.description,
      color: 'error'
    })
  }
}

// Fonction enregistrement utilisateur dans la bdd via api
async function registerUser(data: Schema) {
  loading.value = true
  try {
    await apiFetch('http://localhost:3001/api/users/register', {
      method: 'POST',
      body: data,
    })

    toast.add({
      title: registerTexts.value.alert.success.title,
      description: registerTexts.value.alert.success.description,
      color: 'success'
    })

    // Redirection vers la connexion
    router.push('/auth/login')
  } catch (error) {
    toast.add({
      title: registerTexts.value.alert.error.title,
      description: registerTexts.value.alert.error.description,
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
