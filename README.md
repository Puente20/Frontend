# Zentry-Backend

Ecosistema digital integral para la gestión de ingresos y egresos en barrios cerrados mediante invitaciones, centralizando la gobernanza administrativa y operativa; además, garantizando el control de flujos de acceso mediante identidades digitales.

Este repositorio abarca el **Backend** de este sistema.

## Objetivos especificos

- Gestionar accesos de socios e invitados.
- Generar trazabilidad de ingresos y egresos de socios e invitados.
- Diseñar una interfaz comprensible para todo tipo de usuario.

## Cómo funciona

### Modulos existentes

- Barrios
- Administracion
- Invitaciones
- Reservas
- Eventos

### Barrios
 
Se encarga de centralizar los datos en un solo barrio. Solo consiste de un modelo: Barrio

**Modelos:**

- Barrio

### Administracion

Se encarga de la parte administrativa general del barrio, digamos las acciones que administracion tiene como responsabilidad. Se encarga de ABM de cuentas de socios, guardias, proveedores.

Tambien se encarga de los lotes y los puntos de acceso.

**Modelos:**

- Account (pending)
- Socio <--- Persona
- Proveedor <-- Persona
- Guardia <-- Persona
- Administrador <-- Persona
- Lote
- PuntoAcceso

### Invitaciones

Se encarga de las invitaciones y accesos del barrio. Las diferentes formas de ingreso van a ser: Invitacion Unica (se vence una vez que se recepciona), Invitacion Recurrente (se vence al momento que se da de baja), Autorizacion de Proveedor (se autoriza a un proveedor a entrar a determinadas horas del dia). Ambas invitaciones van a estar constituidas en el modelo Invitación.

Van a existir invitaciones y luego un historico de invitaciones, donde se van a mostrar los accesos ya completados.

**Modelos:**

- Invitado <-- Persona
- Invitacion
- AutorizacionProveedor
- InvitacionHistorico
- RegistroAcceso

### Reservas

Se encarga de las reservas para los espacios comunes y la trazabilidad de los mismos, registrando el estado y problemas si existen

**Modelos:**

- LugarComun
- Reserva
- ReservaHistorico

### Eventos

Se encarga de notificaciones y boton de pánico

**(Not implemented)**

## Documentación

Existen diagramas los cuales se utlizarán como documentación, ademas de un informe general. Aparte de esto vamos a tener dentro de este repositorio la documentación del sistema que va a cubrir cuestiones técnicas y de herramientas para tener en cuenta mientras se va desarrollando.

Toda esta documentación va a estar presentada en la entrega final.