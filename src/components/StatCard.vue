<template>
  <div class="panel p-5">
    <div class="flex items-start justify-between gap-4">
      <div class="min-w-0">
        <p class="text-sm font-medium text-(--ui-text-muted)">{{ label }}</p>
        <p class="mt-2 text-2xl font-semibold tracking-tight text-(--ui-text-highlighted) tabular-nums">
          {{ value }}<span v-if="suffix" class="ml-0.5 text-base font-medium text-(--ui-text-muted)">{{ suffix }}</span>
        </p>
      </div>
      <div class="flex size-10 shrink-0 items-center justify-center rounded-lg" :class="tone.icon">
        <UIcon :name="icon" class="size-5" />
      </div>
    </div>

    <div v-if="progress !== undefined" class="mt-4">
      <div class="h-1.5 w-full overflow-hidden rounded-full bg-(--ui-bg-accented)">
        <div class="h-full rounded-full transition-all duration-500" :class="progressColor" :style="{ width: `${Math.min(progress, 100)}%` }" />
      </div>
    </div>
    <p v-else-if="hint" class="mt-4 text-xs text-(--ui-text-dimmed)">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  label: string
  value: string | number
  icon: string
  suffix?: string
  hint?: string
  /** Pourcentage 0-100 : affiche une barre colorée selon le seuil */
  progress?: number
  color?: 'primary' | 'success' | 'warning' | 'info' | 'error'
}>(), { color: 'primary' })

const tones = {
  primary: 'bg-(--ui-primary)/10 text-(--ui-primary)',
  success: 'bg-(--ui-success)/10 text-(--ui-success)',
  warning: 'bg-(--ui-warning)/10 text-(--ui-warning)',
  info: 'bg-(--ui-info)/10 text-(--ui-info)',
  error: 'bg-(--ui-error)/10 text-(--ui-error)'
}

const tone = computed(() => ({ icon: tones[props.color] }))

const progressColor = computed(() => {
  const value = props.progress ?? 0
  if (value >= 90) return 'bg-(--ui-error)'
  if (value >= 75) return 'bg-(--ui-warning)'
  return 'bg-(--ui-primary)'
})
</script>
