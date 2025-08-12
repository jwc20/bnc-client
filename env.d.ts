declare global {
    namespace NodeJS {
        interface ProcessEnv {
            VITE_API_URL: string;
            VITE_API_KEY: string;
            VITE_WS_URL: string;
        }
    }
}

export {};
