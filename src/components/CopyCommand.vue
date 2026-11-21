<template>
  <div class="overflow-hidden rounded-(--ui-radius) border border-(--ui-border) bg-[#06070a]">
    <div class="flex items-center justify-between border-b border-(--ui-border) px-4 py-2">
      <span class="flex items-center gap-2 text-xs font-medium text-(--ui-text-muted)">
        <UIcon name="solar:programming-linear" class="size-4" />
        Terminal
      </span>
      <UButton
        :icon="copied ? 'solar:check-circle-linear' : 'solar:copy-linear'"
        :label="copied ? 'Copié' : 'Copier'"
        :color="copied ? 'success' : 'neutral'"
        variant="ghost"
        size="xs"
        @click="copy"
      />
    </div>
    <pre class="overflow-x-auto px-4 py-4 font-mono text-[13px] leading-relaxed text-(--ui-text-highlighted)"><span class="select-none text-(--ui-primary)">$ </span>{{ command || '…' }}</pre>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ command: string }>()

const copied = ref(false)

async function copy() {
  await navigator.clipboard.writeText(props.command)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
</script>
