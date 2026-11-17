<script setup lang="ts">
import StudentTable from '~/components/StudentTable/StudentTable.vue';
import ErrorMessage from '~/components/ErrorMessage/ErrorMessage.vue';
import PaginationControls from '~/components/PaginationControls/PaginationControls.vue';
import StudentFilters from '~/components/StudentFilters/StudentFilters.vue';
import { useStudentsList } from '~/composables/useStudentList';
import StudentActions from '~/components/StudentActions/StudentActions.vue';

definePageMeta({
    middleware: ['auth'],
});

const {
    userStore,
    data,
    error,
    isLoading,
    showLoading,
    isDeleting,
    actionError,
    selectedStudentId,
    currentPage,
    totalPages,
    rowOffset,
    changePage,
    applyFilters,
    openSelectedStudent,
    openStudent,
    editSelectedStudent,
    deleteSelectedStudent,
} = useStudentsList();
</script>

<template>
    <section>
        <h1>Студенты</h1>

        <ErrorMessage v-if="error" :error-message="error.message" />

        <StudentFilters @apply="applyFilters" />

        <ErrorMessage :error-message="actionError" />

        <StudentActions
            :is-admin="userStore.isAdmin"
            :disabled="selectedStudentId === null || isLoading || isDeleting"
            :is-deleting="isDeleting"
            @open="openSelectedStudent"
            @edit="editSelectedStudent"
            @delete="deleteSelectedStudent"
        />

        <PaginationControls
            :current-page="currentPage"
            :total-pages="totalPages"
            :is-loading="isLoading || isDeleting"
            @change="changePage"
        />

        <h1 v-if="showLoading" role="status">Загрузка студентов…</h1>

        <StudentTable
            v-if="data"
            :students="data.students"
            :row-offset="rowOffset"
            :selected-student-id="selectedStudentId"
            @select="!isLoading && !isDeleting && (selectedStudentId = $event)"
            @open="openStudent"
        />
    </section>
</template>
