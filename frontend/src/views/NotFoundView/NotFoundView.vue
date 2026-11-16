<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<template>
    <section>
        <h1>404 – страница не найдена</h1>

        <div class="buttons-container">
            <RouterLink to="/students" class="buttons"> К списку студентов </RouterLink>
        </div>
    </section>
</template>
