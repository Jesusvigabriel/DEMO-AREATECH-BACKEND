import { Request, Response, NextFunction } from "express";
import auth from "basic-auth";
import { conectaDesarrollo, conectaProduccion, conectaProduccionUniversal } from "../database";
import { getConnectionManager, getConnection } from "typeorm";

// Funcion que cierra las conexiones abiertas
const closeDatabase = async (numeros: number) => {
  if(numeros !== 0){
    const data = getConnection();
    if (data.isConnected === true) {
      await data.close()
    }
  }
  return
}

// Funcion que Revisa el estado de las conexiones actuales .... Recibe por parametro el nombre del usuario de la Base de Datos
const conectaBase = async (base: string) => {
  const stateDatabase = await getConnectionManager();
  if(stateDatabase.connections.length!= 0){
    const dataUser : any = stateDatabase.connections[0].driver.options
    if(dataUser.username === base) { 
      return true;
    } else {
      await closeDatabase(stateDatabase.connections.length)
      return false
    }
  } else {
    return false
  }
}

export const login = async ( req: Request, res: Response, next: NextFunction) => {
  const user = await auth(req);
  if (user) {
    const {name, pass} = user
    const desarrollo = ["A54APIDev", "A54API4470Dev!"];
    const produccion = ["A54APIProd", "A54API4470Prod!"];
    const produccionUniversal = ["A54APIProdUniversal", "A54API4470ProdUniversal!"];

    // console.log("Name: ",name,"Pass", pass);

    if (name === desarrollo[0] && pass === desarrollo[1]){
        const base = await conectaBase('APIv3Dev')
        if(base === false){
          try {
            await conectaDesarrollo()
          } catch (error) {
            return res.status(401).json(require("lsi-util-node/API").getFormatedResponse("",error));
          }
        } 
        console.log('BD Dev...')
        return next()
    }

    if(name === produccion[0] && pass === produccion[1]){
      const base = await conectaBase('APIv3Prod')
      if(base === false){
        try {
          await conectaProduccion();
        } catch (error: any) {
          if (error.errno=1045) {            
            return res.status(401).json(require("lsi-util-node/API").getFormatedResponse("", "Acceso a base productiva solo permitido en modo local"));
          } else {
            return res.status(401).json(require("lsi-util-node/API").getFormatedResponse("",error.code));
          }
        }
      } 
      console.log('BD Prod ...')
      return next()
    }

    if (name === produccionUniversal[0] && pass === produccionUniversal[1]){
      const base = await conectaBase('APIv3ProdUniversal')
      if(base === false){
        try {
          await conectaProduccionUniversal()
        } catch (error) {
          return res.status(401).json(require("lsi-util-node/API").getFormatedResponse("",error));
        }
      } 
      console.log('BD Prod Universal ...')
      return next()
    }
  }

  return res.status(401).json(require("lsi-util-node/API").getFormatedResponse("","Credenciales inválidas"));
};




