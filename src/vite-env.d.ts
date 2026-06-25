/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ZKWALLET_ADAPTER_BASE_URL?: string;
  readonly VITE_ZKWALLET_ADAPTER_AUTORUN?: string;
  readonly VITE_ZKWALLET_ADAPTER_PROXY_TARGET?: string;
  readonly VITE_ZKPOL_MGR_BASE_URL?: string;
  readonly VITE_ZKPOL_GEN_BASE_URL?: string;
  readonly VITE_ZKPOL_MGR_PROXY_TARGET?: string;
  readonly VITE_ZKPOL_GEN_PROXY_TARGET?: string;
  readonly VITE_ZKPOL_DEMO_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
