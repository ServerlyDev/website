# Serverly — Frontend

Interface web de Serverly, construite avec **Vue 3**, **Vite**, **Vue Router** et **Nuxt UI** (utilisé en mode Vue, sans Nuxt).

## Installation

```bash
bun install
```

## Développement

Lance le serveur de développement sur `http://localhost:3000` :

```bash
bun run dev
```

Le backend doit tourner sur `http://localhost:3001`.

## Production

```bash
bun run build    # génère le dossier dist/
bun run preview  # prévisualise le build
```

## Structure

```
src/
├── main.ts           # Point d'entrée (Vue, Router, Nuxt UI)
├── App.vue           # Choisit le layout selon `route.meta.layout`
├── router/
│   ├── index.ts      # Déclaration des routes
│   └── auth.ts       # Garde d'authentification (ancien middleware Nuxt)
├── layouts/          # default, admin, server, none (sans layout)
├── pages/            # Pages de l'application
├── components/       # Composants (auto-importés)
├── utils/            # lang.ts, api.ts (apiFetch)
└── assets/           # CSS / SCSS et textes de traduction
```

### Ajouter une page

Contrairement à Nuxt, les routes ne sont pas générées depuis les fichiers : il faut déclarer chaque nouvelle page dans `src/router/index.ts`, en précisant le layout via `meta: { layout: 'admin' }` si besoin.

Les API Vue (`ref`, `computed`, `onMounted`…), Vue Router (`useRoute`, `useRouter`), les composants de `src/components` et ceux de Nuxt UI (`UButton`, `useToast`…) sont importés automatiquement.
