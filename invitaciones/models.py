from django.db import models

from base.models import ActiveStatusModel, Persona
from . import InvitacionTipo, InvitacionEstado

# --- Invitaciones --- #

class Invitado(Persona):

    def can_delete(self):
        return not self.invitaciones_vigentes.exists()

class Invitacion(models.Model):
    invitado = models.ForeignKey(Invitado, on_delete=models.PROTECT, related_name='invitaciones_vigentes')
    socio = models.ForeignKey('administracion.Socio', on_delete=models.PROTECT, related_name='invitaciones_vigentes')
    punto_acceso = models.ForeignKey('administracion.PuntoAcceso', on_delete=models.CASCADE, related_name='invitaciones_vigentes')
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_inicio = models.DateTimeField()
    fecha_visita = models.DateTimeField()
    dias_habilitados = models.PositiveIntegerField()
    tipo = models.CharField(choices=InvitacionTipo.CHOICES)

# --- Proveedores --- #

class AutorizacionProveedor(models.Model):
    socio = models.ForeignKey('administracion.Socio', on_delete=models.PROTECT, related_name='autorizaciones_proveedor')
    proveedor = models.OneToOneField('administracion.Proveedor', on_delete=models.CASCADE, related_name='autorizaciones')
    hora_desde = models.TimeField()
    hora_hasta = models.TimeField()
    valido_desde = models.DateField()
    valido_desde = models.DateField()

# --- Trace --- #

class InvitacionHistorico(models.Model):
    invitado = models.ForeignKey(Invitado, on_delete=models.CASCADE, related_name='invitaciones')
    socio = models.ForeignKey('administracion.Socio', on_delete=models.CASCADE, related_name='invitaciones')
    punto_acceso = models.ForeignKey('administracion.PuntoAcceso', on_delete=models.CASCADE, related_name='invitaciones')
    fecha_creacion = models.DateTimeField()
    fecha_inicio = models.DateTimeField()
    fecha_visita = models.DateTimeField()
    fecha_fin = models.DateTimeField()
    dias_habilitados = models.PositiveIntegerField()
    estado = models.CharField(choices=InvitacionEstado.CHOICES)
    tipo = models.CharField(choices=InvitacionTipo.CHOICES)

class RegistroAcceso(ActiveStatusModel):
    hora_desde = models.TimeField()
    hora_hasta = models.TimeField()
    valido_desde = models.DateTimeField()
    valido_hasta = models.DateTimeField()