declare namespace NodeJS {
    export interface ProcessEnv {
        PORT: string;
        DB_HOST: string;
        DB_USER: string;
        DB_PWD: string;
        DB_NAME: string;
        CLIENT_ID: string;
        CLIENT_SECRET: string;
        CALLBACK_URL: string;
        JWT_ACCESS_SECRET: string;
        JWT_REFRESH_SECRET: string;
    }
}