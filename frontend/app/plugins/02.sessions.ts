import { useUserStore } from '~/stores/user';

export default defineNuxtPlugin(() => {
    const userStore = useUserStore();
    const auth = useAuthApi();

    const isRestored = useState<boolean>('session-restored', () => false);
    let sessionPromise: Promise<void> | null = null;

    async function loadSession(): Promise<void> {
        try {
            const refreshed = await auth.refresh();
            if (refreshed) {
                const user = await auth.getCurrentUser();
                userStore.setUser(user);
            }
            isRestored.value = true;
        } catch (error: unknown) {
            userStore.clearUser();
            throw error;
        }
    }

    function restoreSession(): Promise<void> {
        if (isRestored.value) {
            return Promise.resolve();
        }
        if (sessionPromise === null) {
            sessionPromise = loadSession().finally(() => {
                sessionPromise = null;
            });
        }

        return sessionPromise;
    }

    function resetSessionRestore(): void {
        isRestored.value = false;
    }

    return {
        provide: {
            restoreSession,
            resetSessionRestore,
        },
    };
});
