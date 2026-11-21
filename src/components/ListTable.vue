<template>
  <div class="panel overflow-hidden">
    <!-- Barre d'outils -->
    <div class="flex flex-col gap-3 border-b border-(--ui-border) p-4 sm:flex-row sm:items-center sm:justify-between">
      <UInput
        v-model="searchQuery"
        :placeholder="`Rechercher dans ${title}…`"
        icon="solar:magnifer-linear"
        class="w-full sm:max-w-xs"
      />
      <div class="flex items-center gap-3">
        <span class="hidden text-sm text-(--ui-text-muted) sm:inline">
          {{ filtered.length }} résultat{{ filtered.length > 1 ? 's' : '' }}
        </span>
        <UButton v-if="creatable" icon="solar:add-circle-linear" :to="`${route.path}/create`">
          Créer
        </UButton>
      </div>
    </div>

    <!-- Tableau -->
    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead class="bg-(--ui-bg-muted)">
          <tr>
            <th
              v-for="field in fields"
              :key="field"
              scope="col"
              class="whitespace-nowrap px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-(--ui-text-dimmed)"
            >
              {{ labelFor(field) }}
            </th>
            <th scope="col" class="px-4 py-2.5"><span class="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-(--ui-border)">
          <tr v-for="item in paginatedItems" :key="item.id" class="transition-colors hover:bg-(--ui-bg-elevated)/60">
            <td v-for="(field, index) in fields" :key="field" class="whitespace-nowrap px-4 py-3">
              <!-- Statut -->
              <UBadge
                v-if="field === 'status'"
                :color="statusColor(item[field])"
                variant="subtle"
                class="capitalize"
              >
                <span class="size-1.5 rounded-full bg-current" />
                {{ item[field] ?? 'inconnu' }}
              </UBadge>
              <!-- Booléen -->
              <UBadge
                v-else-if="typeof item[field] === 'boolean' || field.startsWith('is_')"
                :color="item[field] ? 'primary' : 'neutral'"
                variant="subtle"
              >
                {{ item[field] ? 'Oui' : 'Non' }}
              </UBadge>
              <!-- Identifiant -->
              <span v-else-if="field === 'id'" class="font-mono text-xs text-(--ui-text-dimmed)">#{{ item[field] }}</span>
              <!-- Adresses -->
              <span v-else-if="monoFields.includes(field)" class="font-mono text-[13px] text-(--ui-text-toned)">{{ item[field] }}</span>
              <!-- Première colonne textuelle : mise en avant avec l'icône -->
              <span v-else-if="index === firstTextIndex" class="flex items-center gap-2.5 font-medium text-(--ui-text-highlighted)">
                <span class="flex size-7 shrink-0 items-center justify-center rounded-md bg-(--ui-bg-accented) text-(--ui-text-muted)">
                  <UIcon :name="icon" class="size-4" />
                </span>
                {{ item[field] }}
              </span>
              <span v-else class="text-(--ui-text-toned)">{{ item[field] ?? '—' }}</span>
            </td>

            <!-- Actions -->
            <td class="whitespace-nowrap px-4 py-3">
              <div class="flex items-center justify-end gap-1">
                <UTooltip v-if="viewable" text="Voir le détail">
                  <UButton
                    icon="solar:eye-linear"
                    color="neutral"
                    variant="ghost"
                    size="sm"
                    :to="`/admin/${itemType}/${item.id}/view`"
                    aria-label="Voir le détail"
                  />
                </UTooltip>
                <UPopover :content="{ align: 'end', side: 'bottom', sideOffset: 6 }">
                  <UButton
                    icon="solar:trash-bin-minimalistic-linear"
                    color="error"
                    variant="ghost"
                    size="sm"
                    aria-label="Supprimer"
                  />
                  <template #content="{ close }">
                    <div class="w-64 p-4">
                      <p class="text-sm font-semibold text-(--ui-text-highlighted)">Supprimer cet élément ?</p>
                      <p class="mt-1 text-sm text-(--ui-text-muted)">Cette action est irréversible.</p>
                      <div class="mt-4 flex justify-end gap-2">
                        <UButton label="Annuler" color="neutral" variant="ghost" size="sm" @click="close" />
                        <UButton
                          label="Supprimer"
                          icon="solar:trash-bin-minimalistic-linear"
                          color="error"
                          size="sm"
                          @click="() => { $emit('delete', item.id); close() }"
                        />
                      </div>
                    </div>
                  </template>
                </UPopover>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- État vide -->
      <div v-if="paginatedItems.length === 0" class="flex flex-col items-center justify-center px-4 py-16 text-center">
        <div class="flex size-12 items-center justify-center rounded-full bg-(--ui-bg-accented) text-(--ui-text-dimmed)">
          <UIcon :name="searchQuery ? 'solar:magnifer-linear' : icon" class="size-6" />
        </div>
        <p class="mt-4 text-sm font-medium text-(--ui-text-highlighted)">
          {{ searchQuery ? 'Aucun résultat' : 'Aucune donnée pour le moment' }}
        </p>
        <p class="mt-1 text-sm text-(--ui-text-muted)">
          {{ searchQuery ? 'Essayez avec d’autres termes de recherche.' : 'Les éléments créés apparaîtront ici.' }}
        </p>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="filtered.length > itemsPerPage" class="flex items-center justify-between border-t border-(--ui-border) px-4 py-3">
      <p class="text-sm text-(--ui-text-muted)">
        <span class="font-medium text-(--ui-text-toned)">{{ rangeStart }}–{{ rangeEnd }}</span> sur
        <span class="font-medium text-(--ui-text-toned)">{{ filtered.length }}</span>
      </p>
      <div class="flex items-center gap-1">
        <UButton icon="solar:alt-arrow-left-linear" color="neutral" variant="outline" size="sm" :disabled="page <= 1" aria-label="Page précédente" @click="page--" />
        <span class="px-2 text-sm tabular-nums text-(--ui-text-muted)">{{ page }} / {{ pageCount }}</span>
        <UButton icon="solar:alt-arrow-right-linear" color="neutral" variant="outline" size="sm" :disabled="page >= pageCount" aria-label="Page suivante" @click="page++" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const props = withDefaults(defineProps<{
  title: string
  data: any[]
  itemType: string
  fields: string[]
  icon: string
  /** Affiche le bouton « Créer » (vers `<route>/create`) */
  creatable?: boolean
  /** Affiche le bouton « Voir » (vers `/admin/<itemType>/<id>/view`) */
  viewable?: boolean
  itemsPerPage?: number
}>(), {
  creatable: true,
  viewable: false,
  itemsPerPage: 10
})

