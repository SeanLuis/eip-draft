/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Declare environment variables
interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_WEB3_PROVIDER: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
