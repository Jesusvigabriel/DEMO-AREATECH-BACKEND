const swaggerJSDoc = require("swagger-jsdoc")
const swaggerUI = require("swagger-ui-express")

// Basic Meta Informations about our API
const options = {
    definition: {
      openapi: "3.0.0",
      info: { title: "Area54sa API", version: "1.0.0" },
    },
    apis: ["./src/api/docs/documentacionApi.ts", "./src/database.ts"]
  
  }

// Docs in JSON format
const swaggerSpec = swaggerJSDoc(options);

// Function to setup our docs
const swaggerDocs = (app, port) => {
  // Route-Handler to visit our docs
  app.use("/api/docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));
  // Make our docs in JSON format available
  app.get("/api/docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
  console.log(
    `Version 1 Docs are available on https://localhost:${port}/api/docs`
  );
};

module.exports = { swaggerDocs };

