from django.conf import settings
from django.db import models


class AlertaPanico(models.Model):
    class Estado(models.TextChoices):
        PENDIENTE = 'pendiente', 'Pendiente'
        ATENDIDA = 'atendida', 'Atendida'
        RECHAZADA = 'rechazada', 'Rechazada'

    socio = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT,
        related_name='emergencias_enviadas',
    )
    nombre_completo = models.CharField(max_length=160)
    numero_lote = models.CharField(max_length=30)
    telefono = models.CharField(max_length=40)
    creada_en = models.DateTimeField(auto_now_add=True, db_index=True)
    estado = models.CharField(
        max_length=10, choices=Estado.choices, default=Estado.PENDIENTE,
        db_index=True,
    )
    guardia = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT,
        null=True, blank=True, related_name='emergencias_resueltas',
    )
    resuelta_en = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['creada_en', 'id']
