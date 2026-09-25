# Zentry-Backend

Ecosistema digital integral para la gestión de ingresos y egresos en barrios cerrados mediante invitaciones, centralizando la gobernanza administrativa y operativa; además, garantizando el control de flujos de acceso mediante identidades digitales.

Este repositorio abarca el **Backend** de este sistema.

## Objetivos especificos

- Gestionar accesos de socios e invitados.
- Generar trazabilidad de ingresos y egresos de socios e invitados.
- Diseñar una interfaz comprensible para todo tipo de usuario.

## Cómo funciona

### Modulos existentes

- Administracion
- Invitaciones

### Administracion

Se encarga de la parte administrativa general del barrio, digamos las acciones que administracion tiene como responsabilidad. Se encarga de ABM de cuentas de socios, guardias, proveedores.

Tambien se encarga del boton de panico.

**Modelos:**
- Persona (Abstracta)
- Account 
- Proveedor <-- Persona
- Guardia <-- Persona
- Administrador <-- Persona

### Invitaciones

Se encarga de las invitaciones y accesos del barrio. Las diferentes formas de ingreso van a ser: Invitacion Unica (se vence una vez que se recepciona), Invitacion Recurrente (se vence al momento que se da de baja), Autorizacion de Proveedor (se autoriza a un proveedor a entrar a determinadas horas del dia).

Van a existir invitaciones y luego un historico de invitaciones, donde se van a mostrar los accesos ya completados.

**Modelos:**
- Invitado <-- Persona
- Invitacion
- InvitacionHistorico
- AutorizacionProveedor
 

## Documentación

Existen diagramas los cuales se utlizarán como documentación, ademas de un informe general. Aparte de esto vamos a tener dentro de este repositorio la documentación del sistema que va a cubrir cuestiones técnicas y de herramientas para tener en cuenta mientras se va desarrollando.

Toda esta documentación va a estar presentada en la entrega final.