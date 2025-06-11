export const datosTienda = (idTienda:number) => {
    for (let index = 0; index < tiendasRegistradas.length; index++) {
        const element = tiendasRegistradas[index];
        if(element.idTiendaArea === idTienda){
            return element
        }
    }
}

const tiendasRegistradas = [
    {
        idTiendaArea: 149,
        urlProductosCien: 'https://www.boating.com.ar/wp-json/wc/v3/products?per_page=100&page=',
        urlProductos: 'https://www.boating.com.ar/wp-json/wc/v3/products?per_page=1&page=',
        urlProducto: 'https://www.boating.com.ar/wp-json/wc/v3/products/',
        urlVentas: 'https://www.boating.com.ar/wp-json/wc/v3/orders?per_page=25&page=',
        username: 'ck_b509122b8028460027aa011b772ef2d1d790d7c6',
        password: 'cs_f8a3fcc5c98857f17e82e378f8786dfac3ee2960'
    }
]

// https://woocommerce.github.io/woocommerce-rest-api-docs/?javascript#rest-api-keys

// https://docs.woocommerce.com/document/gestion-de-pedidos/ 