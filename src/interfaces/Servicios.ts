export interface IServicio {
    Concepto: string,
    Guia: boolean,
    Seguro: boolean,
    CTR: boolean,

}

export interface IResponseDetalleServicio {
    Concepto: string,
    VariableConfigurada: string,
    ValorConfigurado: string,
    MinimoConfigurado: string,
    ValorBase: string | number,
    Total: string | number,
    Mensaje?: string

}
