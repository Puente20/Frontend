from django.db import models

from . import ReservaState, ReservaHistoricoState

class LugarComun(models.Model):
    nombre = models.CharField()
    horas_turno = models.SmallIntegerField()
    lote = models.OneToOneField('administracion.Lote', on_delete=models.PROTECT, related_name='lugarescomun_lote')

class Reserva(models.Model):
    socio = models.ForeignKey('administracion.Socio', on_delete=models.SET_NULL, null=True, related_name='reservas')
    lugar = models.ForeignKey(LugarComun, on_delete=models.CASCADE, related_name='reservas_lote')
    fecha_desde = models.DateTimeField()
    fecha_hasta = models.DateTimeField()
    estado = models.CharField(choices=ReservaState.CHOICES)

class ReservaHistorico(models.Model):
    socio = models.ForeignKey('administracion.Socio', on_delete=models.SET_NULL, null=True, related_name='reservas_trace')
    lugar = models.ForeignKey(LugarComun, on_delete=models.CASCADE, related_name='reservas_trace_lote')
    fecha_desde = models.DateTimeField()
    fecha_hasta = models.DateTimeField()
    detalles = models.TextField(null=True, blank=True)
    estado = models.CharField(choices=ReservaHistoricoState.CHOICES)