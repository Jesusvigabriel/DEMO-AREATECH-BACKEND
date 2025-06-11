import axios from "axios";

import { tiendanube_ventas } from "../../../entities/tiendanube/Venta";

//Helpers Tiendas
import { helpersProductosTienda } from "../helpers/combos";

// DALC de Productos
import { producto_getByBarcodeAndEmpresa_DALC } from "../../../DALC/productos.dalc";
// DALC de Ordenes
import { ordenes_addOrden_DALC, ordenes_getByIdIntAndEmpresa_DALC } from "../../../DALC/ordenes.dalc";
// DALC del Detalle de Ordenes
import { addDetalleOrden_DALC, editCantidadDetalleOrden_DALC, ordenDetalle_getByIdOrden_DALC } from "../../../DALC/ordenesDetalle.dalc";
// DALC de Destinos == Eventuales
import { busca_agregaDestino_DALC } from "../../../DALC/destinos.dalc";

// Entidades 
import { OrdenDetalle } from "../../../entities/OrdenDetalle";
import { Orden } from "../../../entities/Orden";

// DALC: Obtiene las ventas desde Tienda Nube
export const get_VentasFromTN_DALC = async (idTienda: number, tokenTienda: string) => {
  return await axios({
    method: "GET",
    url: `https://api.tiendanube.com/v1/${idTienda}/orders`,
    headers: {
      authentication: `bearer${tokenTienda}`,
    },
  });
};

// DALC: Sincroniza las ventas desde Tienda Nube
export const sync_VentasFromTN_DALC = async (ventas:[], idTienda:number) => {    

    const ventasTNCrudas = await parseaVentas_DALC(ventas, "-1");
    const ventasTN = ventasTNCrudas.filter(e => e.completedAt > '2022-04-01');

    const response= []

    for (let index = 0; index < ventasTN.length; index++) {

        const currentVenta = ventasTN[index]
        const check = await ordenes_getByIdIntAndEmpresa_DALC(idTienda, currentVenta.id)

        if(!check){
            const checkProducts = await checkBarcodeAndStock(currentVenta.products, idTienda)

            if(checkProducts.status){
                const orden = await generaOrden_DALC(currentVenta, idTienda);

                if(orden){
                    const detalleOrden = await generaDetalleOrden_DALC(currentVenta, idTienda, orden.Id);

                    if(detalleOrden){
                        if(idTienda === 164){
                            const detalle = await agregaBocaditos_DALC(detalleOrden, orden.Id )
                            if(detalle){
                                const result = {
                                    status: 'Orden Agregada',
                                    orden,
                                    detalle_Orden: detalle
                                }
                                response.push(result)
                            }else{
                                const result = {
                                    status: 'Orden Agregada',
                                    orden,
                                    detalle_Orden: detalleOrden
                                }
                                response.push(result)
                            }
                        }else{
                            const result = {
                                status: 'Orden Agregada',
                                orden,
                                detalle_Orden: detalleOrden
                            }
                            response.push(result)
                        }
                    }

                }
                

            }else{
                const result = {
                    status: 'Error al agregar',
                    IdOrdenTN: currentVenta.id ,
                    dataError: checkProducts.msg,

                }
                response.push(result)
            }
           
        }
    }

    if(response.length > 0){
        return response
    }else{
        return "Todas las órdenes están actualizadas."
    }


}

// DALC: Genera Orden --- 
export const generaOrden_DALC = async (ventaParseada:any, idEmpresaEnArea:number):Promise<Orden | null> => {
    const newOrden = new Orden();
    // Se asignan los datos de la nueva orden
    newOrden.IdEmpresa = idEmpresaEnArea;
    newOrden.Tipo = 1;
    newOrden.Numero = ventaParseada.id;
    newOrden.IdIntegracion = ventaParseada.id;
    newOrden.Eventual = await busca_agregaDestino_DALC(ventaParseada, idEmpresaEnArea)
    newOrden.ValorDeclarado = ventaParseada.total;
    newOrden.Estado = 1;
    newOrden.Observaciones = `Venta Id: ${ventaParseada.id} a Cliente: ${ventaParseada.customer.name} `;
    newOrden.Fecha = ventaParseada.completedAt;
    const orden = await ordenes_addOrden_DALC(newOrden);
    return orden

}

