import { computed, onUnmounted, onMounted, ref, watch } from 'vue';
import { useUserStore } from '~/stores/user';
import type { StudentFiltersParams } from '~/types/filterParams';
import { EMPTY, catchError, defer, exhaustMap } from 'rxjs';
import type { Subscription } from 'rxjs';
import { createStudentRefreshStream } from '~/streams/studentRefresh';
import type { StudentsPage } from '~/types/student';

export function useStudentsList() {
    const config = useRuntimeConfig();
    const userStore = useUserStore();
    const { getStudents, deleteStudent, clearStudentCache } = useStudentApi();

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
    const studentsQuery = computed(() => ({
        ...activeFilters.value,
        page: currentPage.value,
        limit: pageSize,
    }));
    const studentsKey = computed(
        () => `students-list:${userStore.user?.id}:${JSON.stringify(studentsQuery.value)}`,
    );

    const isStudentsOutdated = ref(false);

    const totalPages = computed(() => data.value?.totalPages ?? 0);
    const rowOffset = computed(() => ((data.value?.page ?? 1) - 1) * pageSize);

    const { data, status, error, refresh } = useAsyncData<StudentsPage>(
        studentsKey,
        () => getStudents(studentsQuery.value),
        {
            server: false,
            lazy: true,

            getCachedData(key, nuxtApp, context) {
                if (context.cause !== 'initial') {
                    return undefined;
                }

                return nuxtApp.payload.data[key] as StudentsPage | undefined;
            },
        },
    );

    watch(data, () => {
        isStudentsOutdated.value = false;
    });

    let refreshSubscription: Subscription | undefined;

    onMounted(() => {
        refreshSubscription = createStudentRefreshStream(
            Number(config.public.studentsRefreshMs),
            () =>
                userStore.isAuthenticated &&
                Boolean(data.value) &&
                !isLoading.value &&
                !isDeleting.value,
        )
            .pipe(
                exhaustMap(() => {
                    const query = studentsQuery.value;
                    const previousData = data.value;

                    return defer(async () => {
                        const result = await getStudents(query);

                        return { query, previousData, result };
                    }).pipe(
                        catchError((error: unknown) => {
                            console.warn('Не удалось проверить актуальность студентов', error);
                            return EMPTY;
                        }),
                    );
                }),
            )
            .subscribe(({ query, previousData, result }) => {
                if (
                    query !== studentsQuery.value ||
                    previousData !== data.value ||
                    isLoading.value ||
                    isDeleting.value ||
                    !previousData
                ) {
                    return;
                }

                isStudentsOutdated.value =
                    result.studentsCount !== previousData.studentsCount ||
                    result.totalPages !== previousData.totalPages ||
                    JSON.stringify(result.students) !== JSON.stringify(previousData.students);

                if (isStudentsOutdated.value) {
                    clearStudentCache();
                }
            });
    });

    let loadingTimer: ReturnType<typeof setTimeout> | undefined;

    watch(
        isLoading,
        (loading) => {
            clearTimeout(loadingTimer);
            showLoading.value = false;

            if (loading && import.meta.client) {
                loadingTimer = setTimeout(() => {
                    showLoading.value = true;
                }, 500);
            }
        },
        { immediate: true },
    );

    onUnmounted(() => {
        clearTimeout(loadingTimer);
        refreshSubscription?.unsubscribe();
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
        if (isDeleting.value) return;
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

    async function openStudent(id: number): Promise<void> {
        if (isLoading.value || isDeleting.value) return;
        await navigateTo(`/students/${id}`);
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
            actionError.value =
                error instanceof Error ? error.message : 'Не удалось удалить студента';
        } finally {
            isDeleting.value = false;
        }
    }

    return {
        userStore,
        data,
        error,
        isLoading,
        showLoading,
        isDeleting,
        isStudentsOutdated,
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
    };
}
