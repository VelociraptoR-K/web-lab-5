import { useUserStore } from '~/stores/user';

export default defineNuxtRouteMiddleware(async () => {
    const userStore = useUserStore();
    const { $restoreSession } = useNuxtApp();

    await $restoreSession();

    if (userStore.isAuthenticated) {
        return navigateTo('/students', { replace: true });
    }
});
