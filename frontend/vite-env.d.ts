/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_SQUARE_APP_ID?: string;
  readonly VITE_SQUARE_LOCATION_ID?: string;
  readonly VITE_SQUARE_ENV?: string;
  readonly VITE_WHATSAPP_NUMBER?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
