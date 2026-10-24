from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import InvitacionViewSet, InvitadoViewSet, historial

router = DefaultRouter()
router.register('invitaciones', InvitacionViewSet, basename='invitacion')
router.register('invitados', InvitadoViewSet, basename='invitado')

urlpatterns = [
    path('historial/', historial, name='historial'),
    *router.urls,
]
