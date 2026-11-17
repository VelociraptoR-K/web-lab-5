<script setup lang="ts">
import StudentForm from '~/components/StudentForm/StudentForm.vue';

definePageMeta({
    middleware: ['auth'],
    adminOnly: true,
});
</script>

<template>
    <StudentForm />
</template>
