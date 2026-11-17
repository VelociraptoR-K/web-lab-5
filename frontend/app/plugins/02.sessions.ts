import { useUserStore } from '~/stores/user';

export default defineNuxtPlugin(() => {
    const userStore = useUserStore();
    const auth = useAuthApi();
    let sessionPromise: Promise<void> | null = null;

    async function loadSession(): Promise<void> {
        try {
            const refreshed = await auth.refresh();
            if (refreshed) {
                const user = await auth.getCurrentUser();
                userStore.setUser(user);
            }
            userStore.isSessionRestored = true;
        } catch (error: unknown) {
            userStore.clearUser();
            throw error;
        }
    }

    async function restoreSession(): Promise<void> {
        if (userStore.isSessionRestored) return;

        if (sessionPromise === null) {
            sessionPromise = loadSession();
        }

        try {
            await sessionPromise;
        } catch (error: unknown) {
            sessionPromise = null;
            throw error;
        }

        sessionPromise = null;
    }

    function resetSessionRestore(): void {
        userStore.isSessionRestored = false;
    }

    return {
        provide: {
            restoreSession,
            resetSessionRestore,
        },
    };
});
