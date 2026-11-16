<script setup lang="ts">
import { ref } from 'vue';
import { useUserStore } from '~/stores/user';
import ErrorMessage from '~/components/ErrorMessage/ErrorMessage.vue';

const userStore = useUserStore();
const { logout } = useAuthApi();
const { $resetSessionRestore } = useNuxtApp();

const isLoggingOut = ref(false);
const errorMessage = ref('');

async function submitLogout(): Promise<void> {
    if (isLoggingOut.value) return;

    errorMessage.value = '';
    isLoggingOut.value = true;

    try {
        await logout();
        $resetSessionRestore();

        await navigateTo('/login', { replace: true });
    } catch (error: unknown) {
        errorMessage.value =
            error instanceof Error ? error.message : 'Не удалось выйти из аккаунта';
    } finally {
        isLoggingOut.value = false;
    }
}
</script>

<template>
    <header class="app-header">
        <NuxtLink to="/students" class="app-title"> Управление студентами </NuxtLink>

        <details v-if="userStore.user" id="user-menu" class="user-menu">
            <summary>
                <span aria-hidden="true">👤</span>
                <span id="menu-username">{{ userStore.user.username }}</span>
            </summary>

            <nav class="user-menu-actions" aria-label="Меню пользователя">
                <NuxtLink to="/profile" class="buttons"> Мой профиль </NuxtLink>
                <button
                    id="logout-button"
                    type="button"
                    class="buttons"
                    :disabled="isLoggingOut"
                    @click="submitLogout"
                >
                    {{ isLoggingOut ? 'Выходим…' : 'Выйти' }}
                </button>
            </nav>
        </details>
    </header>
    <ErrorMessage :error-message="errorMessage" />
</template>

<style scoped src="./AppHeader.css"></style>
