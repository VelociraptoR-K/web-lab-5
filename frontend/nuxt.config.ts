export default defineNuxtConfig({
  modules: ["@pinia/nuxt"],
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["~/assets/styles/main.css"],
  runtimeConfig: {
    public: {
      apiBaseUrl: "http://localhost:8080/api",
      studentsRefreshMs: 30000,
      studentsPageSize: 10,
    },
  },
});
