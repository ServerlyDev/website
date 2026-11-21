<template></template>
<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Supprime le token et redirige vers le login
onMounted(() => {
  localStorage.removeItem('token')
  router.replace('/auth/login')
})
</script>
