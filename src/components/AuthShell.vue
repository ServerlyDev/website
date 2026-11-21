<template>
  <div class="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
    <!-- Panneau de marque -->
    <aside class="relative hidden overflow-hidden border-r border-(--ui-border) bg-(--ui-bg) lg:flex lg:flex-col lg:justify-between lg:p-12">
      <!-- Décor -->
      <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.18),transparent_55%)]" />
      <div class="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_70%)]" />

      <div class="relative flex items-center gap-2.5">
        <img src="/logo_sans_texte_sans_fond.png" alt="" class="size-9" />
        <span class="text-lg font-semibold tracking-tight text-(--ui-text-highlighted)">{{ app.name }}</span>
      </div>

      <div class="relative max-w-md">
        <h2 class="text-3xl font-semibold leading-tight tracking-tight text-(--ui-text-highlighted)">
          Pilotez toute votre infrastructure depuis un seul endroit.
        </h2>
        <p class="mt-4 text-(--ui-text-muted)">
          Déployez, surveillez et administrez vos serveurs et vos nodes en temps réel.
        </p>
        <ul class="mt-10 space-y-5">
          <li v-for="feature in features" :key="feature.title" class="flex gap-4">
            <div class="flex size-9 shrink-0 items-center justify-center rounded-lg border border-(--ui-border) bg-(--ui-bg-elevated) text-(--ui-primary)">
              <UIcon :name="feature.icon" class="size-5" />
            </div>
            <div>
              <p class="text-sm font-medium text-(--ui-text-highlighted)">{{ feature.title }}</p>
              <p class="mt-0.5 text-sm text-(--ui-text-muted)">{{ feature.description }}</p>
            </div>
          </li>
        </ul>
      </div>

      <p class="relative text-xs text-(--ui-text-dimmed)">© {{ year }} {{ app.name }}. Tous droits réservés.</p>
    </aside>

    <!-- Formulaire -->
    <main class="relative flex flex-col px-4 py-8 sm:px-8">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2 lg:invisible">
          <img src="/logo_sans_texte_sans_fond.png" alt="" class="size-8" />
          <span class="font-semibold text-(--ui-text-highlighted)">{{ app.name }}</span>
        </div>
        <Lang />
      </div>

      <div class="flex flex-1 items-center justify-center py-10">
        <div class="w-full max-w-sm">
          <slot />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import app from '~/assets/texts/app.json'

const year = new Date().getFullYear()

const features = [
  { icon: 'solar:server-square-linear', title: 'Gestion centralisée', description: 'Tous vos serveurs et nodes réunis dans une seule interface.' },
  { icon: 'solar:graph-up-linear', title: 'Supervision en temps réel', description: 'CPU, mémoire et stockage suivis en continu, avec alertes.' },
  { icon: 'solar:programming-linear', title: 'Console intégrée', description: 'Accédez au terminal de vos machines directement depuis le navigateur.' }
]
</script>
