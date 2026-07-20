/// <reference types="vite/client" />

declare module "*.png" {
  const src: string;
  export default src;
}

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  readonly VITE_SUPABASE_PUBLIC_BUCKET?: string;
  readonly VITE_ADMIN_AUTH_DOMAIN?: string;
  readonly VITE_ADMIN_USERNAME?: string;
  readonly VITE_ADMIN_AUTH_EMAIL?: string;
  readonly VITE_ENABLE_SUPABASE?: string;
  readonly VITE_ENABLE_REALTIME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
