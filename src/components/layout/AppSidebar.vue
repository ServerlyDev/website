<template>
  <aside class="flex h-full w-(--app-sidebar-width) flex-col border-r border-(--ui-border) bg-(--ui-bg)">
    <!-- Marque -->
    <RouterLink to="/" class="flex h-(--app-topbar-height) shrink-0 items-center gap-2.5 border-b border-(--ui-border) px-5">
      <img src="/logo_sans_texte_sans_fond.png" alt="" class="size-8" />
      <span class="text-base font-semibold tracking-tight text-(--ui-text-highlighted)">{{ app.name }}</span>
    </RouterLink>

    <!-- Contexte (ex : retour, nom du serveur) -->
    <div v-if="$slots.context" class="border-b border-(--ui-border) px-3 py-3">
      <slot name="context" />
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto px-3 py-4">
      <div v-for="(section, index) in sections" :key="index" :class="index > 0 && 'mt-6'">
        <p v-if="section.title" class="mb-1.5 px-2.5 text-[11px] font-semibold uppercase tracking-wider text-(--ui-text-dimmed)">
          {{ section.title }}
        </p>
        <ul class="space-y-0.5">
          <li v-for="item in section.items" :key="item.to">
            <span
              v-if="item.soon"
              class="flex cursor-not-allowed items-center gap-3 rounded-md px-2.5 py-2 text-sm text-(--ui-text-dimmed)"
            >
              <UIcon :name="item.icon" class="size-[18px] shrink-0" />
              <span class="flex-1 truncate">{{ item.label }}</span>
              <UBadge label="Bientôt" size="sm" color="neutral" variant="subtle" />
            </span>
            <RouterLink
              v-else
              :to="item.to"
              class="group relative flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-colors"
              :class="isActive(item)
                ? 'bg-(--ui-bg-accented) text-(--ui-text-highlighted)'
                : 'text-(--ui-text-muted) hover:bg-(--ui-bg-elevated) hover:text-(--ui-text-highlighted)'"
            >
              <span v-if="isActive(item)" class="absolute inset-y-1.5 -left-3 w-0.5 rounded-r bg-(--ui-primary)" />
              <UIcon
                :name="item.icon"
                class="size-[18px] shrink-0 transition-colors"
                :class="isActive(item) ? 'text-(--ui-primary)' : 'text-(--ui-text-dimmed) group-hover:text-(--ui-text-toned)'"
              />
              <span class="truncate">{{ item.label }}</span>
            </RouterLink>
          </li>
        </ul>
      </div>
    </nav>

    <!-- Pied -->
    <div v-if="$slots.footer" class="border-t border-(--ui-border) p-3">
      <slot name="footer" />
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import app from '~/assets/texts/app.json'
import type { NavItem, NavSection } from './types'

defineProps<{ sections: NavSection[] }>()

const route = useRoute()

function isActive(item: NavItem) {
  if (item.exact) return route.path === item.to
  return route.path === item.to || route.path.startsWith(`${item.to}/`)
}
</script>
