
const selectCombos = {
    
    idTiendaArea : 164,
    
    combos:  [
        {
            sku: 'MP3',
            detail: 'Bolsa para perros pequeños x3',
            // productos: [{id: 60280524, barcode: "754697485427", quantity: 3}]
            productos: [{id: 59513, barcode: "SP7NUEVO", quantity: 3}]
        },
        {
            sku: 'MG3',
            detail: 'Bolsa para perros grandes x3',
            // productos: [{id: 60278151, barcode: "754697485434", quantity: 3}]
            productos: [{id: 59514, barcode: "SP14NUEVO", quantity: 3}]
        },
        {
            sku:'Combo1',
            detail: '2 Bolsas para perros grandes y 1 para perros pequeños',
            // productos: [{id: 60278151, barcode: "754697485434", quantity: 2}, {id: 60280524, barcode: "754697485427", quantity: 1}]
            productos: [{id: 59514, barcode: "SP14NUEVO", quantity: 2}, {id: 59513, barcode: "SP7NUEVO", quantity: 1}]
        },
        {
            sku:'Combo2',
            detail: '2 Bolsas para perros pequeños y 1 para perros grandes',
            // productos: [{id: 60280524, barcode: "754697485427", quantity: 2}, {id: 60278151, barcode: "754697485434", quantity: 1}]
            productos: [{id: 59513, barcode: "SP7NUEVO", quantity: 2}, {id: 59514, barcode: "SP14NUEVO", quantity: 1}]
        },
    ]
}

export default selectCombos




