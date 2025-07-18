export const ESTADOS_ORDEN = {
    PENDIENTE: 1,
    EN_PREPARACION: 2,
    PREPARADO: 3,
    EN_CAMINO: 4,
    ENTREGADO: 5,
    CANCELADO: 6
};

export const ESTADOS_REMITO = {
    PENDIENTE: 'PENDIENTE',
    EN_PREPARACION: 'EN_PREPARACION',
    PREPARADO: 'PREPARADO',
    EN_CAMINO: 'EN_CAMINO',
    ENTREGADO: 'ENTREGADO',
    CANCELADO: 'CANCELADO'
};

export const MAPA_ESTADOS_ORDEN_A_REMITO: { [key: number]: string } = {
    [ESTADOS_ORDEN.PENDIENTE]: ESTADOS_REMITO.PENDIENTE,
    [ESTADOS_ORDEN.EN_PREPARACION]: ESTADOS_REMITO.EN_PREPARACION,
    [ESTADOS_ORDEN.PREPARADO]: ESTADOS_REMITO.PREPARADO,
    [ESTADOS_ORDEN.EN_CAMINO]: ESTADOS_REMITO.EN_CAMINO,
    [ESTADOS_ORDEN.ENTREGADO]: ESTADOS_REMITO.ENTREGADO,
    [ESTADOS_ORDEN.CANCELADO]: ESTADOS_REMITO.CANCELADO
};
