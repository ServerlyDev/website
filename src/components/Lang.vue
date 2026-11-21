<template>
  <UDropdownMenu :items="items" :content="{ align: 'end', sideOffset: 8 }" :ui="{ content: 'w-40' }">
    <UButton color="neutral" variant="ghost" :aria-label="`Langue : ${current.label}`">
      <img :src="current.flag" alt="" class="size-4 rounded-sm object-cover" />
      <span class="text-xs font-semibold uppercase">{{ current.code }}</span>
    </UButton>
  </UDropdownMenu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DropdownMenuItem } from '@nuxt/ui'
import { setLang, getLang } from '~/utils/lang'

const langs = [
  { code: 'fr', label: 'Français', flag: '/fr.png' },
  { code: 'en', label: 'English', flag: '/en.png' }
] as const

const currentCode = getLang()
const current = computed(() => langs.find(l => l.code === currentCode) ?? langs[0])

const items = computed<DropdownMenuItem[]>(() =>
  langs.map(lang => ({
    label: lang.label,
    avatar: { src: lang.flag, alt: '' },
    type: 'checkbox',
    checked: lang.code === currentCode,
    onSelect: () => changeLang(lang.code)
  }))
)

function changeLang(code: 'fr' | 'en') {
  if (code === currentCode) return
  setLang(code)
  location.reload()
}
</script>
