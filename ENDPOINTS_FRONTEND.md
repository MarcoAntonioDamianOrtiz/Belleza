# Rutas consumidas por el frontend

La URL base se toma de `VITE_API_URL`.

## Autenticación

```text
POST /auth/login/
POST /auth/refresh/
POST /auth/logout/
GET  /auth/me/
```

## Catálogo y usuarios

```text
GET/POST       /usuarios/
PATCH/DELETE   /usuarios/{id}/

GET/POST       /categorias/
PUT/DELETE     /categorias/{id}/

GET/POST       /productos/
PUT/DELETE     /productos/{id}/

GET/POST       /variantes/
PUT/DELETE     /variantes/{id}/
GET            /variantes/codigo/{codigo}/
```

## Inventario y empresa

```text
GET  /inventario/
POST /inventario/entrada/
POST /inventario/salida/
POST /inventario/ajuste/

GET/POST/PUT /empresa
```

## Métodos de pago y caja

```text
GET/POST       /metodos-pago/
PUT/DELETE     /metodos-pago/{id}/
GET            /metodos-pago/activos/

GET/POST       /cajas/
GET            /cajas/activas/

POST           /caja/abrir/
POST           /caja/cerrar/
GET            /caja/corte/activo/
GET            /caja/cajas/{cajaId}/cortes/
```

## Ventas y tickets

```text
GET/POST       /ventas/
GET            /ventas/{id}/
POST           /ventas/{id}/cancelar/
GET            /ventas/{id}/ticket/
GET            /tickets/reimprimir/{id}/
```

Si los endpoints de ticket todavía no están disponibles, la interfaz utiliza el detalle de la venta para permitir visualizar e imprimir el comprobante.

## Garantías, devoluciones, reportes y bitácora

```text
GET/POST       /garantias/
GET/PUT        /garantias/{id}/
POST           /garantias/{id}/aprobar/
POST           /garantias/{id}/rechazar/
POST           /garantias/{id}/finalizar/

GET/POST       /devoluciones/
GET/PUT        /devoluciones/{id}/
POST           /devoluciones/{id}/aprobar/
POST           /devoluciones/{id}/rechazar/

GET            /reportes/ventas/
GET            /reportes/inventario/
GET            /reportes/stock-bajo/
GET            /reportes/cortes/
GET            /reportes/productos/
GET            /reportes/devoluciones/
GET            /reportes/garantias/
GET            /reportes/movimientos/

GET            /bitacora/
```
