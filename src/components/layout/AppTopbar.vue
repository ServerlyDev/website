<template>
  <header
    class="sticky top-0 z-30 flex h-(--app-topbar-height) items-center gap-3 border-b border-(--ui-border) bg-(--app-bg)/80 px-4 backdrop-blur-md sm:px-6 lg:px-8"
  >
    <!-- Menu mobile -->
    <UButton
      icon="solar:hamburger-menu-linear"
      color="neutral"
      variant="ghost"
      class="lg:hidden"
      aria-label="Ouvrir le menu"
      @click="$emit('toggle-sidebar')"
    />

    <!-- Fil d'Ariane -->
    <nav class="flex min-w-0 items-center gap-1.5 text-sm">
      <template v-for="(crumb, index) in breadcrumbs" :key="index">
        <UIcon v-if="index > 0" name="solar:alt-arrow-right-linear" class="size-3.5 shrink-0 text-(--ui-text-dimmed)" />
        <RouterLink
          v-if="crumb.to && index < breadcrumbs.length - 1"
          :to="crumb.to"
          class="truncate text-(--ui-text-muted) transition-colors hover:text-(--ui-text-highlighted)"
        >
          {{ crumb.label }}
        </RouterLink>
        <span v-else class="truncate font-medium text-(--ui-text-highlighted)">{{ crumb.label }}</span>
      </template>
    </nav>

    <div class="ml-auto flex items-center gap-1.5">
      <Lang />

      <UTooltip text="Support">
        <UButton icon="solar:question-circle-linear" color="neutral" variant="ghost" aria-label="Support" class="hidden sm:inline-flex" />
      </UTooltip>
      <UTooltip text="Notifications">
        <UButton icon="solar:bell-linear" color="neutral" variant="ghost" aria-label="Notifications" />
      </UTooltip>

      <USeparator orientation="vertical" class="mx-1.5 h-6" />

      <!-- Compte -->
      <UDropdownMenu :items="menuItems" :content="{ align: 'end', sideOffset: 8 }" :ui="{ content: 'w-56' }">
        <button
          type="button"
          class="flex items-center gap-2.5 rounded-md py-1 pl-1 pr-2 transition-colors hover:bg-(--ui-bg-elevated)"
        >
          <UAvatar :text="initials" size="sm" class="bg-(--ui-primary)/15 text-(--ui-primary) ring-1 ring-(--ui-primary)/25" />
          <span class="hidden max-w-32 truncate text-sm font-medium text-(--ui-text-highlighted) sm:block">{{ displayName }}</span>
          <UIcon name="solar:alt-arrow-down-linear" class="hidden size-4 text-(--ui-text-dimmed) sm:block" />
        </button>
      </UDropdownMenu>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import type { DropdownMenuItem } from '@nuxt/ui'
import { getLang } from '~/utils/lang'
import { useAuth } from '~/composables/useAuth'

defineEmits<{ 'toggle-sidebar': [] }>()

const route = useRoute()
const { userId, isAdmin, displayName, initials } = useAuth()

// Textes du menu
const navbarTexts = ref<any>({ menu: {} })
onMounted(async () => {
  const data = await import(`../../assets/texts/${getLang()}/components/navbar.json`)
  navbarTexts.value = data.default
})

const menuItems = computed<DropdownMenuItem[][]>(() => {
  const main: DropdownMenuItem[] = [
    { label: navbarTexts.value.menu.profile ?? 'Profil', icon: 'solar:user-linear', to: `/user/${userId.value}` }
  ]
  if (isAdmin.value) {
    main.push({ label: navbarTexts.value.menu.admin ?? 'Administration', icon: 'solar:shield-user-linear', to: '/admin' })
  }
  return [
    [{ label: displayName.value, type: 'label' }],
    main,
    [{ label: navbarTexts.value.menu.logout ?? 'Déconnexion', icon: 'solar:logout-2-linear', to: '/logout', color: 'error' }]
  ]
})

// Fil d'Ariane construit à partir de `meta.title` des routes correspondantes
const breadcrumbs = computed(() => {
  const crumbs: { label: string, to?: string }[] = []
  if (route.meta.parent) crumbs.push({ label: route.meta.parent.title, to: route.meta.parent.to })
  for (const record of route.matched) {
    // Les routes d'index (path vide) ont le même chemin que leur parent : on ignore les doublons
    if (!record.meta.title || crumbs.some(c => c.label === record.meta.title)) continue
    crumbs.push({
      label: record.meta.title,
      to: record.path.includes(':') ? undefined : record.path || '/'
    })
  }
  return crumbs
})
</script>
