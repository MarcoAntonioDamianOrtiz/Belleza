# Contrato frontend ↔ backend (backend recibido 2026-08-28)

Este archivo documenta cómo consume **belleza** el backend recibido. El frontend se adapta al backend; no se modifica Django.

## Formatos de respuesta

El backend mezcla tres formatos de listados y el frontend los normaliza con `unwrapList()`:

- `{ success, count, next, previous, data: [...] }`
- `{ count, next, previous, results: [...] }`
- `{ success, data: [...] }`

## Rutas usadas

- Autenticación: `/auth/login/`, `/auth/refresh/`, `/auth/logout/`, `/auth/me/`
- Usuarios: `/usuarios/`, `/usuarios/crear-admin/`
- Categorías: `/categorias/`
- Productos: `/productos/`
- Variantes: `/variantes/`, `/variantes/codigo/{codigo}/`
- Inventario: `/inventario/`, `/inventario/entrada/`, `/inventario/salida/`, `/inventario/ajuste/`
- Empresa: `/empresa`
- Métodos de pago: `/metodos-pago/`, `/metodos-pago/activos/`
- Cajas: `/cajas/`, `/cajas/activas/`
- Corte: `/caja/abrir/`, `/caja/cerrar/`, `/caja/corte/activo/?caja_id={uuid}`, `/caja/cajas/{uuid}/cortes/`
- Ventas: `/ventas/`, `/ventas/{id}/`, `/ventas/{id}/cancelar/`, `/ventas/{id}/ticket/`
- Devoluciones: `/devoluciones/`, `/devoluciones/{id}/aprobar/`, `/devoluciones/{id}/rechazar/`
- Garantías: `/garantias/`, `/garantias/{id}/aprobar/`, `/garantias/{id}/rechazar/`, `/garantias/{id}/finalizar/`
- Bitácora: `/bitacora/`
- Reportes: `/reportes/ventas/`, `/reportes/productos/`, `/reportes/inventario/`, `/reportes/stock-bajo/`, `/reportes/cortes/`, `/reportes/devoluciones/`, `/reportes/garantias/`, `/reportes/movimientos/`

## Adaptaciones importantes

### Usuarios

`GET /usuarios/` solo expone `nombre`, `apellido`, `usuario` y `email`. Por eso el frontend lista únicamente esos campos y no inventa ID, rol o estado. Se permiten las operaciones que sí soporta el contrato sin necesitar el ID del listado:

- Crear empleado: `POST /usuarios/`
- Crear administrador: `POST /usuarios/crear-admin/`

El backend asigna automáticamente rol de empleado y estado activo al usuario normal.

### Métodos de pago

El catálogo es fijo. El frontend no ofrece crear ni renombrar métodos. Solo permite activar/desactivar, porque `PUT /metodos-pago/{id}/` acepta únicamente `activo`.

### Inventario

El endpoint de ajuste recibe `stock_nuevo`, no `cantidad`. La capa API traduce el valor del formulario al contrato del backend.

### Devoluciones

La creación usa:

- `venta_id`
- `metodo_pago_reembolso_id`
- `tipo`
- `motivo`
- `productos[].detalle_venta_id`
- `productos[].cantidad`

El frontend usa el `detalle_id` que devuelve `GET /ventas/{id}/`.

### Garantías

La creación usa `venta_id`, `variante_id`, `cantidad` y `motivo`. Para aprobar:

- `REEMPLAZO`
- `CAMBIO_PRODUCTO` (requiere `variante_nueva_id`)
- `REPARACION`

### Reportes

Los filtros de fecha del backend son `fecha_inicio` y `fecha_fin`.
