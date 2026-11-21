<template>
  <UApp :toaster="{ position: 'bottom-right' }" :tooltip="{ delayDuration: 200 }">
    <component :is="layout">
      <RouterView />
    </component>
  </UApp>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { layouts } from './layouts'

// Choix du layout selon `meta.layout` de la route (hérité des routes parentes)
const route = useRoute()
const layout = computed(() => layouts[route.meta.layout ?? 'default'])
</script>
