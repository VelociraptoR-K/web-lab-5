import { useUserStore } from '~/stores/user';
import { formatApiError } from '~/api/errors';
import { createFetchError, FetchError } from 'ofetch';
import type { NitroFetchOptions } from 'nitropack';
import type { AccessTokenResponse } from '~/types/auth';

export default defineNuxtPlugin((nuxtApp) => {
    const config = useRuntimeConfig();
    const userStore = useUserStore();

    const headers = useRequestHeaders(['cookie']);
    const responseCookies = import.meta.server ? useResponseHeader('set-cookie') : undefined;

    const client = $fetch.create({
        baseURL: config.public.apiBaseUrl,
        headers,
        retry: 0,

        onRequest({ options }) {
            if (userStore.accessToken) {
                options.headers.set('Authorization', `Bearer ${userStore.accessToken}`);
            }
        },

        onResponse({ response }) {
            if (!responseCookies) return;
            const cookies = response.headers.getSetCookie();
            if (cookies.length === 0) return;
            const current = responseCookies.value;

            let existing: string[];
            if (current === undefined) {
                existing = [];
            } else if (Array.isArray(current)) {
                existing = current;
            } else {
                existing = [String(current)];
            }
            responseCookies.value = [...existing, ...cookies];
        },

        onResponseError(context) {
            const error = createFetchError(context);
            error.message = formatApiError(error);
            throw error;
        },
    });

    let refreshPromise: Promise<void> | null = null;

    function refreshOnce(): Promise<void> {
        if (refreshPromise === null) {
            refreshPromise = client<AccessTokenResponse>('/auth/refresh', {
                method: 'POST',
            })
                .then((data) => {
                    userStore.setAccessToken(data.accessToken);
                })
                .finally(() => {
                    refreshPromise = null;
                });
        }

        return refreshPromise;
    }

    async function api<T>(path: string, options: NitroFetchOptions<string> = {}): Promise<T> {
        const publicRequest = [
            '/auth/login',
            '/auth/register',
            '/auth/refresh',
            '/auth/logout',
        ].includes(path);

        const previousToken = userStore.accessToken;

        try {
            return await client<T>(path, options);
        } catch (error: unknown) {
            if (!(error instanceof FetchError) || error.status !== 401 || publicRequest) {
                throw error;
            }

            const tokenAlreadyUpdated =
                userStore.accessToken !== null && userStore.accessToken !== previousToken;

            if (!tokenAlreadyUpdated) {
                try {
                    await refreshOnce();
                } catch (refreshError: unknown) {
                    if (refreshError instanceof FetchError && refreshError.status === 401) {
                        userStore.clearUser();

                        await nuxtApp.runWithContext(() => navigateTo('/login', { replace: true }));
                    }

                    throw refreshError;
                }
            }

            return client<T>(path, options);
        }
    }

    return {
        provide: {
            api,
        },
    };
});
