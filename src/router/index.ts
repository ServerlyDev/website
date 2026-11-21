import { createRouter, createWebHistory } from 'vue-router'
import type { LayoutName } from '../layouts'
import { authGuard } from './auth'

declare module 'vue-router' {
  interface RouteMeta {
    layout?: LayoutName
    /** Libellé affiché dans le fil d'Ariane */
    title?: string
    /** Élément parent ajouté au début du fil d'Ariane */
    parent?: { title: string, to: string }
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: () => import('../pages/index.vue'), meta: { title: 'Serveurs' } },
    { path: '/logout', component: () => import('../pages/logout.vue'), meta: { layout: 'none' } },

    // Authentification
    { path: '/auth/login', component: () => import('../pages/auth/login.vue'), meta: { layout: 'none' } },
    { path: '/auth/register', component: () => import('../pages/auth/register.vue'), meta: { layout: 'none' } },

    // Utilisateur
    { path: '/user/:idUser', component: () => import('../pages/user/[idUser]/index.vue'), meta: { title: 'Mon profil' } },

    // Serveur
    {
      path: '/server/:idServer',
      component: () => import('../pages/server/[idServer]/index.vue'),
      meta: { layout: 'server', title: 'Console', parent: { title: 'Serveurs', to: '/' } }
    },

    // Administration
    {
      path: '/admin',
      meta: { layout: 'admin', title: 'Administration' },
      children: [
        { path: '', component: () => import('../pages/admin/index.vue') },
        { path: 'api', component: () => import('../pages/admin/api/index.vue'), meta: { title: 'API' } },
        { path: 'database', component: () => import('../pages/admin/database/index.vue'), meta: { title: 'Bases de données' } },
        { path: 'settings', component: () => import('../pages/admin/settings/index.vue'), meta: { title: 'Paramètres' } },
        { path: 'users', component: () => import('../pages/admin/users/index.vue'), meta: { title: 'Utilisateurs' } },
        {
          path: 'locations',
          meta: { title: 'Emplacements' },
          children: [
            { path: '', component: () => import('../pages/admin/locations/index.vue') },
            { path: 'create', component: () => import('../pages/admin/locations/create.vue'), meta: { title: 'Nouvel emplacement' } }
          ]
        },
        {
          path: 'nodes',
          meta: { title: 'Nodes' },
          children: [
            { path: '', component: () => import('../pages/admin/nodes/index.vue') },
            { path: 'create', component: () => import('../pages/admin/nodes/create.vue'), meta: { title: 'Nouvelle node' } },
            { path: ':nodeId/view', component: () => import('../pages/admin/nodes/[nodeId]/view.vue'), meta: { title: 'Détails' } }
          ]
        },
        {
          path: 'servers',
          meta: { title: 'Serveurs' },
          children: [
            { path: '', component: () => import('../pages/admin/servers/index.vue') },
            { path: 'create', component: () => import('../pages/admin/servers/create.vue'), meta: { title: 'Nouveau serveur' } }
          ]
        }
      ]
    },

    // Toute autre URL renvoie vers l'accueil
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
})

router.beforeEach(authGuard)

export default router
