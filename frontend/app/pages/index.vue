<script setup lang="ts">
definePageMeta({
    middleware: ['auth'],
});

await navigateTo('/students', { replace: true });
</script>

<template>
    <div />
</template>
