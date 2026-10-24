from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register('cuentas', views.AccountViewSet, basename='cuenta')
router.register('socios', views.SocioViewSet, basename='socio')
router.register('guardias', views.GuardiaViewSet, basename='guardia')
router.register('administradores', views.AdministradorViewSet, basename='administrador')
router.register('proveedores', views.ProveedorViewSet, basename='proveedor')
router.register('lotes', views.LoteViewSet, basename='lote')
router.register('puntos-acceso', views.PuntoAccesoViewSet, basename='punto-acceso')

urlpatterns = router.urls