// DALC: Genera el Detalle de una Orden
export const generaDetalleOrden_DALC = async (ventaParseada:any, idEmpresaEnArea:number, orden:number) => {
    const result = []
    for (let index = 0; index < ventaParseada.products.length; index++) { 
        if(ventaParseada.products[index].barcode){

            const producto:any = await producto_getByBarcodeAndEmpresa_DALC(ventaParseada.products[index].barcode, idEmpresaEnArea);
            const detalle = await addDetalleOrden(producto, orden, ventaParseada.products[index].quantity)
            result.push(detalle);

        }else {

            const combo = await helpersProductosTienda(ventaParseada.products[index],idEmpresaEnArea)
            if(combo) {
                for (let index = 0; index < combo.length; index++) {
                    const producto:any = await producto_getByBarcodeAndEmpresa_DALC(combo[index].barcode, idEmpresaEnArea);
                    const detalle = await addDetalleOrden(producto, orden, combo[index].quantity);
                    result.push(detalle)
                }
            }
        }
    }

    return result
}

// DALC: Agrega Bocaditos --- SELECTA PERROS
export const agregaBocaditos_DALC = async (detalleOrden:any[], orden:number) => {
    let bocaditos = 0;
    for (let index = 0; index < detalleOrden.length; index++) {
        const element = detalleOrden[index];
        // SP7 = 56081 -- SP14 = 56080
        if(element.IdProducto == 59513 || element.IdProducto == 59514){
            bocaditos += element.Unidades
        }
    }

    if(bocaditos > 0){
        let existeBocaditos = 0
        for (let index = 0; index < detalleOrden.length; index++) {
            const element = detalleOrden[index];
            // if(element.IdProducto === 56434){
            if(element.IdProducto === 60930){
                existeBocaditos = element.Unidades
                const cantidadBocaditos = element.Unidades + bocaditos
                const detalle = await editCantidadDetalleOrden_DALC(element.Id, cantidadBocaditos)
                element.Unidades = cantidadBocaditos

            }
        }
        
        if(existeBocaditos === 0){
            // Se busca el detalle de los bocaditos en Area
            // const producto:any = await producto_getByBarcodeAndEmpresa_DALC("754697485441", 164);
            const producto:any = await producto_getByBarcodeAndEmpresa_DALC("SB100 NUEVO", 164);
            // Se agrega el detalle de la Orden a la base de area
            const detalle = await addDetalleOrden(producto, orden, bocaditos)
            // Se agrego el detalle al Array de detalleOrden

        }

        const result = await ordenDetalle_getByIdOrden_DALC(orden)
        return result

    }

}

// DALC: Parsea las Ventas de tienda Nube
export const parseaVentas_DALC = async (list: any, lastFecha: string) => {
  const result = [];
  for (let index = 0; index < list.length; index++) {
    const element = list[index];

    if (element.completed_at.date >= lastFecha) {
      const productos: any[] = [];
      const ventas: tiendanube_ventas = {
        id: element.id,
        paymentStatus: element.payment_status,
        status: element.status,
        total: element.total,
        completedAt: element.completed_at.date,
        products: productos,
        shippingAddress: {
          name: element.shipping_address.name,
          address: element.shipping_address.address,
          number: element.shipping_address.number,
          floor: element.shipping_address.floor,
          locality: element.shipping_address.locality,
          city: element.shipping_address.city,
          province: element.shipping_address.province,
          zipCode: element.shipping_address.zipcode,
          country: element.shipping_address.country,
          phone: element.shipping_address.phone,
          customs: element.shipping.customs,
        },
        customer: {
          id: element.customer.id,
          name: element.customer.name,
          email: element.customer.email,
          phone: element.customer.phone,
        },
        clientDetails: {
          browserIP: element.client_details.browser_ip,
          userAgent: element.client_details.user_agent,
        },
      };

      for (let i = 0; i < element.products.length; i++) {
        const temp = element.products[i];
        const producto = {
          id: temp.product_id,
          sku: temp.sku,
          barcode: temp.barcode,
          name: temp.name,
          quantity: temp.quantity,
          weight: temp.weight,
          height: temp.height,
          width: temp.width,
          depth: temp.depth,
          price: temp.price,
        };
        productos.push(producto);
      }
      result.push(ventas);
    }
  }

  return result;
};

