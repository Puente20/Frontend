from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LoteViewSet, PuntoAccesoViewSet, SocioViewSet, login_view, recuperar_contrasena_view

router = DefaultRouter()
router.register(r'residentes', SocioViewSet, basename='residentes')
router.register(r'lotes', LoteViewSet, basename='lotes')
router.register(r'puntos-acceso', PuntoAccesoViewSet, basename='puntos-acceso')

urlpatterns = [
    path('auth/login/', login_view, name='api-login'),
    path('auth/recuperar-contrasena/', recuperar_contrasena_view, name='api-recuperar-contrasena'),
    path('', include(router.urls)),
]