defineEmits<{ delete: [id: any] }>()

// Libellés lisibles pour les colonnes connues
const labels: Record<string, string> = {
  id: 'ID',
  name: 'Nom',
  fqdn: 'FQDN',
  ip_address: 'Adresse IP',
  location_id: 'Emplacement',
  user_id: 'Utilisateur',
  status: 'Statut',
  email: 'Email',
  pseudo: 'Pseudo',
  is_admin: 'Admin',
  description: 'Description'
}
const monoFields = ['ip_address', 'fqdn']

const labelFor = (field: string) => labels[field] ?? field.replace(/_/g, ' ')

// Colonne principale (première colonne qui n'est ni l'ID ni une colonne spéciale)
const firstTextIndex = computed(() =>
  props.fields.findIndex(f => f !== 'id' && f !== 'status' && !f.startsWith('is_') && !monoFields.includes(f) && !f.endsWith('_id'))
)

function statusColor(status?: string) {
  switch (String(status).toLowerCase()) {
    case 'online':
    case 'running':
    case 'active':
      return 'success'
    case 'offline':
    case 'stopped':
    case 'error':
      return 'error'
    case 'installing':
    case 'pending':
      return 'warning'
    default:
      return 'neutral'
  }
}

// Recherche et pagination
const searchQuery = ref('')
const page = ref(1)

const filtered = computed(() => {
  const data = props.data ?? []
  if (!searchQuery.value) return data
  const q = searchQuery.value.toLowerCase()
  return data.filter(item => Object.values(item).some(val => String(val).toLowerCase().includes(q)))
})

const pageCount = computed(() => Math.max(1, Math.ceil(filtered.value.length / props.itemsPerPage)))
const rangeStart = computed(() => (page.value - 1) * props.itemsPerPage + 1)
const rangeEnd = computed(() => Math.min(page.value * props.itemsPerPage, filtered.value.length))

const paginatedItems = computed(() => {
  const start = (page.value - 1) * props.itemsPerPage
  return filtered.value.slice(start, start + props.itemsPerPage)
})

// Revient à la première page lors d'une recherche, et reste dans les bornes après une suppression
watch(searchQuery, () => { page.value = 1 })
watch(pageCount, (count) => { if (page.value > count) page.value = count })
</script>
