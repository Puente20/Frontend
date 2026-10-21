# Special Module: BASE

## ¿Para que se usa?

Se utiliza para poder centralizar las funciones que se pueden usar en todos los modulos asi evitar funciones duplicadas.
Esto genera un mantenimiento más simple, mejor documentacion y comprension del flujo de trabajo de las acciones que se pueden generar en el Backend

## FUNCIONES

### models.py -> Models & Managers Genericos

En Django, los Managers son una interfaz entre los modelos y la base de datos. Permiten interactuar con los registros de un modelo mediante los metodos conocidos.

Aca se setean los managers genericos que pueden aparecer en diferentes modelos.

### permissions.py -> Permisos Genericos

Aca se setean los permisos para las vistas globales, donde se autentique mediante si el usuario cumple los requisitos dados

Ejemplos:

- IsSuperUser -> El usuario debe ser superusuario para acceder a esta accion
- IsGuardiaRole -> Su cuenta debe tener el rol de 'guardia'

### views.py -> Vistas y mixins base

Aca se van a globalizar configuraciones y metodos en vistas que van a funcionar para varios viewsets a lo largo del sistema