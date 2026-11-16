<script setup lang="ts">
import AppFooter from '~/components/AppFooter/AppFooter.vue';
import AppHeader from '~/components/AppHeader/AppHeader.vue';
</script>

<template>
    <div class="app-shell">
        <NuxtRouteAnnouncer />

        <AppHeader />

        <main>
            <NuxtPage />
        </main>

        <AppFooter />
    </div>
</template>

<style src="./assets/styles/app.css"></style>
