"""
URL configuration for zentry project.
"""
from django.contrib import admin
from django.urls import include, path

from administracion.views import cambiar_clave, login


urlpatterns = [
    path('auth/', login),
    path('auth/cambiar-clave/', cambiar_clave),
    path('admin/', admin.site.urls),
    path('administracion/', include('administracion.urls')),
    path('invitaciones/', include('invitaciones.urls')),
    path('barrios/', include('barrios.urls')),
]
