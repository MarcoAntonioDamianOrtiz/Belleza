# Contrato frontend y backend Ruby

Referencia: los 16 documentos de `Ruby(5).zip`. Las rutas son relativas a `VITE_API_URL`, configurada con el prefijo `/api`.

## Sesión y permisos

- `src/api/axios.ts` agrega `Authorization: Bearer <access>`, comparte un único refresh entre peticiones simultáneas y guarda el refresh rotado.
- Roles: superadministrador `0`, administrador `1`, empleado `2`. El backend valida los permisos.
- Todos los roles crean y editan productos, categorías y variantes; solo administración activa o desactiva estos registros.
- Todos los roles consultan inventario y registran entradas, salidas y ajustes. Solo administración configura las cajas; cada usuario abre y cierra su propio corte.
- Usuarios, bitácora y empresa son pantallas administrativas. Los reportes de inventario, stock bajo y resumen del día admiten empleados; los demás reportes requieren administración.

## Listados

`src/api/pagination.ts` reconoce los formatos documentados:

| Módulos | Respuesta |
| --- | --- |
| Categorías, usuarios, cortes | `{ success, count, next, previous, data: [...] }` |
| Productos, variantes, inventario, devoluciones, garantías, bitácora y reportes | `{ count, next, previous, results: [...] }` |
| Ventas | `{ success, data: { count, next, previous, results: [...] } }` |
| Catálogos sin paginación | `{ success, data: [...] }` |

Los listados usan `page` y `page_size` hasta 200 por página cuando el módulo indica ese límite. La URL de `next` se convierte a una ruta local para evitar enviar el token a un servidor ajeno.

## Rutas

| Módulo | Rutas relativas a `/api` |
| --- | --- |
| Auth | `/auth/login/`, `/auth/refresh/`, `/auth/me/`, `/auth/logout/` |
| Usuarios | `/usuarios/`, `/usuarios/{id}/`, `/usuarios/crear_admin/`, `/usuarios/{id}/activar/`, `/usuarios/{id}/desactivar/` |
| Categorías y productos | `/categorias/`, `/productos/`, `/{modulo}/{id}/`, `/{modulo}/{id}/activar/`, `/{modulo}/{id}/desactivar/` |
| Variantes | `/variantes/`, `/variantes/{id}/`, `/variantes/codigo/{codigo}/`, `/variantes/{id}/activar/`, `/variantes/{id}/desactivar/` |
| Inventario | `/inventario/`, `/inventario/entrada/`, `/inventario/salida/`, `/inventario/ajuste/` |
| Empresa y pagos | `/empresa`, `/metodos-pago/`, `/metodos-pago/activos/`, `/metodos-pago/{id}/activar/`, `/metodos-pago/{id}/desactivar/` |
| Cajas y cortes | `/cajas/`, `/cajas/activas/`, `/caja/`, `/caja/abrir/`, `/caja/cerrar/`, `/caja/corte/activo/`, `/caja/cajas/{id}/cortes/`, `/caja/{id}/movimientos/` |
| Ventas y tickets | `/ventas/`, `/ventas/{id}/`, `/ventas/{id}/cancelar/`, `/ventas/{id}/ticket/` |
| Devoluciones | `/devoluciones/`, `/devoluciones/{id}/`, `/devoluciones/ventas/{folio}/`, `/devoluciones/{id}/aprobar/`, `/devoluciones/{id}/rechazar/` |
| Garantías | `/garantias/`, `/garantias/{id}/`, `/garantias/{id}/aprobar/`, `/garantias/{id}/rechazar/`, `/garantias/{id}/finalizar/` |
| Bitácora | `/bitacora/` |
| Reportes | `/reportes/resumen-dia/`, `/reportes/ventas/`, `/reportes/productos/`, `/reportes/inventario/`, `/reportes/stock-bajo/`, `/reportes/cortes/`, `/reportes/devoluciones/`, `/reportes/garantias/`, `/reportes/movimientos/` |

## Reglas principales

- El POST de ventas envía `caja_id`, `metodo_pago_id`, `productos[{ variante_id, cantidad }]` y `descuento`. El backend calcula folio, precios, IVA y totales. La caja debe estar abierta y tener un corte propio (`es_mia`).
- La devolución utiliza `GET /devoluciones/ventas/{folio}/` para conocer `disponible_devolucion`. El alta envía IDs de venta, detalles y método de reembolso; la edición pendiente solo cambia tipo, motivo y método.
- La garantía envía `venta_id`, `detalle_venta_id`, `variante_id`, cantidad y motivo. `CAMBIO_PRODUCTO` exige `variante_nueva_id` al aprobar.
- El ajuste de inventario envía `stock_nuevo`; entrada y salida envían `cantidad`. El ticket se consulta después de registrar la venta.
- La impresión y la apertura de la gaveta física requieren hardware o un servicio local; los documentos no definen ese protocolo.

La integración no se pudo probar contra un backend activo porque se entregaron documentos y el frontend, sin una instancia de API para pruebas.
