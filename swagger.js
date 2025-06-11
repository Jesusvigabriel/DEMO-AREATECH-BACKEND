"use strict";
var swaggerJSDoc = require("swagger-jsdoc");
var swaggerUI = require("swagger-ui-express");
// Basic Meta Informations about our API
var options = {
    definition: {
        openapi: "3.0.0",
        info: { title: "Area54sa API", version: "1.0.0" },
    },
    //apis: ["https://apiv3.area54sa.com.ar:8125/api/docs/documentacionApi.ts", "https://apiv3.area54sa.com.ar:8125/database.ts"]

    apis: ["./src/api/docs/documentacionApi.ts", "./src/database.ts"],
    //servers: ["https://apiv3.area54sa.com.ar:8125/apiv3"]
};
// Docs in JSON format
var swaggerSpec = swaggerJSDoc(options);
// Function to setup our docs
var swaggerDocs = function (app, port) {
    // Route-Handler to visit our docs
    app.use("/api/docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));
    // Make our docs in JSON format available
    app.get("/api/docs.json", function (req, res) {
        res.setHeader("Content-Type", "application/json");
        res.send(swaggerSpec);
    });
    console.log("Version 1 Docs are available on http://localhost:" + port + "/api/docs");
};
module.exports = { swaggerDocs: swaggerDocs };
