<template>
  <div class="panel flex flex-col items-center justify-center px-6 py-20 text-center">
    <div class="flex size-14 items-center justify-center rounded-full bg-(--ui-primary)/10 text-(--ui-primary)">
      <UIcon :name="icon" class="size-7" />
    </div>
    <p class="mt-5 font-semibold text-(--ui-text-highlighted)">Bientôt disponible</p>
    <p class="mt-1 max-w-md text-sm text-(--ui-text-muted)">{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{ icon: string, description: string }>()
</script>
