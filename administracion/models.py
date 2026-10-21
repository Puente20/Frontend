from django.db import models
from django.contrib.auth.models import User

from base import AccountRole
from base.models import Persona, ActiveStatusModel
from . import LoteEstado, PuntoAccesoTipo, PuntoAccesoEstado

class Account(ActiveStatusModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='account')
    role = models.CharField(choices=AccountRole.ROLES)

    def __str__(self):
        return self.user.username

# --- Actores --- #

class Administrador(Persona):
    pass ## TODO: ampliar con informacion si necesaria

class Guardia(Persona):
    pass

class Socio(Persona):
    pass

class Proveedor(Persona):
    telefono = models.CharField()

# --- Barrio --- #

class Lote(models.Model):
    numero = models.IntegerField()
    estado = models.CharField(choices=LoteEstado.CHOICES)

class PuntoAcceso(models.Model):
    nombre = models.CharField()
    tipo = models.CharField(choices=PuntoAccesoTipo.CHOICES)
    estado = models.CharField(choices=PuntoAccesoEstado.CHOICES)