from django.db import models
from django.contrib.auth.models import User

from base.models import Persona
from . import LoteEstado, PuntoAccesoTipo, PuntoAccesoEstado
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