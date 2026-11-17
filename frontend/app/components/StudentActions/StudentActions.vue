<script setup lang="ts">
defineProps<{
    isAdmin: boolean;
    disabled: boolean;
    isDeleting: boolean;
}>();

const emit = defineEmits<{
    open: [];
    edit: [];
    delete: [];
}>();
</script>

<template>
    <div class="buttons-container">
        <NuxtLink v-if="isAdmin" to="/students/new" class="buttons accept-button">
            Добавить студента
        </NuxtLink>

        <button type="button" class="buttons" :disabled="disabled" @click="emit('open')">
            Досье
        </button>

        <button
            v-if="isAdmin"
            type="button"
            class="buttons"
            :disabled="disabled"
            @click="emit('edit')"
        >
            Редактировать
        </button>

        <button
            v-if="isAdmin"
            type="button"
            class="buttons delete-button"
            :disabled="disabled"
            @click="emit('delete')"
        >
            {{ isDeleting ? 'Удаление…' : 'Удалить' }}
        </button>
    </div>
</template>
