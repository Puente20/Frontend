from rest_framework.exceptions import ValidationError


def validar_dni_unico(dni, instancia=None):
    if not dni:
        return

    from administracion.models import Administrador, Guardia, Proveedor, Socio
    from invitaciones.models import Invitado

    for modelo in (Administrador, Guardia, Proveedor, Socio, Invitado):
        qs = modelo.all_objects.filter(dni=dni)
        if instancia is not None and instancia.pk and isinstance(instancia, modelo):
            qs = qs.exclude(pk=instancia.pk)
        if qs.exists():
            raise ValidationError('Ya existe una persona con ese DNI.')


def validar_dni_unico_api(dni, instancia=None):
    try:
        validar_dni_unico(dni, instancia)
    except Exception as e:
        raise ValidationError(str(e))
