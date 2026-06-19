declare namespace NodeJS {
  export interface ProcessEnv {
    readonly APP_VARIANT?: string;
    readonly EAS_BUILD?: true;
  }
}
