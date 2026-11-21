<template>
  <div class="min-h-dvh">
    <!-- Barre latérale (fixe sur grand écran, tiroir sur mobile) -->
    <div
      class="fixed inset-y-0 left-0 z-50 transition-transform duration-200 ease-out lg:translate-x-0"
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <AppSidebar :sections="sections">
        <template v-if="$slots.context" #context><slot name="context" /></template>
        <template v-if="$slots['sidebar-footer']" #footer><slot name="sidebar-footer" /></template>
      </AppSidebar>
    </div>

    <!-- Voile mobile -->
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div v-if="sidebarOpen" class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" @click="sidebarOpen = false" />
    </Transition>

    <!-- Contenu -->
    <div class="flex min-h-dvh flex-col lg:pl-(--app-sidebar-width)">
      <AppTopbar @toggle-sidebar="sidebarOpen = !sidebarOpen" />
      <main class="flex-1">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import type { NavSection } from './types'

defineProps<{ sections: NavSection[] }>()

const route = useRoute()
const sidebarOpen = ref(false)

// Ferme le tiroir mobile à chaque navigation
watch(() => route.fullPath, () => { sidebarOpen.value = false })
</script>
