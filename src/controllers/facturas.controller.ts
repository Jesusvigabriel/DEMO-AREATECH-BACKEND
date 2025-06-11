import {Request, Response} from "express"
import { empresa_getById_DALC } from "../DALC/empresas.dalc"
import { factura_generarNueva_DALC } from "../DALC/facturas.dalc"
import { guia_getById_DALC } from "../DALC/guias_DALC"
import { Factura } from "../entities/Factura"

export const factura_generarNueva_controller = async (req: Request, res: Response): Promise<Response> => {

    //Me fijo si mandó todos los parámetros requeridos
    const lsiValidators=require("lsi-util-node/validators")
    const missingParameters=lsiValidators.requestParamsFilled(req.body, ["idEmpresa", "importeAFacturar", "hashExcel", "tipoServicio", "periodoFacturado", "guias"])
    if (missingParameters.length>0) {
        return res.status(400).json(require("lsi-util-node/API").getFormatedResponse("", {missingParameters}))
    }

    //Me fijo si la empresa existe
    const empresa=await empresa_getById_DALC(parseInt(req.body.idEmpresa))
    if (empresa==null) {
        return res.status(400).json(require("lsi-util-node/API").getFormatedResponse("", "Empresa inexistente"))
    }

    let guiasConError=[]
    let todasLasGuiasOK=true
    if (req.body.tipoServicio==="L") {
        //Me fijo si todas las guias que me pide que marque como facturadas existen
        for (const unaGuia of req.body.guias) {
            const guiaAMarcar=await guia_getById_DALC(unaGuia)
            if (!guiaAMarcar) {
                todasLasGuiasOK=false
                guiasConError.push({guia: unaGuia, detalle: "No existe"})
            } else {
                if (guiaAMarcar.IdFactura>0) {
                    todasLasGuiasOK=false
                    guiasConError.push({guia: unaGuia, detalle: "Previamente facturada"})
                }
            }
        }
    }

    if (!todasLasGuiasOK) {
        return res.status(400).json(require("lsi-util-node/API").getFormatedResponse("", {guiasConError}))
    }


    const nuevaFactura=new Factura()
    nuevaFactura.IdEmpresa=Number(req.body.idEmpresa)
    nuevaFactura.ImporteAFacturar=Number(req.body.importeAFacturar)
    nuevaFactura.HashExcel=req.body.hashExcel
    nuevaFactura.PeriodoFacturado=req.body.periodoFacturado
    nuevaFactura.TipoServicio=req.body.tipoServicio
    nuevaFactura.IdGuiasAFacturar=""

    for (const unaGuiaAFacturar of req.body.guias) {
        if (nuevaFactura.IdGuiasAFacturar!=="") {
            nuevaFactura.IdGuiasAFacturar += "|"
        }
        nuevaFactura.IdGuiasAFacturar += unaGuiaAFacturar
    }


    const result=await factura_generarNueva_DALC(nuevaFactura)

    if (result.status=="OK") {
        return res.json(require("lsi-util-node/API").getFormatedResponse(result.data))
    } else {
        return res.status(400).json(require("lsi-util-node/API").getFormatedResponse("", result.data))
    }    
}

