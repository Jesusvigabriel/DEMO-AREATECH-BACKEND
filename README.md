**Edit a file, create a new file, and clone from Bitbucket in under 2 minutes**

When you're done, you can delete the content in this README and update the file with details for others getting started with your repository.

*We recommend that you open this README in another tab as you perform the tasks below. You can [watch our video](https://youtu.be/0ocf7u76WSo) for a full demo of all the steps in this tutorial. Open the video in a new tab to avoid leaving Bitbucket.*

---

## Edit a file

You’ll start by editing this README file to learn how to edit a file in Bitbucket.

1. Click **Source** on the left side.
2. Click the README.md link from the list of files.
3. Click the **Edit** button.
4. Delete the following text: *Delete this line to make a change to the README from Bitbucket.*
5. After making your change, click **Commit** and then **Commit** again in the dialog. The commit page will open and you’ll see the change you just made.
6. Go back to the **Source** page.

---

## Create a file

Next, you’ll add a new file to this repository.

1. Click the **New file** button at the top of the **Source** page.
2. Give the file a filename of **contributors.txt**.
3. Enter your name in the empty file space.
4. Click **Commit** and then **Commit** again in the dialog.
5. Go back to the **Source** page.

Before you move on, go ahead and explore the repository. You've already seen the **Source** page, but check out the **Commits**, **Branches**, and **Settings** pages.

---

## Clone a repository

Use these steps to clone from SourceTree, our client for using the repository command-line free. Cloning allows you to work on your files locally. If you don't yet have SourceTree, [download and install first](https://www.sourcetreeapp.com/). If you prefer to clone from the command line, see [Clone a repository](https://confluence.atlassian.com/x/4whODQ).

1. You’ll see the clone button under the **Source** heading. Click that button.
2. Now click **Check out in SourceTree**. You may need to create a SourceTree account or log in.
3. When you see the **Clone New** dialog in SourceTree, update the destination path and name if you’d like to and then click **Clone**.
4. Open the directory you just created to see your repository’s files.

Now that you're more familiar with your Bitbucket repository, go ahead and add a new file locally. You can [push your change back to Bitbucket with SourceTree](https://confluence.atlassian.com/x/iqyBMg), or you can [add, commit,](https://confluence.atlassian.com/x/8QhODQ) and [push from the command line](https://confluence.atlassian.com/x/NQ0zDQ).

### GET /apiv3/ordenes/byEmpresaPeriodoConDestinos/:idEmpresa/:fechaDesde/:fechaHasta

Obtiene las órdenes de una empresa dentro de un período incluyendo información del destino y de los productos.

Ejemplo de respuesta:

```json
[
  {
    "IdOrden": 1,
    "Numero": "100",
    "NombreDestino": "Casa Central",
    "Barcode": "PROD1",
    "Unidades": 10
  }
  ]
```


### GET /apiv3/ordenes/byNumeroAndIdEmpresa/:numero/:idEmpresa

Devuelve la orden indicada buscando por su número y empresa. Incluye el estado,
los datos del cliente y el detalle de los ítems asociados.
Cada ítem contiene código de empresa, descripción, código de barras y, cuando la
empresa maneja partidas, el número de partida.
Además la respuesta agrega las banderas `TieneLote` y `TienePart` según la
configuración de la empresa.

### GET /apiv3/productos/allProductosByEmpresa/:IdEmpresa

Obtiene la lista de productos de una empresa. El parámetro opcional `includeEmpty` se envía por query string y determina si se devuelven productos sin stock (valor por defecto `true`).

Ejemplo:

```
GET /apiv3/productos/allProductosByEmpresa/5?includeEmpty=false
```

### GET /apiv3/almacenaje/getInConPosicion/:idEmpresa/:fechaDesde/:fechaHasta

Devuelve los movimientos de ingreso junto con las posiciones de cada producto/lote.

Ejemplo de respuesta:

```json
[
  {
    "Fecha": "2023-01-01",
    "Detalle": [
      {
        "idMovimiento": 1,
        "idArticulo": "PROD1",
        "Unidades": 10,
        "Posiciones": [
          { "IdPosicion": 5, "NombrePosicion": "A1", "Unidades": 8 }
        ],
        "SinPosicionar": 2
      }
    ]
  }
]
```

### GET /apiv3/remitos/:id/pdf

Devuelve el remito indicado en formato PDF.

Ejemplo:

```
GET /apiv3/remitos/10/pdf
```

El contenido se envía con `Content-Type: application/pdf`.

## Migraciones

Despues de compilar el proyecto con `npm run build` es posible ejecutar las migraciones de base de datos con el comando:

```
typeorm migration:run
```

Ejecute este comando cada vez que se agregue una nueva migración para aplicar los cambios en la base de datos.

