<script setup lang="ts">
import { ref } from 'vue';
import ErrorMessage from '~/components/ErrorMessage/ErrorMessage.vue';
import { useUserStore } from '~/stores/user';

definePageMeta({
    middleware: ['guest'],
});

const userStore = useUserStore();
const { login, getCurrentUser } = useAuthApi();

const username = ref('');
const password = ref('');
const errorMessage = ref('');
const isSubmitting = ref(false);

async function submitLogin(): Promise<void> {
    if (isSubmitting.value) return;

    errorMessage.value = '';
    isSubmitting.value = true;

    try {
        await login({
            username: username.value,
            password: password.value,
        });

        const user = await getCurrentUser();
        userStore.setUser(user);

        await navigateTo('/students', { replace: true });
    } catch (error: unknown) {
        userStore.clearUser();

        errorMessage.value = error instanceof Error ? error.message : 'Не удалось войти в аккаунт';
    } finally {
        isSubmitting.value = false;
    }
}
</script>

<template>
    <section>
        <h1>Вход в аккаунт</h1>
        <ErrorMessage :error-message="errorMessage" />
        <form id="login-form" class="student-card" @submit.prevent="submitLogin">
            <div class="form-row">
                <label for="username"> Имя пользователя <span class="required">*</span> </label>
                <input
                    type="text"
                    id="username"
                    name="username"
                    autocomplete="username"
                    v-model.trim="username"
                    placeholder="Введите имя пользователя"
                    minlength="3"
                    maxlength="20"
                    pattern="[a-zA-Z0-9]{3,20}"
                    title="От 3 до 20 символов: латинские буквы и цифры"
                    autocapitalize="none"
                    spellcheck="false"
                    :disabled="isSubmitting"
                    required
                />
            </div>

            <div class="form-row">
                <label for="password"> Пароль <span class="required">*</span> </label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    autocomplete="current-password"
                    v-model="password"
                    placeholder="Введите пароль"
                    :disabled="isSubmitting"
                    required
                />
            </div>

            <div class="buttons-container">
                <button type="submit" class="buttons accept-button" :disabled="isSubmitting">
                    Войти
                </button>
                <NuxtLink to="/register" class="buttons"> Зарегистрироваться </NuxtLink>
            </div>
        </form>
    </section>
</template>
