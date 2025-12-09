/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MASTER_AI_KEY: string;
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
