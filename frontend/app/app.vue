<script setup lang="ts">
import AppFooter from "~/components/AppFooter/AppFooter.vue";
</script>

<template>
  <div class="app-shell">
    <NuxtRouteAnnouncer />

    <main>
      <NuxtPage />
    </main>

    <AppFooter />
  </div>
</template>

<style src="./assets/styles/app.css"></style>
