from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from rest_framework.authtoken.models import Token
from rest_framework.exceptions import ValidationError

from . import models


def validar_contacto_proveedor(telefono, mail):
    telefono = (telefono or '').strip()
    mail = (mail or '').strip()
    if not telefono and not mail:
        raise ValidationError('Hace falta el teléfono o el mail.')
    return telefono, mail


def datos_login(user):
    token, _ = Token.objects.get_or_create(user=user)
    account = getattr(user, 'account', None)
    return {
        'token': token.key,
        'debe_cambiar_clave': bool(account and account.debe_cambiar_clave),
    }


def resetear_clave(account, password):
    validate_password(password, user=account.user)
    account.user.set_password(password)
    account.user.save(update_fields=['password'])
    account.debe_cambiar_clave = True
    account.save(update_fields=['debe_cambiar_clave'])
    Token.objects.filter(user=account.user).delete()


def cambiar_clave(user, password):
    validate_password(password, user=user)
    user.set_password(password)
    user.save(update_fields=['password'])
    account = user.account
    account.debe_cambiar_clave = False
    account.save(update_fields=['debe_cambiar_clave'])
    Token.objects.filter(user=user).delete()
    token = Token.objects.create(user=user)
    return token.key


@transaction.atomic
def crear_cuenta(persona, password, role):
    modelo = persona.__class__
    persona = modelo.objects.select_for_update().get(pk=persona.pk)
    if persona.account_id:
        raise ValidationError({'account': ['La persona ya tiene cuenta.']})
    if User.objects.filter(username=persona.dni).exists():
        raise ValidationError({'dni': ['Ya existe un usuario con ese DNI.']})

    user = User(username=persona.dni, email='')
    validate_password(password, user=user)

    user.set_password(password)
    user.save()
    account = models.Account.objects.create(
        user=user,
        role=role,
        debe_cambiar_clave=True,
    )
    persona.account = account
    persona.save(update_fields=['account'])
    return persona
