import {
    defineEventHandler,
    getProxyRequestHeaders,
    getRequestURL,
    proxyRequest,
    sendProxy,
} from 'h3';
import { text } from 'node:stream/consumers';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event);
    const url = getRequestURL(event);

    const path = url.pathname.slice('/api'.length);
    const target = `${config.javaApiBaseUrl}${path}${url.search}`;

    if (event.node.req.method === 'QUERY') {
        const body = await text(event.node.req);
        return sendProxy(event, target, {
            headers: getProxyRequestHeaders(event),
            fetchOptions: {
                method: 'QUERY',
                body,
            },
        });
    }

    return proxyRequest(event, target);
});
