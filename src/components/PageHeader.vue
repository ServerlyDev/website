<template>
  <div class="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
    <div class="min-w-0">
      <div class="flex items-center gap-3">
        <div
          v-if="icon"
          class="hidden size-10 shrink-0 items-center justify-center rounded-lg border border-(--ui-border) bg-(--ui-bg-elevated) text-(--ui-primary) sm:flex"
        >
          <UIcon :name="icon" class="size-5" />
        </div>
        <div class="min-w-0">
          <h1 class="flex items-center gap-3 truncate text-xl font-semibold tracking-tight text-(--ui-text-highlighted) sm:text-2xl">
            {{ title }}
            <slot name="badge" />
          </h1>
          <p v-if="description" class="mt-1 text-sm text-(--ui-text-muted)">{{ description }}</p>
        </div>
      </div>
    </div>
    <div v-if="$slots.actions" class="flex shrink-0 flex-wrap items-center gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description?: string
  icon?: string
}>()
</script>
