import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";

const src = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": src,
      "@components": `${src}/components`,
      "@UI": `${src}/components/UI`,
      "@hooks": `${src}/hooks`,
      "@utils": `${src}/helpers/utils`,
      "@constants": `${src}/helpers/constants`,
      "@app-types": `${src}/helpers/types`,
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@use "@/styles/base" as *;',
      },
    },
  },
});
