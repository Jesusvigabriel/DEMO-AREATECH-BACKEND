const config = require("../config")
const fs = require("fs")
const https = require("https")
const { swaggerDocs } = require("./api/docs/swagger.js")

import "reflect-metadata"

import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
// import { login } from './middlewares/auth'

import { conectaProduccionUniversal, conectaDesarrollo } from "./database"


import empresasRoutes from './routes/empresas.routes'
import guiasRoutes from './routes/guias.routes'
import guiasRendicionesRoutes from './routes/guiasRendiciones.routes'
import posicionesRoutes from './routes/posiciones.routes'
import productosRoutes from './routes/productos.routes'
import posicionesProductosRoutes from './routes/posicionesProductos.routes'
import ordenesRoutes from './routes/ordenes.routes'
import chofereRoutes from './routes/choferes.routes'
import almacenajeRoutes from './routes/almacenaje.routes';
import localidadesRoutes from './routes/localidades.routes';
import facturacionRoutes from './routes/facturas.routes';
import MovimientosStock  from './routes/movimientosStock.routes';
import visionGoogle from './routes/visionGoogle.routes';
import usuarios from './routes/usuarios.routes';
import destinos from './routes/destinos.routes';
import roles from './routes/roles.routes';

import tiendaNubeRoutes from "./api/tiendanube/routes/tiendanube.routes";
import yiqiRoutes from "./api/yiqi/routes/yiqi.routes";
import wooCommerceRoutes from "./api/wooCommerce/routes/wooCommerce.routes";


const app = express()
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Middlewares
app.use(cors())
app.use(morgan("dev"))
//app.use(express.json())
// app.use(login)


// Rutas 
app.use(empresasRoutes)
app.use(guiasRoutes)
app.use(guiasRendicionesRoutes)
app.use(posicionesRoutes)
app.use(productosRoutes)
app.use(posicionesProductosRoutes)
app.use(ordenesRoutes)
app.use(chofereRoutes)
app.use(almacenajeRoutes)
app.use(localidadesRoutes)
app.use(facturacionRoutes)
app.use(MovimientosStock)
app.use(visionGoogle)
app.use(usuarios)
app.use(destinos)
app.use(roles)


// Rutas de Integraciones con APIS
app.use(wooCommerceRoutes)
app.use(tiendaNubeRoutes)
app.use(yiqiRoutes)




if (config.env==="D") {
    app.listen(config.puerto, async () => {        
        if (config.database==="P") {
            await conectaProduccionUniversal()
        } else {
            await conectaDesarrollo()
        }
        console.log("Sirviendo en el puerto:",config.puerto, " - Base de datos:", config.database==="P" ? 'Productiva' : 'Desarrollo')
        swaggerDocs(app, config.puerto)
    })
} else {
    const httpsServerOptions={
        cert: fs.readFileSync("./certificados/_.area54sa.com.ar.crt"),
        ca: fs.readFileSync("./certificados/_.SectigoRSADomainValidationSecureServerCA.crt"),
        key: fs.readFileSync("./certificados/_.area54sa.com.ar.key")
    }
    swaggerDocs(app, config.puerto)
    https.createServer(httpsServerOptions, app).listen(config.puerto, async () => {
        await conectaProduccionUniversal()
        console.log("HTTPS Sirviendo en el puerto "+config.puerto)
    })

}


