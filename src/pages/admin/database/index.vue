<template>
  <div class="page">
    <PageHeader title="Bases de données" description="Les bases de données hébergées sur vos serveurs." icon="solar:database-linear" />
    <ListTable
      title="les bases de données"
      :data="databases"
      item-type="databases"
      :fields="['id', 'name']"
      icon="solar:database-linear"
      :creatable="false"
      @delete="deleteDatabase"
    />
  </div>
</template>

<script setup lang="ts">

// Variables
const databases = ref([])


// Récupération de la liste de tous les base de données
onMounted(async () => {
// Récupération du token
const token = localStorage.getItem('token')
if (!token) return
})


function deleteDatabase(id: number) {
console.log('Supprimer emplacement', id)
// Logique suppresion d'une base de donnée
}
</script>
