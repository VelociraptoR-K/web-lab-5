import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { User } from '@/types/auth';

export const useUserStore = defineStore('user', () => {
    const nuxtApp = useNuxtApp();
    const user = ref<User | null>(null);
    const accessToken = ref<string | null>(null);

    const isAuthenticated = computed(() => user.value !== null);
    const isAdmin = computed(() => user.value?.role === 'ADMIN');
    const isSessionRestored = ref(false);

    function setAccessToken(value: string | null): void {
        accessToken.value = value;
    }

    function setUser(value: User): void {
        user.value = value;
    }

    function clearUser(): void {
        nuxtApp.runWithContext(() => {
            clearNuxtData((key) => key.startsWith('students-list:'));
        });

        user.value = null;
        accessToken.value = null;
    }

    return {
        user,
        accessToken,
        isAuthenticated,
        isAdmin,
        isSessionRestored,
        setUser,
        setAccessToken,
        clearUser,
    };
});
