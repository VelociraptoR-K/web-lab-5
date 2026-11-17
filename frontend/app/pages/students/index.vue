<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue';
import StudentTable from '~/components/StudentTable/StudentTable.vue';
import ErrorMessage from '~/components/ErrorMessage/ErrorMessage.vue';
import PaginationControls from '~/components/PaginationControls/PaginationControls.vue';
import StudentFilters from '~/components/StudentFilters/StudentFilters.vue';
import { useUserStore } from '~/stores/user';

definePageMeta({
    middleware: ['auth'],
});

const config = useRuntimeConfig();
const userStore = useUserStore();
const { getStudents, deleteStudent } = useStudentApi();

const isDeleting = ref(false);
const isLoading = computed(() => status.value === 'idle' || status.value === 'pending');
const actionError = ref('');
const showLoading = ref(false);

const selectedStudentId = ref<number | null>(null);
const activeFilters = ref<StudentFiltersParams>({
    sortBy: 'id',
    order: 'up',
});
const currentPage = ref(1);
const pageSize = Number(config.public.studentsPageSize);

const totalPages = computed(() => data.value?.totalPages ?? 0);
const rowOffset = computed(() => ((data.value?.page ?? 1) - 1) * pageSize);

const { data, status, error, refresh } = useAsyncData(
    'students-list',
    () =>
        getStudents({
            ...activeFilters.value,
            page: currentPage.value,
            limit: pageSize,
        }),
    {
        server: false,
        lazy: true,
        watch: [currentPage, activeFilters],
    },
);

let loadingTimer: ReturnType<typeof setTimeout> | undefined;

watch(
    isLoading,
    (loading) => {
        clearTimeout(loadingTimer);
        showLoading.value = false;

        if (loading) {
            loadingTimer = setTimeout(() => {
                showLoading.value = true;
            }, 500);
        }
    },
    { immediate: true },
);

onUnmounted(() => {
    clearTimeout(loadingTimer);
});

function changePage(page: number): void {
    if (
        isLoading.value ||
        isDeleting.value ||
        page === currentPage.value ||
        page < 1 ||
        page > totalPages.value
    ) {
        return;
    }
    selectedStudentId.value = null;
    currentPage.value = page;
}

function applyFilters(filters: StudentFiltersParams): void {
    selectedStudentId.value = null;
    currentPage.value = 1;
    activeFilters.value = filters;
}

async function openSelectedStudent(): Promise<void> {
    if (selectedStudentId.value === null || isLoading.value || isDeleting.value) {
        return;
    }

    await navigateTo(`/students/${selectedStudentId.value}`);
}

async function editSelectedStudent(): Promise<void> {
    if (
        selectedStudentId.value === null ||
        !userStore.isAdmin ||
        isLoading.value ||
        isDeleting.value
    ) {
        return;
    }

    await navigateTo(`/students/${selectedStudentId.value}/edit`);
}

async function deleteSelectedStudent(): Promise<void> {
    const id = selectedStudentId.value;

    if (id === null || !userStore.isAdmin || isLoading.value || isDeleting.value) {
        return;
    }

    if (!window.confirm('Удалить выбранного студента?')) return;

    actionError.value = '';
    isDeleting.value = true;

    try {
        await deleteStudent(id);
        selectedStudentId.value = null;

        if (currentPage.value > 1 && data.value?.students.length === 1) {
            currentPage.value -= 1;
        } else {
            await refresh();
        }
    } catch (error: unknown) {
        actionError.value = error instanceof Error ? error.message : 'Не удалось удалить студента';
    } finally {
        isDeleting.value = false;
    }
}
</script>

<template>
    <section>
        <h1>Студенты</h1>

        <ErrorMessage v-if="error" :error-message="error.message" />

        <StudentFilters @apply="applyFilters" />

        <ErrorMessage :error-message="actionError" />

        <div class="buttons-container">
            <NuxtLink v-if="userStore.isAdmin" to="/students/new" class="buttons accept-button">
                Добавить студента
            </NuxtLink>

            <button
                type="button"
                class="buttons"
                :disabled="selectedStudentId === null || isLoading || isDeleting"
                @click="openSelectedStudent"
            >
                Досье
            </button>

            <button
                v-if="userStore.isAdmin"
                type="button"
                class="buttons"
                :disabled="selectedStudentId === null || isLoading || isDeleting"
                @click="editSelectedStudent"
            >
                Редактировать
            </button>

            <button
                v-if="userStore.isAdmin"
                type="button"
                class="buttons delete-button"
                :disabled="selectedStudentId === null || isLoading || isDeleting"
                @click="deleteSelectedStudent"
            >
                {{ isDeleting ? 'Удаление…' : 'Удалить' }}
            </button>
        </div>

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
        />
    </section>
</template>
