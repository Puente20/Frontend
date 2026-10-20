from django.contrib import admin
from . import models

# Register your models here.

admin.site.register(models.Invitado)
admin.site.register(models.Invitacion)
admin.site.register(models.AutorizacionProveedor)
admin.site.register(models.InvitacionHistorico)
admin.site.register(models.RegistroAcceso)