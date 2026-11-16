import { useUserStore } from '~/stores/user';

export default defineNuxtRouteMiddleware(async (to) => {
    const userStore = useUserStore();
    const { $restoreSession } = useNuxtApp();

    await $restoreSession();

    if (!userStore.isAuthenticated) {
        return navigateTo('/login', { replace: true });
    }

    if (to.meta.adminOnly && !userStore.isAdmin) {
        return navigateTo('/students', { replace: true });
    }
});
