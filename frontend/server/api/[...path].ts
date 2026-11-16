import { defineEventHandler, getRequestURL, proxyRequest } from "h3";

export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event);
  const url = getRequestURL(event);

  const path = url.pathname.slice("/api".length);
  const target = `${config.javaApiBaseUrl}${path}${url.search}`;

  return proxyRequest(event, target);
});
