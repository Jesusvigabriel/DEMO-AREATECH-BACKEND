import { createConnection } from "typeorm";

const DB_HOST = process.env.DB_HOST || "";
const DB_USER = process.env.DB_USER || "";
const DB_PASSWORD = process.env.DB_PASSWORD || "";
const DB_NAME = process.env.DB_NAME || "";

export const conectaProduccion = async () => {
    await createConnection({
        "type": "mysql",
        "host": DB_HOST,
        "username": DB_USER,
        "password": DB_PASSWORD,
        "database": DB_NAME,
        "entities": ["dist/entities/**/*.js", "dist/entities/tiendanube/**/*.js"],
        "migrations": ["dist/migrations/**/*.js"],
        "synchronize": false,
        "logging": true,
        "logger": "file"
    })
}


export const conectaProduccionUniversal = async () => {
    await createConnection({
        "type": "mysql",
        "host": DB_HOST,
        "username": DB_USER,
        "password": DB_PASSWORD,
        "database": DB_NAME,
        "entities": ["dist/entities/**/*.js", "dist/entities/tiendanube/**/*.js"],
        "migrations": ["dist/migrations/**/*.js"],
        "synchronize": false,
        "logging": true,
        "logger": "file"
    })
}


export const conectaDesarrollo = async () => {
    return await createConnection({
        "type": "mysql",
        "host": DB_HOST,
        "username": DB_USER,
        "password": DB_PASSWORD,
        "database": DB_NAME,
        "entities": ["dist/entities/**/*.js", "dist/entities/tiendanube/**/*.js"],
        "migrations": ["dist/migrations/**/*.js"],
        "synchronize": false,
        "logging": true,
        "logger": "file"

    })
};