// DALC: Agrega el Detalle de una Orden
const addDetalleOrden = async (producto:any ,IdOrden: number, quantity:number) => {
    // Se instancia la nueva orden a agregar
    const newDetalleOrden = new OrdenDetalle() 
    // Se asignan los datos a la nueva orden a agregar
    newDetalleOrden.IdOrden = IdOrden;
    newDetalleOrden.IdProducto = producto.Id;
    newDetalleOrden.Unidades = quantity;
    newDetalleOrden.Precio = producto.price || 0
    // Se agrega la nueva orden
    const result = await addDetalleOrden_DALC(newDetalleOrden)
    return result
} 

// DALC: Chequea que el Producto Exista y Que posea Stock
const checkBarcodeAndStock = async  (productos:any[], idEmpresaEnArea:number) => {

    const productosUnificados = unificaProductos(productos)

    const result:any = {
        status: true,
        msg: []
    }


    if(idEmpresaEnArea === 164){

        let bocaditos = 0

        for (let index = 0; index < productosUnificados.length; index++){

            const element = productosUnificados[index];

            if(element.barcode == null){
                const combo = await helpersProductosTienda(element, idEmpresaEnArea)

                if(combo){

                    for (let index = 0; index < combo.length; index++) {
                        const element = combo[index];

                        let checkProduct = await producto_getByBarcodeAndEmpresa_DALC (element.barcode, idEmpresaEnArea)

                        if(checkProduct){
                            if(checkProduct.StockDisponible < element.quantity){
                                result.status = false;
                                result.msg.push(`El producto ${checkProduct.Nombre} - Barcode ${checkProduct.Barcode} No posee el stock suficiente`)
                            }
                        }

                        
                    }

                }else{
                    result.status = false;
                    result.msg.push(`El producto ${element.name} no esta integrado a la base de Area`)
                }
            }

            if(element.barcode != null){
                let checkProduct = await producto_getByBarcodeAndEmpresa_DALC (element.barcode, idEmpresaEnArea)

                if(checkProduct){
                    if(checkProduct.StockDisponible < element.quantity){
                        result.status = false;
                        result.msg.push(`El producto ${checkProduct.Nombre} - Barcode ${element.barcode} No posee el stock suficiente`)
                    }
    
                    if(checkProduct.Id == 56081 || checkProduct.Id == 56080){
                        bocaditos += element.quantity
                    }
    
                }else{
                    result.status = false;
                    result.msg.push(`El producto ${element.name} no esta integrado a la base de Area`)
                }
            }

        }

        if(bocaditos != 0){
            let checkProduct = await producto_getByBarcodeAndEmpresa_DALC("754697485441", idEmpresaEnArea)
            if(checkProduct){
                if(checkProduct.StockDisponible <  bocaditos){
                    result.status = false;
                    result.msg.push(`El producto  Bocaditos - Barcode 754697485441 No posee el stock suficiente`)
                }
            }

        }

    }


    return result



}

// DALC: Recuenta y unifica los productos
const unificaProductos = (productos:any[]) => {
    const array = productos.concat()
    for (let index = 0; index < array.length; index++) {
        for (let jota =index+1 ; jota < array.length; jota++) {
            if(array[index] === array[jota]) {
                array[index].quantity += array[jota].quantity
                array.splice(jota, 1); 
            }            
        }
    }

    return array

    
}










