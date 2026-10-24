from django.db import models
from django.contrib.auth.models import User

from base import AccountRole
from base.models import Persona, ActiveStatusModel
from . import LoteEstado, PuntoAccesoTipo, PuntoAccesoEstado

class Account(ActiveStatusModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='account')
    role = models.CharField(max_length=7, choices=AccountRole.ROLES)
    reset_password = models.BooleanField(default=False)

    def __str__(self):
        return self.user.username

# --- Actores --- #

class Administrador(Persona):
    account = models.OneToOneField(Account, on_delete=models.SET_NULL, null=True, blank=True, related_name='administrador')

class Guardia(Persona):
    account = models.OneToOneField(Account, on_delete=models.SET_NULL, null=True, blank=True, related_name='guardia')

class Socio(Persona):
    account = models.OneToOneField(Account, on_delete=models.SET_NULL, null=True, blank=True, related_name='socio')
    tipo = models.ForeignKey('Lote', on_delete=models.PROTECT, related_name='residentes')


class Proveedor(Persona):
    contacto_telefono = models.CharField(max_length=15, blank=True, null=True)
    contacto_mail = models.CharField(max_length=50, blank=True, null=True)


# --- Barrio --- #

class Lote(models.Model):
    numero = models.IntegerField()
    estado = models.CharField(max_length=12, choices=LoteEstado.CHOICES)


class PuntoAcceso(models.Model):
    nombre = models.CharField(max_length=50)
    tipo = models.CharField(max_length=9, choices=PuntoAccesoTipo.CHOICES)
    estado = models.CharField(max_length=12, choices=PuntoAccesoEstado.CHOICES)