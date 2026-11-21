import type { Component } from 'vue'
import AdminLayout from './admin.vue'
import DefaultLayout from './default.vue'
import ServerLayout from './server.vue'
import BlankLayout from './blank.vue'

export const layouts = {
  default: DefaultLayout,
  admin: AdminLayout,
  server: ServerLayout,
  // Pas de layout (équivalent de `layout: false` dans Nuxt)
  none: BlankLayout
} satisfies Record<string, Component>

export type LayoutName = keyof typeof layouts
