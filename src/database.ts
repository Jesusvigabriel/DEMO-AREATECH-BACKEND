import {  createConnection } from "typeorm";

export const conectaProduccion = async () => {
    await createConnection({
        "type": "mysql",
        "host": "localhost",
        "username": "APIv3Prod",
        "password": "APIv3Prod1512@!@",
        "database": "godoy",
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
        "host": "datosdemo01.areatech.site",
        "username": "APIv3ProdUniversal",
        "password": "APIv3ProdUniversal1512@!@",
        "database": "godoy",
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
        "host": "datosdemo01.areatech.site",
        "username": "APIv3Dev",
        "password": "APIv3Dev!",
        "database": "hermes_testing",
        "entities": ["dist/entities/**/*.js", "dist/entities/tiendanube/**/*.js"],
        "migrations": ["dist/migrations/**/*.js"],
        "synchronize": false,
        "logging": true,
        "logger": "file"

    })
};
