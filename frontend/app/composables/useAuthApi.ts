import { FetchError } from 'ofetch';
import type { AccessTokenResponse, LoginRequest, RegisterRequest, User } from '~/types/auth';
import { useUserStore } from '~/stores/user';

export function useAuthApi() {
    const { $api } = useNuxtApp();
    const userStore = useUserStore();

    function authFetch<T>(path: string, data?: LoginRequest | RegisterRequest): Promise<T> {
        return $api<T>(`/auth${path}`, {
            method: 'POST',
            body: data,
        });
    }

    async function login(data: LoginRequest): Promise<void> {
        const response = await authFetch<AccessTokenResponse>('/login', data);

        userStore.setAccessToken(response.accessToken);
    }

    async function register(data: RegisterRequest): Promise<void> {
        await authFetch<void>('/register', data);
    }

    async function refresh(): Promise<boolean> {
        try {
            const response = await authFetch<AccessTokenResponse>('/refresh');

            userStore.setAccessToken(response.accessToken);
            return true;
        } catch (error: unknown) {
            if (error instanceof FetchError && error.status === 401) {
                userStore.clearUser();
                return false;
            }

            throw error;
        }
    }

    function getCurrentUser(): Promise<User> {
        return $api<User>('/auth/me');
    }

    async function logout(): Promise<void> {
        await authFetch<void>('/logout');

        userStore.clearUser();
    }

    return {
        login,
        register,
        refresh,
        getCurrentUser,
        logout,
    };
}
