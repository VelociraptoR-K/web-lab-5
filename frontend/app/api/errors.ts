import type { FetchError } from 'ofetch';

export function formatApiError(error: FetchError): string {
    const data = error.data;
    const message =
        typeof data?.message === 'string' ? data.message : 'Не удалось выполнить запрос';

    switch (error.status) {
        case 422: {
            const details: string[] = [];

            if (Array.isArray(data?.details)) {
                for (const detail of data.details) {
                    if (
                        typeof detail?.fieldName === 'string' &&
                        typeof detail?.message === 'string'
                    ) {
                        details.push(`${detail.fieldName}: ${detail.message}`);
                    }
                }
            }

            return [message, ...details].join('\n');
        }
        case 401:
            return `Ошибка авторизации (401):\n${message}`;
        case 403:
            return `Ошибка доступа (403):\n${message}`;
        case 409:
            return `Ошибка конфликта данных (409):\n${message}`;
        case 404:
            return `Ошибка не найдено (404):\n${message}`;
        case 400:
            return `Ошибка при запросе (400):\n${message}`;
        case 500:
            return `Ошибка на сервере (500):\n${message}`;
        default:
            return `Ошибка (${error.status}):\n${message}`;
    }
}
