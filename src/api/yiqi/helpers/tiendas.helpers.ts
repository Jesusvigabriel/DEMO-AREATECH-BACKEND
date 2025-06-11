
export const datosTienda = (idTienda:number) => {
    for (let index = 0; index < tiendasRegistradas.length; index++) {
        const element = tiendasRegistradas[index];
        if(element.idArea === idTienda){
            return element
        }
    }
}

const tiendasRegistradas = [
    {
        idArea: 163,
        userYiqi: 'area@yiqi.com.ar',
        pass: 'Area54x',
        urlProductos: 'https://me.yiqi.com.ar/api/instancesApi/GetList?entityId=782&schemaId=227&smartieId=2073',
        urlVentas: 'https://me.yiqi.com.ar/api/instancesApi/GetList?entityId=1230&schemaId=227&smartieId=2074'
    }
]