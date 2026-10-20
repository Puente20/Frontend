from django.contrib import admin
from . import models

# Register your models here.

admin.site.register(models.LugarComun)
admin.site.register(models.Reserva)
admin.site.register(models.ReservaHistorico)