/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ZKWALLET_ADAPTER_BASE_URL?: string;
  readonly VITE_ZKWALLET_ADAPTER_AUTORUN?: string;
  readonly VITE_ZKWALLET_ADAPTER_PROXY_TARGET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
